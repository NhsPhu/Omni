import React, { useState } from 'react';
import { Card, Table, Button, Tag, Space, Drawer, Form, Input, Row, Col, Typography, message, Badge } from 'antd';
import { Store, Check, X, FileText, Mail, Phone, MapPin } from 'lucide-react';

const { TextArea } = Input;
const { Title, Text } = Typography;

const mockApplications = Array.from({ length: 15 }).map((_, i) => ({
  key: i.toString(),
  id: `APP-2026${String(i).padStart(3, '0')}`,
  shopName: `Cửa hàng Demo ${i + 1}`,
  owner: `Chủ shop ${i + 1}`,
  email: `shop${i+1}@example.com`,
  phone: `0987654${String(i).padStart(3, '0')}`,
  address: `${100 + i} Nguyễn Văn Linh, Đà Nẵng`,
  status: i < 3 ? 'pending' : (i < 8 ? 'approved' : 'rejected'),
  date: `23/05/2026 09:${String(i).padStart(2, '0')}`,
  documentUrl: '#',
}));

export default function Vendors() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rejecting, setRejecting] = useState(false);
  const [form] = Form.useForm();

  const handleApprove = () => {
    message.success(`Đã duyệt hồ sơ ${selectedApp.shopName}!`);
    setDrawerOpen(false);
  };

  const handleReject = () => {
    form.validateFields().then(values => {
      message.success(`Đã từ chối hồ sơ và gửi email lý do: ${values.reason}`);
      setRejecting(false);
      setDrawerOpen(false);
    });
  };

  const columns = [
    { title: 'Mã hồ sơ', dataIndex: 'id', key: 'id', render: (t: string) => <span className="font-mono">{t}</span> },
    { 
      title: 'Tên cửa hàng', 
      key: 'shop',
      render: (_: any, r: any) => (
        <div>
          <div className="font-semibold text-gray-800">{r.shopName}</div>
          <div className="text-xs text-gray-500">{r.owner}</div>
        </div>
      )
    },
    { title: 'Ngày nộp', dataIndex: 'date', key: 'date' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: any = {
          pending: { color: 'processing', text: 'Chờ duyệt' },
          approved: { color: 'success', text: 'Đã duyệt' },
          rejected: { color: 'error', text: 'Từ chối' },
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Button size="small" type="primary" ghost onClick={() => { setSelectedApp(record); setDrawerOpen(true); }}>
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 m-0">Duyệt người bán (Vendors)</h1>
        <p className="text-gray-500">Quản lý và xét duyệt các hồ sơ đăng ký trở thành nhà bán hàng trên hệ thống.</p>
      </div>

      <Row gutter={24} className="mb-6">
        <Col span={8}>
          <Card className="card-shadow border-none rounded-xl">
            <div className="text-gray-500 mb-1">Hồ sơ chờ duyệt</div>
            <div className="text-3xl font-bold text-blue-600">{mockApplications.filter(a => a.status === 'pending').length}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="card-shadow border-none rounded-xl">
            <div className="text-gray-500 mb-1">Đã duyệt (Tháng này)</div>
            <div className="text-3xl font-bold text-green-600">{mockApplications.filter(a => a.status === 'approved').length}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="card-shadow border-none rounded-xl">
            <div className="text-gray-500 mb-1">Từ chối</div>
            <div className="text-3xl font-bold text-red-600">{mockApplications.filter(a => a.status === 'rejected').length}</div>
          </Card>
        </Col>
      </Row>

      <Card className="card-shadow border-none rounded-xl">
        <Table 
          columns={columns} 
          dataSource={mockApplications}
          className="[&_.ant-table-thead_th]:!bg-gray-50"
        />
      </Card>

      <Drawer
        title={<div className="flex items-center gap-2"><Store size={20}/> Chi tiết hồ sơ</div>}
        width={600}
        onClose={() => { setDrawerOpen(false); setRejecting(false); }}
        open={drawerOpen}
        extra={
          selectedApp?.status === 'pending' && !rejecting && (
            <Space>
              <Button danger onClick={() => setRejecting(true)}>Từ chối</Button>
              <Button type="primary" className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>Duyệt hồ sơ</Button>
            </Space>
          )
        }
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Trạng thái hiện tại</div>
                {selectedApp.status === 'pending' && <Badge status="processing" text={<span className="font-semibold text-blue-800 text-lg">Chờ duyệt</span>} />}
                {selectedApp.status === 'approved' && <Badge status="success" text={<span className="font-semibold text-green-800 text-lg">Đã duyệt</span>} />}
                {selectedApp.status === 'rejected' && <Badge status="error" text={<span className="font-semibold text-red-800 text-lg">Đã từ chối</span>} />}
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600">Ngày gửi</div>
                <div className="font-medium">{selectedApp.date}</div>
              </div>
            </div>

            <Card size="small" title="Thông tin Cửa hàng" className="border-gray-200">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="text-gray-500 text-xs">Tên cửa hàng</div>
                  <div className="font-medium text-gray-800">{selectedApp.shopName}</div>
                </Col>
                <Col span={12}>
                  <div className="text-gray-500 text-xs">Người đại diện</div>
                  <div className="font-medium text-gray-800">{selectedApp.owner}</div>
                </Col>
                <Col span={12}>
                  <div className="text-gray-500 text-xs">Email liên hệ</div>
                  <div className="font-medium flex items-center gap-1"><Mail size={14}/> {selectedApp.email}</div>
                </Col>
                <Col span={12}>
                  <div className="text-gray-500 text-xs">Số điện thoại</div>
                  <div className="font-medium flex items-center gap-1"><Phone size={14}/> {selectedApp.phone}</div>
                </Col>
                <Col span={24}>
                  <div className="text-gray-500 text-xs">Địa chỉ kho hàng</div>
                  <div className="font-medium flex items-center gap-1"><MapPin size={14}/> {selectedApp.address}</div>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="Tài liệu đính kèm (Xác minh danh tính)" className="border-gray-200">
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">GiayPhepKinhDoanh_DKKD.pdf</div>
                    <div className="text-xs text-gray-500">2.4 MB</div>
                  </div>
                </div>
                <Button size="small">Tải xuống / Xem</Button>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded bg-gray-50 mt-2">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">CCCD_MatTruoc_MatSau.jpg</div>
                    <div className="text-xs text-gray-500">1.8 MB</div>
                  </div>
                </div>
                <Button size="small">Tải xuống / Xem</Button>
              </div>
            </Card>

            {rejecting && (
              <Card className="border-red-200 bg-red-50 mt-6">
                <Form form={form} layout="vertical">
                  <Form.Item name="reason" label={<span className="text-red-700 font-semibold">Lý do từ chối (Gửi Email cho KH)</span>} rules={[{ required: true }]}>
                    <TextArea rows={4} placeholder="Vui lòng cho biết lý do cụ thể để người bán có thể bổ sung hồ sơ..." />
                  </Form.Item>
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => setRejecting(false)}>Hủy bỏ</Button>
                    <Button danger type="primary" onClick={handleReject}>Xác nhận Từ chối</Button>
                  </div>
                </Form>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
