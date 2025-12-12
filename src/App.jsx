import React, { useState, useMemo, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, CartesianGrid } from 'recharts';
import { Plus, X, BarChart3, Calendar as CalIcon, Trash2, Zap, LogOut, Loader2, MessageSquare, Send, Search } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore'; 
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth, googleProvider } from './firebase'; 
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIG ---
// ⚠️ REPLACE THIS WITH YOUR ACTUAL GEMINI API KEY
const GEMINI_API_KEY = "AIzaSyD1a5q-cQn2j_fOVAE39axbgMd5ycTdgRk"; 

// --- 1. EXPANDED KNOWLEDGE BASE ---
const PRESET_SUBS = [
  { name: 'Netflix', domain: 'netflix.com', cat: 'Entertainment', color: '#E50914', price: '15.49' },
  { name: 'Spotify', domain: 'spotify.com', cat: 'Entertainment', color: '#1DB954', price: '11.99' },
  { name: 'Amazon Prime', domain: 'amazon.com', cat: 'Shopping', color: '#00A8E1', price: '14.99' },
  { name: 'Apple One', domain: 'apple.com', cat: 'Productivity', color: '#000000', price: '19.95' },
  { name: 'Disney+', domain: 'disneyplus.com', cat: 'Entertainment', color: '#113CCF', price: '13.99' },
  { name: 'Hulu', domain: 'hulu.com', cat: 'Entertainment', color: '#1CE783', price: '7.99' },
  { name: 'YouTube Premium', domain: 'youtube.com', cat: 'Entertainment', color: '#FF0000', price: '13.99' },
  { name: 'ChatGPT Plus', domain: 'openai.com', cat: 'Productivity', color: '#74AA9C', price: '20.00' },
  { name: 'Adobe Creative Cloud', domain: 'adobe.com', cat: 'Productivity', color: '#FF0000', price: '59.99' },
  { name: 'Dropbox', domain: 'dropbox.com', cat: 'Productivity', color: '#0061FF', price: '11.99' },
  { name: 'Gym Membership', domain: 'equinox.com', cat: 'Health', color: '#F59E0B', price: '45.00' },
  { name: 'PlayStation Plus', domain: 'playstation.com', cat: 'Gaming', color: '#00439C', price: '9.99' },
  { name: 'Xbox Game Pass', domain: 'xbox.com', cat: 'Gaming', color: '#107C10', price: '16.99' },
  { name: 'Slack', domain: 'slack.com', cat: 'Work', color: '#4A154B', price: '8.75' },
  { name: 'Zoom', domain: 'zoom.us', cat: 'Work', color: '#2D8CFF', price: '15.99' },
];

