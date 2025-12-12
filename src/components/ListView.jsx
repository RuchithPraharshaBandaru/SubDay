import React from 'react';
import { Archive, ArrowUpDown, Edit2, Trash2 } from 'lucide-react';
import { convertPrice, getCurrencySymbol } from '../utils/currency';

const ListView = ({ 
  subscriptions, 
  currency, 
  showArchived, 
  sortBy, 
  sortOrder,
  onToggleArchived, 
  onSort, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="bg-[#1C1C1E] rounded-[24px] md:rounded-[32px] p-3 md:p-6 border border-[#2C2C2E] h-[450px] md:h-[600px] flex flex-col">
      {/* List Controls */}
      <div className="flex flex-col sm:flex-row justify-between mb-3 md:mb-4 border-b border-[#333] pb-3 md:pb-4 gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => onSort('name')} 
            className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap ${
              sortBy === 'name' ? 'bg-white text-black' : 'text-gray-500 hover:bg-[#333]'
            }`}
          >
            Name <ArrowUpDown size={12}/>
          </button>
          <button 
            onClick={() => onSort('price')} 
            className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap ${
              sortBy === 'price' ? 'bg-white text-black' : 'text-gray-500 hover:bg-[#333]'
            }`}
          >
            Price <ArrowUpDown size={12}/>
          </button>
          <button 
            onClick={() => onSort('day')} 
            className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap ${
              sortBy === 'day' ? 'bg-white text-black' : 'text-gray-500 hover:bg-[#333]'
            }`}
          >
            Day <ArrowUpDown size={12}/>
          </button>
        </div>
        <button 
          onClick={onToggleArchived} 
          className={`flex items-center justify-center gap-1 text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap ${
            showArchived ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-[#333]'
          }`}
        >
          <Archive size={12} /> {showArchived ? 'Hide History' : 'Show History'}
        </button>
      </div>

      <div className="overflow-y-auto overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left min-w-[500px]">
          <thead className="text-gray-500 text-[10px] md:text-xs uppercase sticky top-0 bg-[#1C1C1E] z-10">
            <tr>
              <th className="pb-3 md:pb-4 pl-2">Name</th>
              <th className="pb-3 md:pb-4">Cost</th>
              <th className="pb-3 md:pb-4 hidden sm:table-cell">Freq</th>
              <th className="pb-3 md:pb-4 hidden sm:table-cell">Status</th>
              <th className="pb-3 md:pb-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs md:text-sm">
            {subscriptions.map(sub => (
              <tr 
                key={sub.id} 
                className={`border-b border-[#2C2C2E] last:border-0 hover:bg-[#2C2C2E] transition-colors group ${
                  sub.status === 'Canceled' ? 'opacity-50 grayscale' : ''
                }`}
              >
                <td className="py-3 md:py-4 pl-2 font-bold flex items-center gap-2 md:gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-xs flex-shrink-0" 
                    style={{backgroundColor: sub.color}}
                  >
                    {sub.logo ? (
                      <img src={sub.logo} className="w-full h-full object-cover" alt="" />
                    ) : (
                      sub.name[0]
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate">{sub.name}</div>
                    <div className="text-[10px] text-gray-500 sm:hidden">{sub.frequency}</div>
                  </div>
                </td>
                <td className="py-3 md:py-4 font-mono whitespace-nowrap">
                  {getCurrencySymbol(currency)}{convertPrice(sub.price, currency)}
                </td>
                <td className="py-3 md:py-4 text-gray-400 hidden sm:table-cell">{sub.frequency || 'Monthly'}</td>
                <td className="py-3 md:py-4 hidden sm:table-cell">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${
                    sub.status === 'Canceled' 
                      ? 'bg-red-900/30 text-red-400 border-red-900' 
                      : 'bg-green-900/30 text-green-400 border-green-900'
                  }`}>
                    {sub.status || 'Active'}
                  </span>
                </td>
                <td className="py-3 md:py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(sub)} className="p-2 hover:text-blue-400">
                      <Edit2 size={14}/>
                    </button>
                    <button onClick={() => onDelete(sub.id)} className="p-2 hover:text-red-500">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;
