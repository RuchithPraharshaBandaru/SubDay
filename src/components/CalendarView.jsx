import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarView = ({ date, onDateChange, onMonthChange, subsByDay }) => {
  return (
    <div className="flex-1">
      <Calendar 
        onChange={onDateChange} 
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) onMonthChange(activeStartDate);
        }}
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
                  <span className="text-[10px] font-bold text-white z-0">
                    {sub.name[0]}
                  </span>
                  {sub.logo && (
                    <img 
                      src={sub.logo} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover z-10" 
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                  )}
                </div>
              ))}
              {subs.length > 3 && (
                <div className="w-6 h-6 bg-[#3A3A3C] rounded-md text-[9px] flex items-center justify-center">
                  +{subs.length - 3}
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default CalendarView;
