"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Truck, CreditCard, CheckCircle, ChevronRight, ShoppingCart, Edit2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
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

// Only standard method will be dynamically injected

const paymentMethods = [
  { id: "vnpay", label: "VNPay", icon: "CreditCard", desc: "Thanh toán qua VNPay" },
  { id: "cod", label: "Thanh toán khi nhận hàng", icon: "Truck", desc: "Trả tiền mặt khi nhận" }
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [selectedAddr, setSelectedAddr] = useState("");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods?.[0]?.id || "");
  const [voucher, setVoucher] = useState("");
  const [activeVoucher, setActiveVoucher] = useState<any>(null);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ receiverName: "", receiverPhone: "", detail: "", ward: "", district: "", province: "", ghnProvinceId: 0, ghnDistrictId: 0, ghnWardCode: "" });
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (showNewAddr && provinces.length === 0) {
      api.get('/public/ghn/provinces').then(res => setProvinces(res.data)).catch(console.error);
    }
  }, [showNewAddr]);

  useEffect(() => {
    if (newAddr.ghnProvinceId) {
      api.get(`/public/ghn/districts?provinceId=${newAddr.ghnProvinceId}`).then(res => setDistricts(res.data)).catch(console.error);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [newAddr.ghnProvinceId]);

  useEffect(() => {
    if (newAddr.ghnDistrictId) {
      api.get(`/public/ghn/wards?districtId=${newAddr.ghnDistrictId}`).then(res => setWards(res.data)).catch(console.error);
    } else {
      setWards([]);
    }
  }, [newAddr.ghnDistrictId]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [ghnFee, setGhnFee] = useState<number | null>(null);

  useEffect(() => {
    if (step === 2 && selectedAddr) {
      api.get(`/checkout/shipping-fee?addressId=${selectedAddr}`)
        .then(res => setGhnFee(res.data))
        .catch(console.error);
    }
  }, [step, selectedAddr]);

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
                imageUrl: it.imageUrl,
              });
            }
          });
        });
        setCartItems(items);
      }).catch((e: any) => {
        if (e.response?.status !== 401 && e.response?.status !== 403) console.error(e);
      });
      api.get("/me/addresses").then(res => {
        setAddresses(res.data);
        if (res.data.length > 0) {
          const defaultAddr = res.data.find((a: any) => a.isDefault);
          setSelectedAddr(defaultAddr ? defaultAddr.id : res.data[0].id);
        }
      }).catch(console.error);

    } catch (e) {
      console.error(e);
    }
  }, []);

  const selectedItems = cartItems;
  const subtotal  = selectedItems.reduce((s, it) => s + it.price * it.quantity, 0);
  
  const displayMethods = [
    {
      id: "standard",
      label: "Giao hàng tiêu chuẩn (GHN)",
      price: ghnFee !== null ? ghnFee : 30000,
      desc: "Vận chuyển toàn quốc"
    }
  ];

  const shipFee   = ghnFee !== null ? ghnFee : 30000;
  const actualShipFee = step >= 2 ? shipFee : 0;
  const total     = subtotal + actualShipFee;
  const addr      = addresses.find(a => a.id === selectedAddr);

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
                    {addresses.map(a => (
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
                            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{a.receiverName} — {a.receiverPhone}</p>
                            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{a.detail}, {a.ward}, {a.district}, {a.province}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setShowNewAddr(!showNewAddr)} className="w-full py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-colors duration-150 flex items-center justify-center gap-2"
                      style={{ border: "1.5px dashed var(--border)", color: "var(--text-muted)" }}>
                      {showNewAddr ? "- Hủy thêm địa chỉ" : "+ Thêm địa chỉ mới"}
                    </button>

                    <AnimatePresence>
                      {showNewAddr && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                          <div className="grid grid-cols-2 gap-3">
                            <input placeholder="Họ và tên" value={newAddr.receiverName} onChange={e => setNewAddr({...newAddr, receiverName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                            <input placeholder="Số điện thoại" value={newAddr.receiverPhone} onChange={e => setNewAddr({...newAddr, receiverPhone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                          </div>
                          <input placeholder="Số nhà, Tên đường" value={newAddr.detail} onChange={e => setNewAddr({...newAddr, detail: e.target.value})} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <select value={newAddr.ghnProvinceId || ""} onChange={e => {
                                const val = parseInt(e.target.value);
                                const item = provinces.find(p => p.ProvinceID === val);
                                setNewAddr({...newAddr, ghnProvinceId: val, province: item?.ProvinceName || "", ghnDistrictId: 0, district: "", ghnWardCode: "", ward: ""});
                              }} 
                              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                              <option value="" style={{color: "black"}}>Chọn Tỉnh/Thành phố</option>
                              {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID} style={{color: "black"}}>{p.ProvinceName}</option>)}
                            </select>
                            
                            <select value={newAddr.ghnDistrictId || ""} onChange={e => {
                                const val = parseInt(e.target.value);
                                const item = districts.find(d => d.DistrictID === val);
                                setNewAddr({...newAddr, ghnDistrictId: val, district: item?.DistrictName || "", ghnWardCode: "", ward: ""});
                              }} 
                              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} disabled={!newAddr.ghnProvinceId}>
                              <option value="" style={{color: "black"}}>Chọn Quận/Huyện</option>
                              {districts.map(d => <option key={d.DistrictID} value={d.DistrictID} style={{color: "black"}}>{d.DistrictName}</option>)}
                            </select>

                            <select value={newAddr.ghnWardCode || ""} onChange={e => {
                                const val = e.target.value;
                                const item = wards.find(w => w.WardCode === val);
                                setNewAddr({...newAddr, ghnWardCode: val, ward: item?.WardName || ""});
                              }} 
                              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} disabled={!newAddr.ghnDistrictId}>
                              <option value="" style={{color: "black"}}>Chọn Phường/Xã</option>
                              {wards.map(w => <option key={w.WardCode} value={w.WardCode} style={{color: "black"}}>{w.WardName}</option>)}
                            </select>
                          </div>
                          <Button variant="gold" className="w-full" onClick={async () => {
                            if (!newAddr.receiverName || !newAddr.receiverPhone || !newAddr.detail) return toast.error("Vui lòng điền đủ thông tin bắt buộc");
                            try {
                              const res = await api.post("/me/addresses", newAddr);
                              setAddresses([res.data, ...addresses]);
                              setSelectedAddr(res.data.id);
                              setShowNewAddr(false);
                              setNewAddr({ receiverName: "", receiverPhone: "", detail: "", ward: "", district: "", province: "", ghnProvinceId: 0, ghnDistrictId: 0, ghnWardCode: "" });
                              toast.success("Đã thêm địa chỉ");
                            } catch(e) {
                              toast.error("Lỗi khi thêm địa chỉ");
                            }
                          }}>Lưu địa chỉ mới</Button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button variant="gold" className="w-full" onClick={() => {
                      if (!selectedAddr) return toast.error("Vui lòng chọn địa chỉ giao hàng");
                      setStep(2);
                    }}>
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
                        {displayMethods.map(m => (
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
                        <Button variant={activeVoucher ? "glass" : "gold"} onClick={async () => {
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
                        }}>{activeVoucher ? "Hủy" : "Áp dụng"}</Button>
                      </div>
                      {activeVoucher && <p className="text-xs mt-2" style={{ color: "#10B981" }}>✓ Đã áp dụng giảm {activeVoucher.discountType === "PERCENTAGE" ? `${activeVoucher.discountValue}%` : formatPrice(activeVoucher.discountValue)}</p>}
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
                        {addr ? `${addr.detail}, ${addr.ward}, ${addr.district}` : "Chưa chọn địa chỉ"}
                        <button onClick={() => setStep(1)} className="ml-auto cursor-pointer"><Edit2 className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /></button>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <Truck className="w-4 h-4 flex-shrink-0" style={{ color: "var(--purple-light)" }} />
                        {displayMethods.find(s => s.id === selectedShipping)?.label || "Chưa chọn vận chuyển"}
                        <button onClick={() => setStep(2)} className="ml-auto cursor-pointer"><Edit2 className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /></button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="glass" onClick={() => setStep(2)} disabled={loading}>Quay lại</Button>
                      <Button variant="gold" className="flex-1" loading={loading} onClick={async () => {
                        if (!selectedAddr) return toast.error("Vui lòng chọn địa chỉ giao hàng");
                        if (user?.hasPin) {
                          setIsPinModalOpen(true);
                        } else {
                          await submitOrder();
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
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                        {it.imageUrl ? (
                          <img src={it.imageUrl.startsWith('http') ? it.imageUrl : `http://localhost:8080${it.imageUrl}`} className="w-full h-full object-cover" alt={it.name} />
                        ) : (
                          <ShoppingCart className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                        )}
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
                  {[
                    ["Tạm tính", formatPrice(subtotal)], 
                    ...(activeVoucher ? [["Giảm giá", `-${formatPrice(
                      activeVoucher.discountType === "PERCENTAGE" 
                        ? Math.min((subtotal * activeVoucher.discountValue) / 100, activeVoucher.maxDiscountAmount || 999999999)
                        : Math.min(activeVoucher.discountValue, subtotal)
                    )}`]] : []),
                    ["Vận chuyển", step >= 2 ? formatPrice(actualShipFee) : "—"]
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>{l}</span>
                      <span className={l === "Giảm giá" ? "text-green-400" : ""} style={{ color: l === "Giảm giá" ? undefined : "var(--text-primary)" }}>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-primary)" }}>Tổng</span>
                    <span className="text-gradient-gold font-[family-name:var(--font-heading)]">{formatPrice(
                      subtotal + actualShipFee - (activeVoucher 
                        ? (activeVoucher.discountType === "PERCENTAGE" 
                            ? Math.min((subtotal * activeVoucher.discountValue) / 100, activeVoucher.maxDiscountAmount || 999999999) 
                            : Math.min(activeVoucher.discountValue, subtotal))
                        : 0)
                    )}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PIN Verification Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPinModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-sm rounded-3xl p-6 shadow-xl text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Xác thực bảo mật</h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Vui lòng nhập mã PIN 6 số để tiếp tục</p>
            
            <input 
              type="password" 
              maxLength={6} 
              autoFocus
              value={pinInput} 
              onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))} 
              className="w-full px-4 py-4 rounded-xl text-2xl text-center outline-none tracking-[0.7em] font-mono mb-6" 
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} 
              placeholder="******" 
            />

            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <Button type="button" variant="glass" onClick={() => setIsPinModalOpen(false)}>Hủy</Button>
              <Button type="button" variant="gold" loading={loading} onClick={() => submitOrder(pinInput)}>Xác nhận</Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );

  async function submitOrder(pin?: string) {
    setLoading(true);
    try {
      const payload: any = {
        shippingAddressId: selectedAddr,
        skuIds: selectedItems.map(it => it.id),
        platformVoucherId: activeVoucher?.id || null
      };
      if (pin) payload.pin = pin;

      const res = await api.post("/checkout", payload);
      const parentOrderId = res.data.parentOrderId;
      setOrderId(parentOrderId);

      setIsPinModalOpen(false);
      setPinInput("");
      setPlaced(true);

      if (selectedPayment === "vnpay") {
        const vnRes = await api.post(`/payment/vnpay/create-url?orderId=${parentOrderId}`);
        window.location.href = vnRes.data;
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi khi đặt hàng");
      if (e.response?.data?.message?.toLowerCase().includes("pin")) {
        setPinInput("");
      } else {
        setIsPinModalOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }
}
