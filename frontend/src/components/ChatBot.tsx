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
        if (q.includes("dinner") || q.includes("popular") || q.includes("recommend") || q.includes("dish")) {
          return "Here are our chef's top dinner recommendations for tonight:\n\n1. **Royal Dum Biryani** - Fragrant basmati rice slow-cooked with saffron, caramelized onions, and tender spices.\n2. **Paneer Tikka Makhani / Butter Chicken** with Garlic Butter Naan - Rich, creamy tomato-velvet gravy.\n3. **Artisanal Wood-Fired Margherita Pizza** - Sourdough crust topped with San Marzano tomatoes, fresh mozzarella, and basil.\n\nWould you like recommendations for a specific cuisine (e.g. North Indian, Italian, Chinese)?";
        }
        if (q.includes("veg") || q.includes("vegetarian") || q.includes("vegan")) {
          return "Here are top-rated vegetarian favorites on Nomato:\n\n1. **Dal Makhani & Jeera Rice** - Slow-simmered black lentils with churned butter.\n2. **Crispy Chilli Paneer** - Indo-Chinese street-style wok toss with bell peppers.\n3. **Mediterranean Falafel Bowl** - Herb falafels, hummus, tabbouleh, and warm pita.\n4. **Farmhouse Veggie Pizza** - Bell peppers, sweet corn, mushrooms, and olives.";
        }
        if (q.includes("track") || q.includes("order") || q.includes("where is")) {
          return "To track your delivery:\n\n1. Navigate to your **Orders** dashboard from the navigation bar.\n2. Tap **Track Order** to open the real-time Leaflet map view with live GPS coordinates.\n3. You'll also see estimated delivery time and rider contact information!";
        }
        if (q.includes("register") || q.includes("restaurant") || q.includes("seller") || q.includes("partner")) {
          return "To register your restaurant on Nomato:\n\n1. Sign in and select the **Restaurant Partner** role.\n2. Open your **Seller Portal** to set up your restaurant name, location, and cuisine tags.\n3. Add menu items with images, pricing, and dietary flags to start accepting orders immediately!";
        }
        if (q.includes("rider") || q.includes("deliver")) {
          return "To deliver with Nomato:\n\n1. Log in and choose the **Rider Partner** role.\n2. Toggle your status to **Available** in the Rider Dashboard.\n3. Accept incoming orders, view pickup navigation, and mark orders delivered to earn payouts!";
        }
        return `I'm **Nomato AI**, your food and dining concierge! I can help you discover delicious dishes, customize orders, or navigate your restaurant & delivery accounts. What cuisine or dish are you craving?`;
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
