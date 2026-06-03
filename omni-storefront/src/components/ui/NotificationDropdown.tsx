"use client";
import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/me/notifications?page=0&size=10");
      if (res.data && res.data.content) {
        setNotifications(res.data.content);
        setUnreadCount(res.data.content.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/me/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch(`/me/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl glass hover:bg-glass-hover transition-all duration-200 cursor-pointer"
        aria-label="Thông báo"
      >
        <Bell className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white rounded-full bg-red-500"
            style={{ boxShadow: "0 2px 4px rgba(239, 68, 68, 0.4)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50 shadow-xl"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Thông báo</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
                  Đánh dấu đã đọc tất cả
                </button>
              )}
            </div>
            
            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif: any) => (
                  <div 
                    key={notif.id} 
                    onClick={() => {
                      if (!notif.isRead) markAsRead(notif.id);
                    }}
                    className={`p-4 border-b flex gap-3 cursor-pointer transition-colors ${!notif.isRead ? "bg-blue-500/5" : ""}`}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm ${!notif.isRead ? "font-bold" : "font-medium"}`} style={{ color: "var(--text-primary)" }}>
                        {notif.title}
                      </h4>
                      <p className="text-xs mt-1 truncate" style={{ color: "var(--text-secondary)" }}>
                        {notif.message}
                      </p>
                      <span className="text-[10px] mt-2 block" style={{ color: "var(--text-muted)" }}>
                        {new Date(notif.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 self-center flex-shrink-0" />}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Không có thông báo nào</p>
                </div>
              )}
            </div>
            <div className="p-3 text-center border-t cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
              <Link href="/profile/notifications" className="text-sm font-medium" onClick={() => setOpen(false)}>
                Xem tất cả
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}
