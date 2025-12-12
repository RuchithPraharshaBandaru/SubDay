import React from 'react';
import { Plus, Bell, Edit2, Trash2 } from 'lucide-react';
import { convertPrice, getCurrencySymbol } from '../utils/currency';

const SubscriptionCard = ({ 
  subscription, 
  currency, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="bg-[#000] p-4 rounded-2xl flex items-center justify-between border border-[#2C2C2E] group">
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden relative" 
          style={{ backgroundColor: subscription.color }}
        >
          <span className="text-white z-0">{subscription.name[0]}</span>
          {subscription.logo && (
            <img 
              src={subscription.logo} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover z-10" 
              onError={(e) => e.target.style.display = 'none'} 
            />
          )}
        </div>
        <div>
          <p className="font-bold">{subscription.name}</p>
          <p className="text-xs text-gray-500 font-bold uppercase">
            {subscription.category} • {subscription.frequency}
          </p>
        </div>
      </div>
      <div className="text-right flex flex-col items-end">
        <p className="font-bold text-lg">
          {getCurrencySymbol(currency)}{convertPrice(subscription.price, currency)}
        </p>
        <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(subscription)} className="text-blue-400">
            <Edit2 size={14}/>
          </button>
          <button onClick={() => onDelete(subscription.id)} className="text-red-500">
            <Trash2 size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const DayDetailPanel = ({ 
  date, 
  subscriptions, 
  currency, 
  onAddClick, 
  onEdit, 
  onDelete 
}) => {
  const totalDue = subscriptions
    .reduce((a, c) => a + parseFloat(convertPrice(c.price, currency)), 0)
    .toFixed(2);

  return (
    <div className="bg-[#1C1C1E] rounded-3xl p-6 flex-1 flex flex-col border border-[#2C2C2E] min-h-[300px] md:min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            {date.getDate()} {date.toLocaleString('default', { month: 'short' })}
          </h2>
          <p className="text-gray-500 font-bold text-sm">
            Due Today: {getCurrencySymbol(currency)}{totalDue}
          </p>
        </div>
        <button 
          onClick={onAddClick} 
          className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform"
        >
          <Plus />
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1 max-h-[300px] lg:max-h-none">
        {subscriptions.length > 0 ? (
          subscriptions.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              currency={currency}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 font-bold flex-col gap-2 min-h-[200px]">
            <Bell size={30} className="opacity-20"/>
            No payments due
          </div>
        )}
      </div>
    </div>
  );
};

export default DayDetailPanel;
