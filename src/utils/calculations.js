export const calculateMonthlyCostUSD = (subscription) => {
  if (subscription.status === 'Canceled') return 0;
  const price = parseFloat(subscription.price || 0);
  if (subscription.frequency === 'Yearly') return price / 12;
  if (subscription.frequency === 'Weekly') return price * 4;
  return price;
};

export const getDaysUntilDue = (day) => {
  const today = new Date().getDate();
  if (day === today) return "Due Today";
  let diff = day - today;
  if (diff < 0) diff += 30;
  return `${diff} days left`;
};

export const exportToCSV = (subscriptions) => {
  const headers = "Name,Price(USD),Frequency,Category,Status,Due Day\n";
  const rows = subscriptions
    .map(s => `${s.name},${s.price},${s.frequency},${s.category},${s.status || 'Active'},${s.day}`)
    .join("\n");
  const blob = new Blob([headers + rows], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'subday_export.csv';
  a.click();
};
