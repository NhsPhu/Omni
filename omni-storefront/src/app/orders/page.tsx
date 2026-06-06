"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight, Store, Search, Truck, Clock, CheckCircle, XCircle, Loader2, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

import { formatPrice } from "@/lib/utils";
import api from "@/lib/axios";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { Modal, Form, Input, Rate } from "antd";

const { TextArea } = Input;

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ thanh toán" },
  { id: "processing", label: "Chờ giao hàng" },
  { id: "shipping", label: "Đang giao" },
  { id: "delivered", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Chờ thanh toán", color: "var(--gold)", bg: "var(--gold-dim)", icon: Clock },
  confirmed: { label: "Chờ giao hàng", color: "var(--purple-light)", bg: "var(--purple-dim)", icon: Store },
  processing: { label: "Đang xử lý", color: "var(--purple-light)", bg: "var(--purple-dim)", icon: Store },
  shipping: { label: "Đang giao", color: "#3B82F6", bg: "rgba(59,130,246,0.15)", icon: Truck },
  shipped: { label: "Đang giao", color: "#3B82F6", bg: "rgba(59,130,246,0.15)", icon: Truck },
  delivered: { label: "Đã giao", color: "#10B981", bg: "rgba(16,185,129,0.15)", icon: CheckCircle },
  completed: { label: "Hoàn thành", color: "#10B981", bg: "rgba(16,185,129,0.15)", icon: CheckCircle },
  cancelled: { label: "Đã hủy", color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: XCircle },
  return_requested: { label: "Yêu cầu trả hàng", color: "#F59E0B", bg: "rgba(245,158,11,0.15)", icon: Clock },
  returned: { label: "Đã trả hàng", color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: XCircle },
  return_rejected: { label: "Từ chối trả hàng", color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: XCircle },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItemToReview, setSelectedItemToReview] = useState<any>(null);
  const [form] = Form.useForm();

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderToReturn, setSelectedOrderToReturn] = useState<any>(null);
  const [returnForm] = Form.useForm();

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  const fetchTracking = async (childOrderId: string) => {
    setTrackingModalOpen(true);
    setTrackingLoading(true);
    try {
      const res = await api.get(`/me/orders/${childOrderId}/tracking`);
      setTrackingInfo(res.data);
    } catch(e) {
      toast.error("Không thể lấy thông tin vận đơn");
      setTrackingModalOpen(false);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleReorder = async (order: any) => {
    try {
      for (const item of order.items) {
        await api.post("/cart/items", { 
          productId: item.productId, 
          skuId: item.skuId || null, 
          quantity: item.quantity 
        });
      }
      useCartStore.getState().fetchCart();
      toast.success("Đã thêm các sản phẩm vào giỏ hàng");
      router.push("/cart");
    } catch(e) {
      toast.error("Lỗi khi mua lại đơn hàng");
    }
  };

  const handleReviewSubmit = async (values: any) => {
    try {
      await api.post("/me/reviews", {
        productId: selectedItemToReview.productId,
        orderItemId: selectedItemToReview.id,
        rating: values.rating,
        comment: values.comment,
        imageUrls: [] // Optional: implement image upload later
      });
      toast.success("Đánh giá sản phẩm thành công!");
      setReviewModalOpen(false);
      form.resetFields();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi khi đánh giá sản phẩm");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/me/orders");
      // The backend returns List<ParentOrderJpaEntity> which contains childOrders
      // We'll flatten them or map them to the mock order format.
      const mapped: any[] = [];
      res.data.forEach((parent: any) => {
        if (parent.childOrders) {
          parent.childOrders.forEach((child: any) => {
            mapped.push({
              id: child.id,
              parentOrderId: parent.id,
              parentStatus: parent.status,
              shippingAddressId: parent.shippingAddressId,
              shopId: child.shopId,
              shopName: child.shopName || ("Shop " + child.shopId.substring(0, 8)),
              status: child.status.toLowerCase(), // 'pending', 'confirmed', 'shipping', 'delivered', 'cancelled'
              createdAt: new Date(parent.createdAt).toLocaleDateString("vi-VN"),
              total: child.totalAmount,
              items: child.items?.map((it:any) => ({
                id: it.id, // orderItemId
                productId: it.productId,
                skuId: it.skuId,
                name: it.productName || ("Sản phẩm " + it.productId.substring(0, 4)),
                price: it.priceAtPurchase || it.price,
                quantity: it.quantity,
                image: it.imageUrl,
              })) || [],
            });
          });
        }
      });
      setOrders(mapped);
    } catch (e) {
      console.error(e);
      // fallback
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/me/addresses");
      if (res.data) setAddresses(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth");
      return;
    }
    fetchOrders();
    fetchAddresses();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (activeTab !== "all" && order.status !== activeTab) return false;
    if (search && !order.id.toLowerCase().includes(search.toLowerCase()) && !order.shopName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
              Quản lý đơn hàng
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <Search className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo Mã đơn, tên Shop..."
                className="bg-transparent outline-none text-sm font-[family-name:var(--font-body)] w-full md:w-64"
                style={{ color: "var(--text-primary)" }} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto scroll-hide gap-1 mb-6 p-1 rounded-2xl w-fit max-w-full" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-300"
                style={activeTab === tab.id
                  ? { background: "var(--grad-purple)", color: "white", boxShadow: "var(--shadow-glow-purple)" }
                  : { color: "var(--text-secondary)" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredOrders.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center rounded-2xl" style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}>
                  <ShoppingBag className="w-16 h-16 mb-4" style={{ color: "var(--text-muted)" }} />
                  <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Không tìm thấy đơn hàng</h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Thay đổi trạng thái hoặc từ khóa tìm kiếm</p>
                </motion.div>
              ) : (
                filteredOrders.map((order, i) => {
                  const statusInfo = STATUS_CONFIG[order.status];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <motion.div key={order.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-3">
                          <Store className="w-4 h-4" style={{ color: "var(--gold)" }} />
                          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{order.shopName}</span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>• {order.createdAt}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-glass font-mono" style={{ color: "var(--text-secondary)" }}>{order.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="px-5 py-4 space-y-4" onClick={() => {
                        setViewingOrder(order);
                        setOrderDetailsOpen(true);
                      }}>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-4 cursor-pointer group">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-violet-600/80 to-indigo-600/80 flex items-center justify-center flex-shrink-0 relative">
                               {item.image ? (
                                 <img src={item.image.startsWith('http') ? item.image : `http://localhost:8080${item.image}`} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                               ) : (
                                 <ShoppingBag className="w-6 h-6 text-white/20 relative z-10" />
                               )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-medium leading-snug group-hover:text-gold transition-colors" style={{ color: "var(--text-primary)" }}>{item.name}</h4>
                                <span className="text-sm font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>{formatPrice(item.price)}</span>
                              </div>
                              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>x{item.quantity}</p>
                            </div>
                            {["delivered", "completed"].includes(order.status) && (
                              <Button variant="glass" size="sm" className="ml-4" onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItemToReview(item);
                                setReviewModalOpen(true);
                              }}>Đánh giá</Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--border)" }}>
                        <div className="flex flex-col">
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Tổng tiền:</span>
                          <span className="text-lg font-bold text-gradient-gold font-[family-name:var(--font-heading)]">{formatPrice(order.total)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {order.status === "pending" && (
                            <>
                              <Button variant="ghost" size="sm" className="flex-1 sm:flex-none" onClick={async () => {
                                try {
                                  await api.patch(`/me/orders/${order.parentOrderId}/cancel`);
                                  toast.success("Đã hủy đơn hàng thành công");
                                  fetchOrders();
                                } catch(e) {
                                  toast.error("Lỗi khi hủy đơn hàng");
                                }
                              }}>Hủy đơn</Button>
                              <Button variant="gold" size="sm" className="flex-1 sm:flex-none" onClick={async () => {
                                try {
                                  const res = await api.post(`/payment/vnpay/create-url?orderId=${order.parentOrderId}`);
                                  window.location.href = res.data;
                                } catch(e: any) {
                                  toast.error(e.response?.data?.message || "Lỗi tạo link thanh toán");
                                }
                              }}>Thanh toán ngay</Button>
                            </>
                          )}
                          <Button variant="glass" size="sm" className="flex-1 sm:flex-none" onClick={() => {
                            setViewingOrder(order);
                            setOrderDetailsOpen(true);
                            if (["processing", "shipped", "delivered", "completed"].includes(order.status)) {
                              fetchTracking(order.id);
                            }
                          }}>Xem chi tiết</Button>

                          {["delivered", "completed"].includes(order.status) && (
                            <Button variant="ghost" size="sm" className="flex-1 sm:flex-none" onClick={() => {
                              setSelectedOrderToReturn(order);
                              setReturnModalOpen(true);
                            }}>Trả hàng</Button>
                          )}
                          
                          {(order.status === "shipped" || order.status === "delivered") && (
                            <Button variant="gold" size="sm" className="flex-1 sm:flex-none shadow-sm shadow-gold/20" onClick={async () => {
                                try {
                                    await api.patch(`/me/orders/${order.id}/complete`);
                                    toast.success("Đã nhận hàng thành công! Bạn có thể đánh giá sản phẩm ngay bên dưới.");
                                    fetchOrders();
                                } catch (e) {
                                    toast.error("Lỗi xác nhận nhận hàng");
                                }
                            }}>Đã nhận được hàng</Button>
                          )}

                          {["delivered", "completed", "cancelled", "returned", "return_rejected"].includes(order.status) && (
                            <Button variant="glass" size="sm" className="flex-1 sm:flex-none" onClick={() => handleReorder(order)}>Mua lại</Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Modal
        title="Đánh giá sản phẩm"
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        onOk={() => form.submit()}
        okText="Gửi đánh giá"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700 border-none" }}
      >
        {selectedItemToReview && (
          <div className="flex gap-4 mb-4">
            <img src={selectedItemToReview.image ? (selectedItemToReview.image.startsWith('http') ? selectedItemToReview.image : `http://localhost:8080${selectedItemToReview.image}`) : "https://placehold.co/100x100"} alt="Product" className="w-16 h-16 rounded-xl object-cover" />
            <div>
              <p className="font-semibold text-sm">{selectedItemToReview.name}</p>
              <p className="text-xs text-gray-500">{formatPrice(selectedItemToReview.price)}</p>
            </div>
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={handleReviewSubmit}>
          <Form.Item name="rating" label="Đánh giá chất lượng" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
            <Rate className="text-yellow-400" />
          </Form.Item>
          <Form.Item name="comment" label="Nhận xét" rules={[{ required: true, message: 'Vui lòng viết nhận xét' }]}>
            <TextArea rows={4} placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này nhé..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={null}
        open={orderDetailsOpen}
        onCancel={() => setOrderDetailsOpen(false)}
        footer={null}
        width={700}
        styles={{ body: { padding: 0 } }}
      >
        {viewingOrder && (
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-sm text-gray-500 mt-1">Mã đơn: <span className="font-mono">{viewingOrder.id}</span></p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[viewingOrder.status].bg} ${STATUS_CONFIG[viewingOrder.status].color}`}>
                {STATUS_CONFIG[viewingOrder.status].label}
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Payment & Total */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50">
                <div>
                  <p className="text-xs text-gray-500">Thành tiền</p>
                  <p className="text-lg font-bold text-amber-500 mt-1">{formatPrice(viewingOrder.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phương thức thanh toán</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {viewingOrder.parentStatus === "PAID" 
                      ? "Chuyển khoản (Đã thanh toán qua VNPay)" 
                      : "Thanh toán khi nhận hàng (COD)"}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
                  {(() => {
                    const steps = [
                      { id: "pending", label: "Đã đặt hàng" },
                      { id: "processing", label: "Đang xử lý" },
                      { id: "shipped", label: "Đang giao" },
                      { id: "completed", label: "Hoàn thành" }
                    ];
                    let currentIdx = steps.findIndex(s => s.id === viewingOrder.status);
                    if (viewingOrder.status === "delivered") currentIdx = 3;
                    if (currentIdx === -1) currentIdx = 0; // fallback or cancelled
                    
                    return steps.map((step, idx) => {
                      const isActive = idx <= currentIdx;
                      const isCancelled = viewingOrder.status === "cancelled" || viewingOrder.status === "returned";
                      const colorClass = isCancelled ? (idx === 0 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-400") 
                                         : (isActive ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400");
                      const borderClass = isCancelled ? "border-white" : "border-white";
                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full border-4 ${borderClass} ${colorClass} flex items-center justify-center text-xs font-bold shadow-sm transition-colors duration-300`}>
                            {isActive && !isCancelled ? "✓" : (idx + 1)}
                          </div>
                          <span className={`text-xs font-medium ${isActive && !isCancelled ? "text-emerald-600" : "text-gray-500"}`}>
                            {isCancelled && idx === 1 ? "Đã hủy" : step.label}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Địa chỉ nhận hàng</h4>
                  {(() => {
                    const address = addresses.find(a => a.id === viewingOrder.shippingAddressId);
                    if (address) {
                      return (
                        <>
                          <p className="text-sm text-gray-600">{address.receiverName} - {address.receiverPhone}</p>
                          <p className="text-xs text-gray-500 mt-1">{address.detail}, {address.ward}, {address.district}, {address.province}</p>
                        </>
                      );
                    }
                    return <p className="text-sm text-gray-600">Đã cập nhật trên hệ thống</p>;
                  })()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Thông tin người bán</h4>
                  <p className="text-sm text-gray-600">{viewingOrder.shopName}</p>
                  <p className="text-xs text-gray-500 mt-1">Kho hàng tại TP.HCM</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-3">Sản phẩm</h4>
                <div className="space-y-3">
                  {viewingOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-center border border-gray-100 rounded-lg p-2">
                      <img src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:8080${item.image}`) : "https://placehold.co/100x100"} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking */}
              {(viewingOrder.status === "processing" || viewingOrder.status === "shipped" || viewingOrder.status === "delivered" || viewingOrder.status === "completed") && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-800">Lộ trình vận chuyển (GHN)</h4>
                    {!trackingInfo && !trackingLoading && (
                      <Button variant="gold" size="sm" onClick={() => fetchTracking(viewingOrder.id)}>Tải lộ trình</Button>
                    )}
                  </div>
                  
                  {trackingLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                  ) : trackingInfo ? (
                    <div className="relative border-l-2 border-emerald-500/30 ml-2 space-y-4">
                      {trackingInfo.timeline?.map((event: any, idx: number) => (
                        <div key={idx} className="relative pl-5">
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                            <p className="font-medium text-sm text-gray-800">{event.statusName}</p>
                            {event.location && <p className="text-xs mt-0.5 text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> {event.location}</p>}
                            {event.occurredAt && <p className="text-xs mt-1 text-gray-400">{new Date(event.occurredAt).toLocaleString("vi-VN")}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Lộ trình sẽ được cập nhật khi đơn hàng được giao cho ĐVVC.</p>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
               <Button variant="ghost" onClick={() => setOrderDetailsOpen(false)}>Đóng</Button>
               {(viewingOrder.status === "delivered" || viewingOrder.status === "cancelled") && (
                 <Button variant="gold" onClick={() => handleReorder(viewingOrder)}>Mua lại đơn này</Button>
               )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Yêu cầu trả hàng/hoàn tiền"
        open={returnModalOpen}
        onCancel={() => setReturnModalOpen(false)}
        onOk={() => returnForm.submit()}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        okButtonProps={{ className: "bg-red-500 hover:bg-red-600 border-none" }}
      >
        <Form form={returnForm} layout="vertical" onFinish={async (values) => {
          try {
            await api.post(`/me/orders/${selectedOrderToReturn.id}/return`, {
              reasonType: values.reasonType,
              reasonDetails: values.reasonDetails,
              images: [] // can implement upload later
            });
            toast.success("Đã gửi yêu cầu trả hàng");
            setReturnModalOpen(false);
            returnForm.resetFields();
            fetchOrders();
          } catch(e: any) {
            toast.error(e.response?.data?.message || "Lỗi khi gửi yêu cầu");
          }
        }}>
          <Form.Item name="reasonType" label="Lý do" rules={[{ required: true, message: 'Vui lòng chọn lý do' }]}>
            <select className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <option value="" style={{color: "black"}}>Chọn lý do trả hàng</option>
              <option value="WRONG_ITEM" style={{color: "black"}}>Giao sai sản phẩm</option>
              <option value="DEFECTIVE" style={{color: "black"}}>Sản phẩm lỗi/hỏng hóc</option>
              <option value="NOT_AS_DESCRIBED" style={{color: "black"}}>Không đúng mô tả</option>
              <option value="OTHER" style={{color: "black"}}>Khác</option>
            </select>
          </Form.Item>
          <Form.Item name="reasonDetails" label="Chi tiết lý do" rules={[{ required: true, message: 'Vui lòng viết chi tiết' }]}>
            <TextArea rows={4} placeholder="Mô tả rõ hơn về vấn đề của bạn..." />
          </Form.Item>
        </Form>
      </Modal>

      <Footer />
    </>
  );
}
