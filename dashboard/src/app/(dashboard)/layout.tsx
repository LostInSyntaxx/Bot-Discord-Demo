'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { wsService } from '@/lib/websocket';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, setUser, setToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenFromUrl = new URLSearchParams(window.location.search).get('token');
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      setToken(tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const storedToken = localStorage.getItem('token');
    if (!storedToken && !token) {
      router.push('/login');
      return;
    }

    if (storedToken || token) {
      const authToken = storedToken || token;
      if (authToken) {
        setToken(authToken);
        wsService.connect(authToken);
        
        api.getUser()
          .then((userData) => {
            setUser(userData);
            setLoading(false);
          })
          .catch(() => {
            localStorage.removeItem('token');
            router.push('/login');
          });
      }
    }
  }, [router, setUser, setToken, token]);

  useEffect(() => {
    return () => {
      wsService.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
