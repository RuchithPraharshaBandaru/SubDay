import React from 'react';
import { Download, LogOut } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { CURRENCIES } from '../utils/constants';

const Header = ({ currency, onCurrencyChange, onExport }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center px-2 gap-4">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 group cursor-pointer">
        <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110 group-hover:rotate-6">
          <span className="text-white font-black text-lg md:text-xl">S</span>
        </div>
        <span className="bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent tracking-tight">
          SubDay
        </span>
        <span className="text-transparent bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text font-light tracking-wide">
          Pro
        </span>
      </h1>
      
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-end">
        <select 
          value={currency} 
          onChange={(e) => onCurrencyChange(e.target.value)} 
          className="bg-[#1C1C1E] text-white px-3 py-2 rounded-xl outline-none text-sm font-bold border border-[#333]"
        >
          {Object.keys(CURRENCIES).map(c => (
            <option key={c} value={c}>
              {c} ({CURRENCIES[c].symbol})
            </option>
          ))}
        </select>
        <button 
          onClick={onExport} 
          className="bg-[#1C1C1E] p-2 rounded-full text-gray-400 hover:text-white" 
          title="Export CSV"
        >
          <Download size={20}/>
        </button>
        <button 
          onClick={() => signOut(auth)} 
          className="bg-[#1C1C1E] p-2 rounded-full text-gray-400 hover:text-red-500"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Header;
