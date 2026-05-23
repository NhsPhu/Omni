import React, { useState } from 'react';
import { Card, Table, Button, Tag, Input, Space, Drawer, Form, Radio, InputNumber, DatePicker, Switch, message } from 'antd';
import { Search, Plus, Tag as TagIcon, Percent, DollarSign } from 'lucide-react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const mockVouchers = [
  { key: '1', code: 'SUMMER24', type: 'percent', value: 10, minOrder: 200000, maxDiscount: 50000, usage: 45, limit: 100, status: 'active', end: '30/06/2026' },
  { key: '2', code: 'WELCOME', type: 'fixed', value: 50000, minOrder: 150000, maxDiscount: 50000, usage: 120, limit: null, status: 'active', end: '31/12/2026' },
  { key: '3', code: 'FLASH50', type: 'percent', value: 50, minOrder: 50000, maxDiscount: 100000, usage: 200, limit: 200, status: 'expired', end: '15/05/2026' },
  { key: '4', code: 'FREESHIP', type: 'fixed', value: 30000, minOrder: 0, maxDiscount: 30000, usage: 0, limit: 50, status: 'upcoming', end: '01/08/2026' },
];

export default function VoucherList() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState('percent');

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    { 
      title: 'Mã Voucher', 
      dataIndex: 'code', 
      key: 'code',
      render: (text: string) => <div className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit border border-blue-200">{text}</div>
    },
    { 
      title: 'Giảm giá', 
      key: 'discount',
      render: (_: any, record: any) => (
        <span className="font-semibold text-red-500">
          {record.type === 'percent' ? `Giảm ${record.value}%` : `Giảm ${formatCurrency(record.value)}`}
        </span>
      )
    },
    { 
      title: 'Điều kiện', 
      key: 'condition',
      render: (_: any, record: any) => (
        <div className="text-xs text-gray-500">
          <div>Đơn tối thiểu: {formatCurrency(record.minOrder)}</div>
          {record.type === 'percent' && <div>Tối đa: {formatCurrency(record.maxDiscount)}</div>}
        </div>
      )
    },
    { 
      title: 'Đã dùng', 
      key: 'usage',
      render: (_: any, record: any) => (
        <span>{record.usage} / {record.limit ? record.limit : '∞'}</span>
      )
    },
    { 
      title: 'Hạn sử dụng', 
      dataIndex: 'end', 
      key: 'end',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, any> = {
          active: { color: 'success', text: 'Đang chạy' },
          expired: { color: 'default', text: 'Đã kết thúc' },
          upcoming: { color: 'processing', text: 'Sắp diễn ra' },
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" disabled={record.usage > 0}>Sửa</Button>
          <Button type="text" danger size="small">Kết thúc</Button>
        </Space>
      )
    }
  ];

  const onFinish = (values: any) => {
    message.success('Đã tạo voucher thành công!');
    setOpen(false);
    form.resetFields();
  };

  return (
    <>
      <Card className="card-shadow border-none rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Input 
              placeholder="Tìm mã voucher..." 
              prefix={<Search size={16} className="text-gray-400" />}
              className="w-64"
            />
          </div>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            Tạo Voucher
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={mockVouchers}
          className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500"
          pagination={false}
        />
      </Card>

      <Drawer
        title="Tạo Voucher mới"
        width={500}
        onClose={() => setOpen(false)}
        open={open}
        extra={
          <Space>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="primary" onClick={() => form.submit()}>Lưu Voucher</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: 'percent', limitToggle: false }}>
          <Card size="small" className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                <TagIcon size={24} />
              </div>
              <div>
                <div className="font-bold text-lg text-blue-900">PREVIEW MÃ VOUCHER</div>
                <div className="text-sm text-blue-700">Hiển thị trực tiếp cho khách hàng trên trang sản phẩm</div>
              </div>
            </div>
          </Card>

          <Form.Item name="code" label="Mã Voucher (Tối đa 10 ký tự)" rules={[{ required: true }]}>
            <Input size="large" maxLength={10} placeholder="VD: SALE50" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Form.Item name="type" label="Loại giảm giá">
            <Radio.Group 
              optionType="button" 
              buttonStyle="solid" 
              className="w-full flex"
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <Radio.Button value="percent" className="flex-1 text-center"><Percent size={14} className="inline mr-1"/>Theo %</Radio.Button>
              <Radio.Button value="fixed" className="flex-1 text-center"><DollarSign size={14} className="inline mr-1"/>Số tiền cố định</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item name="value" label="Mức giảm" rules={[{ required: true }]} className="flex-1">
              <InputNumber size="large" className="w-full" min={1} max={discountType === 'percent' ? 100 : undefined} addonAfter={discountType === 'percent' ? '%' : '₫'} />
            </Form.Item>
            {discountType === 'percent' && (
              <Form.Item name="maxDiscount" label="Giảm tối đa (₫)" className="flex-1">
                <InputNumber size="large" className="w-full" min={0} />
              </Form.Item>
            )}
          </div>

          <Form.Item name="minOrder" label="Giá trị đơn hàng tối thiểu (₫)" rules={[{ required: true }]}>
            <InputNumber size="large" className="w-full" min={0} />
          </Form.Item>

          <Form.Item label="Thời gian hiệu lực" rules={[{ required: true }]}>
            <RangePicker size="large" showTime className="w-full" />
          </Form.Item>

          <Form.Item name="limitToggle" label="Giới hạn số lượt sử dụng" valuePropName="checked">
            <Switch />
          </Form.Item>

          {/* Conditional field for limit */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.limitToggle !== currentValues.limitToggle}>
            {({ getFieldValue }) =>
              getFieldValue('limitToggle') ? (
                <Form.Item name="limit" label="Tổng số lượt">
                  <InputNumber size="large" className="w-full" min={1} />
                </Form.Item>
              ) : null
            }
          </Form.Item>

        </Form>
      </Drawer>
    </>
  );
}
