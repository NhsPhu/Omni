import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Drawer, Form, Input, Row, Col, Typography, message, Badge } from 'antd';
import { Store, Check, X, FileText, Mail, Phone, MapPin } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function Vendors() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rejecting, setRejecting] = useState(false);
  const [form] = Form.useForm();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const loadShops = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/shops');
      setShops(res.data.content || []);
      setTotal(res.data.totalElements || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleApprove = async () => {
    try {
      await api.patch(`/admin/shops/${selectedApp.id}/approve?approve=true`);
      message.success(`Đã duyệt hồ sơ ${selectedApp.name}!`);
      setDrawerOpen(false);
      loadShops();
    } catch (e) {
      message.error('Lỗi duyệt hồ sơ');
    }
  };

  const handleReject = () => {
    form.validateFields().then(async values => {
      try {
        await api.patch(`/admin/shops/${selectedApp.id}/approve?approve=false`);
        message.success(`Đã từ chối hồ sơ và ghi lại lý do.`);
        setRejecting(false);
        setDrawerOpen(false);
        loadShops();
      } catch (e) {
        message.error('Lỗi khi từ chối hồ sơ');
      }
    });
  };

  const columns = [
    { title: 'Mã hồ sơ', dataIndex: 'id', key: 'id', render: (t: string) => <span className="font-mono">{t}</span> },
    { 
      title: 'Tên cửa hàng', 
      key: 'name',
      render: (_: any, r: any) => (
        <div>
          <div className="font-semibold text-gray-800">{r.name}</div>
        </div>
      )
    },
    { 
      title: 'Ngày nộp', 
      key: 'createdAt',
      render: (_: any, r: any) => dayjs(r.createdAt).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: any = {
          PENDING_REVIEW: { color: 'processing', text: 'Chờ duyệt' },
          ACTIVE: { color: 'success', text: 'Đã duyệt' },
          REJECTED: { color: 'error', text: 'Từ chối' },
        };
        return <Tag color={config[status]?.color || 'default'}>{config[status]?.text || status}</Tag>;
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
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight m-0">Duyệt người bán (Vendors)</h1>
          <p className="text-gray-500 mt-1 font-medium">Quản lý và xét duyệt các hồ sơ đăng ký trở thành nhà bán hàng trên hệ thống.</p>
        </div>
      </div>

      <Row gutter={24} className="mb-6">
        <Col span={8}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-gray-600 font-medium mb-1">Hồ sơ chờ duyệt</div>
            <div className="text-4xl font-extrabold text-blue-600 tracking-tight">{shops.filter((a: any) => a.status === 'PENDING_REVIEW').length}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="text-gray-600 font-medium mb-1">Đã duyệt (Tổng)</div>
            <div className="text-4xl font-extrabold text-emerald-600 tracking-tight">{shops.filter((a: any) => a.status === 'ACTIVE').length}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="border-0 rounded-3xl overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative group bg-gradient-to-br from-rose-50 to-red-50">
            <div className="text-gray-600 font-medium mb-1">Từ chối</div>
            <div className="text-4xl font-extrabold text-rose-600 tracking-tight">{shops.filter((a: any) => a.status === 'REJECTED').length}</div>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 rounded-3xl shadow-sm" styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>
        <Table 
          columns={columns} 
          dataSource={shops}
          rowKey="id"
          loading={loading}
          className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!font-semibold"
          pagination={{ total: total, pageSize: 20 }}
        />
      </Card>

      <Drawer
        title={<div className="flex items-center gap-2"><Store size={20}/> Chi tiết hồ sơ</div>}
        width={600}
        onClose={() => { setDrawerOpen(false); setRejecting(false); }}
        open={drawerOpen}
        extra={
          selectedApp?.status === 'PENDING_REVIEW' && !rejecting && (
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
                {selectedApp.status === 'PENDING_REVIEW' && <Badge status="processing" text={<span className="font-semibold text-blue-800 text-lg">Chờ duyệt</span>} />}
                {selectedApp.status === 'ACTIVE' && <Badge status="success" text={<span className="font-semibold text-green-800 text-lg">Đã duyệt</span>} />}
                {selectedApp.status === 'REJECTED' && <Badge status="error" text={<span className="font-semibold text-red-800 text-lg">Đã từ chối</span>} />}
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-600">Ngày gửi</div>
                <div className="font-medium">{dayjs(selectedApp.createdAt).format('DD/MM/YYYY')}</div>
              </div>
            </div>

            <Card size="small" title="Thông tin Cửa hàng" className="border-gray-200">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="text-gray-500 text-xs">Tên cửa hàng</div>
                  <div className="font-medium text-gray-800">{selectedApp.name}</div>
                </Col>
                <Col span={12}>
                  <div className="text-gray-500 text-xs">Mô tả</div>
                  <div className="font-medium text-gray-800">{selectedApp.description || 'Chưa cung cấp'}</div>
                </Col>
                <Col span={12}>
                  <div className="text-gray-500 text-xs">Người đại diện</div>
                  <div className="font-medium text-gray-800">{selectedApp.ownerId}</div>
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
    </div>
  );
}
