import React from 'react';
import { Ban, Plus, Bell, Edit2, Trash2 } from 'lucide-react';
import { convertPrice, getCurrencySymbol } from '../utils/currency';

const SubscriptionCard = ({ 
  subscription, 
  currency, 
  onEdit, 
  onCancel,
  onDelete 
}) => {
  return (
    <div className="bg-[#000] p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center justify-between border border-[#2C2C2E] group">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <div 
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-bold text-xs md:text-sm overflow-hidden relative flex-shrink-0" 
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
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm md:text-base truncate">{subscription.name}</p>
          <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase truncate">
            {subscription.category} • {subscription.frequency}
          </p>
        </div>
      </div>
      <div className="text-right flex flex-col items-end flex-shrink-0 ml-2">
        <p className="font-bold text-base md:text-lg whitespace-nowrap">
          {getCurrencySymbol(currency)}{convertPrice(subscription.price, currency)}
        </p>
        <div className="flex gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(subscription)} className="text-blue-400 p-1">
            <Edit2 size={12} className="md:hidden" />
            <Edit2 size={14} className="hidden md:block" />
          </button>
          {subscription.status !== 'Canceled' && (
            <button onClick={() => onCancel(subscription)} className="text-yellow-400 p-1">
              <Ban size={12} className="md:hidden" />
              <Ban size={14} className="hidden md:block" />
            </button>
          )}
          <button onClick={() => onDelete(subscription.id)} className="text-red-500 p-1">
            <Trash2 size={12} className="md:hidden" />
            <Trash2 size={14} className="hidden md:block" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DayDetailPanel = ({ 
  date, 
  subscriptions, 
  upcomingSubscriptions,
  currency, 
  onAddClick, 
  onEdit, 
  onCancel,
  onDelete 
}) => {
  const totalDue = subscriptions
    .reduce((a, c) => a + parseFloat(convertPrice(c.price, currency)), 0)
    .toFixed(2);

  return (
    <div className="bg-[#1C1C1E] rounded-[24px] md:rounded-3xl p-4 md:p-6 flex-1 flex flex-col border border-[#2C2C2E] min-h-[250px] md:min-h-[400px]">
      <div className="flex justify-between items-start md:items-center mb-4 md:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {date.getDate()} {date.toLocaleString('default', { month: 'short' })}
          </h2>
          <p className="text-gray-500 font-bold text-xs md:text-sm mt-1">
            Due Today: {getCurrencySymbol(currency)}{totalDue}
          </p>
        </div>
        <button 
          onClick={onAddClick} 
          className="bg-white text-black p-2.5 md:p-3 rounded-full hover:scale-110 transition-transform flex-shrink-0"
        >
          <Plus size={18} className="md:hidden" />
          <Plus size={24} className="hidden md:block" />
        </button>
      </div>

      <div className="space-y-2 md:space-y-3 overflow-y-auto custom-scrollbar pr-1 md:pr-2 flex-1 max-h-[250px] lg:max-h-none">
        {subscriptions.length > 0 ? (
          subscriptions.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              currency={currency}
              onEdit={onEdit}
              onCancel={onCancel}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 font-bold flex-col gap-2 min-h-[150px] md:min-h-[200px]">
            <Bell size={24} className="opacity-20 md:w-8 md:h-8"/>
            <span className="text-sm md:text-base">No payments due</span>
          </div>
        )}
      </div>

      {upcomingSubscriptions?.length > 0 && (
        <div className="mt-4 md:mt-6 border-t border-[#2C2C2E] pt-4">
          <p className="text-xs font-bold uppercase text-gray-500 mb-3">Next 2 days</p>
          <div className="space-y-2">
            {upcomingSubscriptions.map(sub => (
              <SubscriptionCard
                key={`upcoming-${sub.id}`}
                subscription={sub}
                currency={currency}
                onEdit={onEdit}
                onCancel={onCancel}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayDetailPanel;
