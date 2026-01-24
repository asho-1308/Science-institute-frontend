"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  MapPin, 
  Lock, 
  User, 
  ArrowLeft,
  X,
  AlertTriangle,
  Bell
} from "lucide-react";
import { BACKEND_URL } from "../../config";
import styles from "./admin.module.css";

// --- Types ---
type Category = "PERSONAL" | "EXTERNAL";
type ClassType = "Theory" | "Revision" | "Paper Class";
type Medium = "Tamil" | "English";
type NoticeType = "leave" | "announcement";

interface ClassSession {
  _id?: string;
  title?: string;
  subject?: string;
  grade?: string;
  startTime: string; 
  endTime: string;
  day: string;
  location: string;
  category: Category;
  type: ClassType;
  medium?: Medium;
  classNumber?: number;
}

interface Notice {
  _id: string;
  title: string;
  content: string;
  date: string;
  type: NoticeType;
  createdBy: { username: string };
}

interface FormState {
  day: string;
  grade: string;
  subject: string;
  category: Category;
  classType: ClassType;
  medium: Medium;
  location: string;
  startTime: string;
  endTime: string;
}

interface NoticeFormState {
  title: string;
  content: string;
  date: string;
  type: NoticeType;
  image: File | null;
}

// --- Configuration Constants ---
const EXTERNAL_INSTITUTES = ["Excellent Institute", "Viyabarimoolai Institute"];
const PERSONAL_LOCATIONS = ["Thumbasiddy", "Puttalai"];
const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminPanel() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'classes' | 'notices'>('classes');

  const [noticeFormData, setNoticeFormData] = useState<NoticeFormState>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    type: 'announcement',
    image: null
  });

  // Color palette and helper to assign a deterministic color per class
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

  // --- Fetch classes ---
  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        console.log('Fetching classes from backend...');
        const res = await fetch(`${BACKEND_URL}/timetable`);
        console.log('Fetch response status:', res.status);
        if (!res.ok) throw new Error('Failed to fetch classes.');
        const data: ClassSession[] = await res.json();
        console.log('Raw data received:', data);
        
        const formattedData = data.map((cls: ClassSession) => {
          const subject = cls.subject || (cls.title ? cls.title.replace(/\s*-\s*Grade\s*\d+/i, '').trim() : undefined);
          const grade = (cls as any).grade || (cls.classNumber ? `Grade ${cls.classNumber}` : undefined);
          return {
            ...cls,
            subject,
            grade,
            startTime: new Date(cls.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            endTime: new Date(cls.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          } as ClassSession;
        });
        console.log('Formatted data:', formattedData);
        setClasses(formattedData.sort((a, b) => a.startTime.localeCompare(b.startTime)));
        console.log('Classes set successfully');
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // --- Fetch notices ---
  React.useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/notices`);
        if (!res.ok) throw new Error('Failed to fetch notices.');
        const data: Notice[] = await res.json();
        setNotices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    if (activeTab === 'notices') fetchNotices();
  }, [activeTab]);

  // Form State
  const [formData, setFormData] = useState<FormState>({
    day: "Monday",
    grade: "Grade 10",
    subject: "Science",
    category: "EXTERNAL",
    classType: "Theory",
    medium: "English",
    location: EXTERNAL_INSTITUTES[0],
    startTime: "",
    endTime: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    
    if (name === "category") {
      const val = value as Category;
      setFormData(prev => ({
        ...prev,
        category: val,
        location: val === "EXTERNAL" ? EXTERNAL_INSTITUTES[0] : PERSONAL_LOCATIONS[0]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name as keyof FormState]: value } as FormState));
    }
    setError("");
  };

  // --- Save Logic ---
  const handleSave = async () => {
    setError("");
    if (!formData.startTime || !formData.endTime) {
      setError("Please set start and end times.");
      return;
    }
    if (formData.startTime >= formData.endTime) {
      setError("End time must be after start time.");
      return;
    }

    const getNextDayOfWeek = (dayString: string, timeString: string): Date => {
      const dayIndex = DAYS.indexOf(dayString);
      const [hours, minutes] = timeString.split(':').map(s => parseInt(s, 10));
      const resultDate = new Date();
      resultDate.setHours(hours, minutes, 0, 0);
      resultDate.setDate(resultDate.getDate() + (dayIndex - resultDate.getDay() + 7) % 7);
      return resultDate;
    };

    const startTime = getNextDayOfWeek(formData.day, formData.startTime);
    const endTime = getNextDayOfWeek(formData.day, formData.endTime);

    // Overlap Check
    const parseTimeToMinutes = (timeStr: string) => {
      if (!timeStr) return NaN;
      const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (ampmMatch) {
        let h = parseInt(ampmMatch[1], 10);
        const m = parseInt(ampmMatch[2], 10);
        const ampm = ampmMatch[3].toUpperCase();
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return h * 60 + m;
      }
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        return h * 60 + m;
      }
      return NaN;
    };

    const hasOverlap = classes.some(c => {
      if (c._id === editingId) return false;
      if (c.day !== formData.day) return false;
      const startA = parseTimeToMinutes(formData.startTime);
      const endA = parseTimeToMinutes(formData.endTime);
      const startB = parseTimeToMinutes(c.startTime);
      const endB = parseTimeToMinutes(c.endTime);
      if ([startA, endA, startB, endB].some(v => isNaN(v))) return false;
      return startA < endB && endA > startB;
    });

    if (hasOverlap) {
      setError("Time Conflict! You already have a class scheduled during this time.");
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') ?? undefined) : undefined;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const gradeMatch = formData.grade.match(/\d+/);
      const parsedClassNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : NaN;

      // Clean subject to avoid duplicate grade fragments in title
      const cleanedSubject = (formData.subject || '').replace(/\s*-\s*Grade\s*\d+/gi, '').trim();

      const payload: any = {
        ...formData,
        subject: cleanedSubject,
        title: `${cleanedSubject} - ${formData.grade}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        category: formData.category,
        type: formData.classType,
        medium: formData.medium,
      };
      if (!isNaN(parsedClassNumber)) payload.classNumber = parsedClassNumber;

      const url = editingId ? `${BACKEND_URL}/timetable/${editingId}` : `${BACKEND_URL}/timetable`;
      const method = editingId ? 'PUT' : 'POST';

      // Debug: log request details (do not print raw token)
      console.log('handleSave: sending request', {
        url,
        method,
        payload,
        hasToken: !!token,
        headers: { 'Content-Type': headers['Content-Type'], Authorization: token ? 'Bearer [REDACTED]' : undefined }
      });

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });

      // Read response text then try to parse JSON for robust logging
      const resText = await res.text();
      let result: any;
      try {
        result = resText ? JSON.parse(resText) : {};
      } catch (e) {
        result = { text: resText };
      }

      console.log('handleSave: response', { status: res.status, ok: res.ok, body: result });

      if (!res.ok) {
        let message = result && result.message ? result.message : (result.text || `Failed to save (status ${res.status})`);
        if (result && result.overlap) {
          try {
            const o = result.overlap;
            const s = new Date(o.startTime).toLocaleString();
            const e = new Date(o.endTime).toLocaleString();
            message += `\nConflicting session: ${o.title} at ${o.location} (${s} - ${e})`;
          } catch (e) {
            // ignore formatting errors
          }
        }
        throw new Error(message);
      }

      const formatted = {
        ...result,
        startTime: new Date(result.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: new Date(result.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };

      let next = [];
      if (editingId) {
        next = classes.map(c => (c._id === result._id ? formatted : c));
      } else {
        next = [...classes, formatted];
      }
      setClasses(next.sort((a,b) => a.startTime.localeCompare(b.startTime)));

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ ...formData, startTime: "", endTime: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Delete this session?")) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string,string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/timetable/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete class');
      setClasses(classes.filter(c => c._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // --- Notice handlers ---
  const handleNoticeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNoticeFormData(prev => ({ ...prev, [name as keyof NoticeFormState]: value } as NoticeFormState));
  };

  const handleNoticeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNoticeFormData(prev => ({ ...prev, image: file }));
  };

  const handleNoticeSave = async () => {
    setError("");
    if (!noticeFormData.title.trim() || !noticeFormData.content.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      let body: string | FormData;
      let contentType: string | undefined;

      if (noticeFormData.image) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('title', noticeFormData.title.trim());
        formData.append('content', noticeFormData.content.trim());
        formData.append('date', noticeFormData.date || new Date().toISOString());
        formData.append('type', noticeFormData.type);
        formData.append('image', noticeFormData.image);
        body = formData;
      } else {
        // Use JSON for text-only updates
        contentType = 'application/json';
        body = JSON.stringify({
          title: noticeFormData.title.trim(),
          content: noticeFormData.content.trim(),
          date: noticeFormData.date || new Date().toISOString(),
          type: noticeFormData.type
        });
      }

      if (contentType) headers['Content-Type'] = contentType;

      const url = editingNoticeId ? `${BACKEND_URL}/api/notices/${editingNoticeId}` : `${BACKEND_URL}/api/notices`;
      const method = editingNoticeId ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body });
      if (!res.ok) throw new Error('Failed to save notice');

      const savedNotice = await res.json();

      if (editingNoticeId) {
        setNotices(notices.map(n => n._id === editingNoticeId ? savedNotice : n));
      } else {
        setNotices([...notices, savedNotice]);
      }

      setIsNoticeModalOpen(false);
      setEditingNoticeId(null);
      setNoticeFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        type: 'announcement',
        image: null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleNoticeDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/api/notices/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete notice');
      setNotices(notices.filter(n => n._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleNoticeEdit = (notice: Notice) => {
    setEditingNoticeId(notice._id);
    setNoticeFormData({
      title: notice.title,
      content: notice.content,
      date: new Date(notice.date).toISOString().split('T')[0],
      type: notice.type,
      image: null
    });
    setIsNoticeModalOpen(true);
  };

  // Normalize times to `HH:MM` for `input[type=time]` when editing
  const normalizeTimeForInput = (time?: string) => {
    if (!time) return "";
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const parts = time.split(':').map(p => p.padStart(2, '0'));
      return `${parts[0]}:${parts[1]}`;
    }
    const ampm = time.match(/(AM|PM)$/i);
    if (ampm) {
      const m = time.match(/(\d{1,2}):(\d{2})/);
      if (!m) return "";
      let h = parseInt(m[1], 10);
      const min = m[2];
      const isPM = /PM/i.test(ampm[0]);
      if (isPM && h !== 12) h += 12;
      if (!isPM && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${min}`;
    }
    const d = new Date(time);
    if (!isNaN(d.getTime())) {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
    return "";
  };

  // Extract clean subject from title by removing any " - Grade X" suffixes
  const extractSubjectFromTitle = (t?: string) => {
    if (!t) return '';
    return t.replace(/\s*-\s*Grade\s*\d+/gi, '').trim();
  };

  const handleEdit = async (cls: ClassSession) => {
    // Fetch authoritative record from backend to avoid client-side mismatches
    try {
      const id = cls._id;
      if (!id) return;
      const res = await fetch(`${BACKEND_URL}/timetable/${id}`);
      if (!res.ok) throw new Error('Failed to fetch class details');
      const data: ClassSession = await res.json();
      setEditingId(data._id || null);
      setFormData({
        day: data.day || 'Monday',
        grade: (data as any).grade || (data.classNumber ? `Grade ${data.classNumber}` : 'Grade 10'),
        subject: data.subject || (data.title ? data.title.replace(/\s*-\s*Grade\s*\d+/i, '').trim() : 'Science'),
        category: data.category || 'EXTERNAL',
        classType: data.type || 'Theory',
        medium: data.medium || 'English',
        location: data.location || EXTERNAL_INSTITUTES[0],
        startTime: normalizeTimeForInput(data.startTime),
        endTime: normalizeTimeForInput(data.endTime),
      });
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // Prevent layout shift when modal opens by locking body scroll
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyLock = () => {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth) document.body.style.paddingRight = `${scrollBarWidth}px`;
    };

    const removeLock = () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };

    if (isModalOpen || isNoticeModalOpen) applyLock();
    else removeLock();

    return () => removeLock();
  }, [isModalOpen, isNoticeModalOpen]);

  return (
    <div className={styles.container}>
      
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
            <Link href="/" className={styles.backLink}>
            <ArrowLeft size={20} />
            <span className={styles.navText}>Back</span>
            </Link>
            <div className={styles.brand}>Admin</div>
        </div>
        <div className={styles.navTabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'classes' ? styles.activeTab : ''}`} 
            onClick={() => setActiveTab('classes')}
          >
            Classes
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'notices' ? styles.activeTab : ''}`} 
            onClick={() => setActiveTab('notices')}
          >
            <Bell size={16} /> Notices
          </button>
        </div>
        <button 
          className={styles.addButton} 
          onClick={() => activeTab === 'classes' ? setIsModalOpen(true) : setIsNoticeModalOpen(true)}
        >
          <Plus size={20} /> <span className={styles.btnText}>
            Add {activeTab === 'classes' ? 'Class' : 'Notice'}
          </span>
        </button>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        {activeTab === 'classes' && (
          <>
            <div className={styles.tipBox}>
              <strong>Tip:</strong> Add your <b>External Institute</b> classes first.
            </div>

            {loading && <p className={styles.loading}>Loading schedule...</p>}
            {!loading && error && <div className={styles.errorMsg}>{error}</div>}

            {!loading && !error && DAYS.map(day => {
              const dayClasses = classes.filter(c => c.day === day);
              if (dayClasses.length === 0) return null;

              return (
                <div key={day} className={styles.dayGroup}>
                  <div className={styles.dayHeader}>{day}</div>
                  <ul className={styles.classList}>
                    {dayClasses.map((cls, idx) => {
                      const classNum = cls.classNumber;
                      const locClass = cls.location?.includes('Viyabarimoolai') ? 'locViyabarimoolaiInstitute' 
                        : cls.location?.includes('Puttalai') ? 'locPuttalai' 
                        : cls.location?.includes('Thumbasiddy') ? 'locThumbasiddy'
                        : 'locExcellentInstitute';
                      
                      return (
                      <li
                        key={cls._id}
                        className={`${styles.classItem} ${styles[locClass]}`}
                        style={{ borderLeft: `4px solid ${getColorForKey(cls._id || cls.title || (cls.subject || ''))}` }}
                      >
                        
                        <div className={styles.itemHeader}>
                            <div className={styles.timeBox}>
                                <span className={styles.timeText}>{cls.startTime}</span>
                                <span className={styles.durationText}>- {cls.endTime}</span>
                            </div>
                            {/* Mobile Actions (Top Right) */}
                            <div className={`${styles.actionGroup} ${styles.mobileActions}`}>
                                <button className={`${styles.actionBtn} ${styles.btnEdit}`} onClick={() => handleEdit(cls)}>
                                    <Edit2 size={16} />
                                </button>
                                <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={() => handleDelete(cls._id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.infoBox}>
                          <div className={styles.subjectRow}>
                            <span className={styles.subjectTitle}>
                              {classNum ? `Class ${classNum}` : (cls.grade || '')}
                            </span>
                            {cls.category === 'EXTERNAL' ? (
                               <span className={`${styles.badge} ${styles.badgeExternal}`}>
                                 <Lock size={10} style={{marginRight:3}}/> Fixed
                               </span>
                            ) : (
                               <span className={`${styles.badge} ${styles.badgePersonal}`}>
                                 <User size={10} style={{marginRight:3}}/> Personal
                               </span>
                            )}
                            <span className={`${styles.badge} ${
                              cls.type === 'Theory' ? styles.badgeTheory :
                              cls.type === 'Revision' ? styles.badgeRevision :
                              styles.badgePaper
                            }`}>
                              {cls.type}
                            </span>
                            <span className={`${styles.badge} ${
                              cls.medium === 'English' ? styles.badgeEnglish :
                              styles.badgeTamil
                            }`}>
                              {cls.medium}
                            </span>
                          </div>
                          <div className={styles.locationRow}>
                            <MapPin size={14} className={styles.icon} /> {cls.location}
                          </div>
                        </div>

                        {/* Desktop Actions (Right Side) */}
                        <div className={`${styles.actionGroup} ${styles.desktopActions}`}>
                          <button className={`${styles.actionBtn} ${styles.btnEdit}`} onClick={() => handleEdit(cls)}>
                            <Edit2 size={16} />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={() => handleDelete(cls._id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {!loading && !error && classes.length === 0 && (
              <div className={styles.emptyState}>
                <p>No classes yet. Start by adding your Fixed External Classes.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'notices' && (
          <>
            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.noticesList}>
              {notices.map((notice) => (
                <div key={notice._id} className={`${styles.noticeItem} ${notice.type === 'leave' ? styles.noticeLeave : styles.noticeAnnouncement}`}>
                  <div className={styles.noticeHeader}>
                    <h3 className={styles.noticeTitle}>{notice.title}</h3>
                    <span className={`${styles.noticeType} ${notice.type === 'leave' ? styles.typeLeave : styles.typeAnnouncement}`}>
                      {notice.type === 'leave' ? 'Teacher Leave' : 'Announcement'}
                    </span>
                  </div>
                  <p className={styles.noticeContent}>{notice.content}</p>
                  <div className={styles.noticeMeta}>
                    <span>{new Date(notice.date).toLocaleDateString()}</span>
                    <span>by {notice.createdBy.username}</span>
                  </div>
                  <div className={styles.noticeActions}>
                    <button className={`${styles.actionBtn} ${styles.btnEdit}`} onClick={() => handleNoticeEdit(notice)}>
                      <Edit2 size={16} />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={() => handleNoticeDelete(notice._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {notices.length === 0 && (
              <div className={styles.emptyState}>
                <p>No notices yet. Add your first notice.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingId ? "Edit Class" : "Add Class"}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className={styles.modalBody}>
              {error && <div className={styles.errorMsg}><AlertTriangle size={18} /> {error}</div>}

              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="category" value="EXTERNAL" checked={formData.category === "EXTERNAL"} onChange={handleChange} />
                    <span>External (Fixed)</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="category" value="PERSONAL" checked={formData.category === "PERSONAL"} onChange={handleChange} />
                    <span>Personal Tuition</span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Class Type</label>
                <select name="classType" className={styles.select} value={formData.classType} onChange={handleChange}>
                  <option value="Theory">Theory</option>
                  <option value="Revision">Revision</option>
                  <option value="Paper Class">Paper Class</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Medium</label>
                <select name="medium" className={styles.select} value={formData.medium} onChange={handleChange}>
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Grade</label>
                  <select name="grade" className={styles.select} value={formData.grade} onChange={handleChange}>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Day</label>
                  <select name="day" className={styles.select} value={formData.day} onChange={handleChange}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Location</label>
                <select name="location" className={styles.select} value={formData.location} onChange={handleChange}>
                  {formData.category === "EXTERNAL"
                    ? EXTERNAL_INSTITUTES.map(l => <option key={l} value={l}>{l}</option>)
                    : PERSONAL_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)
                  }
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Start Time</label>
                  <input type="time" name="startTime" className={styles.input} value={formData.startTime} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>End Time</label>
                  <input type="time" name="endTime" className={styles.input} value={formData.endTime} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className={styles.btnSave} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* --- NOTICE MODAL --- */}
      {isNoticeModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingNoticeId ? "Edit Notice" : "Add Notice"}</h2>
              <button className={styles.closeBtn} onClick={() => setIsNoticeModalOpen(false)}><X size={20}/></button>
            </div>

            <div className={styles.modalBody}>
              {error && <div className={styles.errorMsg}><AlertTriangle size={18} /> {error}</div>}

              <div className={styles.formGroup}>
                <label className={styles.label}>Title</label>
                <input
                  type="text"
                  name="title"
                  className={styles.input}
                  value={noticeFormData.title}
                  onChange={handleNoticeChange}
                  placeholder="Enter notice title"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Type</label>
                <select name="type" className={styles.select} value={noticeFormData.type} onChange={handleNoticeChange}>
                  <option value="announcement">Announcement</option>
                  <option value="leave">Teacher Leave</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  name="date"
                  className={styles.input}
                  value={noticeFormData.date}
                  onChange={handleNoticeChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Content</label>
                <textarea
                  name="content"
                  className={styles.textarea}
                  value={noticeFormData.content}
                  onChange={handleNoticeChange}
                  placeholder="Enter notice content"
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.input}
                  onChange={handleNoticeImageChange}
                />
                {noticeFormData.image && (
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                    Selected: {noticeFormData.image.name}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setIsNoticeModalOpen(false)}>Cancel</button>
              <button className={styles.btnSave} onClick={handleNoticeSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}