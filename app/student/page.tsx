"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Moon, 
  Clock, 
  CalendarDays 
} from "lucide-react";
import { BACKEND_URL } from "../../config";
import styles from "./student.module.css";

// We'll fetch schedule from backend and display only PERSONAL classes
interface StudentClass {
  _id?: string;
  day: string;
  title?: string;
  subject?: string;
  teacher?: string;
  category?: string;
  type?: string;
  startTime: string; // ISO or formatted
  endTime: string;
  location?: string;
  isEvening?: boolean;
  classNumber?: number;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudentDashboard() {
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState<string>(todayName);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      console.log('Fetching classes for student dashboard...');
      try {
        const params = new URLSearchParams({ category: 'PERSONAL', day: selectedDay });
        console.log('Fetch URL:', `${BACKEND_URL}/timetable?${params.toString()}`);
        const res = await fetch(`${BACKEND_URL}/timetable?${params.toString()}`);
        console.log('Fetch response status:', res.status);
        if (!res.ok) throw new Error('Failed to fetch schedule');
        const data: StudentClass[] = await res.json();
        console.log('Raw data received:', data);
        // format start/end times for display
        const formatted = data.map(d => ({
          ...d,
          startTime: new Date(d.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          endTime: new Date(d.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        }));
        console.log('Formatted data:', formatted);
        setClasses(formatted);
      } catch (err) {
        console.error('Error fetching classes:', err);
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [selectedDay]);

  // --- FILTER LOGIC ---
  // 1. Filter by selected Day
  // 2. STRICTLY Filter to show ONLY 'PERSONAL' classes
  const dailyClasses = classes.filter((cls) => 
    cls.day === selectedDay && cls.category === "PERSONAL"
  );

  // Helper to get badge style
  const getBadgeStyle = (type?: string) => {
    switch (type) {
      case "Theory": return styles.badgeTheory;
      case "Revision": return styles.badgeRevision;
      default: return styles.badgePaper;
    }
  };

  // Helper to get strip color style
  const getStripStyle = (type?: string) => {
    switch (type) {
      case "Theory": return styles.stripTheory;
      case "Revision": return styles.stripRevision;
      default: return styles.stripPaper;
    }
  };

  return (
    <div className={styles.container}>
      
      {/* --- Sticky Header --- */}
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Home
        </Link>
        <h1 className={styles.pageTitle}>Class Schedule</h1>
        <div style={{ width: 20 }}></div> 
      </header>

      {/* --- Day Selector Bar --- */}
      <div className={styles.filterBar}>
        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`${styles.dayBtn} ${selectedDay === day ? styles.dayBtnActive : ""}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* --- Main Content --- */}
      <main className={styles.content}>
        
        {/* Date Header / Live Preview */}
        <div className={styles.dateHeader}>
          {selectedDay === todayName ? (
            <>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>Today's Schedule</div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>Live Preview</div>
              </div>
              <div className={styles.classCount}>{dailyClasses.length} Sessions</div>
            </>
          ) : (
            <>
              <span className={styles.dateTitle}>
                Personal Classes for <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{selectedDay}</span>
              </span>
              <span className={styles.classCount}>{dailyClasses.length} Sessions</span>
            </>
          )}
        </div>

        {/* Classes List */}
        <div className={styles.cardList}>
          {loading && <p>Loading schedule...</p>}
          {error && <div className={styles.errorMsg}>{error}</div>}

          {!loading && !error && (
            dailyClasses.length > 0 ? (
              dailyClasses.map((cls) => {
                const classNum = cls.classNumber ?? (() => {
                  const m = (cls.title || cls.subject || '').match(/\d+/);
                  return m ? parseInt(m[0], 10) : undefined;
                })();
                return (
                  <div key={cls._id || cls.title} className={styles.classCard}>
                    {/* Colored Strip */}
                    <div className={`${styles.cardStrip} ${getStripStyle(cls.type)}`}></div>

                    {/* Left: Time */}
                    <div className={styles.timeCol}>
                      <span className={styles.startTime}>{cls.startTime}</span>
                      <span className={styles.endTime}>to {cls.endTime}</span>
                    </div>

                    {/* Right: Details */}
                    <div className={styles.detailsCol}>
                      <div className={styles.subjectRow}>
                        <h3 className={styles.subjectName}>{classNum ? `Class ${classNum} — ${cls.subject ?? cls.title}` : (cls.subject ?? cls.title)}</h3>
                        <span className={`${styles.badge} ${getBadgeStyle(cls.type)}`}>
                          {cls.type}
                        </span>
                      </div>

                      {/* Location & Evening Indicator */}
                      <div className={styles.cardFooter}>
                        <div className={styles.locationItem}>
                          <MapPin size={16} className={cls.isEvening ? "text-purple-600" : "text-slate-400"} />
                          {cls.location}
                        </div>

                        {cls.isEvening && (
                          <div className={styles.eveningAlert}>
                            <Moon size={14} />
                            <span>Evening Session</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Empty State
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
                <CalendarDays size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No Personal Tuition classes on {selectedDay}.</p>
                <p style={{ fontSize: '0.9rem' }}>Check other institutes or enjoy your break!</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}