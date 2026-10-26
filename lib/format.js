export const DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAYS_SHORT = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function hhmm(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
export function to12(min) {
  const h = Math.floor(min / 60), m = min % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ap}`;
}
export function dur(sec) {
  const m = Math.max(1, Math.round(sec / 60));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
export function countdown(min) {
  if (min == null) return '';
  if (min <= 0) return 'now';
  if (min < 60) return `${min} min`;
  if (min < 1440) return `${Math.floor(min / 60)} h ${min % 60 ? `${min % 60} min` : ''}`.trim();
  const d = Math.floor(min / 1440);
  return `${d} day${d > 1 ? 's' : ''}`;
}
export function greeting(minutes) {
  if (minutes < 12 * 60) return 'Good morning';
  if (minutes < 17 * 60) return 'Good afternoon';
  return 'Good evening';
}
export function meters(m) { return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`; }
export function floorShort(level) { return level === 0 ? 'Ground floor' : `Floor ${level}`; }
export const TYPE_LABEL = {
  lecture: 'Lecture hall', lab: 'Laboratory', seminar: 'Seminar room', auditorium: 'Auditorium', library: 'Library',
  cafeteria: 'Cafeteria', lounge: 'Study lounge', office: 'Office', restroom: 'Restrooms', stairs: 'Stairs', elevator: 'Elevator', exit: 'Exit',
};
export function ago(iso) {
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  const s = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
