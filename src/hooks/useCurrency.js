import { useState, useEffect } from 'react';

export const useCurrency = () => {
  const [currency, setCurrency] = useState(() => 
    localStorage.getItem('subday_currency') || 'USD'
  );

  useEffect(() => {
    localStorage.setItem('subday_currency', currency);
  }, [currency]);

  return { currency, setCurrency };
};
