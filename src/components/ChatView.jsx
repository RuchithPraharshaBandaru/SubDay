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
    <div className="bg-[#1C1C1E] rounded-[32px] p-6 h-[500px] md:h-[600px] flex flex-col border border-[#2C2C2E]">
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#0A84FF] text-white rounded-br-sm' 
                : 'bg-[#2C2C2E] text-gray-200 rounded-bl-sm'
            }`}>
              {msg.role === 'ai' && (
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400">
                  <Zap size={12} fill="currentColor" className="text-yellow-500"/> SubDay AI
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-500 ml-4 animate-pulse">
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
          className="flex-1 bg-black border border-[#333] rounded-2xl px-4 md:px-6 py-4 outline-none focus:border-[#0A84FF] text-white" 
        />
        <button 
          onClick={handleSendMessage} 
          disabled={!chatInput.trim() || isTyping} 
          className="bg-[#0A84FF] text-white p-4 rounded-2xl hover:bg-blue-600 disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatView;
