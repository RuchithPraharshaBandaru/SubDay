import { CURRENCIES } from './constants';

export const convertPrice = (priceUSD, currency) => {
  const rate = CURRENCIES[currency].rate;
  return (parseFloat(priceUSD || 0) * rate).toFixed(2);
};

export const getCurrencySymbol = (currency) => {
  return CURRENCIES[currency].symbol;
};

export const getLogoUrl = (domain) => {
  return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
};
