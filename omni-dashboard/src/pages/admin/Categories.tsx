import React, { useState } from 'react';
import { Card, Tree, Button, Modal, Form, Input, Switch, message, Upload, Popconfirm } from 'antd';
import { Plus, Edit2, EyeOff, Trash2, Upload as UploadIcon, AlertCircle } from 'lucide-react';

const initialTreeData = [
  {
    title: 'Điện thoại di động',
    key: 'dienthoai',
    children: [
      { title: 'Apple (iPhone)', key: 'iphone' },
      { title: 'Samsung Galaxy', key: 'samsung' },
    ],
  },
  {
    title: 'Máy tính xách tay (Laptop)',
    key: 'laptop',
    children: [
      { title: 'MacBook', key: 'macbook' },
      { title: 'Laptop Gaming', key: 'gaming' },
    ],
  },
  {
    title: 'Phụ kiện',
    key: 'phukien',
    children: [
      { title: 'Tai nghe Bluetooth', key: 'tainghe' },
      { title: 'Cáp sạc, pin dự phòng', key: 'capsac' },
    ],
  },
];

export default function Categories() {
  const [treeData, setTreeData] = useState<any[]>(initialTreeData);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingNode, setEditingNode] = useState<any>(null);

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
          <Button size="small" type="text" icon={<Plus size={14} />} onClick={(e) => { e.stopPropagation(); setEditingNode(null); form.setFieldsValue({ parent: nodeData.title }); setModalOpen(true); }} />
          <Button size="small" type="text" icon={<Edit2 size={14} />} onClick={(e) => { e.stopPropagation(); setEditingNode(nodeData); form.setFieldsValue({ name: nodeData.title, slug: nodeData.key }); setModalOpen(true); }} />
          <Button size="small" type="text" icon={<EyeOff size={14} />} onClick={(e) => e.stopPropagation()} />
          <Popconfirm title="Bạn có chắc chắn muốn xóa?" description="Danh mục đang có sản phẩm sẽ không thể bị xóa." onConfirm={(e) => e?.stopPropagation()}>
            <Button size="small" type="text" danger icon={<Trash2 size={14} />} onClick={(e) => e.stopPropagation()} />
          </Popconfirm>
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-6 h-full">
      <Card className="card-shadow border-none rounded-xl flex-1 max-w-md h-fit">
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

      <Card className="card-shadow border-none rounded-xl flex-1 h-fit" title="Thống kê / Chi tiết">
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
  );
}
