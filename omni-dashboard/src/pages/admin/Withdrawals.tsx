import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Input, Space, Modal, Form, Select, message, Upload, Row, Col } from 'antd';
import { Search, Download, CheckCircle, Clock, Upload as UploadIcon, Building2, Copy } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

const { Option } = Select;

export default function Withdrawals() {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/finance/withdrawals');
      setWithdrawals(res.data.content || []);
      setTotal(res.data.totalElements || 0);
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi tải lệnh rút tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã copy!');
  };

  const handleApprove = () => {
    form.validateFields().then(async values => {
      try {
        await api.patch(`/admin/finance/withdrawals/${selectedRecord.id}/approve`, { txId: values.txId });
        message.success(`Đã cập nhật trạng thái thành công. TX ID: ${values.txId}`);
        setModalOpen(false);
        form.resetFields();
        loadWithdrawals();
      } catch (e) {
        message.error('Lỗi cập nhật trạng thái lệnh rút tiền');
      }
    });
  };

  const columns = [
    { title: 'Mã GD', dataIndex: 'id', key: 'id', render: (t: string) => <span className="font-mono text-xs">{t}</span> },
    { title: 'Gian hàng', dataIndex: 'shopId', key: 'shopId', render: (t: string) => <span className="font-semibold text-blue-600">{t}</span> },
    { 
      title: 'Tài khoản nhận', 
      key: 'bankInfo',
      render: (_: any, r: any) => (
        <div className="text-sm">
          <div className="font-bold flex items-center gap-1"><Building2 size={12}/> {r.bankName}</div>
          <div className="text-gray-600 group flex items-center gap-1">
            {r.bankAccountNumber} - {r.bankAccountName} 
            <Copy size={12} className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(`${r.bankAccountNumber}`)}/>
          </div>
        </div>
      )
    },
    { 
      title: 'Số tiền', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (val: number) => <span className="font-bold text-red-600">{formatCurrency(val)}</span>
    },
    { 
      title: 'Ngày yêu cầu', 
      key: 'createdAt', 
      render: (_: any, r: any) => <span className="text-gray-500 text-sm">{dayjs(r.createdAt).format('DD/MM/YYYY HH:mm')}</span> 
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => {
        if (status === 'COMPLETED') return (
          <div>
            <Tag color="success" icon={<CheckCircle size={14} className="mr-1"/>}>Hoàn thành</Tag>
            <div className="text-[10px] text-gray-400 mt-1">Ref: {record.adminNote}</div>
          </div>
        );
        return <Tag color="warning" icon={<Clock size={14} className="mr-1"/>}>Chờ chuyển khoản</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => {
        if (record.status === 'COMPLETED') return null;
        return <Button type="primary" size="small" onClick={() => { setSelectedRecord(record); setModalOpen(true); }}>Cập nhật</Button>;
      }
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight m-0">Duyệt lệnh rút tiền</h1>
          <p className="text-gray-500 mt-1 font-medium">Quản lý và đối soát các yêu cầu rút tiền từ ví của nhà bán hàng.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Space>
            <Button icon={<Download size={16} />} className="rounded-xl" onClick={() => message.info('Đang xuất file Excel chuẩn format cho Vietcombank/MBBank...')}>
              Export file
            </Button>
            <Button type="primary" className="rounded-xl shadow-md" icon={<UploadIcon size={16} />} onClick={() => message.info('Tính năng đang phát triển')}>
              Import kết quả
            </Button>
          </Space>
        </div>
      </div>

      <Card className="border-0 rounded-3xl shadow-sm" styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>

        <div className="flex gap-4 mb-4">
          <Input placeholder="Tìm theo mã GD, tên gian hàng, số TK..." prefix={<Search size={16} className="text-gray-400" />} style={{ width: 350 }} />
          <Select defaultValue="pending" style={{ width: 200 }}>
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="pending">Chờ chuyển khoản</Option>
            <Option value="completed">Đã hoàn thành</Option>
          </Select>
        </div>

        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg text-sm mb-4">
          💡 <strong>Quy trình xử lý:</strong> 1. Export file danh sách chờ chuyển khoản ➔ 2. Upload file lên hệ thống Ngân hàng doanh nghiệp để chuyển lô ➔ 3. Quay lại màn hình này cập nhật trạng thái hoặc Import file kết quả từ ngân hàng.
        </div>

        <Table 
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
          }}
          columns={columns} 
          dataSource={withdrawals}
          rowKey="id"
          loading={loading}
          className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!font-semibold"
          pagination={{ total: total, pageSize: 20 }}
        />
      </Card>

      <Modal
        title="Xác nhận đã chuyển khoản"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleApprove}
        okText="Lưu & Thông báo Vendor"
        okButtonProps={{ className: 'bg-green-600 hover:bg-green-700' }}
      >
        {selectedRecord && (
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded mb-4 text-sm border border-gray-200">
              <Row gutter={[16, 8]}>
                <Col span={8} className="text-gray-500">Gian hàng:</Col>
                <Col span={16} className="font-bold text-blue-600">{selectedRecord.shopId}</Col>
                <Col span={8} className="text-gray-500">Số tiền rút:</Col>
                <Col span={16} className="font-bold text-red-600">{formatCurrency(selectedRecord.amount)}</Col>
                <Col span={8} className="text-gray-500">Thông tin nhận:</Col>
                <Col span={16}>
                  <strong>{selectedRecord.bankName}</strong><br/>
                  {selectedRecord.bankAccountNumber} - {selectedRecord.bankAccountName}
                </Col>
              </Row>
            </div>

            <Form form={form} layout="vertical">
              <Form.Item name="txId" label="Mã tham chiếu / Mã giao dịch Ngân hàng (Transaction ID)" rules={[{ required: true, message: 'Bắt buộc nhập mã tham chiếu để đối soát' }]}>
                <Input size="large" placeholder="VD: FT20260523000123" />
              </Form.Item>
              <div className="text-xs text-gray-500">
                Sau khi lưu, hệ thống sẽ tự động cập nhật trạng thái "Hoàn thành" và gửi thông báo biến động số dư cho Cửa hàng.
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
