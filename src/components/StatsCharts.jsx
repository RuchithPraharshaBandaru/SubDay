import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, CartesianGrid } from 'recharts';
import { getCurrencySymbol } from '../utils/currency';
import { calculateMonthlyCostUSD } from '../utils/calculations';
import { CURRENCIES } from '../utils/constants';

const StatsCharts = ({ subscriptions, currency }) => {
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

    const totalMonthlyUSD = subscriptions
      .filter(s => s.status !== 'Canceled')
      .reduce((acc, sub) => acc + calculateMonthlyCostUSD(sub), 0);

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
  }, [subscriptions, currency]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-full">
      <div className="bg-[#1C1C1E] rounded-[24px] md:rounded-[32px] p-4 md:p-6 border border-[#2C2C2E] flex flex-col">
        <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-3 md:mb-4">
          Category Split
        </h3>
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData.pie} 
                dataKey="value" 
                nameKey="name" 
                innerRadius={50} 
                outerRadius={70} 
                paddingAngle={5} 
                stroke="none"
              >
                {chartData.pie.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `${getCurrencySymbol(currency)}${value}`} 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #2C2C2E', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-[#1C1C1E] rounded-[24px] md:rounded-[32px] p-4 md:p-6 border border-[#2C2C2E] flex flex-col">
        <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-3 md:mb-4">
          Cost Forecast
        </h3>
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#636366" 
                axisLine={false} 
                tickLine={false} 
                style={{ fontSize: '12px' }}
              />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px' }} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#0A84FF" 
                strokeWidth={3} 
                dot={{r: 3, fill: '#0A84FF'}} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsCharts;
