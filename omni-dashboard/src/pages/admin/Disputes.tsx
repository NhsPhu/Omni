import React, { useState, useEffect } from 'react';
import { Card, Row, Col, List, Avatar, Tag, Button, Input, Select, Modal, message, Divider, Image, Space } from 'antd';
import { Search, ShieldAlert, CheckCircle, XCircle, MessageCircle, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../lib/axios';

const { TextArea } = Input;
const { Option } = Select;

export default function Disputes() {
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState('');
  const [decisionNote, setDecisionNote] = useState('');

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/disputes');
      setDisputes(res.data.content || []);
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi tải danh sách tranh chấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const mockDisputes = [
    {
      id: 'DSP-8821',
      orderId: 'OMN-202401',
      customer: 'Nguyễn Quang Hải',
      shop: 'Apple Store VN',
      reason: 'Hàng không đúng mô tả / Lỗi ngoại quan',
      status: 'pending',
      date: '23/05/2026',
    },
    {
      id: 'DSP-8822',
      orderId: 'OMN-202402',
      customer: 'Trần Minh Đức',
      shop: 'Keychron Official',
      reason: 'Chưa nhận được hàng nhưng đã báo giao thành công',
      status: 'escalated',
      date: '22/05/2026',
    }
  ];

  const handleResolve = () => {
    if (!decision || !decisionNote) {
      message.warning("Vui lòng chọn kết quả phán quyết và nhập lý do!");
      return;
    }

    Modal.confirm({
      title: 'Xác nhận Phán quyết',
      content: 'Phán quyết này sẽ KHÔNG THỂ HOÀN TÁC. Hệ thống sẽ tự động gửi email cho cả hai bên và thực hiện luồng hoàn tiền/chuyển tiền tương ứng. Bạn chắc chắn chứ?',
      okText: 'Xác nhận & Thực thi',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const payload = {
            customerWins: decision === 'refund_full' || decision === 'refund_partial',
            refundAmount: decision === 'refund_full' ? 999999 : 0, // This should normally take an input for amount
            decision: decisionNote
          };
          await api.patch(`/admin/disputes/${selectedDispute.id}/resolve`, payload);
          message.success('Đã đóng tranh chấp và thực thi phán quyết!');
          setSelectedDispute(null);
          setDecision('');
          setDecisionNote('');
          loadDisputes();
        } catch (e) {
          message.error('Lỗi khi thực thi phán quyết');
        }
      }
    });
  };

  return (
    <div className="flex gap-6 h-full">
      <Card className="card-shadow border-none rounded-xl w-1/3 min-w-[350px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold m-0">Tranh chấp cần xử lý</h2>
          <Tag color="error">{mockDisputes.length}</Tag>
        </div>
        <Input placeholder="Tìm mã tranh chấp, mã đơn..." prefix={<Search size={16} className="text-gray-400" />} className="mb-4" />
        
        <List
          loading={loading}
          dataSource={disputes}
          renderItem={item => (
            <div 
              className={`p-4 border rounded-lg mb-3 cursor-pointer transition-all ${selectedDispute?.id === item.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
              onClick={() => setSelectedDispute(item)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-red-600">{item.id}</span>
                <span className="text-xs text-gray-500">{dayjs(item.createdAt).format('DD/MM/YYYY')}</span>
              </div>
              <div className="text-sm font-medium mb-1">{item.reason}</div>
              <div className="text-xs text-gray-600 flex justify-between">
                <span>Đơn: <strong>{item.orderId}</strong></span>
                <Tag color={item.status === 'OPEN' ? 'warning' : 'default'} className="m-0">
                  {item.status === 'OPEN' ? 'Chờ xử lý' : item.status}
                </Tag>
              </div>
            </div>
          )}
        />
      </Card>

      <Card className="card-shadow border-none rounded-xl flex-1 flex flex-col">
        {selectedDispute ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold m-0">Chi tiết tranh chấp {selectedDispute.id}</h2>
                <div className="text-gray-500">Đơn hàng: {selectedDispute.orderId} | Lý do: {selectedDispute.reason}</div>
              </div>
              <Button type="primary" danger onClick={handleResolve}>Đưa ra Phán quyết</Button>
            </div>

            <Row gutter={24} className="flex-1 overflow-y-auto mb-6 border-b pb-6">
              {/* Cột Khách Hàng */}
              <Col span={12} className="border-r border-gray-100">
                <div className="flex items-center gap-2 mb-4 bg-blue-50 p-2 rounded text-blue-800">
                  <Avatar className="bg-blue-600">KH</Avatar>
                  <span className="font-bold">{selectedDispute.userId} (Người mua)</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Yêu cầu</div>
                    <Tag color="red">Hoàn tiền 100%</Tag>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Lời khai</div>
                    <div className="p-3 bg-gray-50 rounded text-sm text-gray-700">"Sản phẩm bị xước xát mặt lưng rất nhiều, seal đã bị bóc trước khi giao."</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase mb-2">Bằng chứng (Ảnh/Video)</div>
                    <Space size={[8, 8]} wrap>
                      <Image width={80} height={80} src="https://picsum.photos/seed/ev1/200/200" className="rounded" />
                      <Image width={80} height={80} src="https://picsum.photos/seed/ev2/200/200" className="rounded" />
                    </Space>
                  </div>
                </div>
              </Col>

              {/* Cột Shop */}
              <Col span={12}>
                <div className="flex items-center gap-2 mb-4 bg-purple-50 p-2 rounded text-purple-800">
                  <Avatar className="bg-purple-600">SH</Avatar>
                  <span className="font-bold">Người bán</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Phản hồi</div>
                    <Tag color="cyan">Từ chối hoàn tiền</Tag>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">Lời khai</div>
                    <div className="p-3 bg-gray-50 rounded text-sm text-gray-700">"Hàng shop gửi đi nguyên seal 100%, có video đóng gói đầy đủ. Xước là do khách tự làm."</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase mb-2">Bằng chứng (Ảnh/Video)</div>
                    <Space size={[8, 8]} wrap>
                      <Image width={80} height={80} src="https://picsum.photos/seed/ev3/200/200" className="rounded" />
                    </Space>
                  </div>
                </div>
              </Col>
            </Row>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3 flex items-center gap-2"><ShieldAlert size={18}/> Khu vực Phán Quyết (Admin Only)</h3>
              <Row gutter={16}>
                <Col span={8}>
                  <Select className="w-full" size="large" placeholder="Chọn kết quả phán quyết" value={decision} onChange={setDecision}>
                    <Option value="refund_full">Hoàn tiền 100% cho Khách</Option>
                    <Option value="refund_partial">Hoàn tiền 50%</Option>
                    <Option value="reject_buyer">Bác đơn Khách hàng (Shop nhận tiền)</Option>
                    <Option value="escalate">Chuyển lên cấp trên (Escalate)</Option>
                  </Select>
                </Col>
                <Col span={16}>
                  <Input size="large" placeholder="Ghi chú nội bộ cho lý do phán quyết (Bắt buộc)..." value={decisionNote} onChange={e => setDecisionNote(e.target.value)} />
                </Col>
              </Row>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 flex-col">
            <MessageCircle size={48} className="mb-4 opacity-50" />
            <p>Chọn một tranh chấp ở danh sách bên trái để xem bằng chứng 2 phía</p>
          </div>
        )}
      </Card>
    </div>
  );
}
