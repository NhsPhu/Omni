import React, { useState, useEffect } from 'react';
import { Card, Steps, Form, Input, InputNumber, Button, Select, Upload, Switch, Table, Space, message, Row, Col, TreeSelect } from 'antd';
import { UploadOutlined, InboxOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
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
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [bulkStock, setBulkStock] = useState<number>(0);
  const [fileList, setFileList] = useState<any[]>([]);
  const { shopId, token } = useAuthStore();

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
          videoUrl: p.videoUrl,
          specsList: p.specs ? Object.entries(p.specs).map(([name, value]) => ({ name, value })) : [],
        });
        if (p.skus && p.skus.length > 0) {
          const hasAttributes = p.skus[0].attributes && Object.keys(p.skus[0].attributes).length > 0;
          if (hasAttributes) {
            setSkus(p.skus);
          } else {
            form.setFieldsValue({
              originalPrice: p.skus[0].originalPrice,
              price: p.skus[0].price,
              stock: p.skus[0].stockQuantity,
              sku: p.skus[0].skuCode
            });
            setSkus([]);
          }
        }
        if (p.images && p.images.length > 0) {
          setFileList(p.images.map((img: any, idx: number) => ({
            uid: `-${idx}`,
            name: `image-${idx}.jpg`,
            status: 'done',
            url: `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'}${img.imageUrl}` // Storefront/Backend prefix if needed, or just img.imageUrl if it's absolute
          })));
        }
      }).catch(e => console.error(e));
    }
  }, [id, form]);

  const transformCategoriesToTree = (cats: any[]): any[] => {
    return cats.map(c => ({
      title: c.name,
      value: c.id,
      key: c.id,
      children: c.children && c.children.length > 0 ? transformCategoriesToTree(c.children) : undefined
    }));
  };
  
  const generateSkus = (colors: string[], storages: string[]) => {
    const basePrice = form.getFieldValue('price') || 0;
    const baseOriginalPrice = form.getFieldValue('originalPrice') || 0;
    const generateRandomSku = () => `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Instead of completely overwriting, we should try to preserve existing data for matched keys
    const existingSkusMap = new Map(skus.map(s => [s.key, s]));
    
    const newSkus: any[] = [];
    if (colors?.length && storages?.length) {
      colors.forEach(c => {
        storages.forEach(s => {
          const key = `${c}-${s}`;
          newSkus.push(existingSkusMap.get(key) || { 
            key, 
            attributes: { color: c, storage: s }, 
            originalPrice: baseOriginalPrice,
            price: basePrice, 
            stockQuantity: 0, 
            skuCode: generateRandomSku() 
          });
        });
      });
    } else if (colors?.length) {
      colors.forEach(c => {
        newSkus.push(existingSkusMap.get(c) || { key: c, attributes: { color: c }, originalPrice: baseOriginalPrice, price: basePrice, stockQuantity: 0, skuCode: generateRandomSku() });
      });
    } else if (storages?.length) {
      storages.forEach(s => {
        newSkus.push(existingSkusMap.get(s) || { key: s, attributes: { storage: s }, originalPrice: baseOriginalPrice, price: basePrice, stockQuantity: 0, skuCode: generateRandomSku() });
      });
    }
    setSkus(newSkus);
  };
  
  const applyBulkSettings = () => {
    if (!skus.length) return;
    const updatedSkus = skus.map(s => ({
      ...s,
      price: bulkPrice > 0 ? bulkPrice : s.price,
      stockQuantity: bulkStock > 0 ? bulkStock : s.stockQuantity
    }));
    setSkus(updatedSkus);
    message.success('Đã áp dụng hàng loạt!');
  };

  const skuColumns = [
    { title: 'Màu sắc', dataIndex: 'attributes', key: 'color', render: (attrs: any) => attrs.color },
    { title: 'Dung lượng', dataIndex: 'attributes', key: 'storage', render: (attrs: any) => attrs.storage },
    { 
      title: 'Giá gốc', 
      dataIndex: 'originalPrice', 
      key: 'originalPrice',
      render: (_: any, record: any, index: number) => (
        <InputNumber 
          min={0} 
          value={record.originalPrice} 
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
          style={{ width: 120 }} 
          onChange={(val) => {
            const newSkus = [...skus];
            newSkus[index].originalPrice = val || 0;
            setSkus(newSkus);
          }}
        />
      )
    },
    { 
      title: 'Giá bán', 
      dataIndex: 'price', 
      key: 'price',
      render: (_: any, record: any, index: number) => (
        <InputNumber 
          min={0} 
          value={record.price} 
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
          value={record.stockQuantity} 
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
          placeholder="VD: SP-TRANG (Mã nội bộ để quản lý kho)" 
          value={record.skuCode}
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
                <TreeSelect 
                  size="large" 
                  placeholder="Chọn danh mục" 
                  treeData={transformCategoriesToTree(categories)}
                  treeDefaultExpandAll
                />
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

          <Card title="Thông số kỹ thuật" size="small" className="mb-6 border border-gray-200">
            <Form.List name="specsList">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={16} align="middle" className="mb-4">
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          rules={[{ required: true, message: 'Nhập tên thông số' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Tên thông số (VD: Chip, RAM)" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          rules={[{ required: true, message: 'Nhập giá trị' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Giá trị (VD: Snapdragon 8 Gen 2)" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <MinusCircleOutlined className="text-red-500 hover:text-red-700 cursor-pointer" onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm thông số kỹ thuật
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>
        </div>
      ),
    },
    {
      title: 'Hình ảnh',
      content: (
        <div className="max-w-2xl mt-8">
          <Form.Item label="Hình ảnh sản phẩm (Tối đa 9 ảnh)">
            <Dragger 
              multiple 
              listType="picture" 
              maxCount={9} 
              action={`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/upload`}
              headers={{ Authorization: `Bearer ${token}` }}
              fileList={fileList}
              onChange={(info) => {
                setFileList(info.fileList);
                if (info.file.status === 'done') {
                  message.success(`${info.file.name} tải lên thành công.`);
                } else if (info.file.status === 'error') {
                  message.error(`${info.file.name} tải lên thất bại.`);
                }
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Kéo thả hoặc nhấp để tải ảnh lên</p>
              <p className="ant-upload-hint">Hỗ trợ JPG, PNG, WEBP. Kích thước tối đa 5MB/ảnh.</p>
            </Dragger>
          </Form.Item>
          <Form.Item label="Video sản phẩm (Tùy chọn)" extra="Giới hạn thời lượng: Tối đa 5 phút" style={{ marginBottom: 0 }}>
            <Form.Item name="videoUrl" style={{ marginBottom: '8px' }}>
              <Input placeholder="Nhập URL video YouTube hoặc Tiktok" />
            </Form.Item>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gray-400">hoặc</span>
              <Upload 
                action={`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/upload`}
                headers={{ Authorization: `Bearer ${token}` }}
                accept="video/*"
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => {
                  return new Promise((resolve, reject) => {
                    const video = document.createElement('video');
                    video.preload = 'metadata';
                    video.onloadedmetadata = () => {
                      window.URL.revokeObjectURL(video.src);
                      if (video.duration > 300) {
                        message.error('Video không được vượt quá 5 phút!');
                        reject(Upload.LIST_IGNORE);
                      } else {
                        resolve(file);
                      }
                    };
                    video.onerror = () => {
                      message.error('File video không hợp lệ!');
                      reject(Upload.LIST_IGNORE);
                    };
                    video.src = window.URL.createObjectURL(file);
                  });
                }}
                onChange={(info) => {
                   if (info.file.status === 'done') {
                     const url = info.file.response?.url;
                     if (url) form.setFieldsValue({ videoUrl: url.startsWith('http') ? url : `http://localhost:8080${url}` });
                     message.success('Tải video lên thành công');
                   } else if (info.file.status === 'error') {
                     message.error('Tải video thất bại');
                   }
                }}
              >
                <Button icon={<UploadOutlined />}>Tải video từ máy</Button>
              </Upload>
            </div>
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
              <div className="mb-4 flex flex-col md:flex-row gap-4 p-4 bg-indigo-50 rounded-xl items-end border border-indigo-100">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1 font-medium">Áp dụng chung (Giá bán)</div>
                  <InputNumber 
                    size="large" 
                    className="w-full" 
                    placeholder="VD: 300,000"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                    suffix="₫" 
                    value={bulkPrice}
                    onChange={(val) => setBulkPrice(val as number)}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1 font-medium">Áp dụng chung (Tồn kho)</div>
                  <InputNumber 
                    size="large" 
                    className="w-full" 
                    placeholder="VD: 100"
                    value={bulkStock}
                    onChange={(val) => setBulkStock(val as number)}
                  />
                </div>
                <Button type="primary" size="large" onClick={applyBulkSettings} className="bg-indigo-600 hover:bg-indigo-700">
                  Cập nhật hàng loạt
                </Button>
              </div>
              
              <div className="mb-4 text-gray-500 text-sm">Hoặc thiết lập giá và tồn kho cho từng biến thể bên dưới:</div>
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
                <Col span={6}>
                  <Form.Item name="originalPrice" label="Giá gốc (Tùy chọn)">
                    <InputNumber size="large" className="w-full" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} suffix="₫" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}>
                    <InputNumber size="large" className="w-full" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} suffix="₫" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="stock" label="Tồn kho" rules={[{ required: true }]}>
                    <InputNumber size="large" className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={6}>
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
    let fieldsToValidate: string[] = [];
    if (current === 0) fieldsToValidate = ['name', 'categoryId', 'description'];
    
    if (fieldsToValidate.length > 0) {
      form.validateFields(fieldsToValidate).then(() => {
        setCurrent(current + 1);
      }).catch(() => {});
    } else {
      setCurrent(current + 1);
    }
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
        videoUrl: values.videoUrl,
        specs: (values.specsList || []).reduce((acc: any, cur: any) => {
          if (cur && cur.name && cur.value) acc[cur.name] = cur.value;
          return acc;
        }, {}),
        status: 'ACTIVE',
        skus: skus.length > 0 ? skus.map(s => ({
          skuCode: s.skuCode || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          price: s.price,
          originalPrice: s.originalPrice,
          stockQuantity: s.stockQuantity,
          attributes: s.attributes
        })) : [{
          skuCode: values.sku || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          price: values.price || 0,
          originalPrice: values.originalPrice || null,
          stockQuantity: values.stock || 0,
          attributes: {}
        }],
        images: fileList.map((file, idx) => ({
          imageUrl: file.response?.url || file.url?.replace(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080', ''),
          isPrimary: idx === 0,
          sortOrder: idx
        })).filter(img => img.imageUrl)
      };

      if (id) {
        console.log('Update payload:', JSON.stringify(payload, null, 2));
        await api.put(`/vendor/products/${id}`, payload);
        message.success('Đã cập nhật sản phẩm!');
      } else {
        console.log('Create payload:', JSON.stringify(payload, null, 2));
        await api.post('/vendor/products', payload);
        message.success('Đã xuất bản sản phẩm!');
      }
      navigate('/products');
    } catch (e: any) {
      if (e.errorFields) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      } else {
        console.error('API Error Response:', e.response?.data || e);
        message.error(e.response?.data?.message || e.response?.data?.error || 'Có lỗi khi lưu sản phẩm! Mở F12 Console để xem chi tiết.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeft size={18} />} type="text" onClick={() => navigate('/products')} className="text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-xl w-10 h-10 flex items-center justify-center" />
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight m-0">{id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
            <p className="text-gray-600 mt-1 font-medium">Hoàn thiện thông tin để đăng bán sản phẩm.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button className="rounded-xl border-gray-200" icon={<Save size={16} />}>Lưu nháp</Button>
          <Button className="rounded-xl border-gray-200" icon={<Eye size={16} />}>Xem trước</Button>
          <Button type="primary" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md" onClick={handlePublish} loading={loading}>Xuất bản</Button>
        </div>
      </div>

      <Card className="border-0 rounded-3xl shadow-sm" styles={{ body: { padding: '32px' } }}>
        <Steps current={current} items={steps.map(item => ({ key: item.title, title: item.title }))} className="max-w-2xl mx-auto mb-8" />
        
        <Form form={form} layout="vertical" className="min-h-[400px]">
          {steps.map((step, index) => (
            <div key={step.title} style={{ display: current === index ? 'block' : 'none' }}>
              {step.content}
            </div>
          ))}
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
