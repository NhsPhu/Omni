import React, { useState } from 'react';
import { Card, Table, Button, Tag, Input, Space, Modal, Form, Select, message, Upload, Row, Col } from 'antd';
import { Search, Download, CheckCircle, Clock, Upload as UploadIcon, Building2, Copy } from 'lucide-react';

const { Option } = Select;

const mockWithdrawals = [
  { key: '1', id: 'WD-001', vendor: 'Apple Store VN', bank: 'Vietcombank', account: '0123456789', owner: 'NGUYEN VAN A', amount: 15000000, date: '23/05/2026 09:30', status: 'pending' },
  { key: '2', id: 'WD-002', vendor: 'Keychron Official', bank: 'MB Bank', account: '9876543210', owner: 'TRAN MINH B', amount: 4500000, date: '22/05/2026 14:15', status: 'completed', txId: 'FT202605221234' },
  { key: '3', id: 'WD-003', vendor: 'Sony Center', bank: 'Techcombank', account: '1903456789012', owner: 'LE THI C', amount: 28000000, date: '23/05/2026 10:45', status: 'pending' },
];

export default function Withdrawals() {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã copy!');
  };

  const handleApprove = () => {
    form.validateFields().then(values => {
      message.success(`Đã cập nhật trạng thái thành công. TX ID: ${values.txId}`);
      setModalOpen(false);
      form.resetFields();
    });
  };

  const columns = [
    { title: 'Mã GD', dataIndex: 'id', key: 'id', render: (t: string) => <span className="font-mono text-xs">{t}</span> },
    { title: 'Gian hàng', dataIndex: 'vendor', key: 'vendor', render: (t: string) => <span className="font-semibold text-blue-600">{t}</span> },
    { 
      title: 'Tài khoản nhận', 
      key: 'bankInfo',
      render: (_: any, r: any) => (
        <div className="text-sm">
          <div className="font-bold flex items-center gap-1"><Building2 size={12}/> {r.bank}</div>
          <div className="text-gray-600 group flex items-center gap-1">
            {r.account} - {r.owner} 
            <Copy size={12} className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(`${r.account}`)}/>
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
    { title: 'Ngày yêu cầu', dataIndex: 'date', key: 'date', render: (t: string) => <span className="text-gray-500 text-sm">{t}</span> },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => {
        if (status === 'completed') return (
          <div>
            <Tag color="success" icon={<CheckCircle size={14} className="mr-1"/>}>Hoàn thành</Tag>
            <div className="text-[10px] text-gray-400 mt-1">Ref: {record.txId}</div>
          </div>
        );
        return <Tag color="warning" icon={<Clock size={14} className="mr-1"/>}>Chờ chuyển khoản</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => {
        if (record.status === 'completed') return null;
        return <Button type="primary" size="small" onClick={() => { setSelectedRecord(record); setModalOpen(true); }}>Cập nhật</Button>;
      }
    }
  ];

  return (
    <>
      <Card className="card-shadow border-none rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 m-0">Duyệt lệnh rút tiền</h1>
          <Space>
            <Button icon={<Download size={16} />} onClick={() => message.info('Đang xuất file Excel chuẩn format cho Vietcombank/MBBank...')}>
              Export file chuyển khoản lô
            </Button>
            <Button type="primary" icon={<UploadIcon size={16} />} onClick={() => message.info('Tính năng đang phát triển')}>
              Import kết quả giao dịch
            </Button>
          </Space>
        </div>

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
          dataSource={mockWithdrawals}
          className="[&_.ant-table-thead_th]:!bg-gray-50"
          pagination={false}
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
                <Col span={16} className="font-bold text-blue-600">{selectedRecord.vendor}</Col>
                <Col span={8} className="text-gray-500">Số tiền rút:</Col>
                <Col span={16} className="font-bold text-red-600">{formatCurrency(selectedRecord.amount)}</Col>
                <Col span={8} className="text-gray-500">Thông tin nhận:</Col>
                <Col span={16}>
                  <strong>{selectedRecord.bank}</strong><br/>
                  {selectedRecord.account} - {selectedRecord.owner}
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
    </>
  );
}
