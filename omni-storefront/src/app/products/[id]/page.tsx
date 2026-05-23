"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, ShoppingCart, Zap, Shield, Truck, RefreshCw, Share2, ChevronRight, Minus, Plus, Store, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { productDetail } from "@/data/mock";
import { formatPrice, calcDiscount } from "@/lib/utils";

const GRADS = ["from-violet-600/80 to-indigo-600/80","from-amber-500/80 to-orange-600/80","from-purple-600/80 to-pink-600/80","from-blue-600/80 to-cyan-500/80"];
const TABS = ["Mô tả sản phẩm", "Thông số kỹ thuật", "Đánh giá"];

export default function ProductDetailPage() {
  const p = productDetail;
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  // Derive unique colors / storages
  const colors   = [...new Set(p.skus?.map(s => s.color).filter(Boolean) as string[])];
  const storages = [...new Set(p.skus?.map(s => s.storage).filter(Boolean) as string[])];

  // Find matching SKU
  const activeSku = p.skus?.find(s =>
    (!selectedColor   || s.color   === selectedColor) &&
    (!selectedStorage || s.storage === selectedStorage)
  );
  const currentPrice = activeSku?.price ?? p.price;
  const stockLeft    = activeSku?.stock ?? (p.stock ?? 0);
  const canAdd       = !!selectedColor && !!selectedStorage && stockLeft > 0;

  const handleAddToCart = () => {
    if (!canAdd) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
            {["Trang chủ", "Điện tử", "Điện thoại", p.name].map((crumb, i, arr) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
                <span className={i === arr.length - 1 ? "truncate max-w-xs" : "cursor-pointer hover:text-gold transition-colors duration-150"}
                  style={{ color: i === arr.length - 1 ? "var(--text-secondary)" : undefined }}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            {/* ── Left: Gallery ───────────────────────────────── */}
            <div className="space-y-3">
              {/* Main image */}
              <motion.div
                key={activeImg}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br ${GRADS[activeImg % 4]}`}
                style={{ border: "1px solid var(--border)" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingCart className="w-20 h-20 text-white/20" />
                </div>
                {p.discount && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 text-sm font-bold rounded-xl bg-red-500 text-white">
                    -{p.discount}%
                  </div>
                )}
                <button onClick={() => setWishlisted(!wishlisted)}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl glass cursor-pointer">
                  <Heart className={`w-5 h-5 transition-all ${wishlisted ? "fill-red-400 text-red-400" : "text-white/70"}`} />
                </button>
              </motion.div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {(p.images ?? [p.image, p.image, p.image, p.image]).map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${GRADS[i % 4]} cursor-pointer transition-all duration-200`}
                    style={{ border: activeImg === i ? "2px solid var(--gold)" : "1px solid var(--border)", opacity: activeImg === i ? 1 : 0.6 }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white/30" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2">
                {[[Shield,"Hàng chính hãng, bảo hành 12T"],[Truck,"Giao hàng toàn quốc, nhanh 2-5 ngày"],[RefreshCw,"Đổi trả trong 7 ngày"],[MessageCircle,"Hỗ trợ 24/7"]].map(([Icon, text], i) => {
                  const Ic = Icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
                  return (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <Ic className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gold)" }} />
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{text as string}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Right: Product Info ──────────────────────────── */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg" style={{ background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--border-gold)" }}>Bán chạy</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Đã bán {p.sold.toLocaleString("vi-VN")}</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold leading-tight font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
                  {p.name}
                </h1>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(p.rating) ? "fill-gold text-gold" : "text-border"}`} />
                    ))}
                    <span className="text-sm font-semibold ml-1" style={{ color: "var(--gold)" }}>{p.rating}</span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>({p.reviews?.length ?? 0} đánh giá)</span>
                  <button className="ml-auto flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                    <Share2 className="w-4 h-4" /> Chia sẻ
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gradient-gold font-[family-name:var(--font-heading)]">{formatPrice(currentPrice)}</span>
                  {p.originalPrice && <span className="text-lg line-through" style={{ color: "var(--text-muted)" }}>{formatPrice(p.originalPrice)}</span>}
                  {p.originalPrice && <span className="px-2 py-0.5 text-sm font-bold rounded-lg bg-red-500 text-white">-{calcDiscount(p.originalPrice, currentPrice)}%</span>}
                </div>
                {p.originalPrice && (
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    Tiết kiệm {formatPrice(p.originalPrice - currentPrice)}
                  </p>
                )}
              </div>

              {/* Color selector */}
              {colors.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                    Màu sắc: <span style={{ color: "var(--text-primary)" }}>{selectedColor ?? "Chưa chọn"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(color => {
                      const sku = p.skus?.find(s => s.color === color && (!selectedStorage || s.storage === selectedStorage));
                      const outOfStock = (sku?.stock ?? 0) === 0;
                      return (
                        <button key={color} disabled={outOfStock} onClick={() => setSelectedColor(color)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            border: selectedColor === color ? "2px solid var(--gold)" : "1px solid var(--border)",
                            background: selectedColor === color ? "var(--gold-dim)" : "var(--bg-card)",
                            color: selectedColor === color ? "var(--gold)" : "var(--text-secondary)",
                          }}>
                          {sku?.colorHex && <span className="w-4 h-4 rounded-full border border-border flex-shrink-0" style={{ background: sku.colorHex }} />}
                          {color}
                          {outOfStock && <span className="text-xs text-red-400">(Hết)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Storage selector */}
              {storages.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                    Dung lượng: <span style={{ color: "var(--text-primary)" }}>{selectedStorage ?? "Chưa chọn"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {storages.map(storage => {
                      const sku = p.skus?.find(s => s.storage === storage && (!selectedColor || s.color === selectedColor));
                      const outOfStock = (sku?.stock ?? 0) === 0;
                      return (
                        <button key={storage} disabled={outOfStock} onClick={() => setSelectedStorage(storage)}
                          className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            border: selectedStorage === storage ? "2px solid var(--purple)" : "1px solid var(--border)",
                            background: selectedStorage === storage ? "var(--purple-dim)" : "var(--bg-card)",
                            color: selectedStorage === storage ? "var(--purple-light)" : "var(--text-secondary)",
                          }}>
                          {storage}
                          {outOfStock && <span className="text-xs text-red-400 ml-1">(Hết)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity + Stock */}
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-glass"
                    style={{ color: "var(--text-secondary)" }}><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(stockLeft, q + 1))} disabled={qty >= stockLeft}
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-glass disabled:opacity-30"
                    style={{ color: "var(--text-secondary)" }}><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-sm" style={{ color: stockLeft > 10 ? "var(--text-muted)" : "var(--gold)" }}>
                  {stockLeft > 0 ? `Còn ${stockLeft} sản phẩm` : "Hết hàng"}
                </span>
              </div>

              {/* Validation hint */}
              {(!selectedColor || !selectedStorage) && (
                <p className="text-xs" style={{ color: "var(--gold)" }}>⚠ Vui lòng chọn Màu sắc và Dung lượng trước khi đặt hàng</p>
              )}

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="gold" size="lg" className="flex-1" onClick={handleAddToCart}
                  disabled={!canAdd}>
                  <AnimatePresence mode="wait">
                    {addedToCart
                      ? <motion.span key="added" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex items-center gap-2">✓ Đã thêm vào giỏ!</motion.span>
                      : <motion.span key="add"   initial={{ opacity: 0, y: 8  }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Thêm vào giỏ</motion.span>
                    }
                  </AnimatePresence>
                </Button>
                <Button variant="purple" size="lg" className="flex-1" disabled={!canAdd}>
                  <Zap className="w-5 h-5" /> Mua ngay
                </Button>
              </div>

              {/* Shop info */}
              <div className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-gold)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-gold)" }}>
                    <Store className="w-5 h-5" style={{ color: "var(--gold)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.shopName}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Xem cửa hàng →</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="glass" size="sm">Chat</Button>
                  <Button variant="glass" size="sm">Xem shop</Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabs Section ─────────────────────────────────────── */}
          <div className="mt-12">
            <div className="flex gap-1 p-1 rounded-2xl mb-8 w-fit" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              {TABS.map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(i)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300"
                  style={activeTab === i
                    ? { background: "var(--grad-purple)", color: "white", boxShadow: "var(--shadow-glow-purple)" }
                    : { color: "var(--text-secondary)" }}>
                  {tab} {tab === "Đánh giá" && `(${p.reviews?.length ?? 0})`}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Description */}
              {activeTab === 0 && (
                <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-6 rounded-2xl prose-sm max-w-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                  {p.description?.split("\n").map((line, i) => <p key={i} className="mb-3">{line}</p>)}
                </motion.div>
              )}

              {/* Specs */}
              {activeTab === 1 && (
                <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  {Object.entries(p.specs ?? {}).map(([key, val], i) => (
                    <div key={key} className="flex items-start" style={{ background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                      <span className="w-44 flex-shrink-0 px-5 py-3 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{key}</span>
                      <span className="flex-1 px-5 py-3 text-sm" style={{ color: "var(--text-primary)" }}>{val}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Reviews */}
              {activeTab === 2 && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Rating summary */}
                  <div className="flex items-center gap-6 p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gradient-gold font-[family-name:var(--font-heading)]">{p.rating}</div>
                      <div className="flex justify-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(p.rating) ? "fill-gold text-gold" : "text-border"}`} />)}
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{p.reviews?.length} đánh giá</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5,4,3,2,1].map(star => {
                        const count = p.reviews?.filter(r => Math.floor(r.rating) === star).length ?? 0;
                        const pct = p.reviews?.length ? (count / p.reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-xs w-4" style={{ color: "var(--text-muted)" }}>{star}</span>
                            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--grad-gold)" }} />
                            </div>
                            <span className="text-xs w-6 text-right" style={{ color: "var(--text-muted)" }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review cards */}
                  {p.reviews?.map(review => (
                    <div key={review.id} className="p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--purple-dim)", color: "var(--purple-light)" }}>
                            {review.userName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{review.userName}</p>
                            {review.sku && <p className="text-xs" style={{ color: "var(--text-muted)" }}>Phân loại: {review.sku}</p>}
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-gold text-gold" : "text-border"}`} />)}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{review.comment}</p>
                      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{review.date}</span>
                        <button className="text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>👍 Hữu ích ({review.helpful})</button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sticky CTA mobile */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden p-4 z-40" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--border)", backdropFilter: "blur(20px)" }}>
          <div className="flex gap-3">
            <Button variant="glass" size="md" className="flex-1" onClick={handleAddToCart} disabled={!canAdd}>
              <ShoppingCart className="w-4 h-4" /> Giỏ hàng
            </Button>
            <Button variant="gold" size="md" className="flex-1" disabled={!canAdd}>
              <Zap className="w-4 h-4" /> Mua ngay
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
