"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  Atom, 
  UserCog, 
  ArrowRight, 
  MapPin, 
  BookOpen,
  Bell,
  Megaphone,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { BACKEND_URL } from "../config";
import styles from "./home.module.css";

export default function Home() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [todayClasses, setTodayClasses] = useState<Array<any>>([]);
  const [notices, setNotices] = useState<Array<any>>([]);

  // Clock
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Logic (Kept same as your original)
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  useEffect(() => {
    const fetchToday = async () => {
      try {
        const params = new URLSearchParams({ category: 'PERSONAL', day: todayName });
        const res = await fetch(`${BACKEND_URL}/timetable?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        const mapped = data.map((d: any) => {
          const start = new Date(d.startTime);
          const time = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const hour = start.getHours();
          return {
            id: d._id,
            time,
            subject: d.title || d.subject,
            location: d.location,
            type: d.type,
            medium: d.medium,
            isEvening: hour >= 18 && hour < 23,
          };
        });
        setTodayClasses(mapped);
      } catch (e) { console.error(e); }
    };
    fetchToday();
  }, [todayName]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/notices`);
        if (!res.ok) return;
        const data = await res.json();
        setNotices(data);
      } catch (e) { console.error(e); }
    };
    fetchNotices();
  }, []);

  // Helpers
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
  const hashString = (s: string) => { let h = 5381; for (let i=0;i<s.length;i++) h=(h*33) ^ s.charCodeAt(i); return (h>>>0).toString(16); };
  const getColorForKey = (key?: string) => { const k = key||''; if(!k) return COLORS[0]; const hash = parseInt(hashString(k).slice(-8),16); return COLORS[hash % COLORS.length]; };

  return (
    <div className={styles.container}>
      
      {/* --- Navbar --- */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContent}>
          <div className={styles.brand}>
            <div className={styles.logoBox}>
              <Atom size={22} className="text-white" />
            </div>
            <span className={styles.brandText}>
              Thomsan <span className={styles.brandHighlight}>Institute</span>
            </span>
          </div>
          
          <div className={styles.navMeta}>
            {currentTime && (
              <div className={styles.timeBadge}>
                <Clock size={14} />
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className={styles.dateDivider}>•</span>
                <span className={styles.dateText}>
                  {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className={styles.main}>
        
        {/* Section 1: Hero & Live Schedule */}
        <section className={styles.heroSection}>
          <div className={styles.heroGrid}>
            
            {/* Left: Welcome */}
            <div className={styles.heroContent}>
              <div className={styles.systemStatus}>
                <span className={styles.statusDot}></span>
                <span>System Operational</span>
              </div>
              
              <h1 className={styles.title}>
                Academic <br />
                <span className={styles.titleGradient}>Intelligence Hub</span>
              </h1>
              
              <p className={styles.subtitle}>
                Seamlessly integrated scheduling for students and faculty. 
                Access real-time class data, locations, and institutional updates.
              </p>

              <div className={styles.actionButtons}>
                <Link href="/student" className={styles.primaryBtn}>
                  <BookOpen size={18} />
                  <span>Student Portal</span>
                  <ArrowRight size={16} className={styles.btnArrow} />
                </Link>

                <Link href="/admin/login" className={styles.secondaryBtn}>
                  <UserCog size={18} />
                  <span>Faculty Login</span>
                </Link>
              </div>
            </div>

            {/* Right: Glass Card Schedule */}
            <div className={styles.scheduleWrapper}>
              <div className={styles.glassCard}>
                <div className={styles.glassHeader}>
                  <div className={styles.headerTitle}>
                    <Calendar size={18} className="text-indigo-600" />
                    <h3>Today's Timeline</h3>
                  </div>
                  <div className={styles.liveIndicator}>
                    <span className={styles.blink}></span> Live
                  </div>
                </div>

                <div className={styles.timelineList}>
                  {todayClasses.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Clock size={32} />
                      <p>No classes scheduled for today.</p>
                    </div>
                  ) : (
                    todayClasses.slice(0, 4).map((cls, i) => (
                      <div key={i} className={styles.timelineItem}>
                        <div className={styles.timeBox}>
                          <span className={styles.timeH}>{cls.time.split(' ')[0]}</span>
                          <span className={styles.timeM}>{cls.time.split(' ')[1]}</span>
                        </div>
                        <div className={styles.classDetails}>
                          <div className={styles.subjectRow}>
                            <span 
                              className={styles.colorDot} 
                              style={{ backgroundColor: getColorForKey(cls.subject) }}
                            />
                            <h4 className={styles.subjectName}>{cls.subject}</h4>
                          </div>
                          <div className={styles.metaRow}>
                            <span className={styles.metaTag}>
                              <MapPin size={10} /> {cls.location || 'N/A'}
                            </span>
                            <span className={`${styles.metaTag} ${cls.type === 'Theory' ? styles.tagTheory : styles.tagRevision}`}>
                              {cls.type || 'Class'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <Link href="/student" className={styles.cardFooterLink}>
                  View Full Schedule <ChevronRight size={14} />
                </Link>
              </div>
              
              {/* Background Blobs */}
              <div className={styles.blob1}></div>
              <div className={styles.blob2}></div>
            </div>
          </div>
        </section>

        {/* Section 2: Professional Notice Board */}
        {notices.length > 0 && (
          <section className={styles.noticeSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.headerIconBox}>
                <Bell size={20} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Notice Board</h2>
                <p className={styles.sectionDesc}>Latest updates and administrative announcements</p>
              </div>
            </div>

            <div className={styles.noticeGrid}>
              {notices.map((notice) => (
                <div 
                  key={notice._id} 
                  className={`${styles.noticeCard} ${notice.type === 'leave' ? styles.noticeCritical : styles.noticeInfo}`}
                >
                  <div className={styles.noticeHeader}>
                    <span className={styles.noticeBadge}>
                      {notice.type === 'leave' ? <AlertCircle size={14} /> : <Megaphone size={14} />}
                      {notice.type === 'leave' ? 'Urgent Update' : 'Announcement'}
                    </span>
                    <span className={styles.noticeDate}>
                      {new Date(notice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <h3 className={styles.noticeTitle}>{notice.title}</h3>
                  <p className={styles.noticeBody}>{notice.content}</p>
                  
                  <div className={styles.noticeFooter}>
                    <div className={styles.authorInfo}>
                      <div className={styles.authorAvatar}>
                        {notice.createdBy?.username?.charAt(0) || 'A'}
                      </div>
                      <span>{notice.createdBy?.username || 'Admin'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}