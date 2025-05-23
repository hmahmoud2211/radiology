export function formatTimeDifference(minutes: number): string {
  if (minutes === 0) return 'Now';
  
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const remainingMinutes = absMinutes % 60;
  
  let formattedTime = '';
  
  if (hours > 0) {
    formattedTime += `${hours}h`;
    if (remainingMinutes > 0) {
      formattedTime += ` ${remainingMinutes}m`;
    }
  } else {
    formattedTime += `${remainingMinutes}m`;
  }
  
  return minutes < 0 ? `${formattedTime} ago` : `in ${formattedTime}`;
}

export function getTimeDifferenceInMinutes(time1: string, time2: string = new Date().toLocaleTimeString()): number {
  const parseTime = (timeStr: string) => {
    const date = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0);
    return date;
  };

  const t1 = parseTime(time1);
  const t2 = parseTime(time2);
  
  return Math.round((t1.getTime() - t2.getTime()) / (1000 * 60));
}

export function formatAppointmentTime(scheduledTime: string): string {
  const now = new Date();
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const appointmentTime = new Date(now);
  appointmentTime.setHours(hours, minutes, 0);
  
  const diffInMinutes = Math.round((appointmentTime.getTime() - now.getTime()) / (1000 * 60));
  return formatTimeDifference(diffInMinutes);
}

export function getMinutesUntilAppointment(date: string, time: string): number {
  // date: 'YYYY-MM-DD', time: 'HH:MM AM/PM'
  const [year, month, day] = date.split('-').map(Number);
  let [timePart, ampm] = time.split(' ');
  let [hour, minute] = timePart.split(':').map(Number);

  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  const appointmentDate = new Date(year, month - 1, day, hour, minute);
  const now = new Date();

  return Math.round((appointmentDate.getTime() - now.getTime()) / (1000 * 60));
}

export function formatAppointmentRemaining(date: string, time: string): string {
  const minutes = getMinutesUntilAppointment(date, time);
  return formatTimeDifference(minutes);
}

export function formatDuration(minutes: number): string {
  if (isNaN(minutes)) return '--';
  const abs = Math.abs(Math.round(minutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
} 