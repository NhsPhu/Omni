import React, { useState } from 'react';
import { Card, Steps, Form, Input, InputNumber, Button, Select, Upload, Switch, Table, Space, message, Row, Col } from 'antd';
import { InboxOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

export default function ProductForm() {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [skus, setSkus] = useState<any[]>([]);
  
  // Fake SKU generation for demo
  const generateSkus = (colors: string[], storages: string[]) => {
    const newSkus: any[] = [];
    if (colors?.length && storages?.length) {
      colors.forEach(c => {
        storages.forEach(s => {
          newSkus.push({ key: `${c}-${s}`, color: c, storage: s, price: 0, stock: 0, sku: '' });
        });
      });
    }
    setSkus(newSkus);
  };

  const skuColumns = [
    { title: 'Màu sắc', dataIndex: 'color', key: 'color' },
    { title: 'Dung lượng', dataIndex: 'storage', key: 'storage' },
    { 
      title: 'Giá bán', 
      dataIndex: 'price', 
      key: 'price',
      render: (_: any, record: any) => <InputNumber min={0} defaultValue={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} style={{ width: 120 }} />
    },
    { 
      title: 'Kho', 
      dataIndex: 'stock', 
      key: 'stock',
      render: (_: any, record: any) => <InputNumber min={0} defaultValue={0} />
    },
    { 
      title: 'Mã SKU', 
      dataIndex: 'sku', 
      key: 'sku',
      render: (_: any, record: any) => <Input placeholder="Tùy chọn" />
    },
  ];

  const steps = [
    {
      title: 'Thông tin cơ bản',
      content: (
        <div className="max-w-2xl mt-8">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên SP' }]}>
            <Input size="large" placeholder="Ví dụ: iPhone 15 Pro Max 256GB" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                <Select size="large" placeholder="Chọn danh mục">
                  <Option value="dienthoai">Điện thoại di động</Option>
                  <Option value="laptop">Laptop</Option>
                  <Option value="tainghe">Tai nghe</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="brand" label="Thương hiệu">
                <Select size="large" placeholder="Chọn thương hiệu">
                  <Option value="apple">Apple</Option>
                  <Option value="samsung">Samsung</Option>
                  <Option value="sony">Sony</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
            <TextArea rows={6} placeholder="Nhập mô tả chi tiết sản phẩm của bạn..." />
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Hình ảnh',
      content: (
        <div className="max-w-2xl mt-8">
          <Form.Item label="Hình ảnh sản phẩm (Tối đa 9 ảnh)">
            <Dragger multiple listType="picture" maxCount={9} action="/upload">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Kéo thả hoặc nhấp để tải ảnh lên</p>
              <p className="ant-upload-hint">Hỗ trợ JPG, PNG, WEBP. Kích thước tối đa 5MB/ảnh.</p>
            </Dragger>
          </Form.Item>
          <Form.Item label="Video sản phẩm (Tùy chọn)">
            <Input placeholder="Nhập URL video YouTube hoặc Tiktok" />
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Phân loại & Giá',
      content: (
        <div className="mt-8">
          <Card className="mb-6" title="Thuộc tính sản phẩm">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="colors" label="Màu sắc">
                  <Select mode="tags" placeholder="Nhập màu và nhấn Enter" onChange={(val) => generateSkus(val, form.getFieldValue('storages') || [])} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="storages" label="Dung lượng / Kích thước">
                  <Select mode="tags" placeholder="Nhập dung lượng và nhấn Enter" onChange={(val) => generateSkus(form.getFieldValue('colors') || [], val)} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {skus.length > 0 ? (
            <Card title="Danh sách phân loại (SKUs)">
              <div className="mb-4 text-gray-500 text-sm">Thiết lập giá và tồn kho cho từng biến thể</div>
              <Table 
                dataSource={skus} 
                columns={skuColumns} 
                pagination={false}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-gray-50"
              />
            </Card>
          ) : (
            <Card title="Giá & Kho (Sản phẩm không có phân loại)">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}>
                    <InputNumber size="large" className="w-full" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} suffix="₫" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="stock" label="Tồn kho" rules={[{ required: true }]}>
                    <InputNumber size="large" className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="sku" label="Mã SKU (Tùy chọn)">
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}
        </div>
      ),
    },
  ];

  const next = () => {
    form.validateFields().then(() => {
      setCurrent(current + 1);
    });
  };

  const prev = () => setCurrent(current - 1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeft size={18} />} type="text" onClick={() => navigate('/products')} />
          <h1 className="text-xl font-bold text-gray-800 m-0">Thêm sản phẩm mới</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<Save size={16} />}>Lưu nháp</Button>
          <Button icon={<Eye size={16} />}>Xem trước</Button>
          <Button type="primary" onClick={() => message.success('Đã xuất bản sản phẩm!')}>Xuất bản</Button>
        </div>
      </div>

      <Card className="card-shadow border-none rounded-xl">
        <Steps current={current} items={steps.map(item => ({ key: item.title, title: item.title }))} className="max-w-2xl mx-auto mb-8" />
        
        <Form form={form} layout="vertical" className="min-h-[400px]">
          {steps[current].content}
        </Form>
        
        <div className="mt-8 flex justify-end gap-2 border-t pt-6">
          {current > 0 && <Button onClick={prev}>Quay lại</Button>}
          {current < steps.length - 1 && <Button type="primary" onClick={next}>Tiếp theo</Button>}
          {current === steps.length - 1 && <Button type="primary" onClick={() => message.success('Hoàn thành!')}>Hoàn thành</Button>}
        </div>
      </Card>
    </div>
  );
}
