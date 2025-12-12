import React, { useState, useMemo, useEffect } from 'react';
import { Loader2, BarChart3, Calendar as CalIcon, List, MessageSquare } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useCurrency } from './hooks/useCurrency';
import { calculateMonthlyCostUSD } from './utils/calculations';
import { exportToCSV } from './utils/calculations';
import { getCurrencySymbol } from './utils/currency';
import { CURRENCIES } from './utils/constants';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import CalendarView from './components/CalendarView';
import ListView from './components/ListView';
import StatsCharts from './components/StatsCharts';
import ChatView from './components/ChatView';
import DayDetailPanel from './components/DayDetailPanel';
import AddSubscriptionModal from './components/AddSubscriptionModal'; 

function App() {
  // --- HOOKS ---
  const { user, authLoading } = useAuth();
  const { subscriptions, dataLoading, handleAdd, handleUpdate, handleDelete } = useSubscriptions(user);
  const { currency, setCurrency } = useCurrency();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('calendar');
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('desc');

  // --- NOTIFICATIONS ---
  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
  }, []);

  // --- SORTING & FILTERING ---
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

  const selectedDateSubs = processedSubscriptions.filter(
    s => s.day === date.getDate() && s.status !== 'Canceled'
  );

  const totalMonthlyUSD = useMemo(
    () => subscriptions.reduce((acc, sub) => acc + calculateMonthlyCostUSD(sub), 0),
    [subscriptions]
  );
  const totalMonthlyConverted = (totalMonthlyUSD * CURRENCIES[currency].rate).toFixed(2);

  // --- HANDLERS ---
  const handleSort = (key) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('desc'); }
  };

  const handleEdit = (sub) => {
    setEditingSubscription(sub);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingSubscription(null);
    setShowModal(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingSubscription) {
        await handleUpdate(editingSubscription.id, { ...formData, uid: user.uid });
      } else {
        await handleAdd({ ...formData, uid: user.uid });
      }
      setShowModal(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error("Error saving subscription:", error);
    }
  };

  // --- LOADING & AUTH CHECKS ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // --- MAIN APP ---
  return (
    <div className="min-h-screen bg-black text-white font-sans p-3 sm:p-4 md:p-6 flex justify-center overflow-x-hidden">
      <div className="w-full max-w-7xl flex flex-col gap-4 md:gap-6">
        {/* HEADER */}
        <Header
          currency={currency}
          onCurrencyChange={setCurrency}
          onExport={() => exportToCSV(subscriptions)}
        />

        {/* MAIN CONTENT */}
        {dataLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-gray-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 flex-1">
            {/* LEFT PANEL */}
            <div className="lg:col-span-8 flex flex-col">
              {/* TABS */}
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-[#1C1C1E] p-1 rounded-2xl flex overflow-x-auto no-scrollbar w-full md:w-auto">
                  {[
                    { id: 'calendar', icon: CalIcon },
                    { id: 'list', icon: List },
                    { id: 'stats', icon: BarChart3 },
                    { id: 'chat', icon: MessageSquare }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap ${
                        activeTab === tab.id ? 'bg-[#3A3A3C] text-white' : 'text-gray-500'
                      }`}
                    >
                      <tab.icon size={18} />
                      <span className="hidden sm:inline">{tab.id}</span>
                    </button>
                  ))}
                </div>
                <div className="md:ml-auto flex justify-between md:block items-center border-t md:border-0 border-[#333] pt-4 md:pt-0">
                  <p className="text-xs text-gray-500 font-bold uppercase">Total Monthly</p>
                  <p className="text-xl md:text-2xl font-bold">
                    {getCurrencySymbol(currency)}{totalMonthlyConverted}
                  </p>
                </div>
              </div>

              {/* VIEWS */}
              {activeTab === 'calendar' && (
                <CalendarView
                  date={date}
                  onDateChange={setDate}
                  subsByDay={subsByDay}
                />
              )}

              {activeTab === 'list' && (
                <ListView
                  subscriptions={processedSubscriptions}
                  currency={currency}
                  showArchived={showArchived}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onToggleArchived={() => setShowArchived(!showArchived)}
                  onSort={handleSort}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}

              {activeTab === 'stats' && (
                <StatsCharts subscriptions={subscriptions} currency={currency} />
              )}

              {activeTab === 'chat' && (
                <ChatView subscriptions={subscriptions} currency={currency} />
              )}
            </div>

            {/* RIGHT PANEL - Day Details */}
            <div className="lg:col-span-4 flex flex-col gap-4 mt-6 lg:mt-[88px]">
              <DayDetailPanel
                date={date}
                subscriptions={selectedDateSubs}
                currency={currency}
                onAddClick={openAddModal}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      <AddSubscriptionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSubscription(null);
        }}
        onSubmit={handleModalSubmit}
        editingSubscription={editingSubscription}
        defaultDay={date.getDate()}
      />
    </div>
  );
}

export default App;