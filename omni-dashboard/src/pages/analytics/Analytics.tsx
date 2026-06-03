import React from 'react';
import { Card, Row, Col, DatePicker, Table, Tag } from 'antd';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from 'recharts';

const { RangePicker } = DatePicker;

const funnelData = [
  { value: 15430, name: 'Lượt xem (Views)', fill: '#185FA5' },
  { value: 4210, name: 'Thêm vào giỏ', fill: '#0F6E56' },
  { value: 1205, name: 'Tiến hành đặt hàng', fill: '#F59E0B' },
  { value: 890, name: 'Thanh toán thành công', fill: '#8B5CF6' },
];

const mockSkuPerformance = [
  { key: '1', sku: 'SNY-WH5-BLK', name: 'Tai nghe Sony WH-1000XM5 Đen', views: 5400, cart: 1200, ordered: 350, revenue: 262500000, refundRate: 1.2, stock: 15 },
  { key: '2', sku: 'KCN-K2P-BRN', name: 'Keychron K2 Pro Brown Switch', views: 3200, cart: 850, ordered: 210, revenue: 525000000, refundRate: 0.5, stock: 45 },
  { key: '3', sku: 'SNY-WH5-SLV', name: 'Tai nghe Sony WH-1000XM5 Bạc', views: 4100, cart: 950, ordered: 280, revenue: 210000000, refundRate: 5.8, stock: 3 },
  { key: '4', sku: 'KCN-K2P-RED', name: 'Keychron K2 Pro Red Switch', views: 2730, cart: 1210, ordered: 50, revenue: 125000000, refundRate: 0.0, stock: 120 },
];

export default function Analytics() {
  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (text: string) => <span className="font-mono text-xs font-bold text-gray-500">{text}</span> },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', render: (text: string) => <span className="font-medium text-gray-800">{text}</span> },
    { title: 'Lượt xem', dataIndex: 'views', key: 'views', sorter: (a: any, b: any) => a.views - b.views },
    { title: 'Thêm vào giỏ', dataIndex: 'cart', key: 'cart', sorter: (a: any, b: any) => a.cart - b.cart },
    { title: 'Đã mua', dataIndex: 'ordered', key: 'ordered', sorter: (a: any, b: any) => a.ordered - b.ordered },
    { 
      title: 'Tỷ lệ hoàn trả', 
      dataIndex: 'refundRate', 
      key: 'refundRate',
      render: (val: number) => <span className={val > 5 ? 'text-red-500 font-bold' : ''}>{val}%</span>,
      sorter: (a: any, b: any) => a.refundRate - b.refundRate
    },
    { 
      title: 'Tồn kho', 
      dataIndex: 'stock', 
      key: 'stock',
      render: (val: number) => <Tag color={val < 10 ? 'error' : 'success'}>{val}</Tag>,
      sorter: (a: any, b: any) => a.stock - b.stock
    },
    { 
      title: 'Doanh thu', 
      dataIndex: 'revenue', 
      key: 'revenue',
      render: (val: number) => <span className="font-semibold text-blue-600">{formatCurrency(val)}</span>,
      sorter: (a: any, b: any) => a.revenue - b.revenue
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight m-0">Phân tích sản phẩm</h1>
          <p className="text-gray-500 mt-1 font-medium">Theo dõi hiệu suất và chuyển đổi bán hàng.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <RangePicker size="large" className="rounded-xl" />
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="border-0 rounded-3xl shadow-sm h-full" title={<span className="font-bold text-gray-800 text-lg">Phễu chuyển đổi bán hàng</span>} styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>
            <div style={{ width: '100%', height: 350, paddingTop: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip 
                    formatter={(value: any, name: any) => [value, name]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                  >
                    <LabelList position="right" fill="#000" stroke="none" dataKey="name" fontSize={12} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={16}>
          <Card className="border-0 rounded-3xl shadow-sm h-full" title={<span className="font-bold text-gray-800 text-lg">Hiệu suất theo SKU</span>} styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>
            <Table 
              columns={columns} 
              dataSource={mockSkuPerformance}
              className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!font-semibold"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
