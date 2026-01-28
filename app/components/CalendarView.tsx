"use client";

import React, { useEffect, useState } from "react";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
// FullCalendar global styles are loaded in app/layout.tsx via CDN
import { BACKEND_URL } from "../../config";
import styles from './calendar.module.css';
import { X } from 'lucide-react';

type EventObj = {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  extendedProps?: any;
};

interface Props {
  onEventClick?: (id: string) => void;
}

export default function CalendarView({ onEventClick }: Props) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // color utilities (copied from admin page)
  const COLORS = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // green
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];

  const hashString = (s: string) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
    return (h >>> 0).toString(16);
  };

  const getColorForKey = (key?: string) => {
    const k = key || '';
    if (!k) return COLORS[0];
    const hash = parseInt(hashString(k).slice(-8), 16);
    return COLORS[hash % COLORS.length];
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/timetable`);
        if (!res.ok) throw new Error('Failed to fetch timetable');
        const data = await res.json();
        const evts: any[] = data.map((c: any) => ({
          id: c._id,
          title: c.title || c.subject || 'Class',
          start: c.startTime,
          end: c.endTime,
          backgroundColor: getColorForKey(c._id || c.title || c.subject || ''),
          borderColor: getColorForKey(c._id || c.title || c.subject || ''),
          textColor: '#fff',
          extendedProps: { ...c }
        }));
        setEvents(evts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Responsive view selection
  const [calendarView, setCalendarView] = useState<string>('timeGridWeek');
  useEffect(() => {
    const updateView = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      if (w < 480) setCalendarView('timeGridDay');
      else setCalendarView('timeGridWeek');
    };
    updateView();
    window.addEventListener('resize', updateView);
    return () => window.removeEventListener('resize', updateView);
  }, []);

  const updateEventOnServer = async (id: string, start: Date | null, end: Date | null, extendedProps: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const body: any = {
      title: extendedProps.title || extendedProps.subject || 'Class',
      startTime: start ? start.toISOString() : undefined,
      endTime: end ? end.toISOString() : undefined,
      location: extendedProps.location || 'Unknown',
      category: extendedProps.category || 'EXTERNAL',
      type: extendedProps.type || 'Theory',
      medium: extendedProps.medium || 'English',
      day: start ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][start.getDay()] : extendedProps.day
    };

    try {
      const res = await fetch(`${BACKEND_URL}/timetable/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to update event');
      }
      const updated = await res.json();
      // update local event list
      setEvents(prev => prev.map(ev => ev.id === id ? { id, title: updated.title, start: updated.startTime, end: updated.endTime, extendedProps: { ...updated } } : ev));
      return true;
    } catch (err) {
      console.error('updateEventOnServer error', err);
      return false;
    }
  };

  // UI helpers and state
  const [tooltip, setTooltip] = useState<null | { x: number; y: number; html: string }>(null);
  const [modalEvent, setModalEvent] = useState<EventObj | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleEventMouseEnter = (mouseEnterInfo: any) => {
    try {
      const ev = mouseEnterInfo.event;
      const rect = (mouseEnterInfo.el as HTMLElement).getBoundingClientRect();
      setTooltip({ x: rect.right + 8, y: rect.top, html: `${ev.title} <br/> ${new Date(ev.start).toLocaleString()} - ${new Date(ev.end).toLocaleTimeString()}` });
    } catch (e) {
      // ignore
    }
  };

  const handleEventMouseLeave = () => setTooltip(null);

  const handleEventClickInternal = (info: any) => {
    const ev = info.event;
    setModalEvent({ id: ev.id, title: ev.title, start: ev.start?.toISOString(), end: ev.end?.toISOString(), extendedProps: ev.extendedProps });
  };

  const handleEventDrop = async (arg: any) => {
    const id = arg.event.id;
    const start = arg.event.start;
    const end = arg.event.end || new Date((start as Date).getTime() + 60 * 60 * 1000);
    const ok = await updateEventOnServer(id, start, end, arg.event.extendedProps);
    if (!ok) { arg.revert(); showToast('Failed to save change'); }
  };

  const handleEventResize = async (arg: any) => {
    const id = arg.event.id;
    const start = arg.event.start;
    const end = arg.event.end;
    const ok = await updateEventOnServer(id, start, end, arg.event.extendedProps);
    if (!ok) { arg.revert(); showToast('Failed to save change'); }
  };

  return (
    <div style={{ minHeight: 500 }}>
      {loading && <div>Loading calendar...</div>}
      <div className={styles.calendarRoot}>
        <div className={styles.calendarHeader}>
          <div className={styles.legend}>
            <div className={styles.legendItem}><span className={styles.colorDot} style={{ background: '#3B82F6' }} /> Theory</div>
            <div className={styles.legendItem}><span className={styles.colorDot} style={{ background: '#10B981' }} /> Revision</div>
            <div className={styles.legendItem}><span className={styles.colorDot} style={{ background: '#EF4444' }} /> Paper</div>
          </div>
          <div>
            <button className={styles.toggleBtn} onClick={() => showToast('Calendar view ready')}>Refresh</button>
          </div>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={calendarView}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events}
          editable={true}
          selectable={true}
          droppable={false}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventClick={(info: any) => { handleEventClickInternal(info); if (onEventClick) onEventClick(info.event.id); }}
          eventMouseEnter={(info: any) => handleEventMouseEnter(info)}
          eventMouseLeave={() => handleEventMouseLeave()}
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
        />

        {tooltip && (
          <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }} dangerouslySetInnerHTML={{ __html: tooltip.html }} />
        )}

        {modalEvent && (
          <div className={styles.modalOverlay} onClick={() => setModalEvent(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{modalEvent.title}</h3>
                <button onClick={() => setModalEvent(null)}><X /></button>
              </div>
              <p style={{ marginTop: 8 }}>{modalEvent.start} — {modalEvent.end}</p>
              <p style={{ marginTop: 8, color: 'rgba(0,0,0,0.7)' }}>{modalEvent.extendedProps?.location}</p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className={styles.toggleBtn} onClick={() => { setModalEvent(null); showToast('Open edit form in list view'); }}>Edit</button>
                <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 8 }} onClick={() => { setModalEvent(null); showToast('Delete action not implemented'); }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className={styles.toast}>{toast}</div>}
      </div>
    </div>
  );
}
