import React, { useState, useEffect } from 'react';
import { Card, Steps, Form, Input, InputNumber, Button, Select, Upload, Switch, Table, Space, message, Row, Col } from 'antd';
import { InboxOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

export default function ProductForm() {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [skus, setSkus] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { shopId } = useAuthStore();

  useEffect(() => {
    api.get('/categories').then(res => {
      setCategories(res.data);
    }).catch(e => console.error(e));

    if (id) {
      api.get(`/products/${id}`).then(res => {
        const p = res.data;
        form.setFieldsValue({
          name: p.name,
          categoryId: p.categoryId,
          description: p.description,
        });
        if (p.skus && p.skus.length > 0) {
          const hasAttributes = p.skus[0].attributes && Object.keys(p.skus[0].attributes).length > 0;
          if (hasAttributes) {
            setSkus(p.skus);
          } else {
            form.setFieldsValue({
              price: p.skus[0].price,
              stock: p.skus[0].stockQuantity,
              sku: p.skus[0].skuCode
            });
            setSkus([]);
          }
        }
      }).catch(e => console.error(e));
    }
  }, [id, form]);
  
  // Fake SKU generation for demo
  const generateSkus = (colors: string[], storages: string[]) => {
    const newSkus: any[] = [];
    if (colors?.length && storages?.length) {
      colors.forEach(c => {
        storages.forEach(s => {
          newSkus.push({ 
            key: `${c}-${s}`, 
            attributes: { color: c, storage: s }, 
            price: 0, 
            stockQuantity: 0, 
            skuCode: '' 
          });
        });
      });
    }
    setSkus(newSkus);
  };

  const skuColumns = [
    { title: 'Màu sắc', dataIndex: 'attributes', key: 'color', render: (attrs: any) => attrs.color },
    { title: 'Dung lượng', dataIndex: 'attributes', key: 'storage', render: (attrs: any) => attrs.storage },
    { 
      title: 'Giá bán', 
      dataIndex: 'price', 
      key: 'price',
      render: (_: any, record: any, index: number) => (
        <InputNumber 
          min={0} 
          defaultValue={0} 
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
          style={{ width: 120 }} 
          onChange={(val) => {
            const newSkus = [...skus];
            newSkus[index].price = val || 0;
            setSkus(newSkus);
          }}
        />
      )
    },
    { 
      title: 'Kho', 
      dataIndex: 'stockQuantity', 
      key: 'stockQuantity',
      render: (_: any, record: any, index: number) => (
        <InputNumber 
          min={0} 
          defaultValue={0} 
          onChange={(val) => {
            const newSkus = [...skus];
            newSkus[index].stockQuantity = val || 0;
            setSkus(newSkus);
          }}
        />
      )
    },
    { 
      title: 'Mã SKU', 
      dataIndex: 'skuCode', 
      key: 'skuCode',
      render: (_: any, record: any, index: number) => (
        <Input 
          placeholder="Tùy chọn" 
          onChange={(e) => {
            const newSkus = [...skus];
            newSkus[index].skuCode = e.target.value;
            setSkus(newSkus);
          }}
        />
      )
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
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                <Select size="large" placeholder="Chọn danh mục">
                  {categories.map((c: any) => (
                    <Option key={c.id} value={c.id}>{c.name}</Option>
                  ))}
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

  const handlePublish = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        shopId,
        categoryId: values.categoryId,
        name: values.name,
        slug: values.name.toLowerCase().replace(/ /g, '-'),
        description: values.description,
        status: 'ACTIVE',
        skus: skus.length > 0 ? skus.map(s => ({
          skuCode: s.skuCode || '',
          price: s.price,
          stockQuantity: s.stockQuantity,
          attributes: s.attributes
        })) : [{
          skuCode: values.sku || '',
          price: values.price || 0,
          stockQuantity: values.stock || 0,
          attributes: {}
        }],
        images: []
      };

      if (id) {
        await api.put(`/vendor/products/${id}`, payload);
        message.success('Đã cập nhật sản phẩm!');
      } else {
        await api.post('/vendor/products', payload);
        message.success('Đã xuất bản sản phẩm!');
      }
      navigate('/products');
    } catch (e: any) {
      console.error(e);
      if (e.errorFields) {
        message.error('Vui lòng điền đầy đủ thông tin');
      } else {
        message.error('Lỗi khi xuất bản sản phẩm');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeft size={18} />} type="text" onClick={() => navigate('/products')} />
          <h1 className="text-xl font-bold text-gray-800 m-0">{id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<Save size={16} />}>Lưu nháp</Button>
          <Button icon={<Eye size={16} />}>Xem trước</Button>
          <Button type="primary" onClick={handlePublish} loading={loading}>Xuất bản</Button>
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
          {current === steps.length - 1 && <Button type="primary" onClick={handlePublish} loading={loading}>Hoàn thành</Button>}
        </div>
      </Card>
    </div>
  );
}
