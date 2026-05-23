import React, { useState } from 'react';
import { Table, Card, Button, Input, Select, Tag, Space, Dropdown, Modal, message } from 'antd';
import { Search, Plus, MoreVertical, Edit2, Copy, EyeOff, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const mockProducts = Array.from({ length: 25 }).map((_, i) => ({
  key: i.toString(),
  id: `PROD-${2024001 + i}`,
  name: i % 2 === 0 ? `Tai nghe Bluetooth Không Dây Sony WH-1000XM${i % 5 + 3}` : `Bàn phím cơ Keychron K${i % 10 + 2} Pro`,
  category: i % 2 === 0 ? 'Âm thanh' : 'Bàn phím',
  price: 2500000 + i * 150000,
  stock: i % 5 === 0 ? 0 : 45 + i * 2,
  sales: 120 + i * 15,
  status: i % 7 === 0 ? 'draft' : i % 8 === 0 ? 'hidden' : 'active',
  image: `https://picsum.photos/seed/${i}/80/80`
}));

export default function ProductList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <img src={record.image} alt={text} className="w-10 h-10 rounded border border-gray-200 object-cover" />
          <div>
            <div className="font-medium text-gray-800 line-clamp-1 max-w-[200px]" title={text}>{text}</div>
            <div className="text-xs text-gray-500">{record.id}</div>
          </div>
        </div>
      ),
    },
    { title: 'Danh mục', dataIndex: 'category', key: 'category' },
    { 
      title: 'Giá bán', 
      dataIndex: 'price', 
      key: 'price',
      render: (val: number) => <span className="font-medium">{formatCurrency(val)}</span>
    },
    { 
      title: 'Kho', 
      dataIndex: 'stock', 
      key: 'stock',
      render: (val: number) => (
        <span className={val === 0 ? 'text-red-500 font-semibold' : ''}>
          {val === 0 ? 'Hết hàng' : val}
        </span>
      )
    },
    { title: 'Đã bán', dataIndex: 'sales', key: 'sales' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string, text: string }> = {
          active: { color: 'success', text: 'Đang bán' },
          draft: { color: 'default', text: 'Bản nháp' },
          hidden: { color: 'warning', text: 'Đã ẩn' },
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
      }
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: () => (
        <Dropdown menu={{ items: [
          { key: 'edit', icon: <Edit2 size={14} />, label: 'Chỉnh sửa' },
          { key: 'copy', icon: <Copy size={14} />, label: 'Sao chép' },
          { key: 'hide', icon: <EyeOff size={14} />, label: 'Ẩn sản phẩm' },
          { type: 'divider' },
          { key: 'delete', icon: <Trash2 size={14} />, label: 'Xóa', danger: true },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreVertical size={16} />} />
        </Dropdown>
      )
    }
  ];

  return (
    <Card className="card-shadow border-none rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-1 gap-2">
          <Input 
            placeholder="Tìm theo tên, mã SKU..." 
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-xs"
          />
          <Select defaultValue="all" className="w-32">
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="active">Đang bán</Option>
            <Option value="draft">Bản nháp</Option>
            <Option value="hidden">Đã ẩn</Option>
          </Select>
          <Button icon={<Filter size={16} />}>Lọc thêm</Button>
        </div>
        <div className="flex gap-2">
          {selectedRowKeys.length > 0 && (
            <Dropdown menu={{ items: [
              { key: 'hide', label: 'Ẩn các sản phẩm đã chọn' },
              { key: 'show', label: 'Hiện các sản phẩm đã chọn' },
              { key: 'delete', label: 'Xóa', danger: true },
            ]}}>
              <Button>Thao tác ({selectedRowKeys.length})</Button>
            </Dropdown>
          )}
          <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/products/create')}>
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <Table 
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns} 
        dataSource={mockProducts}
        className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500"
        pagination={{ total: 25, pageSize: 10, showSizeChanger: true }}
      />
    </Card>
  );
}
