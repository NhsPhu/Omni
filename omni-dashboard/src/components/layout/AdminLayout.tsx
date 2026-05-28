import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Badge } from 'antd';
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
  User
} from 'lucide-react';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from './NotificationBell';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { key: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { key: '/products', icon: <Package size={18} />, label: 'Sản phẩm' },
    { key: '/orders', icon: <ClipboardList size={18} />, label: 'Đơn hàng' },
    { key: '/vouchers', icon: <Tag size={18} />, label: 'Voucher Shop' },
    { key: '/finance', icon: <Wallet size={18} />, label: 'Tài chính' },
    { key: '/reviews', icon: <MessageCircle size={18} />, label: 'Đánh giá & Hỏi đáp' },
    { key: '/analytics', icon: <LineChart size={18} />, label: 'Phân tích' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        theme="light"
      >
        <div className="h-16 flex items-center justify-center gap-2 border-b border-gray-100 px-4">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Store size={18} />
          </div>
          {!collapsed && <span className="font-bold text-lg text-gray-800 truncate">Omni Vendor</span>}
        </div>
        <div className="py-4">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            className="border-none"
          />
        </div>
      </Sider>

      <Layout>
        <Header className="flex items-center justify-between px-6 bg-white shadow-sm">
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
                  { key: 'profile', icon: <User size={16} />, label: 'Hồ sơ cửa hàng' },
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
