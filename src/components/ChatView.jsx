import React, { useState, useRef, useEffect } from 'react';
import { Zap, Send } from 'lucide-react';
import { generateAIResponse } from '../services/gemini';

const ChatView = ({ subscriptions, currency }) => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: "Hi! I'm SubDay AI. I've analyzed your monthly spending. How can I help you save money today?" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(chatInput, subscriptions, currency);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#1C1C1E] rounded-[24px] md:rounded-[32px] p-4 md:p-6 h-[450px] md:h-[600px] flex flex-col border border-[#2C2C2E]">
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 md:space-y-4 pr-1 md:pr-2 mb-3 md:mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] md:max-w-[80%] p-3 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#0A84FF] text-white rounded-br-sm' 
                : 'bg-[#2C2C2E] text-gray-200 rounded-bl-sm'
            }`}>
              {msg.role === 'ai' && (
                <div className="flex items-center gap-2 mb-2 text-[10px] md:text-xs font-bold text-gray-400">
                  <Zap size={10} fill="currentColor" className="text-yellow-500 md:w-3 md:h-3"/> SubDay AI
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 ml-4 animate-pulse">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-2 relative">
        <input 
          value={chatInput} 
          onChange={(e) => setChatInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
          placeholder="Ask AI..." 
          className="flex-1 bg-black border border-[#333] rounded-xl md:rounded-2xl px-3 md:px-6 py-3 md:py-4 outline-none focus:border-[#0A84FF] text-white text-sm md:text-base" 
        />
        <button 
          onClick={handleSendMessage} 
          disabled={!chatInput.trim() || isTyping} 
          className="bg-[#0A84FF] text-white p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-blue-600 disabled:opacity-50 flex-shrink-0"
        >
          <Send size={16} className="md:hidden" />
          <Send size={20} className="hidden md:block" />
        </button>
      </div>
    </div>
  );
};

export default ChatView;
