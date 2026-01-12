"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin-login');
  }, [router]);

  return null;
}
