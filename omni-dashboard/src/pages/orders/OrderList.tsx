import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Tag, Input, Space, Dropdown, Modal, message } from 'antd';
import { Search, Printer, FileText, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

export default function OrderList() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { shopId } = useAuthStore();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/orders');
      setOrders(res.data.map((o:any) => ({
        key: o.id,
        id: o.id.split('-')[0].toUpperCase(),
        date: new Date(o.createdAt).toLocaleString('vi-VN'),
        customer: 'Khách hàng',
        phone: '09xxxxxx',
        total: o.totalAmount,
        items: o.orderItems?.length || 1,
        status: o.status.toLowerCase(),
        returnReason: o.returnReason,
        shippingMethod: 'Tiêu chuẩn',
        originalId: o.id
      })));
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'SHIPPED') {
        await api.post(`/vendor/orders/${id}/ship`);
      } else {
        await api.patch(`/vendor/orders/${id}/status?status=${newStatus}`);
      }
      message.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch(e) {
      message.error("Cập nhật thất bại");
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'pending': return { color: 'warning', text: 'Chờ xác nhận', icon: <CheckCircle size={14} /> };
      case 'processing': return { color: 'processing', text: 'Đang chuẩn bị', icon: <Package size={14} /> };
      case 'shipped': return { color: 'cyan', text: 'Đang giao hàng', icon: <Truck size={14} /> };
      case 'delivered': return { color: 'success', text: 'Đã giao', icon: <CheckCircle size={14} /> };
      case 'completed': return { color: 'success', text: 'Hoàn thành', icon: <CheckCircle size={14} /> };
      case 'cancelled': return { color: 'error', text: 'Đã hủy', icon: <XCircle size={14} /> };
      case 'return_requested': return { color: 'magenta', text: 'Yêu cầu trả hàng', icon: <XCircle size={14} /> };
      case 'returned': return { color: 'magenta', text: 'Đã trả hàng', icon: <XCircle size={14} /> };
      case 'return_rejected': return { color: 'default', text: 'Từ chối trả hàng', icon: <XCircle size={14} /> };
      default: return { color: 'default', text: status, icon: null };
    }
  };

  const columns = [
    { 
      title: 'Mã đơn', 
      dataIndex: 'id', 
      key: 'id',
      render: (text: string) => <a className="font-semibold text-blue-600">{text}</a>
    },
    { 
      title: 'Ngày đặt', 
      dataIndex: 'date', 
      key: 'date',
      render: (text: string) => <span className="text-gray-500">{text}</span>
    },
    { 
      title: 'Khách hàng', 
      key: 'customer',
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium text-gray-800">{record.customer}</div>
          <div className="text-xs text-gray-500">{record.phone}</div>
        </div>
      )
    },
    { 
      title: 'Sản phẩm', 
      dataIndex: 'items', 
      key: 'items',
      render: (val: number) => <span>{val} sản phẩm</span>
    },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'total', 
      key: 'total',
      render: (val: number) => <span className="font-medium">{formatCurrency(val)}</span>
    },
    { 
      title: 'Đơn vị VC', 
      dataIndex: 'shippingMethod', 
      key: 'shippingMethod',
      render: (text: string) => <Tag>{text}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => {
        const config = getStatusConfig(status);
        return (
          <div className="flex flex-col gap-1">
            <Tag color={config.color} icon={config.icon} className="flex items-center w-fit gap-1">{config.text}</Tag>
            {status === 'returned' && record.returnReason && (
              <span className="text-xs text-red-500">Lý do: {record.returnReason}</span>
            )}
          </div>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'pending' && <Button type="primary" size="small" onClick={() => updateStatus(record.originalId, 'PROCESSING')}>Xác nhận</Button>}
          {record.status === 'processing' && <Button type="primary" size="small" onClick={() => updateStatus(record.originalId, 'SHIPPED')}>Giao ĐVVC</Button>}
          <Button size="small" icon={<FileText size={14} />} />
        </Space>
      )
    }
  ];

  const filteredOrders = orders.filter((order: any) => activeTab === 'all' ? true : order.status === activeTab);

  const tabItems = [
    { key: 'all', label: `Tất cả (${orders.length})` },
    { key: 'pending', label: `Chờ xác nhận (${orders.filter((o: any) => o.status === 'pending').length})` },
    { key: 'processing', label: `Đang chuẩn bị (${orders.filter((o: any) => o.status === 'processing').length})` },
    { key: 'shipped', label: `Đang giao hàng (${orders.filter((o: any) => o.status === 'shipped').length})` },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
    { key: 'return_requested', label: 'Yêu cầu trả hàng' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight m-0">Xử lý đơn hàng</h1>
          <p className="text-gray-500 mt-1 font-medium">Theo dõi và cập nhật trạng thái đơn hàng của bạn.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button size="large" className="rounded-xl shadow-sm border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300" icon={<Printer size={18} />}>
            In mã vạch hàng loạt
          </Button>
        </div>
      </div>

      <Card className="border-0 rounded-3xl shadow-sm" styles={{ body: { padding: '24px' } }}>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <Input 
            placeholder="Tìm theo Mã đơn, SĐT..." 
            prefix={<Search size={16} className="text-gray-400" />}
            style={{ width: 250 }}
          />
        </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        items={tabItems} 
        className="mb-4"
      />

      <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
        <span>Có <strong>{orders.filter(o => o.status === 'pending').length} đơn hàng</strong> cần được xác nhận trong vòng 24h để tránh bị phạt tỷ lệ giao hàng trễ.</span>
        <Button size="small" type="primary">Xác nhận hàng loạt</Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredOrders}
        loading={loading}
        className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!font-semibold"
        pagination={{ total: filteredOrders.length, pageSize: 10, showSizeChanger: true }}
      />
      </Card>
    </div>
  );
}
