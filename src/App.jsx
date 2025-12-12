import React, { useState, useMemo, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, CartesianGrid } from 'recharts';
import { Plus, X, BarChart3, Calendar as CalIcon, Trash2, Zap, LogOut, Loader2, MessageSquare, Send, Search, List, Edit2, Download, Bell, Archive, Filter, ArrowUpDown } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore'; 
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth, googleProvider } from './firebase'; 
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIG ---
const GEMINI_API_KEY = "AIzaSyD1a5q-cQn2j_fOVAE39axbgMd5ycTdgRk"; 

// --- 1. DATA & CONSTANTS ---
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

const CURRENCIES = {
  'USD': { symbol: '$', rate: 1 },
  'EUR': { symbol: '€', rate: 0.92 },
  'GBP': { symbol: '£', rate: 0.78 },
  'INR': { symbol: '₹', rate: 83.5 }
};

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
  const [currency, setCurrency] = useState(() => localStorage.getItem('subday_currency') || 'USD');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // --- VIEW STATE ---
  const [showArchived, setShowArchived] = useState(false); 
  const [sortBy, setSortBy] = useState('price'); 
  const [sortOrder, setSortOrder] = useState('desc');

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
  const [formFrequency, setFormFrequency] = useState('Monthly'); 
  const [formLogo, setFormLogo] = useState(''); 
  const [formStatus, setFormStatus] = useState('Active'); 
  const [suggestions, setSuggestions] = useState([]); 

  // --- 1. LISTEN FOR LOGIN & NOTIFICATIONS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    if ("Notification" in window) Notification.requestPermission();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('subday_currency', currency);
  }, [currency]);

  // --- 2. FETCH DATA & CHECK ALERTS ---
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
        checkDueSoon(data);
      } catch (error) { console.error("Error fetching subs:", error); } 
      finally { setDataLoading(false); }
    };
    fetchSubs();
  }, [user]);

  // --- HELPER FUNCTIONS ---
  const checkDueSoon = (subs) => {
    const activeSubs = subs.filter(s => s.status !== 'Canceled');
    const today = new Date().getDate();
    const dueSoon = activeSubs.filter(s => s.day === today || s.day === today + 1);
    if (dueSoon.length > 0 && Notification.permission === "granted") {
      new Notification("SubDay Alert", { body: `You have ${dueSoon.length} payments due soon!` });
    }
  };

  const getDaysUntilDue = (day) => {
    const today = new Date().getDate();
    if (day === today) return "Due Today";
    let diff = day - today;
    if (diff < 0) diff += 30; 
    return `${diff} days left`;
  };

  const convertPrice = (priceUSD) => {
    const rate = CURRENCIES[currency].rate;
    return (parseFloat(priceUSD || 0) * rate).toFixed(2);
  };

  const calculateMonthlyCostUSD = (sub) => {
    if (sub.status === 'Canceled') return 0;
    const price = parseFloat(sub.price || 0);
    if (sub.frequency === 'Yearly') return price / 12;
    if (sub.frequency === 'Weekly') return price * 4;
    return price;
  };

  const exportToCSV = () => {
    const headers = "Name,Price(USD),Frequency,Category,Status,Due Day\n";
    const rows = subscriptions.map(s => `${s.name},${s.price},${s.frequency},${s.category},${s.status || 'Active'},${s.day}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subday_export.csv';
    a.click();
  };

  // --- 3. AI CHAT ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const activeSubs = subscriptions.filter(s => s.status !== 'Canceled');
      const totalCost = activeSubs.reduce((acc, sub) => acc + calculateMonthlyCostUSD(sub), 0).toFixed(2);
      const subsContext = activeSubs.map(s => `- ${s.name} (${s.frequency}): $${s.price}`).join("\n");

      const prompt = `Act as a financial assistant. User Currency: ${currency}. Total Monthly (USD base): $${totalCost}. Active Subs: ${subsContext}. Question: "${userMsg.text}". Keep it short.`;
      
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
      const result = await model.generateContent(prompt);
      const text = await result.response.text();

      setMessages(prev => [...prev, { role: 'ai', text: text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error." }]);
    } finally { setIsTyping(false); }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // --- CRUD ACTIONS ---
  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    let finalLogo = formLogo;
    if (!finalLogo) {
       const match = PRESET_SUBS.find(s => s.name.toLowerCase() === formName.toLowerCase());
       if (match) {
          finalLogo = getLogoUrl(match.domain);
          if(formColor === '#0A84FF') setFormColor(match.color); 
       }
    }

    const subData = {
      name: formName, 
      price: parseFloat(formPrice).toFixed(2), 
      day: parseInt(e.target.day.value),
      category: formCategory, 
      frequency: formFrequency,
      status: formStatus,
      color: formColor,
      logo: finalLogo, 
      uid: user.uid
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "subscriptions", editingId), subData);
        setSubscriptions(prev => prev.map(sub => sub.id === editingId ? { ...sub, ...subData } : sub));
      } else {
        const docRef = await addDoc(collection(db, "subscriptions"), { ...subData, createdAt: new Date() });
        setSubscriptions(prev => [...prev, { ...subData, id: docRef.id }]);
      }
      closeModal();
    } catch (error) { console.error("Error saving:", error); }
  };

  const handleEdit = (sub) => {
    setEditingId(sub.id);
    setFormName(sub.name);
    setFormPrice(sub.price);
    setFormCategory(sub.category);
    setFormColor(sub.color);
    setFormFrequency(sub.frequency || 'Monthly');
    setFormStatus(sub.status || 'Active');
    setFormLogo(sub.logo || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this subscription completely?")) return;
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    try { await deleteDoc(doc(db, "subscriptions", id)); } catch (error) { console.error("Error deleting:", error); }
  };

  // --- AUTOCOMPLETE ---
  const handleNameChange = (e) => {
    const input = e.target.value;
    setFormName(input);
    if (input.length > 1) {
      const matches = PRESET_SUBS.filter(s => s.name.toLowerCase().includes(input.toLowerCase()));
      setSuggestions(matches);
    } else { setSuggestions([]); }
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
    setEditingId(null);
    setFormName(''); setFormPrice(''); setFormLogo(''); setSuggestions([]); setFormStatus('Active');
  };

  // --- SORTING LOGIC ---
  const handleSort = (key) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('desc'); }
  };

  // --- DERIVED DATA ---
  const processedSubscriptions = useMemo(() => {
    let filtered = subscriptions;
    if (!showArchived) {
      filtered = filtered.filter(s => s.status !== 'Canceled');
    }
    
    return [...filtered].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      if (sortBy === 'price') {
        valA = parseFloat(a.price);
        valB = parseFloat(b.price);
      } else if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [subscriptions, showArchived, sortBy, sortOrder]);

  const subsByDay = useMemo(() => {
    const lookup = {};
    subscriptions.filter(s => s.status !== 'Canceled').forEach(sub => { 
      if (!lookup[sub.day]) lookup[sub.day] = []; 
      lookup[sub.day].push(sub); 
    });
    return lookup;
  }, [subscriptions]);

  const totalMonthlyUSD = useMemo(() => subscriptions.reduce((acc, sub) => acc + calculateMonthlyCostUSD(sub), 0), [subscriptions]);
  const totalMonthlyConverted = (totalMonthlyUSD * CURRENCIES[currency].rate).toFixed(2);
  const selectedDateSubs = processedSubscriptions.filter(s => s.day === date.getDate() && s.status !== 'Canceled');

  // Chart Data
  const chartData = useMemo(() => {
    const catMap = {};
    subscriptions.filter(s => s.status !== 'Canceled').forEach(sub => {
      const monthlyCost = calculateMonthlyCostUSD(sub);
      if (!catMap[sub.category]) {
        catMap[sub.category] = { name: sub.category, value: 0, color: sub.color };
      }
      catMap[sub.category].value += monthlyCost;
    });
    
    const pieData = Object.values(catMap).map(item => ({
      ...item,
      value: parseFloat((item.value * CURRENCIES[currency].rate).toFixed(2))
    })).filter(i => i.value > 0);

    const forecastData = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      forecastData.push({
        month: futureDate.toLocaleString('default', { month: 'short' }),
        amount: parseFloat((totalMonthlyUSD * CURRENCIES[currency].rate).toFixed(2))
      });
    }

    return { pie: pieData, forecast: forecastData };
  }, [subscriptions, totalMonthlyUSD, currency]);


  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1C1C1E] rounded-[40px] p-8 md:p-10 border border-[#333] text-center shadow-2xl">
          <div className="w-20 h-20 bg-[#2C2C2E] rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#444] shadow-lg">
             <Zap size={40} className="text-yellow-500" fill="currentColor"/>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">SubDay</h1>
          <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-white text-black py-4 md:py-5 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-3">Sign in with Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 md:p-6 flex justify-center overflow-x-hidden">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center px-2 gap-4">
           <h1 className="text-2xl font-bold flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">S</div>
             SubDay <span className="text-gray-500">Pro</span>
           </h1>
           <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-end">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)} 
                className="bg-[#1C1C1E] text-white px-3 py-2 rounded-xl outline-none text-sm font-bold border border-[#333]"
              >
                {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c} ({CURRENCIES[c].symbol})</option>)}
              </select>
              <button onClick={exportToCSV} className="bg-[#1C1C1E] p-2 rounded-full text-gray-400 hover:text-white" title="Export CSV"><Download size={20}/></button>
              <button onClick={() => signOut(auth)} className="bg-[#1C1C1E] p-2 rounded-full text-gray-400 hover:text-red-500"><LogOut size={20} /></button>
           </div>
        </div>

        {/* MAIN CONTENT */}
        {dataLoading ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-gray-600" size={40} /></div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1">
          
          {/* LEFT PANEL */}
          <div className="lg:col-span-8 flex flex-col">
             {/* TABS */}
             <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="bg-[#1C1C1E] p-1 rounded-2xl flex overflow-x-auto no-scrollbar w-full md:w-auto">
                  {[
                    {id: 'calendar', icon: CalIcon}, 
                    {id: 'list', icon: List},
                    {id: 'stats', icon: BarChart3}, 
                    {id: 'chat', icon: MessageSquare}
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap ${activeTab === tab.id ? 'bg-[#3A3A3C] text-white' : 'text-gray-500'}`}
                    >
                      <tab.icon size={18} /> <span className="hidden sm:inline">{tab.id}</span>
                    </button>
                  ))}
                </div>
                <div className="md:ml-auto flex justify-between md:block items-center border-t md:border-0 border-[#333] pt-4 md:pt-0">
                   <p className="text-xs text-gray-500 font-bold uppercase">Total Monthly</p>
                   <p className="text-xl md:text-2xl font-bold">{CURRENCIES[currency].symbol}{totalMonthlyConverted}</p>
                </div>
             </div>

             {/* VIEW: CALENDAR */}
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
                          <div key={i} className="w-6 h-6 rounded-md flex items-center justify-center shadow-sm overflow-hidden relative" style={{ backgroundColor: sub.color }}>
                            <span className="text-[10px] font-bold text-white z-0">{sub.name[0]}</span>
                            {sub.logo && <img src={sub.logo} alt="" className="absolute inset-0 w-full h-full object-cover z-10" onError={(e) => e.target.style.display = 'none'} />}
                          </div>
                        ))}
                        {subs.length > 3 && <div className="w-6 h-6 bg-[#3A3A3C] rounded-md text-[9px] flex items-center justify-center">+{subs.length - 3}</div>}
                      </div>
                    );
                  }}
                />
               </div>
             )}

             {/* VIEW: LIST */}
             {activeTab === 'list' && (
                <div className="bg-[#1C1C1E] rounded-[32px] p-4 md:p-6 border border-[#2C2C2E] h-[500px] md:h-[600px] flex flex-col">
                  {/* List Controls */}
                  <div className="flex flex-col md:flex-row justify-between mb-4 border-b border-[#333] pb-4 gap-4">
                    <div className="flex gap-2 overflow-x-auto">
                      <button onClick={() => handleSort('name')} className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg ${sortBy==='name' ? 'bg-white text-black' : 'text-gray-500 hover:bg-[#333]'}`}>Name <ArrowUpDown size={12}/></button>
                      <button onClick={() => handleSort('price')} className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg ${sortBy==='price' ? 'bg-white text-black' : 'text-gray-500 hover:bg-[#333]'}`}>Price <ArrowUpDown size={12}/></button>
                      <button onClick={() => handleSort('day')} className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg ${sortBy==='day' ? 'bg-white text-black' : 'text-gray-500 hover:bg-[#333]'}`}>Day <ArrowUpDown size={12}/></button>
                    </div>
                    <button onClick={() => setShowArchived(!showArchived)} className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap ${showArchived ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-[#333]'}`}>
                      <Archive size={12} /> {showArchived ? 'Hide History' : 'Show History'}
                    </button>
                  </div>

                  <div className="overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-left min-w-[500px]">
                      <thead className="text-gray-500 text-xs uppercase sticky top-0 bg-[#1C1C1E] z-10">
                        <tr>
                          <th className="pb-4 pl-2">Name</th>
                          <th className="pb-4">Cost</th>
                          <th className="pb-4">Freq</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {processedSubscriptions.map(sub => (
                          <tr key={sub.id} className={`border-b border-[#2C2C2E] last:border-0 hover:bg-[#2C2C2E] transition-colors group ${sub.status === 'Canceled' ? 'opacity-50 grayscale' : ''}`}>
                            <td className="py-4 pl-2 font-bold flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-xs flex-shrink-0" style={{backgroundColor: sub.color}}>
                                 {sub.logo ? <img src={sub.logo} className="w-full h-full object-cover" /> : sub.name[0]}
                              </div>
                              {sub.name}
                            </td>
                            <td className="py-4 font-mono">{CURRENCIES[currency].symbol}{convertPrice(sub.price)}</td>
                            <td className="py-4 text-gray-400">{sub.frequency || 'Monthly'}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold border ${sub.status === 'Canceled' ? 'bg-red-900/30 text-red-400 border-red-900' : 'bg-green-900/30 text-green-400 border-green-900'}`}>
                                {sub.status || 'Active'}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => handleEdit(sub)} className="p-2 hover:text-blue-400"><Edit2 size={16}/></button>
                                <button onClick={() => handleDelete(sub.id)} className="p-2 hover:text-red-500"><Trash2 size={16}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
             )}

             {/* VIEW: STATS */}
             {activeTab === 'stats' && (
               <div className="grid md:grid-cols-2 gap-6 h-full">
                  <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-[#2C2C2E] flex flex-col">
                    <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-4">Category Split</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData.pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5} stroke="none">
                            {chartData.pie.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(value) => `${CURRENCIES[currency].symbol}${value}`} contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-[#2C2C2E] flex flex-col">
                    <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-4">Cost Forecast</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.forecast}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                          <XAxis dataKey="month" stroke="#636366" axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="amount" stroke="#0A84FF" strokeWidth={4} dot={{r: 4, fill: '#0A84FF'}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
               </div>
             )}

             {/* VIEW: CHAT */}
             {activeTab === 'chat' && (
               <div className="bg-[#1C1C1E] rounded-[32px] p-6 h-[500px] md:h-[600px] flex flex-col border border-[#2C2C2E]">
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 mb-4">
                     {messages.map((msg, idx) => (
                       <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] md:max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#0A84FF] text-white rounded-br-sm' : 'bg-[#2C2C2E] text-gray-200 rounded-bl-sm'}`}>
                             {msg.role === 'ai' && <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400"><Zap size={12} fill="currentColor" className="text-yellow-500"/> SubDay AI</div>}
                             {msg.text}
                          </div>
                       </div>
                     ))}
                     {isTyping && <div className="flex items-center gap-2 text-xs text-gray-500 ml-4 animate-pulse">Thinking...</div>}
                     <div ref={messagesEndRef} />
                  </div>
                  <div className="flex gap-2 relative">
                     <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask AI..." className="flex-1 bg-black border border-[#333] rounded-2xl px-4 md:px-6 py-4 outline-none focus:border-[#0A84FF] text-white" />
                     <button onClick={handleSendMessage} disabled={!chatInput.trim() || isTyping} className="bg-[#0A84FF] text-white p-4 rounded-2xl hover:bg-blue-600 disabled:opacity-50"><Send size={20} /></button>
                  </div>
               </div>
             )}
          </div>

          {/* RIGHT SIDE DETAILS (Stacked on mobile) */}
          <div className="lg:col-span-4 flex flex-col gap-4 mt-6 lg:mt-[88px]">
             <div className="bg-[#1C1C1E] rounded-3xl p-6 flex-1 flex flex-col border border-[#2C2C2E] min-h-[300px] md:min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                   <div>
                     <h2 className="text-2xl md:text-3xl font-bold">{date.getDate()} {date.toLocaleString('default', { month: 'short' })}</h2>
                     <p className="text-gray-500 font-bold text-sm">Due Today: {CURRENCIES[currency].symbol}{selectedDateSubs.reduce((a,c)=>a+parseFloat(convertPrice(c.price)),0).toFixed(2)}</p>
                   </div>
                   <button onClick={() => { setEditingId(null); setFormName(''); setFormPrice(''); setFormStatus('Active'); setShowModal(true); }} className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform"><Plus /></button>
                </div>

                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1 max-h-[300px] lg:max-h-none">
                   {selectedDateSubs.length > 0 ? selectedDateSubs.map(sub => (
                     <div key={sub.id} className="bg-[#000] p-4 rounded-2xl flex items-center justify-between border border-[#2C2C2E] group">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden relative" style={{ backgroundColor: sub.color }}>
                              <span className="text-white z-0">{sub.name[0]}</span>
                              {sub.logo && <img src={sub.logo} alt="" className="absolute inset-0 w-full h-full object-cover z-10" onError={(e) => e.target.style.display = 'none'} />}
                           </div>
                           <div>
                              <p className="font-bold">{sub.name}</p>
                              <p className="text-xs text-gray-500 font-bold uppercase">{sub.category} • {sub.frequency}</p>
                           </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                           <p className="font-bold text-lg">{CURRENCIES[currency].symbol}{convertPrice(sub.price)}</p>
                           <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(sub)} className="text-blue-400"><Edit2 size={14}/></button>
                              <button onClick={() => handleDelete(sub.id)} className="text-red-500"><Trash2 size={14}/></button>
                           </div>
                        </div>
                     </div>
                   )) : (
                     <div className="h-full flex items-center justify-center text-gray-600 font-bold flex-col gap-2 min-h-[200px]">
                        <Bell size={30} className="opacity-20"/>
                        No payments due
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
        )}
      </div>

      {/* MODAL (Responsive) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 md:p-6">
          <div className="bg-[#1C1C1E] w-full max-w-md p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-[#333] shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-[#1C1C1E] z-10 pb-2">
               <h2 className="text-xl md:text-2xl font-bold text-white">{editingId ? 'Edit Subscription' : 'New Subscription'}</h2>
               <button onClick={closeModal} className="bg-[#2C2C2E] p-2 rounded-full text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAddOrUpdate} className="space-y-5 md:space-y-6">
              {/* AUTOCOMPLETE INPUT */}
              <div className="relative group z-50">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Service Name</label>
                <div className="relative">
                  <input value={formName} onChange={handleNameChange} placeholder="Search (e.g. Netflix)..." className="w-full bg-[#000] border border-[#333] rounded-2xl p-4 md:p-5 text-lg font-bold focus:border-[#0A84FF] outline-none pl-12" autoFocus required />
                  <Search className="absolute left-4 top-5 text-gray-600" size={20} />
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#2C2C2E] border border-[#333] rounded-2xl overflow-hidden shadow-2xl max-h-40 overflow-y-auto z-50">
                    {suggestions.map((sub, i) => (
                      <button key={i} type="button" onClick={() => selectSuggestion(sub)} className="w-full text-left p-3 hover:bg-[#3A3A3C] flex items-center gap-3 transition-colors border-b border-[#333]">
                         <img src={getLogoUrl(sub.domain)} className="w-6 h-6 rounded bg-white" alt="" onError={(e)=>e.target.style.display='none'} />
                         <span className="font-bold text-white">{sub.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Price (USD)</label>
                  <input name="price" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} type="number" step="0.01" className="w-full bg-[#000] border border-[#333] rounded-2xl p-4 md:p-5 text-lg font-bold focus:border-[#0A84FF] outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Day Due</label>
                  <input name="day" type="number" min="1" max="31" defaultValue={editingId ? undefined : date.getDate()} className="w-full bg-[#000] border border-[#333] rounded-2xl p-4 md:p-5 text-lg font-bold focus:border-[#0A84FF] outline-none" required />
                </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Frequency</label>
                    <div className="flex bg-[#000] p-1 rounded-2xl border border-[#333]">
                       {['Monthly', 'Yearly', 'Weekly'].map(freq => (
                          <button key={freq} type="button" onClick={() => setFormFrequency(freq)} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${formFrequency === freq ? 'bg-[#3A3A3C] text-white' : 'text-gray-500'}`}>{freq}</button>
                       ))}
                    </div>
                 </div>
                 <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Status</label>
                    <div className="flex bg-[#000] p-1 rounded-2xl border border-[#333]">
                       {['Active', 'Canceled'].map(status => (
                          <button key={status} type="button" onClick={() => setFormStatus(status)} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${formStatus === status ? (status === 'Active' ? 'bg-green-900/50 text-white' : 'bg-red-900/50 text-white') : 'text-gray-500'}`}>{status}</button>
                       ))}
                    </div>
                 </div>
              </div>

              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">Category</label>
                 <div className="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
                    {['Entertainment', 'Productivity', 'Shopping', 'Health', 'Gaming', 'Work'].map(cat => (
                      <button key={cat} type="button" onClick={() => setFormCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border ${formCategory === cat ? 'bg-white text-black border-white' : 'bg-[#000] text-gray-500 border-[#333]'}`}>{cat}</button>
                    ))}
                 </div>
              </div>

              <button className="w-full bg-white text-black py-4 md:py-5 rounded-2xl font-bold text-lg mt-4 hover:bg-gray-200 transition-colors">{editingId ? 'Update Subscription' : 'Add Subscription'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;