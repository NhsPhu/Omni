import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Input, Space, Dropdown, Modal, Form, Select, Avatar, Timeline, Drawer, message } from 'antd';
import { Search, MoreVertical, Ban, CheckCircle, Shield, User, History, Download } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

const { Option } = Select;
const { TextArea } = Input;

export default function Users() {
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.content || []);
      setTotal(res.data.totalElements || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleBanUser = async () => {
    try {
      await api.patch(`/admin/users/${selectedUser.id}/ban?ban=${selectedUser.status === 'ACTIVE' ? 'true' : 'false'}`);
      message.success(selectedUser.status === 'ACTIVE' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      setBanModalOpen(false);
      form.resetFields();
      loadUsers();
    } catch (e) {
      message.error('Lỗi thao tác');
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar src={`https://api.dicebear.com/7.x/notionists/svg?seed=${record.fullName}`} />
          <div>
            <div className="font-medium text-gray-800">{record.fullName}</div>
            <div className="text-xs text-gray-500">{record.id}</div>
          </div>
        </div>
      ),
    },
    { title: 'Email / SĐT', key: 'contact', render: (_: any, r: any) => <div><div>{r.email}</div><div className="text-xs text-gray-500">{r.phone}</div></div> },
    { 
      title: 'Phân quyền', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => {
        const colors: any = { ADMIN: 'red', VENDOR: 'blue', CUSTOMER: 'default', USER: 'default' };
        return <Tag color={colors[role] || 'default'}>{role || 'USER'}</Tag>;
      }
    },
    { 
      title: 'Ngày tham gia', 
      key: 'createdAt',
      render: (_: any, r: any) => dayjs(r.createdAt).format('DD/MM/YYYY')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'error'} icon={status === 'ACTIVE' ? <CheckCircle size={14} className="mr-1"/> : <Ban size={14} className="mr-1"/>}>
          {status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
        </Tag>
      )
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: any, record: any) => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <User size={14} />, label: 'Xem chi tiết', onClick: () => { setSelectedUser(record); setDetailDrawerOpen(true); } },
          { key: 'ban', icon: <Ban size={14} />, label: record.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa', danger: record.status === 'ACTIVE', onClick: () => { setSelectedUser(record); setBanModalOpen(true); } },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreVertical size={16} />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight m-0">Quản lý Người dùng</h1>
          <p className="text-gray-500 mt-1 font-medium">Danh sách và phân quyền toàn bộ thành viên hệ thống.</p>
        </div>
      </div>

      <Card className="border-0 rounded-3xl shadow-sm" styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Input placeholder="Tìm theo tên, email, SĐT..." prefix={<Search size={16} className="text-gray-400" />} style={{ width: 300 }} />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Option value="all">Tất cả Role</Option>
              <Option value="vendor">Vendor</Option>
              <Option value="customer">Customer</Option>
            </Select>
            <Select defaultValue="all" style={{ width: 150 }}>
              <Option value="all">Tất cả Trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="banned">Bị khóa</Option>
            </Select>
          </div>
          <Button icon={<Download size={16} />}>Xuất dữ liệu</Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={users}
          rowKey="id"
          loading={loading}
          className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500 [&_.ant-table-thead_th]:!font-semibold"
          pagination={{ total: total, pageSize: 20 }}
        />
      </Card>

      <Modal
        title={selectedUser?.status === 'ACTIVE' ? "Khóa tài khoản người dùng" : "Mở khóa tài khoản"}
        open={banModalOpen}
        onCancel={() => setBanModalOpen(false)}
        onOk={handleBanUser}
        okText="Xác nhận"
        okButtonProps={{ danger: selectedUser?.status === 'ACTIVE' }}
      >
        <div className="mb-4 text-gray-600">
          Bạn đang thực hiện thao tác trên tài khoản <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email}). 
          Thao tác này sẽ được lưu vào Audit Log.
        </div>
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="Lý do (Bắt buộc)" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
            <TextArea rows={4} placeholder="Nhập lý do chi tiết để lưu vết..." />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết Người dùng"
        width={500}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <Avatar size={64} src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedUser.fullName}`} />
              <div>
                <h3 className="text-lg font-bold m-0">{selectedUser.fullName}</h3>
                <div className="text-gray-500">{selectedUser.email}</div>
                <div className="mt-1">
                  <Tag color={selectedUser.status === 'ACTIVE' ? 'success' : 'error'}>{selectedUser.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}</Tag>
                  <Tag color="blue">{selectedUser.role || 'USER'}</Tag>
                </div>
              </div>
            </div>

            <Card size="small" title={<div className="flex items-center gap-2"><History size={16}/><span>Lịch sử hoạt động / Audit Log</span></div>} className="border-gray-200">
              <Timeline
                items={[
                  { color: 'red', children: <><div className="font-semibold text-xs text-gray-500">23/05/2026 14:00</div><div>Bị khóa bởi Admin: <i>Phát hiện hành vi gian lận voucher</i></div></> },
                  { color: 'green', children: <><div className="font-semibold text-xs text-gray-500">21/05/2026 09:30</div><div>Tạo thành công gian hàng "Apple Store"</div></> },
                  { color: 'blue', children: <><div className="font-semibold text-xs text-gray-500">20/05/2026 10:15</div><div>Đăng ký tài khoản hệ thống</div></> },
                ]}
              />
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
