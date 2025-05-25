// Time slots for scheduling (8 AM to 8 PM, 30-min intervals)
export const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const min = i % 2 === 0 ? '00' : '30';
  const ampm = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${min} ${ampm}`;
}); 