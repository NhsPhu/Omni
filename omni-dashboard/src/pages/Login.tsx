import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      });
      setAuth(res.data.accessToken || res.data.token);
      message.success("Đăng nhập thành công!");
      
      // Assume getting shop for vendor
      const shopRes = await api.get('/shops/me').catch(() => null);
      if (shopRes?.data?.id) {
        useAuthStore.getState().setShopId(shopRes.data.id);
      } else {
        // Fallback for demo
        useAuthStore.getState().setShopId('11111111-1111-1111-1111-111111111111');
      }
      
      navigate('/');
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Đăng nhập thất bại. Sai tài khoản hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>Omni Dashboard</Title>
          <p style={{ color: '#666' }}>Đăng nhập quản trị viên / Nhà bán hàng</p>
        </div>
        <Form name="login" onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}> 
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}> 
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
