"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight, Store, Search, Truck, Clock, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { mockOrders } from "@/data/mock";
import { formatPrice } from "@/lib/utils";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ thanh toán" },
  { id: "confirmed", label: "Chờ giao hàng" },
  { id: "shipping", label: "Đang giao" },
  { id: "delivered", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Chờ thanh toán", color: "var(--gold)", bg: "var(--gold-dim)", icon: Clock },
  confirmed: { label: "Chờ giao hàng", color: "var(--purple-light)", bg: "var(--purple-dim)", icon: Store },
  shipping: { label: "Đang giao", color: "#3B82F6", bg: "rgba(59,130,246,0.15)", icon: Truck },
  delivered: { label: "Hoàn thành", color: "#10B981", bg: "rgba(16,185,129,0.15)", icon: CheckCircle },
  cancelled: { label: "Đã hủy", color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: XCircle },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filteredOrders = mockOrders.filter(order => {
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
                      <div className="px-5 py-4 space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 cursor-pointer group">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-violet-600/80 to-indigo-600/80 flex items-center justify-center flex-shrink-0">
                               <ShoppingBag className="w-6 h-6 text-white/20" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-medium leading-snug group-hover:text-gold transition-colors" style={{ color: "var(--text-primary)" }}>{item.name}</h4>
                                <span className="text-sm font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>{formatPrice(item.price)}</span>
                              </div>
                              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>x{item.quantity}</p>
                            </div>
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
                              <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">Hủy đơn</Button>
                              <Button variant="gold" size="sm" className="flex-1 sm:flex-none">Thanh toán ngay</Button>
                            </>
                          )}
                          {(order.status === "confirmed" || order.status === "shipping") && (
                            <Button variant="glass" size="sm" className="flex-1 sm:flex-none">Theo dõi đơn</Button>
                          )}
                          {order.status === "delivered" && (
                            <>
                              <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">Trả hàng</Button>
                              <Button variant="gold" size="sm" className="flex-1 sm:flex-none">Đánh giá</Button>
                              <Button variant="glass" size="sm" className="flex-1 sm:flex-none">Mua lại</Button>
                            </>
                          )}
                          {order.status === "cancelled" && (
                            <Button variant="glass" size="sm" className="flex-1 sm:flex-none">Mua lại</Button>
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
      <Footer />
    </>
  );
}
