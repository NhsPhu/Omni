import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Badge, Drawer, Grid } from 'antd';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Tag, 
  Wallet, 
  MessageCircle, 
  LineChart,
  Bell,
  Menu as MenuIcon,
  Store,
  LogOut,
  User,
  Settings,
  Zap,
  MessageSquare,
  Bot
} from 'lucide-react';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from './NotificationBell';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const screens = Grid.useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ROLE_ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role !== 'ROLE_VENDOR') {
    window.location.href = (import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000') + '/seller/register';
    return null;
  }

  const menuItems = [
    { key: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { key: '/products', icon: <Package size={18} />, label: 'Sản phẩm' },
    { key: '/orders', icon: <ClipboardList size={18} />, label: 'Đơn hàng' },
    { key: '/vouchers', icon: <Tag size={18} />, label: 'Voucher Shop' },
    { key: '/finance', icon: <Wallet size={18} />, label: 'Tài chính' },
    { key: '/reviews', icon: <MessageCircle size={18} />, label: 'Đánh giá & Hỏi đáp' },
    { key: '/chat', icon: <MessageSquare size={18} />, label: 'Tin nhắn' },
    { key: '/analytics', icon: <LineChart size={18} />, label: 'Phân tích' },
    { key: '/flash-sale', icon: <Zap size={18} />, label: 'Flash Sale' },
    { key: '/ai-settings', icon: <Bot size={18} />, label: 'Trợ lý AI' },
    { key: '/settings', icon: <Settings size={18} />, label: 'Cài đặt Shop' },
  ];

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center justify-center gap-3 border-b border-gray-100 px-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
             style={{ background: 'linear-gradient(135deg, #CA8A04, #854d0e)', boxShadow: '0 4px 14px rgba(202, 138, 4, 0.4)' }}>
          <Store size={18} strokeWidth={2.5} />
        </div>
        {!collapsed && <span className="font-bold text-lg text-gray-800 truncate" style={{ fontFamily: "'Bodoni Moda', serif", letterSpacing: '-0.5px' }}>Omni Vendor</span>}
      </div>
      <div className="py-4">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key);
            setDrawerVisible(false);
          }}
          className="border-none"
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
          width={250}
          theme="light"
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
          styles={{ body: { padding: 0 } }}
          width={250}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout>
        <Header className="flex items-center justify-between px-6 bg-white shadow-sm">
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
                  { key: 'profile', icon: <User size={16} />, label: 'Hồ sơ cửa hàng' },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogOut size={16} />, label: 'Đăng xuất', danger: true },
                ],
                onClick: ({ key }) => {
                  if (key === 'profile') {
                    navigate('/settings');
                  } else if (key === 'logout') {
                    logout();
                    navigate('/login');
                  }
                }
              }} 
              placement="bottomRight"
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.fullName || 'Vendor'}</span>
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
