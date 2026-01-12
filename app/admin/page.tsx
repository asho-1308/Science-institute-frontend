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
  AlertTriangle
} from "lucide-react";
import styles from "./admin.module.css";

// --- Types ---
type Category = "PERSONAL" | "EXTERNAL";
type ClassType = "Theory" | "Revision" | "Paper Class";

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
  classNumber?: number;
}

interface FormState {
  day: string;
  grade: string;
  subject: string;
  category: Category;
  classType: ClassType;
  location: string;
  startTime: string;
  endTime: string;
}

// --- Configuration Constants ---
const EXTERNAL_INSTITUTES = ["Excellent Institute", "Viyabarimoolai Institute"];
const PERSONAL_LOCATIONS = ["Thumbasiddy", "Puttalai"];
const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminPanel() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch classes ---
  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        console.log('Fetching classes from backend...');
        const res = await fetch('https://science-institute-backend.vercel.app/timetable');
        console.log('Fetch response status:', res.status);
        if (!res.ok) throw new Error('Failed to fetch classes.');
        const data: ClassSession[] = await res.json();
        console.log('Raw data received:', data);
        
        const formattedData = data.map((cls: ClassSession) => ({
          ...cls,
          startTime: new Date(cls.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: new Date(cls.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        }));
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

  // Form State
  const [formData, setFormData] = useState<FormState>({
    day: "Monday",
    grade: "Grade 10",
    subject: "Science",
    category: "EXTERNAL",
    classType: "Theory",
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

      const payload: any = {
        ...formData,
        title: `${formData.subject} - ${formData.grade}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        category: formData.category,
        type: formData.classType,
      };
      if (!isNaN(parsedClassNumber)) payload.classNumber = parsedClassNumber;

      const url = editingId ? `https://science-institute-backend.vercel.app/timetable/${editingId}` : 'https://science-institute-backend.vercel.app/timetable';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Failed to save.');

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

      const res = await fetch(`https://science-institute-backend.vercel.app/timetable/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete class');
      setClasses(classes.filter(c => c._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleEdit = (cls: ClassSession) => {
    setEditingId(cls._id || null);
    setFormData({
      day: cls.day || 'Monday',
      grade: cls.grade || 'Grade 10',
      subject: cls.subject || cls.title || 'Science',
      category: cls.category || 'EXTERNAL',
      classType: cls.type || 'Theory',
      location: cls.location || EXTERNAL_INSTITUTES[0],
      startTime: cls.startTime || '',
      endTime: cls.endTime || '',
    });
    setIsModalOpen(true);
  };

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
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> <span className={styles.btnText}>Add Class</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
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
                  <li key={cls._id} className={`${styles.classItem} ${styles[locClass]}`}>
                    
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
    </div>
  );
}