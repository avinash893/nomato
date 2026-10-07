import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { utilsService } from "../config";
import {
  BsChatDotsFill,
  BsX,
  BsSendFill,
  BsStars,
  BsArrowCounterclockwise,
} from "react-icons/bs";
import { FaUtensils } from "react-icons/fa";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "🍕 Recommend popular dinner dishes",
  "🥗 Best vegetarian options",
  "📦 How do I track my order?",
  "🏪 How can I register my restaurant?",
];

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi there! I'm **Nomato AI**, your personal food & dining assistant. Craving something tasty, or need help with an order? Ask me anything!",
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
      // 1. Try backend utils service if reachable
      try {
        const response = await axios.post(
          `${utilsService}/api/chat`,
          {
            message: text,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          },
          { timeout: 3000 }
        );

        if (response.data?.reply) {
          setMessages((prev) => [...prev, { role: "assistant", content: response.data.reply }]);
          return;
        }
      } catch (backendErr) {
        console.warn("Backend chat unavailable, using built-in smart assistant:", backendErr);
      }

      // 2. Intelligent Culinary & Nomato Concierge responder (works 100% offline & on Vercel)
      const getSmartResponse = (query: string): string => {
        const q = query.toLowerCase();

        // Greetings
        if (q === "hi" || q === "hello" || q === "hey" || q.startsWith("hi ") || q.startsWith("hello ")) {
          return "Hello! 👋 I'm **Nomato AI**, your personal food & dining concierge.\n\nI can help you with:\n• **Dinner & Lunch suggestions**\n• **Vegetarian & healthy picks**\n• **Live order tracking guidance**\n• **Special offers & coupons**\n\nWhat are you craving today?";
        }

        // Dinner / Popular recommendations
        if (q.includes("dinner") || q.includes("popular") || q.includes("recommend") || q.includes("craving")) {
          return "Here are our chef's top dinner recommendations tonight:\n\n1. **Royal Dum Biryani** - Fragrant basmati rice slow-cooked with saffron, caramelized onions, and tender spices.\n2. **Paneer Makhani / Butter Chicken** with Garlic Butter Naan - Rich, creamy tomato-velvet gravy.\n3. **Artisanal Wood-Fired Margherita Pizza** - Sourdough crust topped with San Marzano tomatoes, fresh mozzarella, and basil.\n\nWould you like recommendations for a specific cuisine?";
        }

        // Biryani
        if (q.includes("biryani") || q.includes("rice")) {
          return "Here are the finest Biryanis available on Nomato:\n\n1. **Hyderabadi Dum Biryani** - Authentic spiced long-grain basmati with mint raita.\n2. **Lucknowi Awadhi Biryani** - Delicate, aromatic saffron rice with tender marinated pieces.\n3. **Kolkata Mutton Biryani** - Subtle spices served with golden potatoes and boiled egg.\n4. **Paneer & Veg Saffroni Biryani** - Rich vegetarian alternative slow-cooked in a sealed handi.";
        }

        // Pizza & Italian
        if (q.includes("pizza") || q.includes("pasta") || q.includes("italian")) {
          return "Top Italian & Pizza picks on Nomato:\n\n1. **Classic Margherita Pizza** - San Marzano tomatoes, fresh mozzarella, extra virgin olive oil, and basil.\n2. **Quattro Formaggi Pizza** - Gorgonzola, parmesan, provolone, and creamy mozzarella.\n3. **Penne Arrabbiata** - Al dente pasta tossed in spicy garlic tomato sauce.\n4. **Fettuccine Alfredo** - Rich parmesan cream sauce with grilled mushrooms.";
        }

        // Chinese / Asian
        if (q.includes("chinese") || q.includes("noodle") || q.includes("manchurian") || q.includes("dimsum") || q.includes("momos")) {
          return "Cravings for Indo-Chinese & Asian delicacies:\n\n1. **Crispy Chilli Paneer / Chicken** - Tossed in fiery dark soy and green chillies.\n2. **Wok-Tossed Hakka Noodles** - Thin wheat noodles with crispy spring veggies.\n3. **Steamed Dim Sum / Momos** - Served with spicy Schezwan dipping sauce.\n4. **Hot & Sour Soup** - Pepper-spiced tangy broth with tofu and shredded veggies.";
        }

        // Vegetarian
        if (q.includes("veg") || q.includes("vegetarian") || q.includes("vegan") || q.includes("paneer")) {
          return "Top-rated vegetarian favorites on Nomato:\n\n1. **Dal Makhani & Jeera Rice** - Slow-simmered black lentils with churned white butter.\n2. **Paneer Butter Masala** - Cottage cheese in rich, mildly sweet cashew-tomato gravy.\n3. **Mediterranean Falafel Mezze** - Herb falafels, roasted garlic hummus, and pita bread.\n4. **Farmhouse Veggie Pizza** - Bell peppers, sweet corn, mushrooms, and black olives.";
        }

        // Breakfast & Morning
        if (q.includes("breakfast") || q.includes("morning") || q.includes("dosa") || q.includes("pancake")) {
          return "Energizing breakfast favorites:\n\n1. **Masala Dosa with Sambar** - Golden crisp fermented rice crepe with spiced potato mash and coconut chutney.\n2. **Fluffy Buttermilk Pancakes** - Drizzled with warm maple syrup and wild berries.\n3. **Chole Bhature** - Spiced Punjabi chickpeas served with puffed golden fried bread.\n4. **Avocado Sourdough Toast** - Smashed avocado, cherry tomatoes, and microgreens.";
        }

        // Desserts & Sweets
        if (q.includes("dessert") || q.includes("sweet") || q.includes("ice cream") || q.includes("cake") || q.includes("chocolate")) {
          return "Sweet tooth delights:\n\n1. **Warm Gulab Jamun** with Rabri - Soft khoya dumplings soaked in cardamom saffron syrup.\n2. **Molten Belgian Chocolate Lava Cake** - Warm gooey chocolate center served with vanilla bean gelato.\n3. **Classic Italian Tiramisu** - Coffee-soaked ladyfingers with whipped mascarpone cream.\n4. **Nutella & Banana Waffles** - Crispy Belgian waffles with drizzled dark chocolate.";
        }

        // Offers / Discounts
        if (q.includes("offer") || q.includes("discount") || q.includes("coupon") || q.includes("code") || q.includes("promo")) {
          return "Exclusive Nomato Promo Codes today:\n\n• **NOMATO50** - Get 50% off up to ₹100 on your first order!\n• **FEAST20** - Flat 20% off on orders above ₹499.\n• **FREEDEL** - Free delivery on orders above ₹299.\n\nApply these in your Cart during checkout!";
        }

        // Tracking & Orders
        if (q.includes("track") || q.includes("order") || q.includes("where is") || q.includes("status")) {
          return "To track your delivery live:\n\n1. Navigate to your **Orders** page from the top navigation bar.\n2. Click **Track Order** on any active delivery.\n3. View real-time GPS tracking of your rider on the interactive Leaflet map, along with delivery estimates!";
        }

        // Restaurant Partner / Seller
        if (q.includes("register") || q.includes("restaurant") || q.includes("seller") || q.includes("partner") || q.includes("menu")) {
          return "To join Nomato as a Restaurant Partner:\n\n1. Sign in and select the **Restaurant Partner** role.\n2. Open your **Seller Portal** to customize your restaurant name, cuisine tags, and banner.\n3. Add menu items with images, pricing, and dietary flags to begin receiving live customer orders!";
        }

        // Rider Partner
        if (q.includes("rider") || q.includes("deliver") || q.includes("job") || q.includes("earn")) {
          return "To deliver with Nomato:\n\n1. Sign in and select the **Rider Partner** role.\n2. Toggle your status to **Available** on the Rider Dashboard.\n3. Accept nearby broadcasted delivery requests, follow the map route, and earn instant trip payouts!";
        }

        // Support & Contact
        if (q.includes("support") || q.includes("contact") || q.includes("help") || q.includes("complaint") || q.includes("issue")) {
          return "We are here 24/7 to help!\n\n• **Email Support**: support.wehear@gmail.com\n• **Live Helpdesk**: Visit the [Support Page](/support) for quick ticket resolution and FAQs.\n• **Phone Support**: Available in the order details during active deliveries.";
        }

        // Default friendly response
        return `I'm **Nomato AI**, your dining concierge! I can help you discover dishes, find cuisine recommendations (Biryani, Italian, Chinese, Vegan, Desserts), track live deliveries, or give you promo codes. What are you in the mood for?`;
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
          "👋 Hi there! I'm **Nomato AI**, your personal food & dining assistant. What would you like help with?",
      },
    ]);
  };

  // Basic markdown-like parser for bold text and linebreaks
  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Replace **bold** with <strong>
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className={line.trim() === "" ? "h-2" : "mb-1 leading-relaxed"}>
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
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
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
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[560px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-5 py-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white">
                <FaUtensils className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-base tracking-wide">
                  <span>Nomato AI</span>
                  <BsStars className="w-3.5 h-3.5 text-yellow-300" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-red-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Food & Order Assistant</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Restart chat"
                className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition"
              >
                <BsArrowCounterclockwise className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition"
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
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl shadow-sm ${
                      isUser
                        ? "bg-red-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="text-gray-700">{renderFormattedText(msg.content)}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce"></span>
                  <span
                    className="w-2 h-2 rounded-full bg-red-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full bg-red-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length <= 2 && !loading && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-3 py-1.5 rounded-full transition border border-gray-200 hover:border-red-200 flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Nomato AI for recommendations..."
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-800 text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-40 disabled:hover:bg-red-500 text-white flex items-center justify-center transition shadow-md"
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
