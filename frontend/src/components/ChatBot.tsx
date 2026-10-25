import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { utilsService, geminiApiKey } from "../config";
import {
  BsChatDotsFill,
  BsX,
  BsSendFill,
  BsStars,
  BsArrowCounterclockwise,
  BsLightningChargeFill,
} from "react-icons/bs";
import { FaUtensils } from "react-icons/fa";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "🍕 Recommend dinner",
  "🍛 Best Biryanis",
  "🥗 Pure Veg specials",
  "🏷️ Today's Coupons",
  "📍 Track my order",
  "🏪 Register restaurant",
];

const CANDIDATE_GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

const NOMATO_SYSTEM_PROMPT =
  "You are Nomato AI, a brilliant, warm, and appetizing culinary concierge for Nomato (India's premier food delivery app, like Zomato/Swiggy).\n" +
  "Restaurants on Nomato:\n" +
  "• The Royal Tandoor: Royal Dum Biryani, Old Delhi Butter Chicken, Paneer Tikka Makhani, Garlic Butter Naan, Warm Gulab Jamun.\n" +
  "• Bella Italia & Pizzeria: Classic Margherita Pizza, Quattro Formaggi 4-Cheese Pizza, Penne all'Arrabbiata, Classic Italian Tiramisu (Pure Veg).\n" +
  "• Wok Express Asian Street: Crystal Veg Dim Sum, Wok-Tossed Hakka Noodles, Crispy Chilli Paneer.\n" +
  "• Green Leaf Pure Veg: Special Rajasthani Veg Thali, Royal Shahi Paneer (100% Satvik Pure Veg).\n" +
  "• Punjab Grill & Kebabs: Charcoal Chicken Tikka, Kashmiri Mutton Rogan Josh.\n" +
  "• Sweet Treats Cafe: Loaded Nutella Belgian Waffles, Blueberry Cheesecake.\n\n" +
  "Active Promo Codes:\n" +
  "• NOMATO50: 50% off up to ₹100 on first order.\n" +
  "• FEAST20: Flat 20% off on orders above ₹499.\n" +
  "• FREEDEL: Free delivery on orders above ₹299.\n\n" +
  "Tone & Formatting:\n" +
  "• Give mouthwatering, appetizing descriptions.\n" +
  "• Highlight **Dish Names** in bold.\n" +
  "• Use cheerful food emojis (🍕, 🍛, 🍜, 🥗, 🍰).\n" +
  "• Use clean bullet points and always conclude with a friendly follow-up question or recommendation to add to cart.";

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi there! I'm **Nomato AI**, your personal food & dining concierge powered by **Gemini AI**.\n\nCraving something tasty, looking for dish recommendations, or need promo codes? Ask me anything!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const q = text.toLowerCase();

      // 1. Direct App Shortcuts for Instant Actions (Coupons, Tracking, Partner Info)
      if (
        q.includes("coupon") ||
        q.includes("promo") ||
        q.includes("discount") ||
        q === "codes" ||
        q.includes("promo code")
      ) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Exclusive Nomato Promo Codes today: 🏷️\n\n• **NOMATO50** - Get 50% off up to ₹100 on your first order!\n• **FEAST20** - Flat 20% off on orders above ₹499.\n• **FREEDEL** - Free delivery on orders above ₹299.\n\nApply these in your Cart during checkout!",
          },
        ]);
        return;
      }

      if (q.includes("track") || q.includes("where is my order")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "To track your delivery live: 📍\n\n1. Navigate to your **Orders** page from the top navigation bar.\n2. Click **Track Order** on any active delivery.\n3. View real-time GPS tracking of your rider on the interactive Leaflet map, along with delivery estimates!",
          },
        ]);
        return;
      }

      if (q.includes("register restaurant") || q.includes("become a seller")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "To join Nomato as a Restaurant Partner: 🏪\n\n1. Sign in and select the **Restaurant Partner** role.\n2. Open your **Kitchen Hub / Seller Portal** to customize your restaurant name, cuisine tags, and banner.\n3. Add dishes with images, pricing, and dietary flags to begin receiving live customer orders!",
          },
        ]);
        return;
      }

      if (q.includes("become a rider") || q.includes("rider job")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "To deliver with Nomato: 🛵\n\n1. Sign in and select the **Rider Partner** role.\n2. Toggle your status to **Available** on the Rider Dashboard.\n3. Accept nearby broadcasted delivery requests, follow the map route, and earn instant trip payouts!",
          },
        ]);
        return;
      }

      // 2. Direct Google Gemini AI Execution with Cascade Fallback
      if (geminiApiKey) {
        // Format sanitized multi-turn history compliant with Google Generative AI specs:
        // Must start with 'user', alternate strictly between 'user' and 'model'
        const conversationHistory: {
          role: "user" | "model";
          parts: [{ text: string }];
        }[] = [];

        // Exclude the initial greeting from history to ensure it starts with a user turn
        const historyCandidates = messages.slice(1);
        for (const m of historyCandidates) {
          const role = m.role === "assistant" ? "model" : "user";
          if (conversationHistory.length === 0 && role === "model") continue;
          if (
            conversationHistory.length > 0 &&
            conversationHistory[conversationHistory.length - 1].role === role
          ) {
            continue;
          }
          conversationHistory.push({ role, parts: [{ text: m.content }] });
        }

        // Ensure the last history entry before current user message was a model turn
        if (
          conversationHistory.length > 0 &&
          conversationHistory[conversationHistory.length - 1].role === "user"
        ) {
          conversationHistory.pop();
        }

        const geminiPayload = {
          contents: [
            ...conversationHistory,
            {
              role: "user",
              parts: [{ text }],
            },
          ],
          systemInstruction: {
            parts: [{ text: NOMATO_SYSTEM_PROMPT }],
          },
        };

        for (const model of CANDIDATE_GEMINI_MODELS) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const geminiRes = await fetch(geminiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(geminiPayload),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (geminiRes.ok) {
              const data = await geminiRes.json();
              const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (reply && reply.trim().length > 0) {
                setMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: reply.trim() },
                ]);
                return;
              }
            }
          } catch (modelErr) {
            console.warn(`Gemini model ${model} unavailable, trying next:`, modelErr);
          }
        }
      }

      // 3. Backend Utils Service fallback (if running)
      try {
        const response = await axios.post(
          `${utilsService}/api/chat`,
          {
            message: text,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          },
          { timeout: 2500 }
        );

        if (response.data?.reply) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: response.data.reply },
          ]);
          return;
        }
      } catch (backendErr) {
        console.warn("Backend chat unavailable:", backendErr);
      }

      // 4. Secondary Public AI fallback
      try {
        const aiUrl = `https://text.pollinations.ai/${encodeURIComponent(
          text
        )}?system=${encodeURIComponent(NOMATO_SYSTEM_PROMPT)}&model=openai`;
        const aiRes = await axios.get(aiUrl, { timeout: 4500 });
        if (
          aiRes.data &&
          typeof aiRes.data === "string" &&
          aiRes.data.trim().length > 10
        ) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: aiRes.data.trim() },
          ]);
          return;
        }
      } catch (aiErr) {
        console.warn("Secondary AI fallback failed:", aiErr);
      }

      // 5. Comprehensive Local Culinary & Nomato Concierge Engine
      const getSmartResponse = (query: string): string => {
        const lower = query.toLowerCase();

        // Greetings
        if (
          lower === "hi" ||
          lower === "hello" ||
          lower === "hey" ||
          lower === "hii" ||
          lower === "hiii" ||
          lower.startsWith("hi ") ||
          lower.startsWith("hello ") ||
          lower.startsWith("hey ")
        ) {
          return "Hello! 👋 I'm **Nomato AI**, your culinary concierge.\n\nWhat are you in the mood for today?\n• **🍛 Royal Dum Biryani & Kebabs**\n• **🍕 Artisanal Wood-Fired Pizza**\n• **🥗 100% Satvik Pure Veg Thalis**\n• **🏷️ Active Discount Coupons**\n\nTell me what you'd like to eat!";
        }

        // Lunch suggestions
        if (
          lower.includes("lunch") ||
          lower.includes("afternoon") ||
          lower.includes("midday") ||
          lower.includes("thali") ||
          lower.includes("meal box")
        ) {
          return "Here are our top chef recommendations for a delicious **Lunch**:\n\n1. **Special Royal Thali** - Dal Makhani, Shahi Paneer, 2 Butter Rotis, aromatic Jeera Rice, and Gulab Jamun.\n2. **Dum Biryani Lunch Bowl** - Saffron-infused basmati rice served with Burani Raita and spicy Mirchi Ka Salan.\n3. **Paneer Tikka / Chicken Kathi Roll** - Freshly rolled flaky paratha packed with charred tikka and mint chutney.\n4. **Wok-Tossed Hakka Noodles & Manchurian Combo** - Perfect midday Indo-Chinese crunch.\n\nLooking for something light or a full hearty meal?";
        }

        // Dinner / Evening
        if (
          lower.includes("dinner") ||
          lower.includes("night") ||
          lower.includes("evening")
        ) {
          return "Here are our chef's top **Dinner** favorites tonight:\n\n1. **Royal Dum Biryani** - Fragrant basmati rice slow-cooked in a sealed clay handi with tender spices.\n2. **Paneer Butter Masala / Butter Chicken** with Garlic Naan - Velvety tomato cashew gravy with warm bread.\n3. **Artisanal Wood-Fired Margherita Pizza** - Sourdough crust topped with San Marzano tomatoes, fresh mozzarella, and basil.\n4. **Creamy Fettuccine Alfredo** - Rich parmesan sauce tossed with button mushrooms.\n\nWhich one sounds appetizing for your dinner?";
        }

        // Best dishes / general recommendations
        if (
          lower.includes("best dish") ||
          lower.includes("best food") ||
          lower.includes("recommend") ||
          lower.includes("popular") ||
          lower.includes("special") ||
          lower.includes("craving") ||
          lower.includes("what should i eat")
        ) {
          return "Here are the top-rated **All-Time Favorites** on Nomato:\n\n1. 🍛 **Royal Dum Biryani** - Rich, aromatic, and cooked to perfection.\n2. 🍕 **Artisanal Wood-Fired Pizza** - Smoky sourdough with gooey imported cheese.\n3. 🫓 **Dal Makhani & Garlic Naan** - 12-hour slow-simmered black lentils with churned butter.\n4. 🍜 **Spicy Schezwan Hakka Noodles** - Wok-tossed with fresh crunch.\n5. 🍫 **Belgian Chocolate Lava Cake** - Warm molten center with chocolate drizzle.\n\nWould you like to explore dishes from a particular restaurant?";
        }

        // Burgers, Sandwiches & Fast Food
        if (
          lower.includes("burger") ||
          lower.includes("fries") ||
          lower.includes("sandwich") ||
          lower.includes("fast food") ||
          lower.includes("wrap")
        ) {
          return "Fast food cravings sorted! 🍔\n\n1. **Smoky BBQ Gourmet Burger** - Grilled patty, cheddar melt, caramelized onions, and house secret sauce.\n2. **Peri-Peri Crispy Fries** - Golden hand-cut potatoes tossed in fiery African peri-peri spices.\n3. **Club Sandwich Deluxe** - Triple-decker toasted sourdough with roasted veggies and garlic aioli.\n4. **Crispy Paneer / Chicken Wrap** - Rolled with shredded iceberg lettuce and tangy chipotle mayo.";
        }

        // Healthy & Diet
        if (
          lower.includes("healthy") ||
          lower.includes("salad") ||
          lower.includes("diet") ||
          lower.includes("keto") ||
          lower.includes("protein") ||
          lower.includes("gym") ||
          lower.includes("low cal")
        ) {
          return "Nutritious & Wholesome picks on Nomato: 🥗\n\n1. **Mediterranean Quinoa Bowl** - Fluffy quinoa, kalamata olives, cherry tomatoes, feta, and lemon oregano vinaigrette.\n2. **Grilled Herb Chicken / Tofu Salad** - Crisp greens, shaved almonds, and balsamic glaze.\n3. **Protein Power Sprout Bowl** - Steamed edamame, pomegranate, crunchy sprouts, and roasted seeds.\n4. **Avocado Sourdough Toast** - Smashed hass avocado, microgreens, and a dash of smoked paprika.";
        }

        // Biryani
        if (
          lower.includes("biryani") ||
          lower.includes("pulao") ||
          lower.includes("rice")
        ) {
          return "Here are the finest **Biryanis** available on Nomato:\n\n1. **Hyderabadi Dum Biryani** - Authentic spiced long-grain basmati with mint raita.\n2. **Lucknowi Awadhi Biryani** - Delicate, aromatic saffron rice with tender marinated pieces.\n3. **Kolkata Mutton Biryani** - Subtle spices served with golden potatoes and boiled egg.\n4. **Paneer & Veg Saffroni Biryani** - Rich vegetarian alternative slow-cooked in a sealed handi.";
        }

        // Pizza & Italian
        if (
          lower.includes("pizza") ||
          lower.includes("pasta") ||
          lower.includes("italian")
        ) {
          return "Top Italian & Pizza picks on Nomato: 🍕\n\n1. **Classic Margherita Pizza** - San Marzano tomatoes, fresh mozzarella, extra virgin olive oil, and basil.\n2. **Quattro Formaggi Pizza** - Gorgonzola, parmesan, provolone, and creamy mozzarella.\n3. **Penne Arrabbiata** - Al dente pasta tossed in spicy garlic tomato sauce.\n4. **Fettuccine Alfredo** - Rich parmesan cream sauce with grilled mushrooms.";
        }

        // Chinese / Asian
        if (
          lower.includes("chinese") ||
          lower.includes("noodle") ||
          lower.includes("manchurian") ||
          lower.includes("dimsum") ||
          lower.includes("momos")
        ) {
          return "Indo-Chinese & Asian delicacies: 🥢\n\n1. **Crispy Chilli Paneer / Chicken** - Tossed in fiery dark soy and green chillies.\n2. **Wok-Tossed Hakka Noodles** - Thin wheat noodles with crispy spring veggies.\n3. **Steamed Dim Sum / Momos** - Served with spicy Schezwan dipping sauce.\n4. **Hot & Sour Soup** - Pepper-spiced tangy broth with tofu and shredded veggies.";
        }

        // Vegetarian
        if (
          lower.includes("veg") ||
          lower.includes("vegetarian") ||
          lower.includes("vegan") ||
          lower.includes("paneer")
        ) {
          return "Top-rated vegetarian favorites on Nomato: 🌿\n\n1. **Dal Makhani & Jeera Rice** - Slow-simmered black lentils with churned white butter.\n2. **Paneer Butter Masala** - Cottage cheese in rich, mildly sweet cashew-tomato gravy.\n3. **Mediterranean Falafel Mezze** - Herb falafels, roasted garlic hummus, and pita bread.\n4. **Farmhouse Veggie Pizza** - Bell peppers, sweet corn, mushrooms, and black olives.";
        }

        // Non-veg & Chicken
        if (
          lower.includes("non veg") ||
          lower.includes("chicken") ||
          lower.includes("mutton") ||
          lower.includes("fish") ||
          lower.includes("meat") ||
          lower.includes("kebab") ||
          lower.includes("tikka")
        ) {
          return "Sizzling meat & non-veg specialties: 🍗\n\n1. **Butter Chicken Deluxe** - Tandoor-roasted chicken in rich velvety makhani gravy.\n2. **Mutton Rogan Josh** - Slow-braised Kashmiri lamb infused with fennel and ginger.\n3. **Tandoori Murgh (Full/Half)** - Marinated in yogurt and freshly ground spices, roasted on skewers.\n4. **Crispy Fish & Chips** - Flaky battered fish fillet served with tartar dip.";
        }

        // Desserts & Sweets
        if (
          lower.includes("dessert") ||
          lower.includes("sweet") ||
          lower.includes("ice cream") ||
          lower.includes("cake") ||
          lower.includes("chocolate") ||
          lower.includes("waffle")
        ) {
          return "Sweet tooth delights: 🍰\n\n1. **Warm Gulab Jamun with Rabri** - Soft khoya dumplings soaked in cardamom saffron syrup.\n2. **Molten Belgian Chocolate Lava Cake** - Warm gooey chocolate center served with vanilla bean gelato.\n3. **Loaded Nutella Belgian Waffle** - Golden waffle with warm hazelnut spread and crushed nuts.\n4. **Classic Italian Tiramisu** - Coffee-soaked ladyfingers with whipped mascarpone cream.";
        }

        // Contextual Fallback
        return `That sounds delicious! On Nomato, we have fantastic options across **Biryanis**, **Wood-Fired Pizzas**, **North Indian Curries**, and **Pan-Asian Noodles**.\n\nWould you like recommendations for a specific cuisine, or should I share today's discount coupons with you?`;
      };

      const smartReply = getSmartResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: smartReply }]);
    } catch (err: any) {
      console.error("ChatBot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm here to help! Ask me for dinner recommendations, vegetarian specials, or order tracking guidance.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Hi there! I'm **Nomato AI**, your personal food & dining concierge powered by **Gemini AI**. What would you like help with?",
      },
    ]);
  };

  // Basic markdown-like parser for bold text and linebreaks
  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p
          key={idx}
          className={line.trim() === "" ? "h-2" : "mb-1 leading-relaxed"}
        >
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-semibold text-gray-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Open Nomato AI Chat"
          >
            <BsChatDotsFill className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-5 py-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white">
                <FaUtensils className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-base tracking-wide">
                  <span>Nomato AI</span>
                  <BsStars className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-red-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="flex items-center gap-1">
                    <BsLightningChargeFill className="text-yellow-300 w-3 h-3" />
                    Powered by Gemini AI
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Restart chat"
                className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
              >
                <BsArrowCounterclockwise className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
              >
                <BsX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60 text-sm">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${
                      isUser
                        ? "bg-red-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    ) : (
                      <div className="text-gray-700">
                        {renderFormattedText(msg.content)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <BsStars className="text-red-500 w-4 h-4 animate-spin" />
                  <span className="text-xs font-semibold text-gray-500">
                    Nomato AI is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Persistent Quick Action Chips */}
          <div className="px-3 py-2 bg-slate-50 border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap text-[11px] font-semibold bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 px-3 py-1 rounded-full transition border border-gray-200 shadow-2xs flex-shrink-0 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (dishes, lunch, coupons)..."
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-800 text-xs sm:text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-40 disabled:hover:bg-red-600 text-white flex items-center justify-center transition shadow-md cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <BsSendFill className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
