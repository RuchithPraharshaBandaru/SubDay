// src/utils/constants.js

export const PRESET_SUBS = [
  {
    name: 'Netflix',
    domain: 'netflix.com',
    cat: 'Entertainment',
    color: '#E50914',
    price: '15.49',
    cancelUrl: 'https://help.netflix.com/en/node/407'
  },
  {
    name: 'Spotify',
    domain: 'spotify.com',
    cat: 'Entertainment',
    color: '#1DB954',
    price: '11.99',
    cancelUrl: 'https://support.spotify.com/us/article/cancel-premium/'
  },
  {
    name: 'Amazon Prime',
    domain: 'amazon.com',
    cat: 'Shopping',
    color: '#00A8E1',
    price: '14.99',
    cancelUrl: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=GTJQ7QZY7QL2HK4Y'
  },
  {
    name: 'Apple One',
    domain: 'apple.com',
    cat: 'Productivity',
    color: '#000000',
    price: '19.95',
    cancelUrl: 'https://support.apple.com/en-us/118428'
  },
  {
    name: 'Disney+',
    domain: 'disneyplus.com',
    cat: 'Entertainment',
    color: '#113CCF',
    price: '13.99',
    cancelUrl: 'https://help.disneyplus.com/article/disneyplus-cancel-subscription'
  },
  {
    name: 'Hulu',
    domain: 'hulu.com',
    cat: 'Entertainment',
    color: '#1CE783',
    price: '7.99',
    cancelUrl: 'https://help.hulu.com/article/hulu-cancel-hulu-subscription'
  },
  {
    name: 'YouTube Premium',
    domain: 'youtube.com',
    cat: 'Entertainment',
    color: '#FF0000',
    price: '13.99',
    cancelUrl: 'https://support.google.com/youtube/answer/6308278'
  },
  {
    name: 'ChatGPT Plus',
    domain: 'openai.com',
    cat: 'Productivity',
    color: '#74AA9C',
    price: '20.00',
    cancelUrl: 'https://help.openai.com/en/articles/7232927-how-do-i-cancel-my-chatgpt-plus-subscription'
  },
  {
    name: 'Adobe Creative Cloud',
    domain: 'adobe.com',
    cat: 'Productivity',
    color: '#FF0000',
    price: '59.99',
    cancelUrl: 'https://helpx.adobe.com/manage-account/using/cancel-subscription.html'
  },
  {
    name: 'Dropbox',
    domain: 'dropbox.com',
    cat: 'Productivity',
    color: '#0061FF',
    price: '11.99',
    cancelUrl: 'https://help.dropbox.com/account-settings/cancel-subscription'
  },
  {
    name: 'Gym Membership',
    domain: 'equinox.com',
    cat: 'Health',
    color: '#F59E0B',
    price: '45.00',
    cancelUrl: 'https://www.equinox.com/member-services'
  },
  {
    name: 'PlayStation Plus',
    domain: 'playstation.com',
    cat: 'Gaming',
    color: '#00439C',
    price: '9.99',
    cancelUrl: 'https://www.playstation.com/support/store/cancel-ps-store-subscription/'
  },
  {
    name: 'Xbox Game Pass',
    domain: 'xbox.com',
    cat: 'Gaming',
    color: '#107C10',
    price: '16.99',
    cancelUrl: 'https://support.xbox.com/help/subscriptions-billing/manage-subscriptions/cancel-recurring-billing'
  },
  {
    name: 'Slack',
    domain: 'slack.com',
    cat: 'Work',
    color: '#4A154B',
    price: '8.75',
    cancelUrl: 'https://slack.com/help/articles/115003098563-Cancel-your-paid-Slack-subscription'
  },
  {
    name: 'Zoom',
    domain: 'zoom.us',
    cat: 'Work',
    color: '#2D8CFF',
    price: '15.99',
    cancelUrl: 'https://support.zoom.us/hc/en-us/articles/201362003-Cancel-an-account'
  }
];

export const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.78 },
  INR: { symbol: '₹', rate: 83.5 }
};

export const CATEGORIES = [
  'Entertainment',
  'Productivity',
  'Shopping',
  'Health',
  'Gaming',
  'Work'
];

export const FREQUENCIES = ['Monthly', 'Yearly', 'Weekly'];
export const STATUSES = ['Active', 'Canceled'];
