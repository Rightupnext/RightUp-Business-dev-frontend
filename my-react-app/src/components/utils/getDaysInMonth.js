// utils/getDaysInMonth.js
export function getDaysInMonth(year, month) {
  const days = [];
  const totalDays = new Date(year, month, 0).getDate();
  for (let i = 1; i <= totalDays; i++) {
    days.push(`${i}-${month}-${year}`);
  }
  return days;
}
