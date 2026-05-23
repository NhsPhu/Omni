import React, { useState } from 'react';
import { Card, Tabs, List, Avatar, Rate, Button, Input, Tag, Space } from 'antd';
import { MessageSquare, Star, Search, Clock, AlertCircle } from 'lucide-react';

const { TextArea } = Input;

const mockReviews = [
  { 
    id: 1, 
    user: 'Nguyễn Quang Hải', 
    product: 'Tai nghe Bluetooth Không Dây Sony WH-1000XM5',
    rating: 5, 
    content: 'Chất âm tuyệt vời, chống ồn tốt nhất hiện nay. Đóng gói rất cẩn thận và giao hàng siêu tốc.', 
    time: '2 giờ trước',
    replied: false 
  },
  { 
    id: 2, 
    user: 'Trần Minh Đức', 
    product: 'Bàn phím cơ Keychron K2 Pro',
    rating: 4, 
    content: 'Bàn phím gõ êm, layout Mac chuẩn. Tuy nhiên hộp hơi xước một chút xíu.', 
    time: '1 ngày trước',
    replied: true,
    replyContent: 'Chào bạn, Omni Store xin lỗi vì trải nghiệm chưa hoàn hảo về vỏ hộp do quá trình vận chuyển. Shop đã ghi nhận và sẽ bọc xốp kỹ hơn trong các đơn sau. Cảm ơn bạn đã tin tưởng!'
  }
];

const mockQA = [
  {
    id: 1,
    user: 'Lê Thanh Bình',
    product: 'Tai nghe Bluetooth Không Dây Sony WH-1000XM5',
    content: 'Cho mình hỏi sản phẩm này bảo hành bao lâu và có được đổi trả nếu lỗi từ nhà sản xuất không shop?',
    time: '49 giờ trước',
    isOverdue: true,
  },
  {
    id: 2,
    user: 'Phạm Hương Trang',
    product: 'Bàn phím cơ Keychron K2 Pro',
    content: 'Bản này là nhựa hay nhôm vậy shop? Switch Red hay Brown?',
    time: '5 giờ trước',
    isOverdue: false,
  }
];

export default function Reviews() {
  const [activeTab, setActiveTab] = useState('qa');
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const handleReply = (id: number) => {
    // Send reply
    setReplyingTo(null);
  };

  const qaTab = (
    <div className="space-y-4">
      {mockQA.length > 0 && mockQA.some(q => q.isOverdue) && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg flex items-center gap-2 mb-4">
          <AlertCircle size={16} />
          <span>Bạn có <strong>1 câu hỏi</strong> quá 48h chưa được phản hồi. Cần ưu tiên xử lý để tránh bị giảm điểm cửa hàng.</span>
        </div>
      )}

      <List
        itemLayout="vertical"
        dataSource={mockQA}
        renderItem={item => (
          <List.Item className="bg-white border border-gray-200 rounded-lg mb-4 p-5">
            <div className="flex gap-4">
              <Avatar src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item.user}`} size={40} />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">{item.user}</div>
                    <div className="text-xs text-blue-600 font-medium">Sản phẩm: {item.product}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.isOverdue && <Tag color="error">Quá hạn phản hồi</Tag>}
                    <span className="text-gray-400 text-xs flex items-center gap-1"><Clock size={12} /> {item.time}</span>
                  </div>
                </div>
                
                <div className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3 inline-block relative">
                  <div className="absolute w-3 h-3 bg-gray-50 border-t border-l border-gray-100 transform rotate-45 -top-1.5 left-4"></div>
                  {item.content}
                </div>

                {replyingTo === item.id ? (
                  <div className="mt-2">
                    <TextArea 
                      rows={3} 
                      placeholder="Nhập câu trả lời của bạn..." 
                      value={replyText[item.id] || ''}
                      onChange={(e) => setReplyText({...replyText, [item.id]: e.target.value})}
                      className="mb-2"
                    />
                    <Space>
                      <Button type="primary" onClick={() => handleReply(item.id)}>Gửi phản hồi</Button>
                      <Button onClick={() => setReplyingTo(null)}>Hủy</Button>
                    </Space>
                  </div>
                ) : (
                  <div>
                    <Button type="dashed" size="small" onClick={() => setReplyingTo(item.id)}>Trả lời ngay</Button>
                  </div>
                )}
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );

  const reviewsTab = (
    <List
      itemLayout="vertical"
      dataSource={mockReviews}
      renderItem={item => (
        <List.Item className="bg-white border border-gray-200 rounded-lg mb-4 p-5">
          <div className="flex gap-4">
            <Avatar src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item.user}`} size={40} />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{item.user}</div>
                  <div className="text-xs text-blue-600 font-medium mb-1">Sản phẩm: {item.product}</div>
                  <Rate disabled defaultValue={item.rating} className="text-sm" />
                </div>
                <span className="text-gray-400 text-xs">{item.time}</span>
              </div>
              
              <div className="text-gray-800 mb-4 mt-2">
                {item.content}
              </div>

              {item.replied ? (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 ml-4 relative">
                  <div className="absolute w-3 h-3 bg-blue-50 border-t border-l border-blue-100 transform rotate-45 -top-1.5 left-4"></div>
                  <div className="text-xs font-bold text-blue-800 mb-1">Phản hồi của Shop:</div>
                  <div className="text-gray-700 text-sm">{item.replyContent}</div>
                </div>
              ) : replyingTo === item.id ? (
                <div className="mt-2 ml-4">
                  <TextArea 
                    rows={3} 
                    placeholder="Phản hồi đánh giá này một cách công khai..." 
                    value={replyText[item.id] || ''}
                    onChange={(e) => setReplyText({...replyText, [item.id]: e.target.value})}
                    className="mb-2"
                  />
                  <Space>
                    <Button type="primary" onClick={() => handleReply(item.id)}>Gửi phản hồi</Button>
                    <Button onClick={() => setReplyingTo(null)}>Hủy</Button>
                  </Space>
                </div>
              ) : (
                <Button type="dashed" size="small" onClick={() => setReplyingTo(item.id)}>Phản hồi đánh giá</Button>
              )}
            </div>
          </div>
        </List.Item>
      )}
    />
  );

  return (
    <Card className="card-shadow border-none rounded-xl min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 m-0">Đánh giá & Hỏi đáp</h1>
        <Input 
          placeholder="Tìm theo nội dung, tên KH, sản phẩm..." 
          prefix={<Search size={16} className="text-gray-400" />}
          style={{ width: 300 }}
        />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'qa', label: `Hỏi đáp khách hàng (${mockQA.length})`, children: qaTab },
          { key: 'reviews', label: 'Đánh giá sản phẩm', children: reviewsTab },
        ]}
      />
    </Card>
  );
}
