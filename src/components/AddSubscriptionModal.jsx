import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { PRESET_SUBS, CATEGORIES, FREQUENCIES, STATUSES } from '../utils/constants';
import { getLogoUrl } from '../utils/currency';

const AddSubscriptionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingSubscription = null,
  defaultDay 
}) => {
  const [formData, setFormData] = useState({
    name: editingSubscription?.name || '',
    price: editingSubscription?.price || '',
    day: editingSubscription?.day || defaultDay,
    category: editingSubscription?.category || 'Entertainment',
    frequency: editingSubscription?.frequency || 'Monthly',
    status: editingSubscription?.status || 'Active',
    color: editingSubscription?.color || '#0A84FF',
    logo: editingSubscription?.logo || ''
  });
  
  const [suggestions, setSuggestions] = useState([]);

  if (!isOpen) return null;

  const handleNameChange = (value) => {
    setFormData(prev => ({ ...prev, name: value }));
    
    if (value.length > 1) {
      const matches = PRESET_SUBS.filter(s => 
        s.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (sub) => {
    setFormData({
      ...formData,
      name: sub.name,
      price: sub.price,
      category: sub.cat,
      color: sub.color,
      logo: getLogoUrl(sub.domain)
    });
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalLogo = formData.logo;
    if (!finalLogo) {
      const match = PRESET_SUBS.find(s => 
        s.name.toLowerCase() === formData.name.toLowerCase()
      );
      if (match) {
        finalLogo = getLogoUrl(match.domain);
      }
    }

    onSubmit({
      ...formData,
      price: parseFloat(formData.price).toFixed(2),
      day: parseInt(formData.day),
      logo: finalLogo
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 md:p-6">
      <div className="bg-[#1C1C1E] w-full max-w-md p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-[#333] shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-[#1C1C1E] z-10 pb-2">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {editingSubscription ? 'Edit Subscription' : 'New Subscription'}
          </h2>
          <button onClick={onClose} className="bg-[#2C2C2E] p-2 rounded-full text-gray-400 hover:text-white">
            <X size={20}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          {/* Service Name with Autocomplete */}
          <div className="relative group z-50">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">
              Service Name
            </label>
            <div className="relative">
              <input 
                value={formData.name} 
                onChange={(e) => handleNameChange(e.target.value)} 
                placeholder="Search (e.g. Netflix)..." 
                className="w-full bg-[#000] border border-[#333] rounded-2xl p-4 md:p-5 text-lg font-bold focus:border-[#0A84FF] outline-none pl-12" 
                autoFocus 
                required 
              />
              <Search className="absolute left-4 top-5 text-gray-600" size={20} />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#2C2C2E] border border-[#333] rounded-2xl overflow-hidden shadow-2xl max-h-40 overflow-y-auto z-50">
                {suggestions.map((sub, i) => (
                  <button 
                    key={i} 
                    type="button" 
                    onClick={() => selectSuggestion(sub)} 
                    className="w-full text-left p-3 hover:bg-[#3A3A3C] flex items-center gap-3 transition-colors border-b border-[#333]"
                  >
                    <img 
                      src={getLogoUrl(sub.domain)} 
                      className="w-6 h-6 rounded bg-white" 
                      alt="" 
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-bold text-white">{sub.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price & Day */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">
                Price (USD)
              </label>
              <input 
                value={formData.price} 
                onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                type="number" 
                step="0.01" 
                className="w-full bg-[#000] border border-[#333] rounded-2xl p-4 md:p-5 text-lg font-bold focus:border-[#0A84FF] outline-none" 
                required 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">
                Day Due
              </label>
              <input 
                value={formData.day} 
                onChange={(e) => setFormData({ ...formData, day: e.target.value })} 
                type="number" 
                min="1" 
                max="31" 
                className="w-full bg-[#000] border border-[#333] rounded-2xl p-4 md:p-5 text-lg font-bold focus:border-[#0A84FF] outline-none" 
                required 
              />
            </div>
          </div>

          {/* Frequency & Status */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">
                Frequency
              </label>
              <div className="flex bg-[#000] p-1 rounded-2xl border border-[#333]">
                {FREQUENCIES.map(freq => (
                  <button 
                    key={freq} 
                    type="button" 
                    onClick={() => setFormData({ ...formData, frequency: freq })} 
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${
                      formData.frequency === freq ? 'bg-[#3A3A3C] text-white' : 'text-gray-500'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">
                Status
              </label>
              <div className="flex bg-[#000] p-1 rounded-2xl border border-[#333]">
                {STATUSES.map(status => (
                  <button 
                    key={status} 
                    type="button" 
                    onClick={() => setFormData({ ...formData, status })} 
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${
                      formData.status === status 
                        ? (status === 'Active' ? 'bg-green-900/50 text-white' : 'bg-red-900/50 text-white') 
                        : 'text-gray-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-4 mb-2 block">
              Category
            </label>
            <div className="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  type="button" 
                  onClick={() => setFormData({ ...formData, category: cat })} 
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border ${
                    formData.category === cat 
                      ? 'bg-white text-black border-white' 
                      : 'bg-[#000] text-gray-500 border-[#333]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full bg-white text-black py-4 md:py-5 rounded-2xl font-bold text-lg mt-4 hover:bg-gray-200 transition-colors">
            {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubscriptionModal;
