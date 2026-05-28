import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Tag, Space, Modal, Form, InputNumber, Select, message, Tooltip as AntTooltip } from 'antd';
import { Wallet as WalletIcon, ArrowDownRight, ArrowUpRight, History, Info, Building2 } from 'lucide-react';
import api from '../../lib/axios';

const { Option } = Select;

import dayjs from 'dayjs';

export default function Wallet() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchWalletData = async () => {
    try {
      const res = await api.get('/vendor/wallet');
      if (res.data) {
        setBalance(res.data.balance || 0);
        if (res.data.transactions) {
          setTransactions(res.data.transactions.map((t: any) => ({
            key: t.id,
            id: t.id.split('-')[0].toUpperCase(),
            date: dayjs(t.createdAt).format('DD/MM/YYYY HH:mm'),
            desc: t.description,
            type: t.type === 'CREDIT' ? 'income' : t.description === 'WITHDRAWAL' ? 'withdraw' : 'fee',
            amount: t.type === 'CREDIT' ? t.amount : -t.amount,
          })));
        }
      }
    } catch (e) {
      console.error("Wallet error:", e);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    { title: 'Mã GD', dataIndex: 'id', key: 'id', render: (text: string) => <span className="font-mono text-xs">{text}</span> },
    { title: 'Thời gian', dataIndex: 'date', key: 'date', render: (text: string) => <span className="text-gray-500">{text}</span> },
    { title: 'Mô tả', dataIndex: 'desc', key: 'desc' },
    { 
      title: 'Loại', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => {
        const config: Record<string, { color: string, text: string }> = {
          income: { color: 'success', text: 'Tiền vào' },
          fee: { color: 'warning', text: 'Phí Omni' },
          withdraw: { color: 'error', text: 'Rút tiền' },
        };
        return <Tag color={config[type].color}>{config[type].text}</Tag>;
      }
    },
    { 
      title: 'Số tiền', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (val: number, record: any) => (
        <span className={`font-semibold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {val > 0 ? '+' : ''}{formatCurrency(val)}
        </span>
      )
    },
    { 
      title: 'Số dư biến động', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (val: number, record: any) => (
        <span className={`font-semibold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {val > 0 ? '+' : ''}{formatCurrency(val)}
        </span>
      )
    }
  ];

  const handleWithdraw = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/vendor/wallet/withdraw', { amount: values.amount, bank: values.bank });
      message.success('Đã gửi yêu cầu rút tiền thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchWalletData();
    } catch (e) {
      console.error(e);
      message.error("Có lỗi xảy ra khi rút tiền!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 m-0">Ví nội bộ & Tài chính</h1>
        <Button type="primary" size="large" onClick={() => setIsModalOpen(true)}>Yêu cầu rút tiền</Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="card-shadow border-none rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <WalletIcon size={18} />
              <span>Số dư khả dụng</span>
            </div>
            <div className="text-4xl font-bold mb-4">{formatCurrency(balance)}</div>
            <div className="text-sm opacity-80">Có thể dùng để rút về thẻ ngân hàng hoặc thanh toán dịch vụ Omni</div>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card className="card-shadow border-none rounded-xl h-full">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <span>Tiền tạm giữ</span>
              <AntTooltip title="Tiền từ các đơn hàng đã giao nhưng khách hàng chưa bấm 'Đã nhận hàng' (hoặc trong 3 ngày chờ hoàn trả).">
                <Info size={14} className="cursor-help" />
              </AntTooltip>
            </div>
            <div className="text-3xl font-bold text-gray-800">{formatCurrency(8500000)}</div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="card-shadow border-none rounded-xl h-full">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <span>Doanh thu dự kiến tháng này</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{formatCurrency(124300000)}</div>
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <History size={18} />
            <span>Lịch sử giao dịch</span>
          </div>
        }
        className="card-shadow border-none rounded-xl"
        extra={
          <Space>
            <Select defaultValue="all" style={{ width: 120 }}>
              <Option value="all">Tất cả</Option>
              <Option value="income">Tiền vào</Option>
              <Option value="withdraw">Rút tiền</Option>
              <Option value="fee">Phí</Option>
            </Select>
            <Button>Xuất sao kê</Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={transactions}
          className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Yêu cầu rút tiền"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleWithdraw}
        okText="Xác nhận rút tiền"
        cancelText="Hủy bỏ"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-6 flex justify-between items-center">
            <span className="text-blue-800 font-medium">Số dư khả dụng</span>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(balance)}</span>
          </div>
          
          <Form.Item name="amount" label="Số tiền muốn rút" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <InputNumber 
              className="w-full" 
              size="large" 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
              addonAfter="VND"
              max={balance}
            />
          </Form.Item>

          <Form.Item name="bank" label="Rút về tài khoản" rules={[{ required: true, message: 'Vui lòng chọn ngân hàng' }]}>
            <Select size="large">
              <Option value="vcb">
                <div className="flex items-center gap-2">
                  <Building2 size={16} />
                  <span>Vietcombank - 0123456789 - NGUYEN VAN A</span>
                </div>
              </Option>
              <Option value="mbb">
                <div className="flex items-center gap-2">
                  <Building2 size={16} />
                  <span>MB Bank - 9876543210 - NGUYEN VAN A</span>
                </div>
              </Option>
            </Select>
          </Form.Item>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
            Lưu ý: Lệnh rút tiền sẽ được xử lý trong vòng 24h làm việc. Phí rút tiền: Miễn phí.
          </div>
        </Form>
      </Modal>
    </div>
  );
}
