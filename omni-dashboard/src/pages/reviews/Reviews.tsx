import React, { useState, useEffect } from 'react';
import { Card, Tabs, List, Avatar, Rate, Button, Input, Tag, Space, message } from 'antd';
import { MessageSquare, Star, Search, Clock, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';

const { TextArea } = Input;

const mockQA: any[] = [];

export default function Reviews() {
  const [activeTab, setActiveTab] = useState('reviews');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendor/reviews');
      setReviews(res.data.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id: string) => {
    try {
      await api.patch(`/vendor/reviews/${id}/reply`, { replyContent: replyText[id] });
      message.success('Đã gửi phản hồi');
      setReplyingTo(null);
      fetchReviews();
    } catch (e) {
      message.error('Lỗi khi gửi phản hồi');
    }
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
      loading={loading}
      itemLayout="vertical"
      dataSource={reviews}
      renderItem={item => (
        <List.Item className="bg-white border border-gray-200 rounded-lg mb-4 p-5">
          <div className="flex gap-4">
            <Avatar src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item.userName || item.userId}`} size={40} />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{item.userName || item.userId}</div>
                  <div className="text-xs text-blue-600 font-medium mb-1">Sản phẩm ID: {item.productId}</div>
                  <Rate disabled defaultValue={item.rating} className="text-sm" />
                </div>
                <span className="text-gray-400 text-xs">{new Date(item.createdAt || item.date).toLocaleString('vi-VN')}</span>
              </div>
              
              <div className="text-gray-800 mb-4 mt-2">
                {item.comment}
              </div>

              {item.replyContent ? (
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
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight m-0">Đánh giá & Hỏi đáp</h1>
          <p className="text-gray-500 mt-1 font-medium">Phản hồi khách hàng để duy trì tương tác tốt nhất.</p>
        </div>
      </div>

      <Card className="border-0 rounded-3xl shadow-sm min-h-[600px]" styles={{ body: { padding: '24px' } }}>
        <div className="flex justify-between items-center mb-6">
          <div></div>
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
    </div>
  );
}
