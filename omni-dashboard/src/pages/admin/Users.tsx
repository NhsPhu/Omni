import React, { useState } from 'react';
import { Card, Table, Button, Tag, Input, Space, Dropdown, Modal, Form, Select, Avatar, Timeline, Drawer } from 'antd';
import { Search, MoreVertical, Ban, CheckCircle, Shield, User, History, Download } from 'lucide-react';

const { Option } = Select;
const { TextArea } = Input;

const mockUsers = Array.from({ length: 20 }).map((_, i) => ({
  key: i.toString(),
  id: `USR-${1000 + i}`,
  name: `Người dùng ${i}`,
  email: `user${i}@example.com`,
  phone: `0901234${String(i).padStart(3, '0')}`,
  role: i === 0 ? 'Admin' : (i % 3 === 0 ? 'Vendor' : 'Customer'),
  status: i % 8 === 0 ? 'banned' : 'active',
  joined: `20/05/2026`,
}));

export default function Users() {
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar src={`https://api.dicebear.com/7.x/notionists/svg?seed=${record.name}`} />
          <div>
            <div className="font-medium text-gray-800">{record.name}</div>
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
        const colors: any = { Admin: 'red', Vendor: 'blue', Customer: 'default' };
        return <Tag color={colors[role]}>{role}</Tag>;
      }
    },
    { title: 'Ngày tham gia', dataIndex: 'joined', key: 'joined' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'} icon={status === 'active' ? <CheckCircle size={14} className="mr-1"/> : <Ban size={14} className="mr-1"/>}>
          {status === 'active' ? 'Hoạt động' : 'Bị khóa'}
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
          { key: 'ban', icon: <Ban size={14} />, label: record.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa', danger: record.status === 'active', onClick: () => { setSelectedUser(record); setBanModalOpen(true); } },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreVertical size={16} />} />
        </Dropdown>
      )
    }
  ];

  return (
    <>
      <Card className="card-shadow border-none rounded-xl">
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
          dataSource={mockUsers}
          className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500"
          pagination={{ total: 50, pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedUser?.status === 'active' ? "Khóa tài khoản người dùng" : "Mở khóa tài khoản"}
        open={banModalOpen}
        onCancel={() => setBanModalOpen(false)}
        onOk={() => { setBanModalOpen(false); form.resetFields(); }}
        okText="Xác nhận"
        okButtonProps={{ danger: selectedUser?.status === 'active' }}
      >
        <div className="mb-4 text-gray-600">
          Bạn đang thực hiện thao tác trên tài khoản <strong>{selectedUser?.name}</strong> ({selectedUser?.email}). 
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
              <Avatar size={64} src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedUser.name}`} />
              <div>
                <h3 className="text-lg font-bold m-0">{selectedUser.name}</h3>
                <div className="text-gray-500">{selectedUser.email}</div>
                <div className="mt-1">
                  <Tag color={selectedUser.status === 'active' ? 'success' : 'error'}>{selectedUser.status === 'active' ? 'Hoạt động' : 'Bị khóa'}</Tag>
                  <Tag color="blue">{selectedUser.role}</Tag>
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
    </>
  );
}
