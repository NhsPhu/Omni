"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Truck, CreditCard, CheckCircle, ChevronRight, ShoppingCart, Edit2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { mockAddresses, shippingMethods, paymentMethods } from "@/data/mock";
import { formatPrice } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import type { CartItem } from "@/app/cart/page";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Địa chỉ",   icon: MapPin      },
  { id: 2, label: "Vận chuyển",icon: Truck       },
  { id: 3, label: "Thanh toán",icon: CreditCard  },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [selectedAddr, setSelectedAddr] = useState(mockAddresses[0].id);
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0].id);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const [voucher, setVoucher] = useState("");
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth");
      return;
    }
    // Load checkout items from cart
    const skusStr = localStorage.getItem("checkout_skus");
    if (!skusStr) return;
    try {
      const selectedSkus = JSON.parse(skusStr);
      api.get("/cart").then(res => {
        const data = res.data;
        if (!data || !data.itemsByShop) return;
        const items: CartItem[] = [];
        Object.keys(data.itemsByShop).forEach((shopId: string) => {
          data.itemsByShop[shopId].forEach((it: any) => {
            if (selectedSkus.includes(it.skuId)) {
              items.push({
                id: it.skuId,
                shopId: it.shopId,
                shopName: "Shop " + it.shopId.substring(0, 8),
                name: it.productName,
                sku: it.skuCode,
                price: it.price,
                quantity: it.quantity,
                stock: 999,
                selected: true,
              });
            }
          });
        });
        setCartItems(items);
      }).catch((e: any) => {
        if (e.response?.status !== 401 && e.response?.status !== 403) console.error(e);
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const selectedItems = cartItems;
  const subtotal  = selectedItems.reduce((s, it) => s + it.price * it.quantity, 0);
  const shipFee   = shippingMethods.find(s => s.id === selectedShipping)!.price;
  const total     = subtotal + shipFee;
  const addr      = mockAddresses.find(a => a.id === selectedAddr)!;

  if (placed) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4" style={{ background: "var(--bg-base)" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
        <CheckCircle className="w-20 h-20" style={{ color: "#10B981" }} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Đặt hàng thành công!</h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>Mã đơn hàng: <strong className="text-gradient-gold">{orderId.split("-")[0].toUpperCase()}</strong></p>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể</p>
        <div className="flex gap-3 mt-6 justify-center">
          <Button variant="gold" onClick={() => window.location.href = "/"}>Về trang chủ</Button>
          <Button variant="glass" onClick={() => window.location.href = "/orders"}>Xem đơn hàng</Button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
          <h1 className="text-2xl font-bold mb-8 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Thanh toán</h1>

          {/* Step indicator */}
          <div className="flex items-center mb-10">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
                      style={{ background: done ? "#10B981" : active ? "var(--grad-gold)" : "var(--bg-card)", border: done || active ? "none" : "1px solid var(--border)" }}>
                      {done ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5" style={{ color: active ? "#050509" : "var(--text-muted)" }} />}
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap hidden sm:block" style={{ color: active ? "var(--gold)" : done ? "#10B981" : "var(--text-muted)" }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-3" style={{ background: step > s.id ? "#10B981" : "var(--border)" }} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left — Step content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {/* Step 1: Address */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Chọn địa chỉ giao hàng</h2>
                    {mockAddresses.map(a => (
                      <div key={a.id} onClick={() => setSelectedAddr(a.id)}
                        className="p-5 rounded-2xl cursor-pointer transition-all duration-200 relative"
                        style={{ background: "var(--bg-card)", border: selectedAddr === a.id ? "2px solid var(--gold)" : "1px solid var(--border)" }}>
                        {a.isDefault && <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--gold-dim)", color: "var(--gold)" }}>Mặc định</span>}
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                            style={{ border: selectedAddr === a.id ? "none" : "1.5px solid var(--border)", background: selectedAddr === a.id ? "var(--gold)" : "transparent" }}>
                            {selectedAddr === a.id && <span className="text-[9px] text-black font-bold">✓</span>}
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{a.name} — {a.phone}</p>
                            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{a.street}, {a.ward}, {a.district}, {a.city}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-colors duration-150 flex items-center justify-center gap-2"
                      style={{ border: "1.5px dashed var(--border)", color: "var(--text-muted)" }}>
                      + Thêm địa chỉ mới
                    </button>
                    <Button variant="gold" className="w-full" onClick={() => setStep(2)}>
                      Tiếp theo: Vận chuyển <ChevronRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Shipping + Voucher */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold mb-4 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Phương thức vận chuyển</h2>
                      <div className="space-y-3">
                        {shippingMethods.map(m => (
                          <div key={m.id} onClick={() => setSelectedShipping(m.id)}
                            className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200"
                            style={{ background: "var(--bg-card)", border: selectedShipping === m.id ? "2px solid var(--purple)" : "1px solid var(--border)" }}>
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ border: selectedShipping === m.id ? "none" : "1.5px solid var(--border)", background: selectedShipping === m.id ? "var(--purple)" : "transparent" }}>
                                {selectedShipping === m.id && <span className="text-[9px] text-white font-bold">✓</span>}
                              </div>
                              <div>
                                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{m.label}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.desc}</p>
                              </div>
                            </div>
                            <span className="font-bold text-sm" style={{ color: "var(--gold)" }}>{formatPrice(m.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold mb-4 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Mã giảm giá</h2>
                      <div className="flex gap-2">
                        <input value={voucher} onChange={e => setVoucher(e.target.value)} placeholder="Nhập mã voucher..."
                          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none bg-transparent font-[family-name:var(--font-body)]"
                          style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                        <Button variant="glass" onClick={() => {}}>Áp dụng</Button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="glass" onClick={() => setStep(1)}>Quay lại</Button>
                      <Button variant="gold" className="flex-1" onClick={() => setStep(3)}>
                        Tiếp theo: Thanh toán <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold mb-4 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Phương thức thanh toán</h2>
                      <div className="space-y-3">
                        {paymentMethods.map(m => {
                          const IconComp = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[m.icon] || LucideIcons.CreditCard;
                          return (
                            <div key={m.id} onClick={() => setSelectedPayment(m.id)}
                              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200"
                              style={{ background: "var(--bg-card)", border: selectedPayment === m.id ? "2px solid var(--gold)" : "1px solid var(--border)" }}>
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ border: selectedPayment === m.id ? "none" : "1.5px solid var(--border)", background: selectedPayment === m.id ? "var(--gold)" : "transparent" }}>
                                {selectedPayment === m.id && <span className="text-[9px] text-black font-bold">✓</span>}
                              </div>
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--gold-dim)" }}>
                                <IconComp className="w-5 h-5" style={{ color: "var(--gold)" }} />
                              </div>
                              <div>
                                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{m.label}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Confirm summary */}
                    <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <h3 className="font-bold text-sm font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>Xác nhận đơn hàng</h3>
                      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gold)" }} />
                        {addr.street}, {addr.ward}, {addr.district}
                        <button onClick={() => setStep(1)} className="ml-auto cursor-pointer"><Edit2 className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /></button>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <Truck className="w-4 h-4 flex-shrink-0" style={{ color: "var(--purple-light)" }} />
                        {shippingMethods.find(s => s.id === selectedShipping)!.label}
                        <button onClick={() => setStep(2)} className="ml-auto cursor-pointer"><Edit2 className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /></button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="glass" onClick={() => setStep(2)} disabled={loading}>Quay lại</Button>
                      <Button variant="gold" className="flex-1" loading={loading} onClick={async () => {
                        setLoading(true);
                        try {
                          const res = await api.post("/checkout", {
                            shippingAddressId: "00000000-0000-0000-0000-000000000000", // Dummy address UUID
                            skuIds: selectedItems.map(it => it.id)
                          });
                          const parentOrderId = res.data.parentOrderId;
                          setOrderId(parentOrderId);

                          if (selectedPayment === "vnpay") {
                            const vnRes = await api.post(`/payment/vnpay/create-url?orderId=${parentOrderId}`);
                            window.location.href = vnRes.data; // redirect to VNPay
                          } else {
                            // COD
                            setPlaced(true);
                          }
                        } catch (e: any) {
                          toast.error(e.response?.data?.message || "Lỗi khi đặt hàng");
                        } finally {
                          setLoading(false);
                        }
                      }}>
                        Đặt hàng — {formatPrice(total)}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right — Order summary (sticky) */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="sticky top-24 p-5 rounded-2xl space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <h3 className="font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Đơn hàng ({selectedItems.length})</h3>
                <div className="space-y-3 max-h-52 overflow-y-auto scroll-hide">
                  {selectedItems.map(it => (
                    <div key={it.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--bg-elevated)" }}>
                        <ShoppingCart className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>{it.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>x{it.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--text-primary)" }}>{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  {[["Tạm tính", formatPrice(subtotal)], ["Vận chuyển", formatPrice(shipFee)]].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>{l}</span>
                      <span style={{ color: "var(--text-primary)" }}>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-primary)" }}>Tổng</span>
                    <span className="text-gradient-gold font-[family-name:var(--font-heading)]">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
