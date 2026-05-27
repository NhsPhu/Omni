"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bell, Trash2, ShoppingCart, Tag, Truck, Gift } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { featuredProducts } from "@/data/mock";

const NOTIFICATIONS: any[] = [];

export default function WishlistPage() {
  const [activeTab, setActiveTab] = useState<"wishlist" | "notifications">("wishlist");
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  useEffect(() => {
    api.get("/wishlists").then(res => {
      setWishlist(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, unread: false })));

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
          
          <h1 className="text-2xl font-bold mb-8 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
            Hoạt động của tôi
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 rounded-2xl w-fit" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <button onClick={() => setActiveTab("wishlist")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300"
              style={activeTab === "wishlist"
                ? { background: "var(--grad-purple)", color: "white", boxShadow: "var(--shadow-glow-purple)" }
                : { color: "var(--text-secondary)" }}>
              <Heart className={`w-4 h-4 ${activeTab === "wishlist" ? "fill-white text-white" : ""}`} />
              Yêu thích ({wishlist.length})
            </button>
            <button onClick={() => setActiveTab("notifications")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300"
              style={activeTab === "notifications"
                ? { background: "var(--grad-purple)", color: "white", boxShadow: "var(--shadow-glow-purple)" }
                : { color: "var(--text-secondary)" }}>
              <div className="relative">
                <Bell className={`w-4 h-4 ${activeTab === "notifications" ? "fill-white text-white" : ""}`} />
                {notifications.some(n => n.unread) && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />}
              </div>
              Thông báo
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Wishlist Tab ──────────────────────────────── */}
            {activeTab === "wishlist" && (
              <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl" style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}>
                    <Heart className="w-16 h-16 mb-4" style={{ color: "var(--text-muted)" }} />
                    <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Chưa có sản phẩm yêu thích</h3>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Hãy thả tim những sản phẩm bạn quan tâm để lưu lại nhé!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlist.map((product, i) => (
                      <div key={product.id} className="relative group">
                        <ProductCard product={product} index={i} />
                        <button onClick={() => {
                            api.post(`/wishlists/${product.id}`).then(() => {
                                setWishlist(p => p.filter(x => x.id !== product.id));
                            }).catch(console.error);
                        }}
                          className="absolute top-3 left-3 z-20 w-8 h-8 flex items-center justify-center rounded-full glass opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:bg-red-500/20"
                          title="Xóa khỏi danh sách">
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Notifications Tab ─────────────────────────── */}
            {activeTab === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                {notifications.some(n => n.unread) && (
                  <div className="flex justify-end mb-2">
                    <button onClick={markAllRead} className="text-sm font-semibold cursor-pointer transition-colors duration-150 hover:underline" style={{ color: "var(--purple-light)" }}>
                      Đánh dấu tất cả đã đọc
                    </button>
                  </div>
                )}

                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl" style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}>
                    <Bell className="w-16 h-16 mb-4" style={{ color: "var(--text-muted)" }} />
                    <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Không có thông báo</h3>
                  </div>
                ) : (
                  notifications.map(n => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className="flex gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                        style={{ background: n.unread ? "var(--bg-elevated)" : "var(--bg-card)", border: n.unread ? "1px solid var(--border-purple)" : "1px solid var(--border)" }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${n.color}20` }}>
                          <Icon className="w-6 h-6" style={{ color: n.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                              {n.title}
                              {n.unread && <span className="inline-block w-2 h-2 rounded-full bg-red-500 ml-2" />}
                            </h4>
                            <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{n.time}</span>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{n.desc}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}
