"use client";
import { motion } from "framer-motion";
import { MapPin, Truck, Edit2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useCheckout } from "../CheckoutContext";

const paymentMethods = [
  { id: "vnpay", label: "VNPay", icon: "CreditCard", desc: "Thanh toán qua VNPay" },
  { id: "cod", label: "Thanh toán khi nhận hàng", icon: "Truck", desc: "Trả tiền mặt khi nhận" }
];

export default function CheckoutPaymentStep() {
  const {
    step, setStep,
    selectedPayment, setSelectedPayment,
    voucher, setVoucher, activeVoucher, setActiveVoucher,
    shippingVoucherInput, setShippingVoucherInput, activeShippingVoucher, setActiveShippingVoucher,
    myVouchers, setMyVouchers, platformVouchers,
    subtotal, total, addr, displayMethods, selectedShipping,
    loading, submitOrder, user, setIsPinModalOpen, selectedAddr
  } = useCheckout();

  if (step !== 3) return null;

  return (
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
          <Truck className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gold)" }} />
          {displayMethods.find(s => s.id === selectedShipping)?.label || "Chưa chọn vận chuyển"}
          <button onClick={() => setStep(2)} className="ml-auto cursor-pointer"><Edit2 className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} /></button>
        </div>
      </div>

      {/* Platform Voucher */}
      <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h3 className="font-bold text-sm font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>Mã giảm giá (Omni Voucher)</h3>
        <div className="flex gap-2">
          <input value={voucher} onChange={e => setVoucher(e.target.value)} placeholder="Nhập mã voucher..."
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none bg-transparent font-[family-name:var(--font-body)]"
            style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          <Button variant={activeVoucher && activeVoucher.code === voucher ? "glass" : "gold"} onClick={async () => {
            if (activeVoucher && activeVoucher.code === voucher) {
              setActiveVoucher(null);
              setVoucher("");
              return;
            }
            if (!voucher.trim()) return;
            try {
              const res = await api.get(`/public/vouchers/validate?code=${voucher.toUpperCase()}`);
              const v = res.data;
              if (v.category === "SHIPPING") return toast.error("Đây là mã miễn phí vận chuyển. Vui lòng nhập ở ô bên dưới.");
              if (subtotal < v.minOrderValue) {
                toast.error(`Đơn hàng tối thiểu ${formatPrice(v.minOrderValue)} để áp dụng mã này`);
                return;
              }
              
              const isSaved = myVouchers.some(my => my.voucherId === v.id);
              if (!isSaved) {
                try {
                  await api.post("/me/vouchers/save", { voucherId: v.id, voucherType: "PLATFORM" });
                  setMyVouchers([...myVouchers, { voucherId: v.id, isUsed: false }]);
                } catch (err: any) {
                  toast.error(err.response?.data?.message || "Lỗi lưu voucher");
                  return;
                }
              }

              setActiveVoucher(v);
              toast.success("Áp dụng mã thành công");
            } catch (e: any) {
              toast.error(e.response?.data?.message || "Mã giảm giá không hợp lệ");
            }
          }}>{activeVoucher && activeVoucher.code === voucher ? "Hủy" : "Áp dụng"}</Button>
        </div>
        {activeVoucher && <p className="text-xs mt-2" style={{ color: "#10B981" }}>✓ Đã áp dụng giảm {activeVoucher.discountType === "PERCENTAGE" ? `${activeVoucher.discountValue}%` : formatPrice(activeVoucher.discountValue)}</p>}
        
        {platformVouchers.filter(v => v.category !== "SHIPPING").length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Omni Voucher có sẵn của bạn:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {platformVouchers.filter(v => v.category !== "SHIPPING").map(v => {
                const isActive = activeVoucher?.id === v.id;
                const isEligible = subtotal >= v.minOrderValue;
                const myVoucher = myVouchers.find(my => my.voucherId === v.id);
                const isSaved = !!myVoucher;
                if (myVoucher?.isUsed) return null;
                return (
                  <div key={v.id} onClick={async () => {
                    if (!isEligible) { toast.error(`Đơn hàng tối thiểu ${formatPrice(v.minOrderValue)}`); return; }
                    if (isActive) { setActiveVoucher(null); setVoucher(""); }
                    else { 
                      if (!isSaved) {
                        try {
                          await api.post("/me/vouchers/save", { voucherId: v.id, voucherType: "PLATFORM" });
                          setMyVouchers([...myVouchers, { voucherId: v.id, isUsed: false }]);
                          toast.success("Đã lưu voucher vào kho!");
                        } catch (e: any) {
                          toast.error(e.response?.data?.message || "Lỗi lưu voucher. Có thể đã hết lượt.");
                          return;
                        }
                      }
                      setActiveVoucher(v); 
                      setVoucher(v.code); 
                    }
                  }} className={`p-3 rounded-xl border cursor-pointer transition-colors ${isActive ? 'bg-primary/5 border-gold' : isEligible ? 'hover:border-gold/50 border-gray-200' : 'opacity-50 border-gray-100 cursor-not-allowed'}`}>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs" style={{ color: isActive ? "var(--gold)" : "var(--text-primary)" }}>{v.code}</span>
                      <span className="text-xs font-bold text-green-500">
                        -{v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>Đơn tối thiểu {formatPrice(v.minOrderValue)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Shipping Vouchers */}
      <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h3 className="font-bold text-sm font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>Mã miễn phí vận chuyển (Shipping Voucher)</h3>
        <div className="flex gap-2">
          <input value={shippingVoucherInput} onChange={e => setShippingVoucherInput(e.target.value)} placeholder="Nhập mã vận chuyển..."
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none bg-transparent font-[family-name:var(--font-body)]"
            style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          <Button variant={activeShippingVoucher && activeShippingVoucher.code === shippingVoucherInput ? "glass" : "gold"} onClick={async () => {
            if (activeShippingVoucher && activeShippingVoucher.code === shippingVoucherInput) {
              setActiveShippingVoucher(null);
              setShippingVoucherInput("");
              return;
            }
            if (!shippingVoucherInput.trim()) return;
            try {
              const res = await api.get(`/public/vouchers/validate?code=${shippingVoucherInput.toUpperCase()}`);
              const v = res.data;
              if (v.category !== "SHIPPING") return toast.error("Đây không phải mã miễn phí vận chuyển.");
              if (subtotal < v.minOrderValue) {
                toast.error(`Đơn hàng tối thiểu ${formatPrice(v.minOrderValue)} để áp dụng mã này`);
                return;
              }
              
              const isSaved = myVouchers.some(my => my.voucherId === v.id);
              if (!isSaved) {
                try {
                  await api.post("/me/vouchers/save", { voucherId: v.id, voucherType: "PLATFORM" });
                  setMyVouchers([...myVouchers, { voucherId: v.id, isUsed: false }]);
                } catch (err: any) {
                  toast.error(err.response?.data?.message || "Lỗi lưu voucher");
                  return;
                }
              }

              setActiveShippingVoucher(v);
              toast.success("Áp dụng mã miễn phí vận chuyển thành công");
            } catch (e: any) {
              toast.error(e.response?.data?.message || "Mã giảm giá không hợp lệ");
            }
          }}>{activeShippingVoucher && activeShippingVoucher.code === shippingVoucherInput ? "Hủy" : "Áp dụng"}</Button>
        </div>
        {activeShippingVoucher && <p className="text-xs mt-2" style={{ color: "#10B981" }}>✓ Đã áp dụng giảm {activeShippingVoucher.discountType === "PERCENTAGE" ? `${activeShippingVoucher.discountValue}%` : formatPrice(activeShippingVoucher.discountValue)} phí vận chuyển</p>}
        
        {platformVouchers.filter(v => v.category === "SHIPPING").length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Shipping Voucher có sẵn của bạn:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {platformVouchers.filter(v => v.category === "SHIPPING").map(v => {
                const isActive = activeShippingVoucher?.id === v.id;
                const isEligible = subtotal >= v.minOrderValue;
                const myVoucher = myVouchers.find(my => my.voucherId === v.id);
                const isSaved = !!myVoucher;
                if (myVoucher?.isUsed) return null;
                return (
                  <div key={v.id} onClick={async () => {
                    if (!isEligible) { toast.error(`Đơn hàng tối thiểu ${formatPrice(v.minOrderValue)}`); return; }
                    if (isActive) { setActiveShippingVoucher(null); setShippingVoucherInput(""); }
                    else { 
                      if (!isSaved) {
                        try {
                          await api.post("/me/vouchers/save", { voucherId: v.id, voucherType: "PLATFORM" });
                          setMyVouchers([...myVouchers, { voucherId: v.id, isUsed: false }]);
                          toast.success("Đã lưu voucher vào kho!");
                        } catch (e: any) {
                          toast.error(e.response?.data?.message || "Lỗi lưu voucher. Có thể đã hết lượt.");
                          return;
                        }
                      }
                      setActiveShippingVoucher(v); 
                      setShippingVoucherInput(v.code); 
                    }
                  }} className={`p-3 rounded-xl border cursor-pointer transition-colors ${isActive ? 'bg-primary/5 border-gold' : isEligible ? 'hover:border-gold/50 border-gray-200' : 'opacity-50 border-gray-100 cursor-not-allowed'}`}>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs" style={{ color: isActive ? "var(--gold)" : "var(--text-primary)" }}>{v.code}</span>
                      <span className="text-xs font-bold text-green-500">
                        -{v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>Đơn tối thiểu {formatPrice(v.minOrderValue)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
  );
}
