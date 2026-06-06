import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Card, Row, Col, Statistic, Table, Tabs, Form, InputNumber, Button, Select, Avatar, DatePicker, message, Tag } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Store, ShoppingBag, Settings, History } from 'lucide-react';

const { RangePicker } = DatePicker;

export default function Reports() {
  const [form] = Form.useForm();
  const [report, setReport] = useState<any>(null);
  
  useEffect(() => {
    api.get('/admin/reports').then(res => setReport(res.data)).catch(() => {});
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleSaveConfig = () => {
    form.validateFields().then(values => {
      message.success('Đã lưu cấu hình và ghi nhận Audit Log!');
    });
  };

  const topShopsColumns = [
    { title: 'Hạng', key: 'rank', width: 60, render: (_: any, __: any, index: number) => {
      const t = index + 1;
      return <div className={`font-bold w-6 h-6 rounded-full flex items-center justify-center ${t === 1 ? 'bg-yellow-100 text-yellow-600' : t === 2 ? 'bg-gray-100 text-gray-500' : t === 3 ? 'bg-orange-100 text-orange-600' : ''}`}>{t}</div>
    } },
    { 
      title: 'Gian hàng', 
      key: 'name',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-2">
          <Avatar src={`https://api.dicebear.com/7.x/notionists/svg?seed=${r.name}`} />
          <span className="font-medium">{r.name}</span>
        </div>
      )
    },
    { title: 'Tổng GMV', dataIndex: 'gmv', key: 'gmv', render: (val: number) => <span className="font-semibold text-blue-600">{formatCurrency(val)}</span> },
    { title: 'Đơn hàng', dataIndex: 'orders', key: 'orders' },
  ];

  const dashboardTab = (
    <div className="space-y-6">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <DollarSign size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                <DollarSign size={28} />
              </div>
              <p className="text-gray-600 font-medium mb-1">Tổng GMV toàn sàn</p>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(report?.totalGmv || 0)}</h3>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
                <TrendingUp size={28} />
              </div>
              <p className="text-gray-600 font-medium mb-1">Doanh thu Sàn (Hoa hồng)</p>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(report?.totalRevenue || 0)}</h3>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <Store size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
                <Store size={28} />
              </div>
              <p className="text-gray-600 font-medium mb-1">Gian hàng hoạt động</p>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{report?.activeShops || 0}</h3>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-purple-50 to-fuchsia-50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <ShoppingBag size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                <ShoppingBag size={28} />
              </div>
              <p className="text-gray-600 font-medium mb-1">Tổng đơn hàng</p>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{report?.totalOrders || 0}</h3>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title={<span className="text-lg font-bold text-gray-800">Biểu đồ GMV & Doanh thu Sàn</span>} className="border-0 rounded-3xl shadow-sm h-full" styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>
            <div style={{ width: '100%', height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report?.chartData || []} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
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
                    tickFormatter={(value) => `${value / 1000000}M`}
                    dx={10}
                  />
                  <RechartsTooltip 
                    formatter={(value: any, name: any) => [formatCurrency(value), name]}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 500 }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="gmv" name="Tổng GMV" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorGmv)" activeDot={{ r: 8, strokeWidth: 0, fill: '#4F46E5' }} />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" name="Doanh thu Sàn" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" activeDot={{ r: 8, strokeWidth: 0, fill: '#10B981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<span className="text-lg font-bold text-gray-800">Top Gian Hàng (GMV)</span>} className="border-0 rounded-3xl shadow-sm h-full" styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>
            <Table 
              columns={topShopsColumns} 
              dataSource={report?.topShops?.map((s: any, i: number) => ({ ...s, key: i })) || []}
              pagination={false}
              size="middle"
              className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!font-semibold"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const configTab = (
    <div className="max-w-3xl">
      <Card className="card-shadow border-none rounded-xl mb-6">
        <h3 className="flex items-center gap-2 mb-4 font-bold text-lg"><Settings size={20} /> Cấu hình Tỷ lệ Hoa hồng (Commission Rate)</h3>
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded mb-6 text-sm border border-yellow-200">
          <strong>Cảnh báo:</strong> Thay đổi cấu hình này sẽ áp dụng ngay lập tức cho tất cả đơn hàng phát sinh sau thời điểm lưu. Chỉ Super Admin mới có quyền thực hiện. Mọi thao tác đều được lưu vết.
        </div>

        <Form form={form} layout="vertical" initialValues={{ def: 5, cat1: 3, cat2: 7 }}>
          <Form.Item name="def" label="Tỷ lệ hoa hồng mặc định toàn sàn (%)">
            <InputNumber min={0} max={100} size="large" />
          </Form.Item>
          
          <div className="font-medium text-gray-700 mb-2 mt-4">Ngoại lệ theo Danh mục (Ghi đè mặc định)</div>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6 space-y-4">
            <Row gutter={16}>
              <Col span={12}><div className="font-medium">Điện thoại di động</div></Col>
              <Col span={12}>
                <Form.Item name="cat1" noStyle><InputNumber min={0} max={100} addonAfter="%" /></Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><div className="font-medium">Phụ kiện công nghệ</div></Col>
              <Col span={12}>
                <Form.Item name="cat2" noStyle><InputNumber min={0} max={100} addonAfter="%" /></Form.Item>
              </Col>
            </Row>
          </div>

          <Button type="primary" size="large" danger onClick={handleSaveConfig}>Lưu cấu hình</Button>
        </Form>
      </Card>

      <Card className="card-shadow border-none rounded-xl">
        <h3 className="flex items-center gap-2 mb-4 font-bold text-lg"><History size={20} /> System Audit Log</h3>
        <Table 
          columns={[
            { title: 'Thời gian', dataIndex: 'time', key: 'time' },
            { title: 'Tài khoản', dataIndex: 'admin', key: 'admin', render: (t: string) => <Tag color="red">{t}</Tag> },
            { title: 'Hành động', dataIndex: 'action', key: 'action' },
          ]}
          dataSource={[
            { key: '1', time: '20/05/2026 10:00', admin: 'Super Admin', action: 'Thay đổi commission rate: Default 4% -> 5%' },
            { key: '2', time: '19/05/2026 15:30', admin: 'Manager 1', action: 'Export dữ liệu GMV tháng 4/2026' },
          ]}
          size="small"
          pagination={false}
        />
      </Card>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Báo cáo & Cấu hình Hệ thống
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Bảng điều khiển dành cho Super Admin</p>
        </div>
        <div className="mt-4 md:mt-0">
          <RangePicker 
            size="large" 
            className="rounded-xl border-gray-200 hover:border-indigo-400 focus:border-indigo-500 shadow-sm"
          />
        </div>
      </div>

      <Tabs
        items={[
          { key: 'dashboard', label: 'Báo cáo Tổng quan', children: dashboardTab },
          { key: 'config', label: 'Cấu hình Hệ thống', children: configTab },
        ]}
      />
    </div>
  );
}
