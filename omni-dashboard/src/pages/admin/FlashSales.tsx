import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Card, Table, Button, Tag, Space, Drawer, Form, Input, InputNumber, DatePicker, Tabs, message, Modal, Avatar, Popconfirm } from 'antd';
import { Plus, Zap, Check, X, Eye, Clock, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function FlashSales() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/flash-sale');
      setEvents(res.data.map((e: any) => ({ ...e, key: e.id })));
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi tải danh sách Flash Sale');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (values: any) => {
    try {
      await api.post('/admin/flash-sale', {
        title: values.title,
        startTime: values.dates[0].toISOString(),
        endTime: values.dates[1].toISOString(),
        maxItems: values.maxItems || 50,
      });
      message.success('Tạo Flash Sale Event thành công!');
      setCreateOpen(false);
      form.resetFields();
      fetchEvents();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi tạo event');
    }
  };

  const openDetail = async (eventId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/flash-sale/${eventId}`);
      setSelectedEvent(res.data);
    } catch (err: any) {
      message.error('Lỗi tải chi tiết');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    try {
      await api.patch(`/admin/flash-sale/items/${itemId}/approve`);
      message.success('Đã duyệt sản phẩm!');
      if (selectedEvent) openDetail(selectedEvent.id);
    } catch (err: any) {
      message.error('Lỗi duyệt');
    }
  };

  const handleReject = async (itemId: string) => {
    try {
      await api.patch(`/admin/flash-sale/items/${itemId}/reject`);
      message.success('Đã từ chối sản phẩm');
      if (selectedEvent) openDetail(selectedEvent.id);
    } catch (err: any) {
      message.error('Lỗi từ chối');
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const statusColor: Record<string, string> = {
    DRAFT: 'default',
    UPCOMING: 'processing',
    ACTIVE: 'success',
    ENDED: 'default',
  };

  const statusLabel: Record<string, string> = {
    DRAFT: 'Nháp',
    UPCOMING: 'Sắp diễn ra',
    ACTIVE: 'Đang diễn ra',
    ENDED: 'Đã kết thúc',
  };

  const eventColumns = [
    {
      title: 'Tên chiến dịch',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-orange-500" />
          <span className="font-bold">{text}</span>
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: any, r: any) => (
        <div className="text-xs">
          <div className="flex items-center gap-1"><Clock size={12} /> {dayjs(r.startTime).format('DD/MM/YYYY HH:mm')}</div>
          <div className="text-gray-400 ml-4">→ {dayjs(r.endTime).format('DD/MM/YYYY HH:mm')}</div>
        </div>
      )
    },
    {
      title: 'Sản phẩm',
      key: 'items',
      render: (_: any, r: any) => (
        <div className="text-sm">
          <span className="font-semibold text-blue-600">{r.approvedCount || 0}</span>
          <span className="text-gray-400"> / {r.registeredCount || 0} đăng ký</span>
          <span className="text-gray-300"> (tối đa {r.maxItems})</span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, r: any) => <Tag color={statusColor[r.status]}>{statusLabel[r.status] || r.status}</Tag>
    },
    {
      title: '',
      key: 'action',
      render: (_: any, r: any) => (
        <Button type="text" icon={<Eye size={16} />} onClick={() => openDetail(r.id)}>
          Chi tiết
        </Button>
      )
    },
  ];

  const itemStatusColor: Record<string, string> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  };

  const itemStatusLabel: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  };

  const itemColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          {r.productImage ? (
            <img 
              src={r.productImage.startsWith('http') ? r.productImage : `http://localhost:8080${r.productImage}`} 
              className="rounded-lg object-cover" 
              style={{ width: '48px', height: '48px', minWidth: '48px' }} 
              alt={r.productName}
            />
          ) : (
            <div className="rounded-lg bg-gray-100 flex items-center justify-center" style={{ width: '48px', height: '48px', minWidth: '48px' }}>
              <Zap size={16} className="text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium text-sm">{r.productName}</div>
            <div className="text-xs text-gray-400">{r.shopName} · SKU: {r.skuCode}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Giá gốc',
      key: 'originalPrice',
      render: (_: any, r: any) => <span className="text-gray-500 line-through text-sm">{formatCurrency(r.originalPrice)}</span>
    },
    {
      title: 'Giá Flash Sale',
      key: 'flashPrice',
      render: (_: any, r: any) => {
        const discount = Math.round((1 - r.flashPrice / r.originalPrice) * 100);
        return (
          <div>
            <span className="font-bold text-red-600">{formatCurrency(r.flashPrice)}</span>
            <Tag color="red" className="ml-2">-{discount}%</Tag>
          </div>
        );
      }
    },
    {
      title: 'Tồn kho FS',
      key: 'stock',
      render: (_: any, r: any) => (
        <span>{r.soldCount || 0} / {r.flashStock} đã bán</span>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, r: any) => <Tag color={itemStatusColor[r.status]}>{itemStatusLabel[r.status]}</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, r: any) => r.status === 'PENDING' ? (
        <Space>
          <Button type="primary" size="small" icon={<Check size={14} />} className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(r.id)}>
            Duyệt
          </Button>
          <Popconfirm title="Từ chối sản phẩm này?" onConfirm={() => handleReject(r.id)}>
            <Button danger size="small" icon={<X size={14} />}>Từ chối</Button>
          </Popconfirm>
        </Space>
      ) : null
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500 tracking-tight m-0">
            ⚡ Flash Sale
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Quản lý chiến dịch Flash Sale toàn sàn</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button type="primary" size="large" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)} className="bg-red-600 hover:bg-red-700 rounded-xl shadow-md">
            Tạo Flash Sale mới
          </Button>
        </div>
      </div>

      {/* Events Table */}
      <Card className="border-0 rounded-3xl shadow-sm" styles={{ body: { padding: '24px' } }}>
        <Table
          columns={eventColumns}
          dataSource={events}
          loading={loading}
          pagination={false}
          className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!font-semibold"
        />
      </Card>

      {/* Create Drawer */}
      <Drawer
        title={<div className="flex items-center gap-2"><Zap size={20} className="text-orange-500" /> Tạo Flash Sale Event</div>}
        width={480}
        onClose={() => setCreateOpen(false)}
        open={createOpen}
        extra={<Button type="primary" className="bg-red-600 hover:bg-red-700" onClick={() => form.submit()}>Tạo & Lên lịch</Button>}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Tên chiến dịch" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input size="large" placeholder="VD: Flash Sale Giữa Tháng 6" />
          </Form.Item>

          <Form.Item name="dates" label="Thời gian diễn ra" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
            <RangePicker showTime size="large" className="w-full" />
          </Form.Item>

          <Form.Item name="maxItems" label="Số slot sản phẩm tối đa" initialValue={50}>
            <InputNumber size="large" min={1} max={500} className="w-full" />
          </Form.Item>

          <Card size="small" className="bg-orange-50 border-orange-200 mt-4">
            <div className="flex gap-2 text-orange-800">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                Sau khi tạo, các Vendor sẽ có thể đăng ký sản phẩm vào sự kiện này. Admin cần duyệt trước khi sản phẩm hiển thị trên trang Flash Sale.
              </div>
            </div>
          </Card>
        </Form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        title={selectedEvent ? (
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-orange-500" />
            {selectedEvent.title}
            <Tag color={statusColor[selectedEvent.status]}>{statusLabel[selectedEvent.status]}</Tag>
          </div>
        ) : 'Chi tiết'}
        width={900}
        onClose={() => { setDetailOpen(false); setSelectedEvent(null); }}
        open={detailOpen}
      >
        {detailLoading ? (
          <div className="text-center py-20 text-gray-400">Đang tải...</div>
        ) : selectedEvent && (
          <div className="space-y-6">
            <div className="flex gap-4 text-sm text-gray-600">
              <div>🕐 Bắt đầu: <strong>{dayjs(selectedEvent.startTime).format('DD/MM/YYYY HH:mm')}</strong></div>
              <div>🏁 Kết thúc: <strong>{dayjs(selectedEvent.endTime).format('DD/MM/YYYY HH:mm')}</strong></div>
            </div>

            <Tabs
              items={[
                {
                  key: 'pending',
                  label: `Chờ duyệt (${selectedEvent.items?.filter((i: any) => i.status === 'PENDING').length || 0})`,
                  children: (
                    <Table
                      columns={itemColumns}
                      dataSource={(selectedEvent.items || []).filter((i: any) => i.status === 'PENDING').map((i: any) => ({ ...i, key: i.id }))}
                      pagination={false}
                      size="middle"
                    />
                  )
                },
                {
                  key: 'approved',
                  label: `Đã duyệt (${selectedEvent.items?.filter((i: any) => i.status === 'APPROVED').length || 0})`,
                  children: (
                    <Table
                      columns={itemColumns}
                      dataSource={(selectedEvent.items || []).filter((i: any) => i.status === 'APPROVED').map((i: any) => ({ ...i, key: i.id }))}
                      pagination={false}
                      size="middle"
                    />
                  )
                },
                {
                  key: 'rejected',
                  label: `Từ chối (${selectedEvent.items?.filter((i: any) => i.status === 'REJECTED').length || 0})`,
                  children: (
                    <Table
                      columns={itemColumns}
                      dataSource={(selectedEvent.items || []).filter((i: any) => i.status === 'REJECTED').map((i: any) => ({ ...i, key: i.id }))}
                      pagination={false}
                      size="middle"
                    />
                  )
                },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
