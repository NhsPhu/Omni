import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Select, Space, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Package, TrendingUp, DollarSign, Users, CheckCircle } from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const { Option } = Select;

// Removed mock revenueData

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7days');
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const { shopId } = useAuthStore();

  const fetchStats = async () => {
    try {
      const statsRes = await api.get('/vendor/statistics');
      setStats(statsRes.data);
      setChartData(statsRes.data.revenueChart || []);
    } catch(e) {
      console.error('Lỗi khi lấy thống kê:', e);
    }
  };

  const fetchOrders = async () => {
    if (!shopId) return;
    try {
      const res = await api.get(`/vendor/orders`);
      setOrders(res.data.map((o: any) => ({
        key: o.id,
        id: o.id.split('-')[0].toUpperCase(),
        customer: o.customerName || 'Khách hàng',
        total: o.totalAmount,
        status: o.status,
        time: new Date(o.createdAt).toLocaleString('vi-VN'),
        originalId: o.id
      })));
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [shopId, timeRange]);

  const confirmOrder = async (id: string) => {
    try {
      await api.patch(`/vendor/orders/${id}/status?status=CONFIRMED`);
      message.success("Đã xác nhận đơn hàng");
      fetchOrders();
    } catch(e) {
      message.error("Lỗi xác nhận");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: (text: string) => <a className="font-semibold">{text}</a> },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', render: (val: number) => <span className="font-semibold text-blue-600">{formatCurrency(val)}</span> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (text: string) => <Tag color={text === 'PENDING' ? 'orange' : 'blue'}>{text}</Tag> },
    { title: 'Thời gian', dataIndex: 'time', key: 'time', render: (text: string) => <span className="text-gray-500">{text}</span> },
    { 
      title: 'Hành động', 
      key: 'action', 
      render: (_:any, record: any) => (
        <Space size="middle">
          {record.status === 'PENDING' && (
            <Button type="primary" size="small" onClick={() => confirmOrder(record.originalId)}>Xác nhận</Button>
          )}
          <Button size="small">Chi tiết</Button>
        </Space>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Tổng quan cửa hàng
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Báo cáo hiệu suất kinh doanh thời gian thực</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <Select 
            value={timeRange} 
            onChange={setTimeRange} 
            style={{ width: 160 }} 
            size="large"
            bordered={false}
            className="bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium shadow-sm"
          >
            <Option value="today">Hôm nay</Option>
            <Option value="7days">7 ngày qua</Option>
            <Option value="30days">30 ngày qua</Option>
          </Select>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Doanh thu */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <DollarSign size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                <DollarSign size={28} />
              </div>
              <p className="text-gray-600 font-medium mb-1">Doanh thu (7 ngày)</p>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(stats?.totalRevenue || 0)}</h3>
              <div className="mt-4 flex items-center text-sm font-semibold">
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                  <ArrowUpOutlined /> 12.5%
                </span>
                <span className="text-gray-500 ml-2">so với tuần trước</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Đơn hàng */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <Package size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
                <Package size={28} />
              </div>
              <p className="text-gray-600 font-medium mb-1">Đơn hàng mới</p>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{stats?.newOrdersCount || 0}</h3>
              <div className="mt-4 flex items-center text-sm font-semibold">
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                  <ArrowUpOutlined /> 8.2%
                </span>
                <span className="text-gray-500 ml-2">so với tuần trước</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Chuyển đổi */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-purple-50 to-fuchsia-50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                <TrendingUp size={28} />
              </div>
              <p className="text-gray-600 font-medium mb-1">Tỷ lệ chuyển đổi</p>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{stats?.conversionRate || 3.42}%</h3>
              <div className="mt-4 flex items-center text-sm font-semibold">
                <span className="flex items-center gap-1 text-rose-600 bg-rose-100 px-2 py-1 rounded-lg">
                  <ArrowDownOutlined /> 1.1%
                </span>
                <span className="text-gray-500 ml-2">so với tuần trước</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Khách truy cập */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <Users size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
                <Users size={28} />
              </div>
              <p className="text-gray-600 font-medium mb-1">Khách truy cập</p>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{stats?.visitorsCount || 13482}</h3>
              <div className="mt-4 flex items-center text-sm font-semibold">
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                  <ArrowUpOutlined /> 5.4%
                </span>
                <span className="text-gray-500 ml-2">so với tuần trước</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title={<span className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</span>} 
            className="border-0 rounded-3xl shadow-sm h-full"
            extra={<Button type="text" className="text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg">Xem chi tiết</Button>}
            styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}
          >
            <div style={{ width: '100%', height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CA8A04" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#CA8A04" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={15} />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000000}M`}
                    dx={-10}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dx={10}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => {
                      if (name === 'Doanh thu') return [formatCurrency(value), name];
                      return [value, 'Đơn hàng'];
                    }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 500 }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#CA8A04" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 8, strokeWidth: 0, fill: '#CA8A04' }} fill="url(#colorRevenue)" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Đơn hàng" stroke="#1C1917" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 8, strokeWidth: 0, fill: '#1C1917' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-800">Đơn hàng chờ xử lý</span>
                <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm font-bold">{stats?.pendingOrdersCount || 0}</span>
              </div>
            }
            className="border-0 rounded-3xl shadow-sm h-full"
            extra={<Button type="text" className="text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg">Xem tất cả</Button>}
            styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px 12px 24px 24px' } }}
          >
            <div className="pr-3" style={{ maxHeight: '380px', overflowY: 'auto' }}>
              <div className="space-y-4">
                {orders.filter(o => o.status === 'PENDING').slice(0, 6).map((order) => (
                  <div key={order.key} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50/50 transition-colors border border-gray-100/50 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500 font-bold border border-gray-100 group-hover:border-indigo-200 transition-colors">
                        {order.id.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{order.id}</p>
                        <p className="text-xs text-gray-500 font-medium">{order.time.split(' ')[1]} {order.time.split(' ')[0]}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold text-indigo-600">{formatCurrency(order.total)}</p>
                      </div>
                      <Button 
                        type="primary" 
                        shape="circle"
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/30"
                        icon={<CheckCircle size={16} />}
                        onClick={() => confirmOrder(order.originalId)}
                      />
                    </div>
                  </div>
                ))}
                {orders.filter(o => o.status === 'PENDING').length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Không có đơn hàng chờ xử lý</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
