import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Tag, Space, Modal, Form, InputNumber, Select, message, Tooltip as AntTooltip } from 'antd';
import { Wallet as WalletIcon, ArrowDownRight, ArrowUpRight, History, Info, Building2 } from 'lucide-react';
import api from '../../lib/axios';

const { Option } = Select;

import dayjs from 'dayjs';

export default function Wallet() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchWalletData = async () => {
    try {
      const res = await api.get('/vendor/wallet');
      if (res.data) {
        setAvailableBalance(res.data.availableBalance || 0);
        setPendingBalance(res.data.pendingBalance || 0);
        setTotalEarned(res.data.totalEarned || 0);
        if (res.data.transactions) {
          setTransactions(res.data.transactions.content.map((t: any) => ({
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
      align: 'right' as const,
      render: (val: number, record: any) => (
        <span className={`font-bold text-base ${record.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
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
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-800 tracking-tight m-0">Ví nội bộ & Tài chính</h1>
          <p className="text-gray-500 mt-1 font-medium">Quản lý doanh thu, sao kê và yêu cầu rút tiền.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button type="primary" size="large" style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', borderRadius: '12px' }} onClick={() => setIsModalOpen(true)}>
            Yêu cầu rút tiền
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <div className="relative overflow-hidden rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
               style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)', color: 'white' }}>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white opacity-10 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 opacity-80">
                <div className="flex items-center gap-2">
                  <WalletIcon size={20} style={{ color: '#a5b4fc' }} />
                  <span className="font-semibold text-sm tracking-wider" style={{ color: '#e0e7ff' }}>SỐ DƯ KHẢ DỤNG</span>
                </div>
              </div>
              <div className="text-4xl lg:text-3xl xl:text-4xl font-black mb-2 tracking-tight" style={{ color: 'white' }}>{formatCurrency(availableBalance)}</div>
              <div className="text-sm mb-6" style={{ color: '#c7d2fe' }}>
                Khả dụng để rút tiền
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <Button 
                className="w-full h-12 text-base font-bold transition-all duration-300" 
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                onClick={() => setIsModalOpen(true)}
              >
                Rút tiền về ngân hàng
              </Button>
            </div>
          </div>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card className="h-full border-0 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col h-full justify-center p-2">
              <div className="flex items-center gap-3 mb-3 text-gray-500">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
                  <History size={20} />
                </div>
                <span className="font-medium text-base">Tiền tạm giữ</span>
                <AntTooltip title="Tiền từ các đơn hàng đã giao nhưng chờ xác nhận">
                  <Info size={16} className="cursor-help text-gray-400 hover:text-amber-500 transition-colors" />
                </AntTooltip>
              </div>
              <div className="text-3xl font-bold text-gray-800">{formatCurrency(pendingBalance)}</div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="h-full border-0 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col h-full justify-center p-2">
              <div className="flex items-center gap-3 mb-3 text-gray-500">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                  <ArrowUpRight size={20} />
                </div>
                <span className="font-medium text-base">Doanh thu dự kiến</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">{formatCurrency(totalEarned)}</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <History size={18} />
            <span className="font-bold text-gray-800">Lịch sử giao dịch</span>
          </div>
        }
        className="border-0 rounded-3xl shadow-sm"
        styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}
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
          className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!font-semibold"
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
            <span className="text-xl font-bold text-blue-600">{formatCurrency(availableBalance)}</span>
          </div>
          
          <Form.Item name="amount" label="Số tiền muốn rút" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
            <InputNumber 
              className="w-full" 
              size="large" 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
              addonAfter="VND"
              max={availableBalance}
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
