import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Select, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Package, TrendingUp, DollarSign, Users } from 'lucide-react';

const { Option } = Select;

const revenueData = [
  { date: '17/05', revenue: 12000000, orders: 45 },
  { date: '18/05', revenue: 15500000, orders: 58 },
  { date: '19/05', revenue: 11200000, orders: 42 },
  { date: '20/05', revenue: 18900000, orders: 65 },
  { date: '21/05', revenue: 22400000, orders: 82 },
  { date: '22/05', revenue: 19800000, orders: 74 },
  { date: '23/05', revenue: 24500000, orders: 95 },
];

const pendingOrders = [
  { key: '1', id: 'OMN-202401', customer: 'Nguyễn Văn An', total: 1250000, status: 'pending', time: '10 phút trước' },
  { key: '2', id: 'OMN-202402', customer: 'Trần Thị Bình', total: 3400000, status: 'pending', time: '25 phút trước' },
  { key: '3', id: 'OMN-202403', customer: 'Lê Hoàng Cường', total: 890000, status: 'pending', time: '1 giờ trước' },
  { key: '4', id: 'OMN-202404', customer: 'Phạm Thu Dung', total: 4550000, status: 'pending', time: '2 giờ trước' },
  { key: '5', id: 'OMN-202405', customer: 'Hoàng Văn E', total: 150000, status: 'pending', time: '3 giờ trước' },
];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7days');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: (text: string) => <a className="font-semibold">{text}</a> },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', render: (val: number) => <span className="font-semibold text-blue-600">{formatCurrency(val)}</span> },
    { title: 'Thời gian', dataIndex: 'time', key: 'time', render: (text: string) => <span className="text-gray-500">{text}</span> },
    { 
      title: 'Hành động', 
      key: 'action', 
      render: () => (
        <Space size="middle">
          <Button type="primary" size="small">Xác nhận</Button>
          <Button size="small">Chi tiết</Button>
        </Space>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan cửa hàng</h1>
          <p className="text-gray-500">Cập nhật lúc 10:30 AM, 23/05/2026</p>
        </div>
        <Select value={timeRange} onChange={setTimeRange} style={{ width: 150 }} size="large">
          <Option value="today">Hôm nay</Option>
          <Option value="7days">7 ngày qua</Option>
          <Option value="30days">30 ngày qua</Option>
        </Select>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow border-none rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <DollarSign size={24} />
              </div>
              <Statistic 
                title="Doanh thu" 
                value={124300000} 
                formatter={(val) => formatCurrency(Number(val))}
                valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
              />
            </div>
            <div className="mt-4 text-sm">
              <span className="text-green-500 font-semibold inline-flex items-center gap-1">
                <ArrowUpOutlined /> 12.5%
              </span>
              <span className="text-gray-500 ml-2">so với kỳ trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow border-none rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Package size={24} />
              </div>
              <Statistic 
                title="Đơn hàng mới" 
                value={461} 
                valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
              />
            </div>
            <div className="mt-4 text-sm">
              <span className="text-green-500 font-semibold inline-flex items-center gap-1">
                <ArrowUpOutlined /> 8.2%
              </span>
              <span className="text-gray-500 ml-2">so với kỳ trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow border-none rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <TrendingUp size={24} />
              </div>
              <Statistic 
                title="Tỷ lệ chuyển đổi" 
                value={3.42} 
                precision={2}
                suffix="%"
                valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
              />
            </div>
            <div className="mt-4 text-sm">
              <span className="text-red-500 font-semibold inline-flex items-center gap-1">
                <ArrowDownOutlined /> 1.1%
              </span>
              <span className="text-gray-500 ml-2">so với kỳ trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow border-none rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Users size={24} />
              </div>
              <Statistic 
                title="Khách truy cập" 
                value={13482} 
                valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
              />
            </div>
            <div className="mt-4 text-sm">
              <span className="text-green-500 font-semibold inline-flex items-center gap-1">
                <ArrowUpOutlined /> 5.4%
              </span>
              <span className="text-gray-500 ml-2">so với kỳ trước</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Biểu đồ doanh thu" 
            className="card-shadow border-none rounded-xl h-full"
            extra={<Button type="link">Xem chi tiết</Button>}
          >
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => {
                      if (name === 'Doanh thu') return [formatCurrency(value), name];
                      return [value, 'Đơn hàng'];
                    }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#185FA5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Đơn hàng" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <span>Đơn hàng chờ xử lý</span>
                <Tag color="error" className="rounded-full">{pendingOrders.length}</Tag>
              </div>
            }
            className="card-shadow border-none rounded-xl h-full"
            extra={<Button type="link">Xem tất cả</Button>}
          >
            <Table 
              dataSource={pendingOrders} 
              columns={columns} 
              pagination={false}
              size="middle"
              className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
