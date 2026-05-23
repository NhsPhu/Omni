import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Tag, Input, Space, Dropdown, Modal } from 'antd';
import { Search, Printer, FileText, CheckCircle, Truck, Package, XCircle } from 'lucide-react';

const mockOrders = Array.from({ length: 30 }).map((_, i) => {
  const statusList = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
  const status = statusList[i % 5];
  return {
    key: i.toString(),
    id: `OMN-2026${String(i).padStart(4, '0')}`,
    date: `23/05/2026 10:${String(i).padStart(2, '0')}`,
    customer: `Khách hàng ${i}`,
    phone: `0901234${String(i).padStart(3, '0')}`,
    total: 1500000 + i * 200000,
    items: i % 3 + 1,
    status: status,
    shippingMethod: i % 2 === 0 ? 'Giao Hàng Nhanh' : 'Giao Hàng Tiết Kiệm',
  };
});

export default function OrderList() {
  const [activeTab, setActiveTab] = useState('all');
  
  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'pending': return { color: 'warning', text: 'Chờ xác nhận', icon: <CheckCircle size={14} /> };
      case 'processing': return { color: 'processing', text: 'Đang chuẩn bị', icon: <Package size={14} /> };
      case 'shipping': return { color: 'cyan', text: 'Đang giao hàng', icon: <Truck size={14} /> };
      case 'completed': return { color: 'success', text: 'Hoàn thành', icon: <CheckCircle size={14} /> };
      case 'cancelled': return { color: 'error', text: 'Đã hủy', icon: <XCircle size={14} /> };
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
      render: (status: string) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color} icon={config.icon} className="flex items-center w-fit gap-1">{config.text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'pending' && <Button type="primary" size="small">Xác nhận</Button>}
          {record.status === 'processing' && <Button type="primary" size="small">Giao ĐVVC</Button>}
          <Button size="small" icon={<FileText size={14} />} />
        </Space>
      )
    }
  ];

  const filteredOrders = mockOrders.filter(order => activeTab === 'all' ? true : order.status === activeTab);

  const tabItems = [
    { key: 'all', label: `Tất cả (${mockOrders.length})` },
    { key: 'pending', label: `Chờ xác nhận (${mockOrders.filter(o => o.status === 'pending').length})` },
    { key: 'processing', label: `Đang chuẩn bị (${mockOrders.filter(o => o.status === 'processing').length})` },
    { key: 'shipping', label: `Đang giao hàng (${mockOrders.filter(o => o.status === 'shipping').length})` },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <Card className="card-shadow border-none rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-xl font-bold text-gray-800 m-0">Xử lý đơn hàng</h1>
        <div className="flex gap-2">
          <Input 
            placeholder="Tìm theo Mã đơn, SĐT..." 
            prefix={<Search size={16} className="text-gray-400" />}
            style={{ width: 250 }}
          />
          <Button icon={<Printer size={16} />}>In mã vạch hàng loạt</Button>
        </div>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        items={tabItems} 
        className="mb-4"
      />

      <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
        <span>Có <strong>{mockOrders.filter(o => o.status === 'pending').length} đơn hàng</strong> cần được xác nhận trong vòng 24h để tránh bị phạt tỷ lệ giao hàng trễ.</span>
        <Button size="small" type="primary">Xác nhận hàng loạt</Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredOrders}
        className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500"
        pagination={{ total: filteredOrders.length, pageSize: 10, showSizeChanger: true }}
      />
    </Card>
  );
}
