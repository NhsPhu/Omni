import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Spin, Row, Col, Typography, Divider, Select, Upload } from 'antd';
import { Store, MapPin, Building, CreditCard, Save, UploadCloud } from 'lucide-react';
import api from '../../lib/axios';

const { Title, Text } = Typography;
const { Option } = Select;

interface ShopSettingsFormData {
  name: string;
  description: string;
  address: string;
  pickupAddress: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  warehouseProvinceId: number;
  warehouseDistrictId: number;
  warehouseProvinceId: number;
  warehouseDistrictId: number;
  warehouseWardCode: string;
  ghnShopId: string;
  logoUrl: string;
  bannerUrl: string;
}

export default function ShopSettings() {
  const [form] = Form.useForm<ShopSettingsFormData>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    fetchShopData();
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const res = await api.get('/public/ghn/provinces');
      setProvinces(res.data);
    } catch (error) {
      console.error('Failed to load provinces:', error);
    }
  };

  const fetchDistricts = async (provinceId: number) => {
    try {
      const res = await api.get(`/public/ghn/districts?provinceId=${provinceId}`);
      setDistricts(res.data);
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  };

  const fetchWards = async (districtId: number) => {
    try {
      const res = await api.get(`/public/ghn/wards?districtId=${districtId}`);
      setWards(res.data);
    } catch (error) {
      console.error('Failed to load wards:', error);
    }
  };

  const fetchShopData = async () => {
    try {
      const res = await api.get('/shops/me');
      form.setFieldsValue(res.data);
      if (res.data.warehouseProvinceId) {
        fetchDistricts(res.data.warehouseProvinceId);
      }
      if (res.data.warehouseDistrictId) {
        fetchWards(res.data.warehouseDistrictId);
      }
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

  const handleUpload = async (options: any, fieldName: 'logoUrl' | 'bannerUrl') => {
    const { onSuccess, onError, file } = options;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      form.setFieldValue(fieldName, res.data.url);
      message.success("Tải ảnh lên thành công!");
      onSuccess("ok");
    } catch (err) {
      onError(err);
      message.error("Tải ảnh lên thất bại");
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
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight m-0">Cài đặt Cửa hàng</h1>
          <p className="text-gray-500 mt-1 font-medium">Quản lý thông tin hồ sơ và địa chỉ của cửa hàng.</p>
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
            <Card className="border-0 rounded-3xl shadow-sm" title={<span className="font-bold text-gray-800 text-lg"><Store className="inline-block w-5 h-5 mr-2 -mt-1 text-indigo-500" /> Thông tin chung</span>} styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>
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

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="logoUrl"
                    label="Ảnh Đại diện (Logo)"
                  >
                    <Input 
                      size="large" 
                      placeholder="Nhập đường dẫn ảnh logo..." 
                      addonAfter={
                        <Upload customRequest={(options) => handleUpload(options, 'logoUrl')} showUploadList={false}>
                          <div className="cursor-pointer text-indigo-600 font-medium px-2 flex items-center"><UploadCloud className="w-4 h-4 mr-1" /> Tải lên</div>
                        </Upload>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="bannerUrl"
                    label="Ảnh Bìa (Banner)"
                  >
                    <Input 
                      size="large" 
                      placeholder="Nhập đường dẫn ảnh bìa..." 
                      addonAfter={
                        <Upload customRequest={(options) => handleUpload(options, 'bannerUrl')} showUploadList={false}>
                          <div className="cursor-pointer text-indigo-600 font-medium px-2 flex items-center"><UploadCloud className="w-4 h-4 mr-1" /> Tải lên</div>
                        </Upload>
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card className="border-0 rounded-3xl shadow-sm mt-6" title={<span className="font-bold text-gray-800 text-lg"><MapPin className="inline-block w-5 h-5 mr-2 -mt-1 text-indigo-500" /> Địa chỉ</span>} styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>
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
                extra="Địa chỉ chi tiết để shipper đến lấy hàng khi có đơn mới."
              >
                <Input size="large" placeholder="Nhập số nhà, tên đường..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="warehouseProvinceId" label="Tỉnh/Thành phố" rules={[{ required: true, message: 'Chọn Tỉnh/Thành!' }]}>
                    <Select 
                      size="large" 
                      placeholder="Chọn Tỉnh/Thành" 
                      onChange={(val) => {
                        form.setFieldsValue({ warehouseDistrictId: undefined, warehouseWardCode: undefined });
                        setDistricts([]);
                        setWards([]);
                        fetchDistricts(val);
                      }}
                    >
                      {provinces.map(p => <Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="warehouseDistrictId" label="Quận/Huyện" rules={[{ required: true, message: 'Chọn Quận/Huyện!' }]}>
                    <Select 
                      size="large" 
                      placeholder="Chọn Quận/Huyện"
                      disabled={!form.getFieldValue('warehouseProvinceId')}
                      onChange={(val) => {
                        form.setFieldsValue({ warehouseWardCode: undefined });
                        setWards([]);
                        fetchWards(val);
                      }}
                    >
                      {districts.map(d => <Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="warehouseWardCode" label="Phường/Xã" rules={[{ required: true, message: 'Chọn Phường/Xã!' }]}>
                    <Select 
                      size="large" 
                      placeholder="Chọn Phường/Xã"
                      disabled={!form.getFieldValue('warehouseDistrictId')}
                    >
                      {wards.map(w => <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="ghnShopId" label="Mã Cửa hàng GHN (GHN Shop ID)" className="mt-4" extra="Cần thiết lập mã này để đẩy đơn hàng tự động sang Giao Hàng Nhanh. Truy cập khachhang.ghn.vn để lấy.">
                <Input size="large" placeholder="VD: 1234567" />
              </Form.Item>
              <Text type="warning" className="block mt-2">
                * Thiết lập địa chỉ kho để tính toán phí giao hàng chính xác qua GHN.
              </Text>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="border-0 rounded-3xl shadow-sm" title={<span className="font-bold text-gray-800 text-lg"><CreditCard className="inline-block w-5 h-5 mr-2 -mt-1 text-indigo-500" /> Thông tin Thanh toán</span>} styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>
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
          <Button size="large" onClick={() => form.resetFields()} className="rounded-xl">
            Hủy thay đổi
          </Button>
          <Button type="primary" htmlType="submit" size="large" loading={saving} icon={<Save className="w-4 h-4" />} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md">
            Lưu Cài đặt
          </Button>
        </div>
      </Form>
    </div>
  );
}
