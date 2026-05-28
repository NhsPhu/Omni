import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Input, Space, Drawer, Form, Radio, InputNumber, DatePicker, Switch, message } from 'antd';
import { Search, Plus, Tag as TagIcon, Percent, DollarSign } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

const { RangePicker } = DatePicker;

export default function VoucherList() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState('percent');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { shopId } = useAuthStore();

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/vouchers');
      setVouchers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

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
          {record.discountType === 'PERCENT' || record.discountType === 'PERCENTAGE' ? `Giảm ${record.discountValue}%` : `Giảm ${formatCurrency(record.discountValue)}`}
        </span>
      )
    },
    { 
      title: 'Điều kiện', 
      key: 'condition',
      render: (_: any, record: any) => (
        <div className="text-xs text-gray-500">
          <div>Đơn tối thiểu: {formatCurrency(record.minOrderValue)}</div>
          {(record.discountType === 'PERCENT' || record.discountType === 'PERCENTAGE') && record.maxDiscountAmount && <div>Tối đa: {formatCurrency(record.maxDiscountAmount)}</div>}
        </div>
      )
    },
    { 
      title: 'Đã dùng', 
      key: 'usage',
      render: (_: any, record: any) => (
        <span>{record.usedCount} / {record.usageLimit > 0 ? record.usageLimit : '∞'}</span>
      )
    },
    { 
      title: 'Hạn sử dụng', 
      key: 'validTo',
      render: (_: any, record: any) => dayjs(record.validTo).format('DD/MM/YYYY')
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: any) => {
        const now = dayjs();
        const start = dayjs(record.validFrom);
        const end = dayjs(record.validTo);
        
        if (now.isBefore(start)) {
          return <Tag color="processing">Sắp diễn ra</Tag>;
        } else if (now.isAfter(end)) {
          return <Tag color="default">Đã kết thúc</Tag>;
        } else {
          return <Tag color="success">Đang chạy</Tag>;
        }
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

    const onFinish = async (values: any) => {
      try {
        const payload = {
          code: values.code,
          discountType: values.type === 'percent' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
          discountValue: values.value,
          minOrderValue: values.minOrder,
          maxDiscountAmount: values.maxDiscount,
          usageLimit: values.limitToggle ? values.limit : 0,
          validFrom: values.timeRange[0].toISOString(),
          validTo: values.timeRange[1].toISOString(),
        };
        await api.post('/vendor/vouchers', payload);
      message.success('Đã tạo voucher thành công!');
      setOpen(false);
      form.resetFields();
      loadVouchers();
    } catch (e) {
      console.error(e);
      message.error('Lỗi khi tạo voucher!');
    }
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
          dataSource={vouchers}
          rowKey="id"
          loading={loading}
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

          <Form.Item name="timeRange" label="Thời gian hiệu lực" rules={[{ required: true }]}>
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
