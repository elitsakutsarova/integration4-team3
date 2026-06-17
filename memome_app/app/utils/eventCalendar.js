// utility functions for generating event calendar iCal and Google Calendar URLs

function pad2(value) {
  return String(value).padStart(2, '0');
}

function escapeIcsText(text) {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function parseEventDate(dateStr) {
  if (!dateStr) return null;
  const cleaned = String(dateStr).replace(/\./g, '');
  const parsed = new Date(cleaned);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseTimeRange(timeRange) {
  const match = String(timeRange ?? '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;

  return {
    startHour: Number(match[1]),
    startMinute: Number(match[2]),
    endHour: Number(match[3]),
    endMinute: Number(match[4]),
  };
}

function applyTime(baseDate, hour, minute) {
  const next = new Date(baseDate);
  next.setHours(hour, minute, 0, 0);
  return next;
}

/** @returns {{ start: Date, end: Date, allDay: boolean } | null} */
export function resolveEventSchedule(event) {
  const baseDate = parseEventDate(event.date);
  if (!baseDate) return null;

  const times = parseTimeRange(event.timeRange);
  if (!times) {
    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end, allDay: true };
  }

  const start = applyTime(baseDate, times.startHour, times.startMinute);
  let end = applyTime(baseDate, times.endHour, times.endMinute);
  if (end <= start) {
    end = new Date(end);
    end.setDate(end.getDate() + 1);
  }

  return { start, end, allDay: false };
}

function formatIcsDateTime(date) {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
    'T',
    pad2(date.getHours()),
    pad2(date.getMinutes()),
    pad2(date.getSeconds()),
  ].join('');
}

function formatIcsDateOnly(date) {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join('');
}

function formatGoogleCalendarDateTime(date) {
  return formatIcsDateTime(date);
}

export function buildEventCalendarIcs(event) {
  const schedule = resolveEventSchedule(event);
  if (!schedule) return null;

  const location = [event.venueName, event.venueAddress].filter(Boolean).join(', ');
  const uid = `${Date.now()}-${event.id}@memome.app`;

  const dtStart = schedule.allDay
    ? `DTSTART;VALUE=DATE:${formatIcsDateOnly(schedule.start)}`
    : `DTSTART:${formatIcsDateTime(schedule.start)}`;
  const dtEnd = schedule.allDay
    ? `DTEND;VALUE=DATE:${formatIcsDateOnly(schedule.end)}`
    : `DTEND:${formatIcsDateTime(schedule.end)}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MemoMe//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDateTime(new Date())}`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeIcsText(event.title)}`,
    location ? `LOCATION:${escapeIcsText(location)}` : null,
    event.about ? `DESCRIPTION:${escapeIcsText(event.about)}` : null,
    event.websiteUrl ? `URL:${escapeIcsText(event.websiteUrl)}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

export function buildGoogleCalendarUrl(event) {
  const schedule = resolveEventSchedule(event);
  if (!schedule) return null;

  const location = [event.venueName, event.venueAddress].filter(Boolean).join(', ');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title ?? 'Event',
    details: event.about ?? '',
    location,
  });

  if (schedule.allDay) {
    params.set(
      'dates',
      `${formatIcsDateOnly(schedule.start)}/${formatIcsDateOnly(schedule.end)}`,
    );
  } else {
    params.set(
      'dates',
      `${formatGoogleCalendarDateTime(schedule.start)}/${formatGoogleCalendarDateTime(schedule.end)}`,
    );
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadEventCalendarIcs(event) {
  const ics = buildEventCalendarIcs(event);
  if (!ics) return false;

  const slug = String(event.title ?? 'event')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'event';

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug}.ics`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

export function addEventToCalendar(event) {
  const googleUrl = buildGoogleCalendarUrl(event);
  if (googleUrl && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
    window.open(googleUrl, '_blank', 'noopener,noreferrer');
    return true;
  }
  return downloadEventCalendarIcs(event);
}
