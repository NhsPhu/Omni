import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Select, Tag, Space, Dropdown, Modal, message } from 'antd';
import { Search, Plus, MoreVertical, Edit2, Copy, EyeOff, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

const { Option } = Select;

export default function ProductList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { shopId } = useAuthStore();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/vendor/products?size=100`);
      setProducts(res.data.content.map((p: any) => ({
        key: p.id,
        id: p.id,
        shortId: p.id.split('-')[0].toUpperCase(),
        name: p.name,
        category: p.categoryName || p.categoryId,
        price: p.price,
        stock: p.stock,
        sales: 0,
        status: p.status.toLowerCase(),
        image: p.image || `https://picsum.photos/seed/${p.id}/80/80`
      })));
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/vendor/products/${id}`);
          message.success('Đã xóa sản phẩm');
          fetchProducts();
        } catch (error) {
          message.error('Không thể xóa sản phẩm');
        }
      }
    });
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'HIDDEN' : 'ACTIVE';
    try {
      await api.patch(`/vendor/products/${id}/status?status=${newStatus}`);
      message.success(`Đã ${newStatus === 'ACTIVE' ? 'hiện' : 'ẩn'} sản phẩm`);
      fetchProducts();
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

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
            <div className="text-xs text-gray-500">{record.shortId}</div>
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
      render: (_: any, record: any) => (
        <Dropdown menu={{ items: [
          { key: 'edit', icon: <Edit2 size={14} />, label: 'Chỉnh sửa', onClick: () => navigate(`/products/edit/${record.id}`) },
          { key: 'status', icon: <EyeOff size={14} />, label: record.status === 'active' ? 'Ẩn sản phẩm' : 'Hiện sản phẩm', onClick: () => handleUpdateStatus(record.id, record.status) },
          { type: 'divider' },
          { key: 'delete', icon: <Trash2 size={14} />, label: 'Xóa', danger: true, onClick: () => handleDelete(record.id) },
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
        dataSource={products}
        loading={loading}
        className="[&_.ant-table-thead_th]:!bg-gray-50 [&_.ant-table-thead_th]:!text-gray-500"
        pagination={{ total: products.length, pageSize: 10, showSizeChanger: true }}
      />
    </Card>
  );
}
