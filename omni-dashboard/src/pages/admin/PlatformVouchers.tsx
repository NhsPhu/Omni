import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Card, Table, Button, Tag, Space, Drawer, Form, Input, InputNumber, DatePicker, Select, message, Progress } from 'antd';
import { Plus, Ticket, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function PlatformVouchers() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [scope, setScope] = useState('all');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/vouchers');
      setVouchers(res.data.map((v: any) => ({
        ...v,
        key: v.id,
        discount: v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatCurrency(v.discountValue),
        budgetUsed: v.usedCount * (v.discountType === 'PERCENTAGE' ? (v.maxDiscountAmount || 0) : v.discountValue), // Approximated
        budgetCap: v.usageLimit * (v.discountType === 'PERCENTAGE' ? (v.maxDiscountAmount || 0) : v.discountValue),
        end: dayjs(v.validTo).format('DD/MM/YYYY'),
        status: v.usedCount >= v.usageLimit ? 'exhausted' : 'active'
      })));
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleCreate = async (values: any) => {
    try {
      const payload = {
        code: values.code,
        discountType: values.discountType === 'percent' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
        discountValue: values.value,
        minOrderValue: 0,
        maxDiscountAmount: values.discountType === 'percent' ? values.budget / 100 : values.value,
        usageLimit: Math.floor(values.budget / (values.discountType === 'percent' ? (values.budget/100) : values.value)),
        validFrom: values.dates[0].toISOString(),
        validTo: values.dates[1].toISOString()
      };
      await api.post('/admin/vouchers', payload);
      message.success('Tạo thành công!');
      setOpen(false);
      form.resetFields();
      fetchVouchers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi tạo voucher');
    }
  };

  const columns = [
    { 
      title: 'Mã Voucher Sàn', 
      dataIndex: 'code', 
      key: 'code',
      render: (text: string) => <div className="font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded w-fit border border-red-200">{text}</div>
    },
    { title: 'Giảm giá', dataIndex: 'discount', key: 'discount', render: (t: string) => <span className="font-semibold">{t}</span> },
    { 
      title: 'Ngân sách (Budget)', 
      key: 'budget',
      width: 250,
      render: (_: any, record: any) => {
        if (!record.budgetCap) return <span>Không giới hạn</span>;
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
          dataSource={vouchers}
          loading={loading}
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
        <Form form={form} layout="vertical" onFinish={handleCreate}>
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

          <Form.Item name="dates" label="Thời gian diễn ra" rules={[{ required: true }]}>
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
