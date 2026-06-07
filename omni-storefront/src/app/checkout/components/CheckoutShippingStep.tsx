"use client";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useCheckout } from "../CheckoutContext";

export default function CheckoutShippingStep() {
  const {
    step, setStep,
    selectedShipping, setSelectedShipping,
    displayMethods
  } = useCheckout();

  if (step !== 2) return null;

  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-4 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Phương thức vận chuyển</h2>
        <div className="space-y-3">
          {displayMethods.map(m => (
            <div key={m.id} onClick={() => setSelectedShipping(m.id)}
              className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200"
              style={{ background: "var(--bg-card)", border: selectedShipping === m.id ? "2px solid var(--gold)" : "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ border: selectedShipping === m.id ? "none" : "1.5px solid var(--border)", background: selectedShipping === m.id ? "var(--gold)" : "transparent" }}>
                  {selectedShipping === m.id && <span className="text-[9px] text-black font-bold">✓</span>}
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

      <div className="flex gap-3">
        <Button variant="glass" onClick={() => setStep(1)}>Quay lại</Button>
        <Button variant="gold" className="flex-1" onClick={() => setStep(3)}>
          Tiếp theo: Thanh toán <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