// Helper to get reliable logo URL
const getLogoUrl = (domain) => `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;

function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- APP STATE ---
  const [activeTab, setActiveTab] = useState('calendar'); 
  const [date, setDate] = useState(new Date());
  const [subscriptions, setSubscriptions] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // --- CHAT STATE ---
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm SubDay AI. I've analyzed your monthly spending. How can I help you save money today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // -- Form State --
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#0A84FF'); 
  const [formCategory, setFormCategory] = useState('Entertainment');
  const [formPrice, setFormPrice] = useState('');
  const [formLogo, setFormLogo] = useState(''); 
  const [suggestions, setSuggestions] = useState([]); 

  // --- 1. LISTEN FOR LOGIN STATUS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. FETCH PRIVATE DATA ---
  useEffect(() => {
    const fetchSubs = async () => {
      if (!user) return; 
      setDataLoading(true);
      try {
        const q = query(collection(db, "subscriptions"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => a.day - b.day);
        setSubscriptions(data);
      } catch (error) { console.error("Error fetching subs:", error); } 
      finally { setDataLoading(false); }
    };
    fetchSubs();
  }, [user]);

  // --- 3. AI CHAT LOGIC ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const totalCost = subscriptions.reduce((acc, sub) => acc + parseFloat(sub.price), 0).toFixed(2);
      const subsContext = subscriptions.map(s => 
        `- ${s.name} (${s.category}): $${s.price} due on day ${s.day}`
      ).join("\n");

      const prompt = `
        Act as a friendly financial assistant for 'SubDay'.
        USER DATA: Total Spend: $${totalCost}. Active Subscriptions: ${subsContext}
        USER QUESTION: "${userMsg.text}"
        INSTRUCTIONS: Answer concisely. Be encouraging.
      `;

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
      const result = await model.generateContent(prompt);
      const text = await result.response.text();

      setMessages(prev => [...prev, { role: 'ai', text: text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Please check API Key." }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- ACTIONS ---
  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (error) { console.error("Login failed", error); } };
  const handleLogout = async () => { await signOut(auth); setSubscriptions([]); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Smart Logo Logic: If no logo selected, try to find a match by name
    let finalLogo = formLogo;
    let finalColor = formColor;
    let finalCategory = formCategory;

    if (!finalLogo) {
       const match = PRESET_SUBS.find(s => s.name.toLowerCase() === formName.toLowerCase());
       if (match) {
          finalLogo = getLogoUrl(match.domain);
          finalColor = match.color;
          finalCategory = match.cat;
       }
    }

    const newSub = {
      name: formName, 
      price: parseFloat(formPrice).toFixed(2), 
      day: parseInt(e.target.day.value),
      category: finalCategory, 
      color: finalColor,
      logo: finalLogo, 
      createdAt: new Date(), 
      uid: user.uid
    };

    try {
      const docRef = await addDoc(collection(db, "subscriptions"), newSub);
      setSubscriptions(prev => [...prev, { ...newSub, id: docRef.id }].sort((a,b) => a.day - b.day));
      closeModal();
    } catch (error) { console.error("Error adding document: ", error); }
  };

  const handleDelete = async (id) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    try { await deleteDoc(doc(db, "subscriptions", id)); } catch (error) { console.error("Error deleting:", error); }
  };

  // --- AUTOCOMPLETE LOGIC ---
  const handleNameChange = (e) => {
    const input = e.target.value;
    setFormName(input);
    if (input.length > 1) {
      const matches = PRESET_SUBS.filter(s => s.name.toLowerCase().includes(input.toLowerCase()));
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (sub) => {
    setFormName(sub.name);
    setFormPrice(sub.price);
    setFormCategory(sub.cat);
    setFormColor(sub.color);
    setFormLogo(getLogoUrl(sub.domain));
    setSuggestions([]);
  };

  const closeModal = () => {
    setShowModal(false); 
    setFormName(''); 
    setFormPrice(''); 
    setFormLogo(''); 
    setSuggestions([]);
  };

  // --- DERIVED DATA ---
  const subsByDay = useMemo(() => {
    const lookup = {};
    subscriptions.forEach(sub => { if (!lookup[sub.day]) lookup[sub.day] = []; lookup[sub.day].push(sub); });
    return lookup;
  }, [subscriptions]);

  const totalMonthly = useMemo(() => subscriptions.reduce((acc, sub) => acc + parseFloat(sub.price || 0), 0), [subscriptions]);
  const selectedDateSubs = subscriptions.filter(s => s.day === date.getDate());

  const forecastData = useMemo(() => [
    { month: 'Jan', amount: totalMonthly }, { month: 'Feb', amount: totalMonthly },
    { month: 'Mar', amount: totalMonthly }, { month: 'Apr', amount: totalMonthly },
    { month: 'May', amount: totalMonthly }, { month: 'Jun', amount: totalMonthly },
  ], [totalMonthly]);

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1C1C1E] rounded-[40px] p-10 border border-[#333] text-center shadow-2xl">
          <div className="w-20 h-20 bg-[#2C2C2E] rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#444] shadow-lg">
             <Zap size={40} className="text-yellow-500" fill="currentColor"/>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">SubDay</h1>
          <p className="text-gray-500 font-medium mb-10 text-lg">Master your monthly subscriptions.</p>
          <button onClick={handleLogin} className="w-full bg-white text-black py-5 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-3">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 flex justify-center overflow-hidden">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center px-2">
           <h1 className="text-2xl font-bold flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">S</div>
             SubDay <span className="text-gray-500">Pro</span>
           </h1>
           <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-500 hidden md:block">Hi, {user.displayName.split(' ')[0]}</span>
              <button onClick={handleLogout} className="bg-[#1C1C1E] p-3 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
           </div>
        </div>

        {/* MAIN CONTENT GRID */}
        {dataLoading ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-gray-600" size={40} /></div>
        ) : (
        <div className="grid lg:grid-cols-12 gap-8 flex-1">
          
          {/* LEFT SIDE: MAIN VIEW */}
          <div className="lg:col-span-8 flex flex-col">
             
             {/* Toggle Switcher */}
             <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#1C1C1E] p-1 rounded-2xl flex">
                  {['calendar', 'stats', 'chat'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-[#3A3A3C] text-white' : 'text-gray-500'}`}
                    >
                      {tab === 'calendar' && <CalIcon size={18} />}
                      {tab === 'stats' && <BarChart3 size={18} />}
                      {tab === 'chat' && <MessageSquare size={18} />}
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="ml-auto text-right">
                   <p className="text-xs text-gray-500 font-bold uppercase">Monthly</p>
                   <p className="text-xl font-bold">${totalMonthly.toFixed(2)}</p>
                </div>
             </div>

             {/* 1. CALENDAR VIEW */}
             {activeTab === 'calendar' && (
               <div className="flex-1">
                 <Calendar 
                  onChange={setDate} 
                  value={date} 
                  tileContent={({ date: tileDate }) => {
                    const subs = subsByDay[tileDate.getDate()];
                    if (!subs || tileDate.getMonth() !== date.getMonth()) return null; 
                    return (
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
                        {subs.slice(0, 3).map((sub, i) => (
                          <div 
                            key={i} 
                            className="w-6 h-6 rounded-md flex items-center justify-center shadow-sm overflow-hidden relative" 
                            style={{ backgroundColor: sub.color }}
                          >
                            {/* Fallback Initial always behind */}
                            <span className="text-[10px] font-bold text-white z-0">{sub.name[0]}</span>
                            {/* Logo on top, hides on error */}
                            {sub.logo && (
                              <img 
                                src={sub.logo} 
                                alt={sub.name} 
                                className="absolute inset-0 w-full h-full object-cover z-10" 
                                onError={(e) => e.target.style.display = 'none'} 
                              />
                            )}
                          </div>
                        ))}
                        {subs.length > 3 && <div className="w-6 h-6 bg-[#3A3A3C] rounded-md text-[9px] flex items-center justify-center">+{subs.length - 3}</div>}
                      </div>
                    );
                  }}
                />
               </div>
             )}

             {/* 2. STATS VIEW */}
             {activeTab === 'stats' && (
               <div className="grid md:grid-cols-2 gap-6 h-full">
                  <div className="bg-[#1C1C1E] rounded-[32px] p-8 border border-[#2C2C2E] flex flex-col">
                    <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-4">Category Split</h3>
                    <div className="flex-1 min-h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={subscriptions} dataKey="price" nameKey="category" innerRadius={80} outerRadius={100} paddingAngle={5} stroke="none">
                            {subscriptions.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-[#1C1C1E] rounded-[32px] p-8 border border-[#2C2C2E] flex flex-col">
                    <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-4">Forecast</h3>
                    <div className="flex-1 min-h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecastData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                          <XAxis dataKey="month" stroke="#636366" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold' }} />
                          <Line type="monotone" dataKey="amount" stroke="#0A84FF" strokeWidth={4} dot={{r: 4, fill: '#0A84FF', strokeWidth: 0}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
               </div>
             )}

             {/* 3. CHAT VIEW */}
             {activeTab === 'chat' && (
               <div className="bg-[#1C1C1E] rounded-[32px] p-6 h-[80vh] flex flex-col border border-[#2C2C2E]">
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 mb-4">
                     {messages.map((msg, idx) => (
                       <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#0A84FF] text-white rounded-br-sm' : 'bg-[#2C2C2E] text-gray-200 rounded-bl-sm'}`}>
                             {msg.role === 'ai' && <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400"><Zap size={12} fill="currentColor" className="text-yellow-500"/> SubDay AI</div>}
                             {msg.text}
                          </div>
                       </div>
                     ))}
                     {isTyping && <div className="flex items-center gap-2 text-xs text-gray-500 ml-4 animate-pulse">Thinking...</div>}
                     <div ref={messagesEndRef} />
                  </div>
                  <div className="flex gap-2 relative">
                     <input 
                       value={chatInput}
                       onChange={(e) => setChatInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                       placeholder="Ask about your budget..." 
                       className="flex-1 bg-black border border-[#333] rounded-2xl px-6 py-4 outline-none focus:border-[#0A84FF] transition-all text-white"
                     />
                     <button onClick={handleSendMessage} disabled={!chatInput.trim() || isTyping} className="bg-[#0A84FF] text-white p-4 rounded-2xl hover:bg-blue-600 disabled:opacity-50">
                        <Send size={20} />
                     </button>
                  </div>
               </div>
             )}
          </div>

          {/* RIGHT SIDE: DETAILS */}
          <div className="lg:col-span-4 flex flex-col gap-4 mt-[88px]">
             <div className="bg-[#1C1C1E] rounded-3xl p-6 flex-1 flex flex-col border border-[#2C2C2E]">
                <div className="flex justify-between items-center mb-6">
                   <div>
                     <h2 className="text-3xl font-bold">{date.getDate()} {date.toLocaleString('default', { month: 'short' })}</h2>
                     <p className="text-gray-500 font-bold text-sm">Total: ${selectedDateSubs.reduce((a,c)=>a+parseFloat(c.price),0).toFixed(2)}</p>
                   </div>
                   <button onClick={() => setShowModal(true)} className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform"><Plus /></button>
                </div>

                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                   {selectedDateSubs.length > 0 ? selectedDateSubs.map(sub => (
                     <div key={sub.id} className="bg-[#000] p-4 rounded-2xl flex items-center justify-between border border-[#2C2C2E]">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden relative" style={{ backgroundColor: sub.color }}>
                              {/* Fallback Initial */}
                              <span className="text-white z-0">{sub.name[0]}</span>
                              {/* Logo on top */}
                              {sub.logo && (
                                <img 
                                  src={sub.logo} 
                                  alt={sub.name} 
                                  className="absolute inset-0 w-full h-full object-cover z-10"
                                  onError={(e) => e.target.style.display = 'none'} 
                                />
                              )}
                           </div>
                           <div>
                              <p className="font-bold">{sub.name}</p>
                              <p className="text-xs text-gray-500 font-bold uppercase">{sub.category}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-lg">${sub.price}</p>
                           <button onClick={() => handleDelete(sub.id)} className="text-[#333] hover:text-red-500 text-xs mt-1 transition-colors"><Trash2 size={16}/></button>
                        </div>
                     </div>
                   )) : (
                     <div className="h-full flex items-center justify-center text-gray-600 font-bold">No payments due</div>
                   )}
                </div>
             </div>
          </div>
        </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-6">
          <div className="bg-[#1C1C1E] w-full max-w-md p-8 rounded-[40px] border border-[#333] shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold text-white">New Subscription</h2>
               <button onClick={closeModal} className="bg-[#2C2C2E] p-2 rounded-full text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-6">
              
              {/* SEARCH / NAME INPUT */}
              <div className="relative group z-50">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Service Name</label>
                <div className="relative">
                  <input 
                    value={formName} 
                    onChange={handleNameChange} 
                    placeholder="Search (e.g. Netflix)..." 
                    className="w-full bg-[#000] border border-[#333] rounded-2xl p-5 text-lg font-bold focus:border-[#0A84FF] outline-none pl-12" 
                    autoFocus 
                    required 
                  />
                  <Search className="absolute left-4 top-5 text-gray-600" size={20} />
                </div>
                
                {/* AUTOCOMPLETE DROPDOWN */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#2C2C2E] border border-[#333] rounded-2xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto z-50">
                    {suggestions.map((sub, i) => (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => selectSuggestion(sub)}
                        className="w-full text-left p-4 hover:bg-[#3A3A3C] flex items-center gap-3 transition-colors border-b border-[#333] last:border-0"
                      >
                         <img src={getLogoUrl(sub.domain)} className="w-8 h-8 rounded-lg bg-white" alt="" onError={(e)=>e.target.style.display='none'} />
                         <div>
                            <p className="font-bold text-white">{sub.name}</p>
                            <p className="text-xs text-gray-400">{sub.cat}</p>
                         </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Price</label>
                  <input name="price" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} type="number" step="0.01" className="w-full bg-[#000] border border-[#333] rounded-2xl p-5 text-lg font-bold focus:border-[#0A84FF] outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Day</label>
                  <input name="day" type="number" min="1" max="31" className="w-full bg-[#000] border border-[#333] rounded-2xl p-5 text-lg font-bold focus:border-[#0A84FF] outline-none" required />
                </div>
              </div>

              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Category</label>
                 <div className="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
                    {['Entertainment', 'Productivity', 'Shopping', 'Health', 'Gaming', 'Work'].map(cat => (
                      <button 
                        key={cat} 
                        type="button" 
                        onClick={() => setFormCategory(cat)} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border ${formCategory === cat ? 'bg-white text-black border-white' : 'bg-[#000] text-gray-500 border-[#333]'}`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>
              </div>

              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Color Tag</label>
                 <div className="flex gap-2 overflow-x-auto py-2">
                    {['#E50914', '#1DB954', '#0A84FF', '#F59E0B', '#A78BFA', '#000000'].map(color => (
                      <button key={color} type="button" onClick={() => setFormColor(color)} className={`w-10 h-10 rounded-full border-2 ${formColor === color ? 'scale-110 border-white' : 'border-transparent opacity-50'}`} style={{ backgroundColor: color }} />
                    ))}
                 </div>
              </div>
              <button className="w-full bg-white text-black py-5 rounded-2xl font-bold text-lg mt-4 hover:bg-gray-200 transition-colors">Save Subscription</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;