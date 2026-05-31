"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import api from "@/lib/axios";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const vnpTxnRef = searchParams.get("vnp_TxnRef");

    if (vnpTxnRef) {
      setOrderId(vnpTxnRef);
    }

    if (vnpResponseCode === "00") {
      // Payment successful — also notify backend IPN
      const params = Object.fromEntries(searchParams.entries());
      api.get("/payment/vnpay/callback", { params })
        .catch(console.error)
        .finally(() => setStatus("success"));
    } else {
      setStatus("failed");
    }
  }, [searchParams]);

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          {status === "loading" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 animate-spin" style={{ color: "var(--gold)" }} />
              <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
                Đang xác nhận thanh toán...
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Vui lòng đợi trong giây lát
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                <CheckCircle className="w-14 h-14" style={{ color: "#10B981" }} />
              </div>
              <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
                Thanh toán thành công!
              </h1>
              <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
                Mã đơn hàng: <strong className="text-gradient-gold">{orderId.split("-")[0].toUpperCase()}</strong>
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Đơn hàng của bạn đã được thanh toán qua VNPay. Chúng tôi sẽ xử lý và giao hàng sớm nhất!
              </p>
              <div className="flex gap-3 mt-6">
                <Button variant="gold" onClick={() => router.push("/")}>Về trang chủ</Button>
                <Button variant="glass" onClick={() => router.push("/orders")}>Xem đơn hàng</Button>
              </div>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
                <XCircle className="w-14 h-14" style={{ color: "#EF4444" }} />
              </div>
              <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
                Thanh toán thất bại
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
              </p>
              <div className="flex gap-3 mt-6">
                <Button variant="gold" onClick={() => router.push("/orders")}>Xem đơn hàng</Button>
                <Button variant="glass" onClick={() => router.push("/")}>Về trang chủ</Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--gold)" }} />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
