import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Spin, Row, Col, Typography, Divider } from 'antd';
import { Store, MapPin, Building, CreditCard, Save } from 'lucide-react';
import api from '../../lib/axios';

const { Title, Text } = Typography;

interface ShopSettingsFormData {
  name: string;
  description: string;
  address: string;
  pickupAddress: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
}

export default function ShopSettings() {
  const [form] = Form.useForm<ShopSettingsFormData>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const res = await api.get('/shops/me');
      form.setFieldsValue(res.data);
    } catch (error) {
      console.error('Failed to load shop settings:', error);
      message.error('Không thể tải thông tin cửa hàng.');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: ShopSettingsFormData) => {
    setSaving(true);
    try {
      await api.put('/shops/me', values);
      message.success('Cập nhật thông tin cửa hàng thành công!');
    } catch (error) {
      console.error('Failed to update shop:', error);
      message.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!m-0">Cài đặt Cửa hàng</Title>
          <Text type="secondary">Quản lý thông tin hồ sơ và địa chỉ của cửa hàng</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title={<><Store className="inline-block w-5 h-5 mr-2 -mt-1" /> Thông tin chung</>}>
              <Form.Item
                name="name"
                label="Tên cửa hàng"
                rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng!' }]}
              >
                <Input size="large" placeholder="Nhập tên cửa hàng của bạn" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả cửa hàng"
              >
                <Input.TextArea rows={4} placeholder="Giới thiệu ngắn gọn về cửa hàng và sản phẩm..." />
              </Form.Item>
            </Card>

            <Card title={<><MapPin className="inline-block w-5 h-5 mr-2 -mt-1" /> Địa chỉ</>} className="mt-6">
              <Form.Item
                name="address"
                label="Địa chỉ kinh doanh"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ kinh doanh!' }]}
              >
                <Input size="large" placeholder="Địa chỉ hiển thị trên hồ sơ cửa hàng" />
              </Form.Item>

              <Form.Item
                name="pickupAddress"
                label="Địa chỉ lấy hàng"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ lấy hàng!' }]}
                extra="Địa chỉ để shipper đến lấy hàng khi có đơn mới."
              >
                <Input size="large" placeholder="Nhập địa chỉ lấy hàng" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title={<><CreditCard className="inline-block w-5 h-5 mr-2 -mt-1" /> Thông tin Thanh toán</>}>
              <Text type="secondary" className="block mb-4">
                Thông tin tài khoản ngân hàng để nhận thanh toán doanh thu từ hệ thống.
              </Text>
              
              <Form.Item
                name="bankName"
                label="Tên Ngân hàng"
                rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng!' }]}
              >
                <Input size="large" placeholder="VD: Vietcombank" />
              </Form.Item>

              <Form.Item
                name="bankAccountNumber"
                label="Số tài khoản"
                rules={[{ required: true, message: 'Vui lòng nhập số tài khoản!' }]}
              >
                <Input size="large" placeholder="Nhập số tài khoản" />
              </Form.Item>

              <Form.Item
                name="bankAccountName"
                label="Tên chủ tài khoản"
                rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản!' }]}
              >
                <Input size="large" placeholder="NGUYEN VAN A" />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Divider />

        <div className="flex justify-end gap-4">
          <Button size="large" onClick={() => form.resetFields()}>
            Hủy thay đổi
          </Button>
          <Button type="primary" htmlType="submit" size="large" loading={saving} icon={<Save className="w-4 h-4" />}>
            Lưu Cài đặt
          </Button>
        </div>
      </Form>
    </div>
  );
}
