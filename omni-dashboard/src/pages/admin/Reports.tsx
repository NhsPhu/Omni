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
          <Card className="card-shadow border-none rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <DollarSign size={24} />
              </div>
              <Statistic title="Tổng GMV toàn sàn" value={report?.totalGmv || 0} formatter={(v) => formatCurrency(Number(v))} valueStyle={{ fontSize: '20px', fontWeight: 'bold' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow border-none rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <TrendingUp size={24} />
              </div>
              <Statistic title="Doanh thu Sàn (Hoa hồng)" value={report?.totalRevenue || 0} formatter={(v) => formatCurrency(Number(v))} valueStyle={{ fontSize: '20px', fontWeight: 'bold' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow border-none rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Store size={24} />
              </div>
              <Statistic title="Gian hàng hoạt động" value={report?.activeShops || 0} valueStyle={{ fontSize: '24px', fontWeight: 'bold' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow border-none rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <ShoppingBag size={24} />
              </div>
              <Statistic title="Tổng đơn hàng" value={report?.totalOrders || 0} valueStyle={{ fontSize: '24px', fontWeight: 'bold' }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ GMV & Doanh thu Sàn" className="card-shadow border-none rounded-xl h-full">
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report?.chartData || []} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
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
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <RechartsTooltip 
                    formatter={(value: any, name: any) => [formatCurrency(value), name]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="gmv" name="Tổng GMV" stroke="#185FA5" fillOpacity={1} fill="url(#colorGmv)" />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" name="Doanh thu Sàn" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" />
                  <defs>
                    <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#185FA5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#185FA5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top Gian Hàng (GMV)" className="card-shadow border-none rounded-xl h-full">
            <Table 
              columns={topShopsColumns} 
              dataSource={report?.topShops?.map((s: any, i: number) => ({ ...s, key: i })) || []}
              pagination={false}
              size="small"
              className="[&_.ant-table-thead_th]:!bg-gray-50"
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 m-0">Báo cáo & Cấu hình Hệ thống</h1>
        <RangePicker size="large" />
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
