import React, { useState, useEffect } from 'react';
import { Card, Tree, Button, Modal, Form, Input, Switch, message, Upload, Popconfirm } from 'antd';
import { Plus, Edit2, EyeOff, Trash2, Upload as UploadIcon, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';

export default function Categories() {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingNode, setEditingNode] = useState<any>(null);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      // Format tree data
      const formatTree = (items: any[]): any[] => {
        return items.map(item => ({
          title: item.name,
          key: item.id,
          slug: item.slug,
          children: item.children ? formatTree(item.children) : []
        }));
      };
      setTreeData(formatTree(res.data));
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi tải danh mục");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onDrop = (info: any) => {
    // Drop logic omitted for UI demo
    message.success('Đã cập nhật vị trí danh mục');
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      message.success('Lưu danh mục thành công!');
      setModalOpen(false);
      form.resetFields();
    });
  };

  const titleRender = (nodeData: any) => {
    return (
      <div className="flex items-center justify-between group py-1">
        <span className="font-medium text-gray-700">{nodeData.title}</span>
        <div className="hidden group-hover:flex items-center gap-2 px-2">
          <Button size="small" type="text" icon={<Plus size={14} />} onClick={(e) => { e.stopPropagation(); setEditingNode(null); form.setFieldsValue({ parentId: nodeData.key, parent: nodeData.title }); setModalOpen(true); }} />
          <Button size="small" type="text" icon={<Edit2 size={14} />} onClick={(e) => { e.stopPropagation(); setEditingNode(nodeData); form.setFieldsValue({ name: nodeData.title, slug: nodeData.slug }); setModalOpen(true); }} />
          <Button size="small" type="text" icon={<EyeOff size={14} />} onClick={(e) => e.stopPropagation()} />
          <Popconfirm title="Bạn có chắc chắn muốn xóa?" description="Danh mục đang có sản phẩm sẽ không thể bị xóa." onConfirm={(e) => e?.stopPropagation()}>
            <Button size="small" type="text" danger icon={<Trash2 size={14} />} onClick={(e) => e.stopPropagation()} />
          </Popconfirm>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight m-0">Quản lý Danh mục</h1>
          <p className="text-gray-500 mt-1 font-medium">Cấu hình cây danh mục sản phẩm toàn sàn.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <Card className="border-0 rounded-3xl shadow-sm flex-1 lg:max-w-md h-fit" styles={{ body: { padding: '24px' } }}>
          <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold m-0">Cây danh mục</h2>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditingNode(null); setModalOpen(true); }}>
            Thêm gốc
          </Button>
        </div>

        <div className="bg-gray-50 p-2 rounded border border-gray-200 mb-4 text-xs text-gray-500">
          Kéo thả để sắp xếp vị trí hoặc di chuyển danh mục. Tối đa 3 cấp độ.
        </div>

        <Tree
          className="draggable-tree"
          draggable
          blockNode
          onDrop={onDrop}
          treeData={treeData}
          titleRender={titleRender}
          defaultExpandAll
        />
        </Card>

        <Card className="border-0 rounded-3xl shadow-sm flex-1 h-fit" title={<span className="text-lg font-bold text-gray-800">Thống kê / Chi tiết</span>} styles={{ header: { borderBottom: 'none', padding: '24px 24px 0' }, body: { padding: '24px' } }}>
        <div className="flex items-center justify-center h-64 text-gray-400 flex-col">
          <AlertCircle size={48} className="mb-4 opacity-50" />
          <p>Chọn một danh mục hoặc click chỉnh sửa để xem thông tin</p>
        </div>
      </Card>

      <Modal
        title={editingNode ? "Chỉnh sửa Danh mục" : "Thêm Danh mục mới"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="parent" label="Danh mục cha">
            <Input disabled placeholder="Thêm làm danh mục gốc" />
          </Form.Item>

          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>

          <Form.Item 
            name="slug" 
            label="Đường dẫn (Slug)" 
            extra={editingNode ? "Lưu ý: Thay đổi slug sẽ ảnh hưởng đến SEO và các URL đang hoạt động. Cần xác nhận!" : ""}
          >
            <Input size="large" addonBefore="omni.com/category/" />
          </Form.Item>

          <Form.Item label="Icon / Ảnh đại diện">
            <Upload listType="picture-card" maxCount={1}>
              <div>
                <UploadIcon size={20} className="mx-auto text-gray-400 mb-2" />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item name="active" label="Trạng thái" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Hiển thị" unCheckedChildren="Đang ẩn" />
          </Form.Item>
        </Form>
        </Modal>
      </div>
    </div>
  );
}
