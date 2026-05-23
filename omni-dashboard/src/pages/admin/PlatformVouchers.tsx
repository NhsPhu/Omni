import React, { useState } from 'react';
import { Card, Table, Button, Tag, Space, Drawer, Form, Input, InputNumber, DatePicker, Select, Switch, message, Progress } from 'antd';
import { Plus, Ticket, AlertTriangle } from 'lucide-react';

const { RangePicker } = DatePicker;
const { Option } = Select;

const mockVouchers = [
  { key: '1', code: 'OMNI50K', discount: '50K', minOrder: 200000, scope: 'Toàn sàn', usage: 1250, budgetUsed: 62500000, budgetCap: 100000000, status: 'active', end: '30/06/2026' },
  { key: '2', code: 'TECH10', discount: '10%', minOrder: 1000000, scope: 'Điện thoại, Laptop', usage: 342, budgetUsed: 85500000, budgetCap: 100000000, status: 'warning', end: '31/05/2026' },
  { key: '3', code: 'FREESHIPXTRA', discount: '30K', minOrder: 50000, scope: 'Toàn sàn', usage: 5000, budgetUsed: 150000000, budgetCap: 150000000, status: 'exhausted', end: '31/12/2026' },
];

export default function PlatformVouchers() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [scope, setScope] = useState('all');

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    { 
      title: 'Mã Voucher Sàn', 
      dataIndex: 'code', 
      key: 'code',
      render: (text: string) => <div className="font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded w-fit border border-red-200">{text}</div>
    },
    { title: 'Giảm giá', dataIndex: 'discount', key: 'discount', render: (t: string) => <span className="font-semibold">{t}</span> },
    { title: 'Phạm vi', dataIndex: 'scope', key: 'scope' },
    { 
      title: 'Ngân sách sử dụng (Budget Cap)', 
      key: 'budget',
      width: 250,
      render: (_: any, record: any) => {
        const percent = Math.round((record.budgetUsed / record.budgetCap) * 100);
        let strokeColor = '#10B981';
        if (percent >= 80) strokeColor = '#F59E0B';
        if (percent >= 100) strokeColor = '#EF4444';
        
        return (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>{formatCurrency(record.budgetUsed)}</span>
              <span className="text-gray-500">/ {formatCurrency(record.budgetCap)}</span>
            </div>
            <Progress percent={percent} strokeColor={strokeColor} size="small" />
            {percent >= 80 && percent < 100 && <div className="text-xs text-orange-500 mt-1 flex items-center gap-1"><AlertTriangle size={12}/> Gần hết ngân sách</div>}
          </div>
        )
      }
    },
    { title: 'Hạn dùng', dataIndex: 'end', key: 'end' },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: any) => {
        if (record.status === 'exhausted') return <Tag color="error">Hết ngân sách</Tag>;
        if (record.status === 'warning') return <Tag color="warning">Cảnh báo budget</Tag>;
        return <Tag color="success">Đang chạy</Tag>;
      }
    },
    {
      title: '',
      key: 'action',
      render: () => <Button type="text" danger size="small">Ngừng</Button>
    }
  ];

  return (
    <>
      <Card className="card-shadow border-none rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 m-0">Platform Voucher</h1>
            <p className="text-gray-500">Quản lý mã giảm giá do Sàn tài trợ (trừ trực tiếp vào doanh thu sàn)</p>
          </div>
          <Button type="primary" size="large" icon={<Plus size={16} />} onClick={() => setOpen(true)} className="bg-red-600 hover:bg-red-700">
            Tạo Campaign Mới
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={mockVouchers}
          className="[&_.ant-table-thead_th]:!bg-gray-50"
          pagination={false}
        />
      </Card>

      <Drawer
        title={<div className="flex items-center gap-2"><Ticket size={20} className="text-red-600"/> Tạo Platform Voucher</div>}
        width={500}
        onClose={() => setOpen(false)}
        open={open}
        extra={<Button type="primary" className="bg-red-600 hover:bg-red-700" onClick={() => form.submit()}>Lưu & Phát hành</Button>}
      >
        <Form form={form} layout="vertical" onFinish={() => { message.success('Tạo thành công!'); setOpen(false); }}>
          <Form.Item name="code" label="Mã Voucher" rules={[{ required: true }]}>
            <Input size="large" placeholder="VD: MEGA_SALE" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          
          <div className="flex gap-4">
            <Form.Item name="discountType" label="Loại giảm" className="flex-1" initialValue="percent">
              <Select size="large">
                <Option value="percent">Giảm theo %</Option>
                <Option value="fixed">Giảm tiền mặt</Option>
              </Select>
            </Form.Item>
            <Form.Item name="value" label="Giá trị" className="flex-1" rules={[{ required: true }]}>
              <InputNumber size="large" className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="budget" label="Ngân sách tối đa (Budget Cap)" rules={[{ required: true }]} tooltip="Khi tổng số tiền giảm cho khách hàng đạt mức này, voucher sẽ tự động bị vô hiệu hóa để bảo vệ lợi nhuận sàn.">
            <InputNumber size="large" className="w-full" addonAfter="VND" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>

          <Form.Item name="scopeType" label="Phạm vi áp dụng" initialValue="all">
            <Select size="large" onChange={setScope}>
              <Option value="all">Toàn sàn (Tất cả sản phẩm)</Option>
              <Option value="category">Chỉ định Danh mục</Option>
              <Option value="vendor">Chỉ định Cửa hàng</Option>
            </Select>
          </Form.Item>

          {scope === 'category' && (
            <Form.Item name="categories" label="Chọn Danh mục được áp dụng">
              <Select mode="multiple" size="large" placeholder="VD: Điện thoại, Laptop...">
                <Option value="dienthoai">Điện thoại</Option>
                <Option value="laptop">Laptop</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item label="Thời gian diễn ra">
            <RangePicker showTime size="large" className="w-full" />
          </Form.Item>

          <Card size="small" className="bg-orange-50 border-orange-200 mt-4">
            <div className="flex gap-2 text-orange-800">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div className="text-sm">Voucher sàn sẽ được áp dụng ĐỒNG THỜI với voucher của Cửa hàng. Nếu cấu hình budget cap quá lớn, sàn có thể chịu rủi ro thất thoát doanh thu.</div>
            </div>
          </Card>
        </Form>
      </Drawer>
    </>
  );
}
