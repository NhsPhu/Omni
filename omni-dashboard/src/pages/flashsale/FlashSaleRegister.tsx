import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Card, Table, Button, Tag, Form, Select, InputNumber, message, Empty, Descriptions, Statistic, Row, Col } from 'antd';
import { Zap, Clock, Package, ArrowRight } from 'lucide-react';
import dayjs from 'dayjs';

export default function FlashSaleRegister() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [form] = Form.useForm();
  const [selectedProductSkus, setSelectedProductSkus] = useState<any[]>([]);

  // Fetch available events (UPCOMING or ACTIVE)
  useEffect(() => {
    api.get('/vendor/flash-sale/events').then(res => {
      const available = (res.data || []).filter((e: any) => e.status === 'UPCOMING' || e.status === 'ACTIVE');
      setEvents(available);
      if (available.length > 0) {
        setSelectedEvent(available[0]);
      }
    }).catch(() => {});
  }, []);

  // Fetch vendor's products
  useEffect(() => {
    api.get('/vendor/products?page=0&size=100').then(res => {
      const prods = res.data.content || res.data || [];
      setProducts(prods);
    }).catch(() => {});
  }, []);

  // Fetch my registrations when event changes
  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    api.get(`/vendor/flash-sale/${selectedEvent.id}/my-items`)
      .then(res => setMyItems((res.data || []).map((i: any) => ({ ...i, key: i.id }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  const handleProductChange = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    if (product) {
      // Fetch SKUs for this product
      api.get(`/products/${productId}`).then(res => {
        setSelectedProductSkus(res.data.skus || []);
        form.setFieldsValue({ skuId: undefined, flashPrice: undefined, flashStock: undefined });
      }).catch(() => {});
    }
  };

  const handleSkuChange = (skuId: string) => {
    const sku = selectedProductSkus.find((s: any) => s.id === skuId);
    if (sku) {
      form.setFieldsValue({ flashPrice: Math.round(sku.price * 0.8), discountPercent: 20 }); // suggest 20% discount
    }
  };

  const onValuesChange = (changedValues: any, allValues: any) => {
    const sku = selectedProductSkus.find((s: any) => s.id === allValues.skuId);
    if (!sku) return;

    if (changedValues.discountPercent !== undefined) {
      const newPrice = Math.round(sku.price * (1 - changedValues.discountPercent / 100));
      form.setFieldsValue({ flashPrice: newPrice });
    } else if (changedValues.flashPrice !== undefined) {
      const newDiscount = Math.round((1 - changedValues.flashPrice / sku.price) * 100);
      form.setFieldsValue({ discountPercent: newDiscount });
    }
  };

  const handleRegister = async (values: any) => {
    if (!selectedEvent) return;
    setRegistering(true);
    try {
      await api.post(`/vendor/flash-sale/${selectedEvent.id}/register`, {
        productId: values.productId,
        skuId: values.skuId,
        flashPrice: values.flashPrice,
        flashStock: values.flashStock,
      });
      message.success('Đăng ký thành công! Chờ Admin duyệt.');
      form.resetFields();
      // Refresh my items
      const res = await api.get(`/vendor/flash-sale/${selectedEvent.id}/my-items`);
      setMyItems((res.data || []).map((i: any) => ({ ...i, key: i.id })));
    } catch (err: any) {
      message.error(err.response?.data?.message || err.response?.data || 'Lỗi đăng ký');
    } finally {
      setRegistering(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const statusColor: Record<string, string> = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'error' };
  const statusLabel: Record<string, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' };

  const myColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          {r.productImage ? (
            <img 
              src={r.productImage.startsWith('http') ? r.productImage : `http://localhost:8080${r.productImage}`} 
              className="rounded object-cover" 
              style={{ width: '40px', height: '40px', minWidth: '40px' }} 
              alt={r.productName}
            />
          ) : (
            <div className="rounded bg-orange-100 flex items-center justify-center" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
              <Zap size={14} className="text-orange-500" />
            </div>
          )}
          <div>
            <div className="font-medium text-sm">{r.productName}</div>
            <div className="text-xs text-gray-400">SKU: {r.skuCode}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Giá gốc → Flash',
      key: 'price',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-2">
          <span className="line-through text-gray-400 text-sm">{formatCurrency(r.originalPrice)}</span>
          <ArrowRight size={12} className="text-gray-300" />
          <span className="font-bold text-red-600">{formatCurrency(r.flashPrice)}</span>
          <Tag color="red">-{Math.round((1 - r.flashPrice / r.originalPrice) * 100)}%</Tag>
        </div>
      )
    },
    { title: 'Số lượng FS', dataIndex: 'flashStock', key: 'flashStock' },
    { title: 'Đã bán', dataIndex: 'soldCount', key: 'soldCount' },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, r: any) => <Tag color={statusColor[r.status]}>{statusLabel[r.status]}</Tag>
    },
  ];

  if (events.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in pb-8">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500 tracking-tight m-0">⚡ Flash Sale</h1>
          <p className="text-gray-500 mt-1">Đăng ký sản phẩm vào Flash Sale</p>
        </div>
        <Card className="border-0 rounded-3xl shadow-sm text-center py-12">
          <Empty description="Hiện không có chương trình Flash Sale nào đang mở đăng ký" />
        </Card>
      </div>
    );
  }

  // Countdown
  const now = dayjs();
  const end = dayjs(selectedEvent?.endTime);
  const start = dayjs(selectedEvent?.startTime);
  const isActive = selectedEvent?.status === 'ACTIVE';
  const targetTime = isActive ? end : start;
  const diff = targetTime.diff(now, 'second');
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500 tracking-tight m-0">⚡ Flash Sale</h1>
        <p className="text-gray-500 mt-1">Đăng ký sản phẩm vào Flash Sale</p>
      </div>

      {/* Event Info Banner */}
      {selectedEvent && (
        <Card className="border-0 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}>
          <div className="text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={24} className="text-yellow-300 fill-yellow-300" />
                  <h2 className="text-2xl font-bold m-0">{selectedEvent.title}</h2>
                  <Tag color={isActive ? 'green' : 'blue'}>{isActive ? 'Đang diễn ra' : 'Sắp diễn ra'}</Tag>
                </div>
                <div className="flex items-center gap-4 text-red-100 text-sm">
                  <span><Clock size={14} className="inline mr-1" /> {start.format('DD/MM HH:mm')} → {end.format('DD/MM HH:mm')}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-red-200 text-xs mb-1">{isActive ? 'Kết thúc sau' : 'Bắt đầu sau'}</div>
                <div className="flex gap-2">
                  <div className="bg-black/30 rounded-xl px-4 py-2">
                    <span className="text-2xl font-bold">{hours}</span>
                    <span className="text-xs block text-red-200">giờ</span>
                  </div>
                  <div className="bg-black/30 rounded-xl px-4 py-2">
                    <span className="text-2xl font-bold">{minutes}</span>
                    <span className="text-xs block text-red-200">phút</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Row gutter={24}>
        {/* Register Form */}
        <Col xs={24} lg={10}>
          <Card title={<span className="flex items-center gap-2"><Package size={18} /> Đăng ký sản phẩm</span>} className="border-0 rounded-3xl shadow-sm">
            <Form form={form} layout="vertical" onFinish={handleRegister} onValuesChange={onValuesChange}>
              <Form.Item name="productId" label="Chọn sản phẩm" rules={[{ required: true }]}>
                <Select
                  size="large"
                  placeholder="Chọn sản phẩm..."
                  showSearch
                  optionFilterProp="label"
                  onChange={handleProductChange}
                  options={products.map((p: any) => ({ value: p.id, label: p.name }))}
                />
              </Form.Item>

              <Form.Item name="skuId" label="Chọn SKU (phiên bản)" rules={[{ required: true }]}>
                <Select
                  size="large"
                  placeholder="Chọn SKU..."
                  onChange={handleSkuChange}
                  options={selectedProductSkus.map((s: any) => ({
                    value: s.id,
                    label: `${s.skuCode} — ${formatCurrency(s.price)} (Kho: ${s.stockQuantity})`
                  }))}
                />
              </Form.Item>

              <div className="flex gap-4">
                <Form.Item name="discountPercent" label="% Giảm giá" rules={[{ required: true }]} className="w-1/3">
                  <InputNumber size="large" className="w-full" min={1} max={99} addonAfter="%" />
                </Form.Item>

                <Form.Item name="flashPrice" label="Giá Flash Sale (₫)" rules={[{ required: true }]} className="flex-1">
                  <InputNumber size="large" className="w-full" min={1000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              </div>

              <Form.Item name="flashStock" label="Số lượng Flash Sale" rules={[{ required: true }]}>
                <InputNumber size="large" className="w-full" min={1} />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large" loading={registering} className="w-full bg-red-600 hover:bg-red-700 rounded-xl" icon={<Zap size={16} />}>
                Đăng ký vào Flash Sale
              </Button>
            </Form>
          </Card>
        </Col>

        {/* My Registrations */}
        <Col xs={24} lg={14}>
          <Card title="Sản phẩm đã đăng ký" className="border-0 rounded-3xl shadow-sm">
            <Table
              columns={myColumns}
              dataSource={myItems}
              loading={loading}
              pagination={false}
              size="middle"
              locale={{ emptyText: <Empty description="Chưa đăng ký sản phẩm nào" /> }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
