import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Menu, Spin, Button } from 'antd';
import { Bell, Check } from 'lucide-react';
import api from '../../lib/axios';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/me/notifications?size=10');
      const data = res.data.content || [];
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.readAt).length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.patch('/me/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/me/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const items = [
    {
      key: 'header',
      label: (
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
          <span className="font-bold text-gray-800">Thông báo</span>
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={markAllAsRead} className="text-blue-600 p-0 text-xs flex items-center gap-1">
              <Check size={12} /> Đánh dấu đã đọc
            </Button>
          )}
        </div>
      )
    },
    ...notifications.map((n) => ({
      key: n.id,
      label: (
        <div 
          className={`px-4 py-3 border-b border-gray-50 flex flex-col gap-1 w-72 ${!n.readAt ? 'bg-blue-50/50' : ''}`}
          onClick={() => !n.readAt && markAsRead(n.id)}
        >
          <div className="flex justify-between items-start gap-2">
            <span className={`text-sm ${!n.readAt ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
              {n.title}
            </span>
            {!n.readAt && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />}
          </div>
          <span className="text-xs text-gray-500 line-clamp-2">{n.message}</span>
          <span className="text-[10px] text-gray-400 mt-1">
            {new Date(n.createdAt).toLocaleDateString('vi-VN')} {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    })),
    notifications.length === 0 ? {
      key: 'empty',
      label: <div className="px-4 py-8 text-center text-gray-500">Không có thông báo nào</div>
    } : null
  ].filter(Boolean) as any[];

  return (
    <Dropdown 
      menu={{ items }} 
      placement="bottomRight"
      trigger={['click']}
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) fetchNotifications(); // fetch on open
      }}
      overlayStyle={{ padding: 0, overflow: 'hidden', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
    >
      <Badge count={unreadCount} size="small" className="cursor-pointer">
        <Bell size={20} className="text-gray-500 hover:text-blue-600 transition-colors" />
      </Badge>
    </Dropdown>
  );
}
