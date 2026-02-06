export const calculateMonthlyCostUSD = (subscription) => {
  if (subscription.status === 'Canceled') return 0;
  const price = parseFloat(subscription.price || 0);
  if (subscription.frequency === 'Yearly') return price / 12;
  if (subscription.frequency === 'Weekly') return price * 4;
  return price;
};

const getCreatedDate = (subscription) => {
  if (!subscription?.createdAt) return null;
  if (typeof subscription.createdAt?.toDate === 'function') {
    return subscription.createdAt.toDate();
  }
  const createdAt = new Date(subscription.createdAt);
  return Number.isNaN(createdAt.getTime()) ? null : createdAt;
};

export const isDueOnDate = (subscription, targetDate) => {
  if (!subscription || subscription.status === 'Canceled') return false;

  const frequency = subscription.frequency || 'Monthly';
  const dayOfMonth = Number(subscription.day);
  const createdDate = getCreatedDate(subscription);

  if (frequency === 'Weekly') {
    let weekday = subscription.weekday;
    if (weekday === undefined || weekday === null) {
      if (dayOfMonth >= 1 && dayOfMonth <= 7) {
        weekday = dayOfMonth - 1;
      } else if (createdDate) {
        weekday = createdDate.getDay();
      } else {
        weekday = new Date().getDay();
      }
    }
    return targetDate.getDay() === Number(weekday);
  }

  if (frequency === 'Yearly') {
    const yearlyMonth =
      subscription.month ?? createdDate?.getMonth() ?? new Date().getMonth();
    return (
      targetDate.getDate() === dayOfMonth &&
      targetDate.getMonth() === Number(yearlyMonth)
    );
  }

  return targetDate.getDate() === dayOfMonth;
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
