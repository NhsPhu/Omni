"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Star, MessageCircle, StarHalf, Reply, Loader2 } from "lucide-react";
import { format } from "date-fns";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { Modal, Form, Input } from "antd";

const { TextArea } = Input;

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vendor/reviews");
      setReviews(res.data.content);
    } catch (error) {
      toast.error("Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplySubmit = async (values: any) => {
    if (!selectedReview) return;
    try {
      await api.patch(`/vendor/reviews/${selectedReview.id}/reply`, {
        replyContent: values.replyContent
      });
      toast.success("Đã phản hồi đánh giá!");
      setReplyModalOpen(false);
      form.resetFields();
      fetchReviews();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi khi gửi phản hồi");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center shadow-lg">
          <Star className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Quản lý Đánh giá</h1>
          <p className="text-text-secondary">Lắng nghe và phản hồi khách hàng</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm p-6 mb-6">
        {/* Simple Analytics */}
        <div className="flex gap-10 items-center">
            <div className="text-center">
                <div className="text-5xl font-bold text-gradient-gold">
                   {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                </div>
                <div className="flex justify-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <StarHalf className="w-4 h-4 fill-gold text-gold" />
                </div>
                <p className="text-sm text-text-muted mt-1">{reviews.length} đánh giá</p>
            </div>
            <div className="flex-1 border-l border-border pl-10">
                <h3 className="font-semibold mb-2">Lời khuyên cho Nhà bán hàng</h3>
                <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                    <li>Phản hồi đánh giá một cách thân thiện và chuyên nghiệp.</li>
                    <li>Khách hàng thường quay lại nếu họ cảm thấy được trân trọng.</li>
                    <li>Với các đánh giá dưới 3 sao, hãy chủ động liên hệ để giải quyết vấn đề.</li>
                </ul>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center p-10 bg-surface border border-dashed border-border rounded-2xl text-text-muted">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Shop của bạn chưa có đánh giá nào</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6 bg-surface border border-border rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-gold/30">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-900/20 text-purple-600 flex items-center justify-center font-bold">
                        KH
                    </div>
                    <div>
                        <div className="flex gap-1 mb-1">
                            {Array.from({length: 5}).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-gold text-gold" : "text-border"}`} />
                            ))}
                        </div>
                        <p className="text-sm font-semibold text-text-primary">Mã sản phẩm: {review.productId.substring(0,8)}...</p>
                        <p className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString("vi-VN")} | Đã mua hàng</p>
                    </div>
                </div>
                {!review.replyContent && (
                   <Button variant="gold" size="sm" onClick={() => {
                     setSelectedReview(review);
                     setReplyModalOpen(true);
                   }}>
                     <Reply className="w-4 h-4" /> Phản hồi
                   </Button>
                )}
              </div>
              
              <div className="pl-14">
                  <p className="text-text-primary leading-relaxed">{review.comment}</p>
                  
                  {review.replyContent && (
                      <div className="mt-4 p-4 bg-gold/5 border-l-2 border-gold rounded-r-xl">
                          <p className="text-xs font-bold text-gold mb-1">Phản hồi của bạn:</p>
                          <p className="text-sm text-text-secondary">{review.replyContent}</p>
                      </div>
                  )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        title="Phản hồi đánh giá"
        open={replyModalOpen}
        onCancel={() => setReplyModalOpen(false)}
        onOk={() => form.submit()}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-gold hover:bg-gold/90 border-none text-black" }}
      >
        <div className="p-4 bg-surface rounded-xl mb-4 text-sm text-text-secondary border border-border">
            "{selectedReview?.comment}"
        </div>
        <Form form={form} layout="vertical" onFinish={handleReplySubmit}>
          <Form.Item name="replyContent" label="Nội dung phản hồi" rules={[{ required: true, message: 'Vui lòng viết phản hồi' }]}>
            <TextArea rows={4} placeholder="Cảm ơn bạn đã tin tưởng và ủng hộ Shop..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
