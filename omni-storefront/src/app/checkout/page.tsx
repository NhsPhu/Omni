"use client";
import { motion } from "framer-motion";
import { MapPin, Truck, CreditCard, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import { CheckoutProvider, useCheckout } from "./CheckoutContext";
import CheckoutAddressStep from "./components/CheckoutAddressStep";
import CheckoutShippingStep from "./components/CheckoutShippingStep";
import CheckoutPaymentStep from "./components/CheckoutPaymentStep";
import OrderSummary from "./components/OrderSummary";

const STEPS = [
  { id: 1, label: "Địa chỉ",   icon: MapPin      },
  { id: 2, label: "Vận chuyển",icon: Truck       },
  { id: 3, label: "Thanh toán",icon: CreditCard  },
];

function CheckoutContent() {
  const { step, placed, orderId } = useCheckout();

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
              <CheckoutAddressStep />
              <CheckoutShippingStep />
              <CheckoutPaymentStep />
            </div>

            {/* Right — Order summary (sticky) */}
            <OrderSummary />
          </div>
        </div>
      </main>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
