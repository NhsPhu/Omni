"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingCart, Tag, ArrowRight, Store } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/axios";
import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useFlashSaleStore } from "@/store/flashSaleStore";

export interface CartItem {
  id: string; // mapping from skuId
  productId?: string;
  shopId: string;
  shopName: string;
  name: string;
  sku: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stock: number;
  selected: boolean;
}

const GRADS = ["from-violet-600/80 to-indigo-600/80","from-amber-500/80 to-orange-600/80","from-blue-600/80 to-cyan-500/80","from-emerald-600/80 to-teal-600/80"];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [voucher, setVoucher] = useState("");
  const [activeVoucher, setActiveVoucher] = useState<any>(null);
  const { isAuthenticated } = useAuthStore();
  const activeEvent = useFlashSaleStore(state => state.activeEvent);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<Record<string, number>>({});

  const fetchCart = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    try {
      // Fetch flash sale usage
      api.get("/me/flash-sale/usage").then(res => setUsage(res.data)).catch(() => {});

      const res = await api.get("/cart");
      const data = res.data;
      if (!data || !data.itemsByShop) return;
      
      const newItems: CartItem[] = [];
      Object.keys(data.itemsByShop).forEach((shopId: string) => {
        const shopItems = data.itemsByShop[shopId];
        shopItems.forEach((it: any) => {
          newItems.push({
            id: it.skuId, // using skuId as unique cart item ID
            productId: it.productId,
            shopId: it.shopId,
            shopName: it.shopName || ("Shop " + it.shopId.substring(0, 8)),
            name: it.productName,
            sku: it.skuCode,
            price: it.price,
            originalPrice: it.originalPrice,
            quantity: it.quantity,
            stock: 999, // default
            selected: true,
          } as any);
        });
      });
      setItems(newItems);
    } catch (e: any) {
      if (e.response?.status !== 401 && e.response?.status !== 403) {
        console.error("Cart fetch error:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const toggle = (id: string) => setItems(prev => prev.map(it => it.id === id ? { ...it, selected: !it.selected } : it));
  const toggleAll = (checked: boolean) => setItems(prev => prev.map(it => ({ ...it, selected: it.stock > 0 ? checked : false })));
  
  const setQty = async (id: string, qty: number) => {
    // Optimistic update
    setItems(prev => prev.map(it => it.id === id ? { ...it, quantity: Math.max(1, Math.min(it.stock, qty)) } : it));
    try {
      await api.put(`/cart/items/${id}?quantity=${qty}`);
      useCartStore.getState().fetchCart();
    } catch (e) {
      toast.error("Lỗi cập nhật số lượng");
      fetchCart(); // revert
    }
  };
  
  const remove = async (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
    try {
      await api.delete(`/cart/items/${id}`);
      useCartStore.getState().fetchCart();
      toast.success("Đã xóa khỏi giỏ hàng");
    } catch (e) {
      toast.error("Lỗi xóa sản phẩm");
      fetchCart();
    }
  };

  const allChecked = items.filter(it => it.stock > 0).every(it => it.selected);
  const selectedItems = items.filter(it => it.selected);
  
  const getItemPrice = (item: CartItem) => {
    const flashItem = activeEvent?.items?.find((f: any) => f.productId === item.productId && f.flashStock > f.soldCount);
    if (!flashItem) return item.price;
    const max = flashItem.maxQuantityPerUser;
    const bought = usage[item.id] || 0; // item.id is skuId
    if (max > 0 && (bought >= max || bought + item.quantity > max)) {
        return item.price;
    }
    return flashItem.flashPrice;
  };
  
  const getItemOriginalPrice = (item: CartItem) => {
    const flashItem = activeEvent?.items?.find((f: any) => f.productId === item.productId && f.flashStock > f.soldCount);
    if (!flashItem) return item.originalPrice;
    const max = flashItem.maxQuantityPerUser;
    const bought = usage[item.id] || 0;
    if (max > 0 && (bought >= max || bought + item.quantity > max)) {
        return item.originalPrice;
    }
    return item.price;
  };

  const subtotal = selectedItems.reduce((s, it) => s + getItemPrice(it) * it.quantity, 0);
  
  const discount = activeVoucher 
    ? (activeVoucher.discountType === "PERCENTAGE" 
       ? Math.min((subtotal * activeVoucher.discountValue) / 100, activeVoucher.maxDiscountAmount || 999999999) 
       : Math.min(activeVoucher.discountValue, subtotal))
    : 0;
    
  const shipping = selectedItems.length > 0 ? 30000 : 0;
  const total = subtotal - discount + shipping;

  // Group by shop
  const shops = [...new Set(items.map(it => it.shopId))].map(shopId => ({
    shopId,
    shopName: items.find(it => it.shopId === shopId)!.shopName,
    items: items.filter(it => it.shopId === shopId),
  }));
  const shopAllChecked = (shopId: string) => items.filter(it => it.shopId === shopId && it.stock > 0).every(it => it.selected);
  const toggleShop = (shopId: string, checked: boolean) => setItems(prev => prev.map(it => it.shopId === shopId ? { ...it, selected: it.stock > 0 ? checked : false } : it));

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <h1 className="text-2xl font-bold mb-6 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
            Giỏ hàng ({items.length})
          </h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-sm">Đang tải giỏ hàng...</span>
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingCart className="w-20 h-20 mb-5" style={{ color: "var(--text-muted)" }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Giỏ hàng trống</h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Hãy thêm sản phẩm yêu thích vào giỏ nhé!</p>
              <Link href="/search"><Button variant="gold">Tiếp tục mua sắm</Button></Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left — Cart items */}
              <div className="flex-1 space-y-4">
                {/* Select all */}
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <Checkbox checked={allChecked} onChange={toggleAll} />
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Chọn tất cả ({items.filter(it => it.stock > 0).length} sản phẩm)</span>
                  {selectedItems.length > 0 && (
                    <button onClick={() => setItems(prev => prev.filter(it => !it.selected))}
                      className="ml-auto flex items-center gap-1.5 text-sm cursor-pointer transition-colors duration-150"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ef4444"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}>
                      <Trash2 className="w-4 h-4" /> Xóa đã chọn
                    </button>
                  )}
                </div>

                {/* Shop groups */}
                {shops.map(shop => (
                  <div key={shop.shopId} className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    {/* Shop header */}
                    <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                      <Checkbox checked={shopAllChecked(shop.shopId)} onChange={(c) => toggleShop(shop.shopId, c)} />
                      <Store className="w-4 h-4" style={{ color: "var(--gold)" }} />
                      <Link href={`/shop/${shop.shopId}`} className="font-semibold text-sm hover:underline" style={{ color: "var(--text-primary)" }}>{shop.shopName}</Link>
                    </div>

                    {/* Items */}
                    {shop.items.map((item, idx) => (
                      <AnimatePresence key={item.id}>
                        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                          className="flex gap-4 px-5 py-4" style={{ borderBottom: idx < shop.items.length - 1 ? "1px solid var(--border)" : "none", opacity: item.stock === 0 ? 0.5 : 1 }}>
                          <Checkbox checked={item.selected} onChange={() => toggle(item.id)} disabled={item.stock === 0} />

                          {/* Image */}
                          <div className={`w-20 h-20 rounded-xl flex-shrink-0 bg-gradient-to-br ${GRADS[idx % 4]} flex items-center justify-center relative overflow-hidden`}>
                            {item.imageUrl ? (
                              <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:8080${item.imageUrl}`} className="w-full h-full object-cover" alt={item.name} />
                            ) : (
                              <ShoppingCart className="w-6 h-6 text-white/25" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2 leading-snug" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                            {item.sku && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Phân loại: {item.sku}</p>}
                            {item.stock === 0 && <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">Hết hàng</span>}
                            {(() => {
                                const fItem = activeEvent?.items?.find((f: any) => f.productId === item.productId && f.flashStock > f.soldCount);
                                if (fItem && fItem.maxQuantityPerUser > 0) {
                                    const bought = usage[item.id] || 0;
                                    if (bought + item.quantity > fItem.maxQuantityPerUser) {
                                        return <p className="text-[10px] text-orange-500 mt-1">Giới hạn {fItem.maxQuantityPerUser} sản phẩm giá Sale. Giá đã thay đổi về giá gốc.</p>;
                                    }
                                }
                                return null;
                            })()}

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-sm text-gradient-gold">{formatPrice(getItemPrice(item))}</span>
                                {getItemOriginalPrice(item) && <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>{formatPrice(getItemOriginalPrice(item) as number)}</span>}
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Qty */}
                                <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                                  <button onClick={() => setQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1 || item.stock === 0}
                                    className="w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-glass disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-8 text-center text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{item.quantity}</span>
                                  <button onClick={() => setQty(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock || item.stock === 0}
                                    className="w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-glass disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                {/* Delete */}
                                <button onClick={() => remove(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors duration-150 hover:bg-red-500/10"
                                  style={{ color: "var(--text-muted)" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ef4444"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}>
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    ))}
                  </div>
                ))}
              </div>

              {/* Right — Order Summary ──────────────────────────── */}
              <div className="lg:w-80">
                <div className="space-y-4 sticky top-24">
                  {/* Voucher */}
                  <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" style={{ color: "var(--gold)" }} />
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Mã giảm giá</span>
                  </div>
                  <div className="flex gap-2">
                    <input value={voucher} onChange={e => setVoucher(e.target.value)} placeholder="Nhập mã voucher..."
                      className="flex-1 px-3 py-2 rounded-xl text-sm bg-transparent outline-none font-[family-name:var(--font-body)]"
                      style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    <Button variant={activeVoucher ? "glass" : "gold"} size="sm"
                      onClick={async () => {
                        if (activeVoucher) {
                          setActiveVoucher(null);
                          setVoucher("");
                          return;
                        }
                        if (!voucher.trim()) return;
                        try {
                          const res = await api.get(`/public/vouchers/validate?code=${voucher.toUpperCase()}`);
                          const v = res.data;
                          if (subtotal < v.minOrderValue) {
                            toast.error(`Đơn hàng tối thiểu ${formatPrice(v.minOrderValue)} để áp dụng mã này`);
                            return;
                          }
                          setActiveVoucher(v);
                          toast.success("Áp dụng mã thành công");
                        } catch (e: any) {
                          toast.error(e.response?.data?.message || "Mã giảm giá không hợp lệ");
                        }
                      }}>
                      {activeVoucher ? "Hủy" : "Áp dụng"}
                    </Button>
                  </div>
                  {activeVoucher && <p className="text-xs" style={{ color: "#10B981" }}>✓ Đã áp dụng giảm {activeVoucher.discountType === "PERCENTAGE" ? `${activeVoucher.discountValue}%` : formatPrice(activeVoucher.discountValue)}</p>}
                </div>

                {/* Summary */}
                <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h3 className="font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Tóm tắt đơn hàng</h3>
                  {[
                    ["Tạm tính", formatPrice(subtotal)],
                    ...(discount > 0 ? [["Giảm giá" + (activeVoucher ? ` (${activeVoucher.code})` : ""), `-${formatPrice(discount)}`]] : []),
                    ["Phí vận chuyển", selectedItems.length > 0 ? formatPrice(shipping) : "—"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span className={label.includes("Giảm") ? "text-green-400" : ""} style={{ color: label.includes("Giảm") ? undefined : "var(--text-primary)" }}>{val}</span>
                    </div>
                  ))}
                  <div className="pt-3 flex items-center justify-between font-bold" style={{ borderTop: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-primary)" }}>Tổng cộng</span>
                    <span className="text-lg text-gradient-gold font-[family-name:var(--font-heading)]">{formatPrice(total)}</span>
                  </div>

                  <Button variant="gold" className="w-full mt-2 group" disabled={selectedItems.length === 0}
                    onClick={() => {
                      localStorage.setItem("checkout_skus", JSON.stringify(selectedItems.map(it => it.id)));
                      window.location.href = "/checkout";
                    }}>
                      Thanh toán ({selectedItems.length})
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                  <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Bằng cách đặt hàng, bạn đồng ý với điều khoản của Omni</p>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Checkbox({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div onClick={() => !disabled && onChange(!checked)}
      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-150 ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
      style={{ border: checked ? "none" : "1.5px solid var(--border)", background: checked ? "var(--purple)" : "transparent" }}>
      {checked && <span className="text-white text-xs font-bold">✓</span>}
    </div>
  );
}
