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
  BookOpen 
} from "lucide-react";
import styles from "./home.module.css";

export default function Home() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Simple clock effect (Initialized to null to avoid hydration mismatch)
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's PERSONAL classes for the Live Preview
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [todayClasses, setTodayClasses] = useState<Array<{ id?: string; time: string; subject?: string; location?: string; type?: string; isEvening?: boolean }>>([]);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const params = new URLSearchParams({ category: 'PERSONAL', day: todayName });
        const res = await fetch(`http://localhost:5000/timetable?${params.toString()}`);
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
            isEvening: hour >= 18 && hour < 23,
          };
        });
        setTodayClasses(mapped);
      } catch (e) {
        // ignore preview errors
      }
    };
    fetchToday();
  }, [todayName]);

  return (
    <div className={styles.container}>
      
      {/* --- Navbar --- */}
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <Atom size={24} />
          </div>
          <span className={styles.brandName}>
            Thomsan <span className={styles.brandHighlight}>Institute</span>
          </span>
        </div>
        
        <div className={styles.navInfo}>
          {currentTime && (
            <>
              <div className={styles.clockBadge}>
                <Clock size={16} className={styles.clockIcon} />
                <span>
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span>|</span>
              <span>{currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </>
          )}
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className={styles.mainContent}>
        
        {/* Left Column: Welcome & Action */}
        <div className={styles.leftColumn}>
          <div>
            <div className={styles.statusBadge}>
              <span className={styles.pulseDot}></span>
              System Online
            </div>
            <h1 className={styles.heroTitle}>
              Master Your <br />
              <span className={styles.gradientText}>
                Study Timeline
              </span>
            </h1>
            <p className={styles.heroDescription}>
              Access class schedules, exam dates, and location details in real-time. Designed for accuracy, optimized for success.
            </p>
          </div>

          {/* Role Based Buttons */}
          <div className={styles.buttonGroup}>
            <Link href="/student" className={styles.studentBtn}>
              <BookOpen size={20} />
              <span>I'm a Student</span>
              <ArrowRight size={18} className={styles.arrowIcon} />
            </Link>

            <Link href="/admin/login" className={styles.teacherBtn}>
              <UserCog size={20} className={styles.clockIcon} />
              <span>Teacher Login</span>
            </Link>
          </div>
          
          {/* Quick Stat for Admin (Constraint Reminder) */}
          {/* <div className={styles.warningCard}>
             <div className={styles.warningIconWrapper}>
               <MapPin size={18} />
             </div>
             <div>
               <h4 className={styles.warningTitle}>Evening Location Rule</h4>
               <p className={styles.warningText}>
                 Reminder: Evening classes (6pm - 11pm) must be held at a single location per day (Place A or Place B).
               </p>
             </div>
          </div> */}
        </div>

        {/* Right Column: Dynamic Schedule Preview Card */}
        <div className={styles.rightColumn}>
          {/* Decorative background blobs */}
          <div className={`${styles.blob} ${styles.blobPurple}`}></div>
          <div className={`${styles.blob} ${styles.blobIndigo}`}></div>

          <div className={styles.scheduleCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <Calendar className={styles.clockIcon} size={20} />
                Today's Schedule
              </h3>
              <span className={styles.liveBadge}>
                Live Preview
              </span>
            </div>

            {/* Timeline List */}
            <div className={styles.timelineContainer}>
              {todayClasses.map((cls, index) => (
                <div key={cls.id} className={styles.timelineItem}>
                  <div className={styles.timeCol}>
                    <span className={styles.time}>{cls.time.split(' ')[0]}</span>
                    <span className={styles.ampm}>{cls.time.split(' ')[1]}</span>
                    {/* Vertical Line */}
                    {index !== todayClasses.length - 1 && (
                      <div className={styles.verticalLine}></div>
                    )}
                  </div>
                  
                  <div className={styles.infoCol}>
                    <h4 className={styles.subjectTitle}>
                      {cls.subject}
                    </h4>
                    <div className={styles.metaInfo}>
                      <span className={styles.locationTag}>
                        <MapPin size={12} /> {cls.location}
                      </span>
                      <span className={`${styles.typeTag} ${
                        cls.type === 'Theory' ? styles.typeTheory : styles.typeOther
                      }`}>
                        {cls.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View Full Button */}
            <div className="mt-6 text-center">
              <Link href="/student" className={styles.viewFullLink}>
                View Full Week Schedule &rarr;
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}