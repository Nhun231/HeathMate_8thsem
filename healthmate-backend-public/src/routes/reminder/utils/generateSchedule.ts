export function toMinutes(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function toTimeStr(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Generate schedule từ wakeUp → sleep theo gap phút
 */
interface ScheduleItem {
  time: string;
  amount: number;
}

export function generateSchedule(
  wakeUp: string,
  sleep: string,
  gap: number
) {
  const start = toMinutes(wakeUp);
  const end = toMinutes(sleep);
  const schedule: ScheduleItem[] = []; 

  for (let t = start + 5; t < end; t += gap) {
    schedule.push({ time: toTimeStr(t), amount: 250 }); 
  }
  return schedule;
}
