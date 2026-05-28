import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Badge } from 'antd';
import { 
  Users, 
  Store, 
  Network, 
  Scale, 
  Ticket, 
  Banknote,
  Coins,
  Settings,
  BarChart,
  Bell,
  Menu as MenuIcon,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const { Header, Sider, Content } = Layout;

export default function SuperAdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/admin/reports', icon: <BarChart size={18} />, label: 'Báo cáo & Cấu hình' },
    { key: '/admin/users', icon: <Users size={18} />, label: 'Quản lý người dùng' },
    { key: '/admin/vendors', icon: <Store size={18} />, label: 'Duyệt người bán' },
    { key: '/admin/categories', icon: <Network size={18} />, label: 'Cây danh mục' },
    { key: '/admin/disputes', icon: <Scale size={18} />, label: 'Giải quyết tranh chấp' },
    { key: '/admin/vouchers', icon: <Ticket size={18} />, label: 'Platform Voucher' },
    { key: '/admin/withdrawals', icon: <Coins size={18} />, label: 'Duyệt lệnh rút tiền' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={260}
        theme="dark"
        style={{ background: '#001529' }}
      >
        <div className="h-16 flex items-center justify-center gap-2 border-b border-gray-800 px-4">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white shrink-0">
            <ShieldCheck size={18} />
          </div>
          {!collapsed && <span className="font-bold text-lg text-white truncate">Omni Admin</span>}
        </div>
        <div className="py-4">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            className="border-none bg-transparent"
          />
        </div>
      </Sider>

      <Layout>
        <Header className="flex items-center justify-between px-6 bg-white shadow-sm" style={{ padding: '0 24px' }}>
          <Button 
            type="text"
            icon={<MenuIcon size={20} />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600"
          />
          
          <div className="flex items-center gap-6">
            <NotificationBell />
            
            <Dropdown 
              menu={{ 
                items: [
                  { key: 'profile', icon: <Settings size={16} />, label: 'Cài đặt hệ thống' },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogOut size={16} />, label: 'Đăng xuất', danger: true },
                ] 
              }} 
              placement="bottomRight"
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" className="bg-red-100" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Super Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="m-6">
          <div className="bg-transparent h-full">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
