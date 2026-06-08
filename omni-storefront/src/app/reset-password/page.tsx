"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import api from "@/lib/axios";
import { toast } from "sonner";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!token) {
      toast.error("Đường dẫn không hợp lệ hoặc thiếu Token");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      toast.success("Đặt lại mật khẩu thành công!");
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(16,185,129,0.15)" }}>
          <Check className="w-8 h-8" style={{ color: "#10B981" }} />
        </div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
          Thành công!
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>Mật khẩu của bạn đã được đặt lại.</p>
        <Link href="/auth"><Button variant="gold" className="w-full">Đăng nhập ngay <ArrowRight className="w-4 h-4" /></Button></Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold mb-2 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
        Đặt lại mật khẩu
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Mật khẩu mới</label>
          <div className="flex items-center rounded-xl transition-all duration-200" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <Lock className="w-4 h-4 ml-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 px-3 py-3 bg-transparent outline-none text-sm" style={{ color: "var(--text-primary)" }} placeholder="Tối thiểu 6 ký tự" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Xác nhận mật khẩu</label>
          <div className="flex items-center rounded-xl transition-all duration-200" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <Lock className="w-4 h-4 ml-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="flex-1 px-3 py-3 bg-transparent outline-none text-sm" style={{ color: "var(--text-primary)" }} placeholder="Nhập lại mật khẩu" />
          </div>
        </div>
      </div>

      <Button variant="gold" className="w-full mt-8" loading={loading} onClick={submit}>
        Đổi mật khẩu <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-base)" }}>
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="text-center text-gray-500">Đang tải...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
