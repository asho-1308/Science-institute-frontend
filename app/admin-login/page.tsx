"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Hook for redirection
import Link from "next/link";
import { 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle 
} from "lucide-react";
import { BACKEND_URL } from "../../config";
import styles from "./login.module.css";

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // --- MOCK AUTHENTICATION LOGIC ---
    // In a real app, you would make an API call here.
    // e.g., await fetch('/api/login', { ... })
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and username
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        
        {/* Header Icon */}
        <div className={styles.iconWrapper}>
          <ShieldCheck size={32} />
        </div>

        <h1 className={styles.title}>Welcome Back, Sir</h1>
        <p className={styles.subtitle}>Enter your credentials to manage schedules.</p>

        {/* Error Alert */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Username Field */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Username
            </label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="username"
                className={styles.input}
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                name="password"
                className={styles.input}
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.loginBtn}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : (
              <>
                Login to Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

        <Link href="/" className={styles.backLink}>
          &larr; Return to Home Page
        </Link>
      </div>
    </div>
  );
}