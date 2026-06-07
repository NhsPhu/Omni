import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Badge, Drawer, Grid } from 'antd';
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
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;

export default function SuperAdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const screens = Grid.useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { key: '/admin/reports', icon: <BarChart size={18} />, label: 'Báo cáo & Cấu hình' },
    { key: '/admin/users', icon: <Users size={18} />, label: 'Quản lý người dùng' },
    { key: '/admin/vendors', icon: <Store size={18} />, label: 'Duyệt người bán' },
    { key: '/admin/categories', icon: <Network size={18} />, label: 'Cây danh mục' },
    { key: '/admin/disputes', icon: <Scale size={18} />, label: 'Giải quyết tranh chấp' },
    { key: '/admin/vouchers', icon: <Ticket size={18} />, label: 'Platform Voucher' },
    { key: '/admin/flash-sale', icon: <Zap size={18} />, label: 'Flash Sale' },
    { key: '/admin/withdrawals', icon: <Coins size={18} />, label: 'Duyệt lệnh rút tiền' },
  ];

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center justify-center gap-3 border-b border-gray-100 px-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
             style={{ background: 'linear-gradient(135deg, #1C1917, #44403C)', boxShadow: '0 4px 14px rgba(28, 25, 23, 0.4)' }}>
          <ShieldCheck size={18} strokeWidth={2.5} style={{ color: "#CA8A04" }} />
        </div>
        {!collapsed && <span className="font-bold text-lg text-gray-800 truncate" style={{ fontFamily: "'Bodoni Moda', serif", letterSpacing: '-0.5px' }}>Omni Admin</span>}
      </div>
      <div className="py-4">
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key);
            setDrawerVisible(false);
          }}
          className="border-none bg-transparent"
        />
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {screens.lg ? (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          width={260}
          theme="light"
          style={{ background: '#ffffff', borderRight: '1px solid #f3f4f6' }}
        >
          {sidebarContent}
        </Sider>
      ) : (
        <Drawer
          title={null}
          placement="left"
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{ body: { padding: 0, background: '#ffffff' } }}
          width={260}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout>
        <Header className="flex items-center justify-between px-6 bg-white shadow-sm" style={{ padding: '0 24px' }}>
          <Button 
            type="text"
            icon={<MenuIcon size={20} />}
            onClick={() => {
              if (screens.lg) {
                setCollapsed(!collapsed);
              } else {
                setDrawerVisible(!drawerVisible);
              }
            }}
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
                ],
                onClick: ({ key }) => {
                  if (key === 'logout') {
                    logout();
                    navigate('/login');
                  }
                }
              }} 
              placement="bottomRight"
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" style={{ background: '#f5f5f5' }} />
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
