"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Store, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useSocialAuth } from "@/hooks/useSocialAuth";

type Mode = "login" | "register" | "forgot";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"GOOGLE" | "FACEBOOK" | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "", confirmPass: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setToken } = useAuthStore();
  const router = useRouter();
  const { loginWithSocial } = useSocialAuth();

  const set = (key: string, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: "" }));
  };

  // ── Google OAuth handler ──────────────────────────────────────────
  const handleGoogle = useGoogleLogin({
    onSuccess: async (res) => {
      setSocialLoading("GOOGLE");
      await loginWithSocial("GOOGLE", res.access_token);
      setSocialLoading(null);
    },
    onError: () => {
      toast.error("Đăng nhập Google thất bại. Vui lòng thử lại.");
      setSocialLoading(null);
    },
  });

  // ── Facebook SDK handler ──────────────────────────────────────────
  const handleFacebook = () => {
    if (typeof window === "undefined" || !window.FB) {
      toast.error("Facebook SDK chưa tải. Vui lòng thử lại sau vài giây.");
      return;
    }
    setSocialLoading("FACEBOOK");
    window.FB.login(
      async (response: any) => {
        if (response.authResponse?.accessToken) {
          await loginWithSocial("FACEBOOK", response.authResponse.accessToken);
        } else {
          toast.error("Bạn đã hủy đăng nhập Facebook.");
        }
        setSocialLoading(null);
      },
      { scope: "email,public_profile" }
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email không được để trống";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.password) e.password = "Mật khẩu không được để trống";
    else if (form.password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự";
    if (mode === "register") {
      if (!form.name) e.name = "Họ tên không được để trống";
      if (!form.phone) e.phone = "Số điện thoại không được để trống";
      else if (!/^(0|\+84)\d{9}$/.test(form.phone)) e.phone = "Số điện thoại không hợp lệ";
      if (form.password !== form.confirmPass) e.confirmPass = "Mật khẩu xác nhận không khớp";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    
    try {
      if (mode === "login") {
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password
        });
        setToken(res.data.accessToken);
        toast.success("Đăng nhập thành công!");
        setSuccess(true);
        setTimeout(() => router.push("/"), 1500);
      } else if (mode === "register") {
        await api.post("/auth/register", {
          email: form.email,
          password: form.password,
          fullName: form.name,
          phone: form.phone
        });
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setMode("login");
      } else if (mode === "forgot") {
        await api.post("/auth/forgot-password", { email: form.email });
        setSuccess(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* Left — Branding panel (desktop) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c0814 0%, #120b1a 50%, #0a0d18 100%)" }}>
        {/* Orbs */}
        <div className="orb orb-purple w-96 h-96 -top-20 -left-20 animate-orb-drift" style={{ opacity: 0.5 }} />
        <div className="orb orb-gold w-64 h-64 bottom-0 right-0 animate-orb-drift" style={{ opacity: 0.4, animationDelay: "-5s" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 text-center space-y-6 max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--grad-gold)" }}>
              <Store className="w-6 h-6" style={{ color: "#050509" }} />
            </div>
            <span className="text-3xl font-bold text-gradient-gold font-[family-name:var(--font-heading)]">Omni</span>
          </Link>
          <h2 className="text-3xl font-bold leading-tight font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
            Mua sắm <span className="text-gradient-iridescent italic">thông minh,</span>
            <br />bán hàng <span className="text-gradient-gold">dễ dàng</span>
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Tham gia cùng hơn 10.000 cửa hàng và 1 triệu khách hàng trên Omni
          </p>
          <div className="space-y-3 mt-8">
            {[["✓ Đăng ký miễn phí, không phí ẩn"], ["✓ Thanh toán an toàn, bảo vệ người mua"], ["✓ Giao hàng toàn quốc, nhanh 2-5 ngày"]].map(([t]) => (
              <div key={t} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#10B981" }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:max-w-md lg:flex-none w-full">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--grad-gold)" }}>
            <Store className="w-5 h-5" style={{ color: "#050509" }} />
          </div>
          <span className="text-2xl font-bold text-gradient-gold font-[family-name:var(--font-heading)]">Omni</span>
        </Link>

        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(16,185,129,0.15)" }}>
                  <Check className="w-8 h-8" style={{ color: "#10B981" }} />
                </div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
                  {mode === "login" ? "Đăng nhập thành công!" : mode === "forgot" ? "Đã gửi email!" : "Đăng ký thành công!"}
                </h2>
                <p style={{ color: "var(--text-secondary)" }}>
                  {mode === "forgot" ? "Kiểm tra hộp thư để đặt lại mật khẩu" : "Đang chuyển hướng..."}
                </p>
                <Link href="/"><Button variant="gold" className="w-full">Về trang chủ <ArrowRight className="w-4 h-4" /></Button></Link>
              </motion.div>
            ) : (
              <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <h1 className="text-2xl font-bold mb-2 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
                  {mode === "login" ? "Đăng nhập" : mode === "forgot" ? "Quên mật khẩu" : "Tạo tài khoản"}
                </h1>
                <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                  {mode === "login" ? "Chào mừng trở lại!" : mode === "forgot" ? "Nhập email để nhận liên kết đặt lại mật khẩu" : "Tham gia Omni ngay hôm nay, hoàn toàn miễn phí"}
                </p>

                {/* Social login buttons */}
                {mode !== "forgot" && (
                  <div className="flex gap-3 mb-6">
                    {/* Google */}
                    <button
                      onClick={() => handleGoogle()}
                      disabled={!!socialLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 glass disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                      onMouseEnter={e => { if (!socialLoading) { (e.currentTarget as HTMLElement).style.borderColor = "#4285F4"; (e.currentTarget as HTMLElement).style.color = "#4285F4"; } }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                    >
                      {socialLoading === "GOOGLE" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Google
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={handleFacebook}
                      disabled={!!socialLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 glass disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                      onMouseEnter={e => { if (!socialLoading) { (e.currentTarget as HTMLElement).style.borderColor = "#1877F2"; (e.currentTarget as HTMLElement).style.color = "#1877F2"; } }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                    >
                      {socialLoading === "FACEBOOK" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )}
                      Facebook
                    </button>
                  </div>
                )}

                {mode !== "forgot" && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>hoặc</span>
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  </div>
                )}

                {/* Form fields */}
                <div className="space-y-4">
                  {mode === "register" && (
                    <Field icon={User} label="Họ và tên" placeholder="Nguyễn Văn A" value={form.name} onChange={v => set("name", v)} error={errors.name} />
                  )}
                  <Field icon={Mail} label="Email" type="email" placeholder="example@email.com" value={form.email} onChange={v => set("email", v)} error={errors.email} />
                  {mode === "register" && (
                    <Field icon={Phone} label="Số điện thoại" type="tel" placeholder="0901234567" value={form.phone} onChange={v => set("phone", v)} error={errors.phone} />
                  )}
                  {mode !== "forgot" && (
                    <Field icon={Lock} label="Mật khẩu" type={showPass ? "text" : "password"} placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={v => set("password", v)} error={errors.password}
                      suffix={<button type="button" onClick={() => setShowPass(!showPass)} className="cursor-pointer p-1" style={{ color: "var(--text-muted)" }}>{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
                  )}
                  {mode === "register" && (
                    <Field icon={Lock} label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPass} onChange={v => set("confirmPass", v)} error={errors.confirmPass} />
                  )}
                </div>

                {mode === "login" && (
                  <div className="flex justify-end mt-3">
                    <button onClick={() => setMode("forgot")} className="text-xs cursor-pointer transition-colors duration-150" style={{ color: "var(--purple-light)" }}>Quên mật khẩu?</button>
                  </div>
                )}

                <Button variant="gold" className="w-full mt-6" loading={loading} onClick={submit}>
                  {mode === "login" ? "Đăng nhập" : mode === "forgot" ? "Gửi liên kết" : "Tạo tài khoản"}
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-sm text-center mt-6" style={{ color: "var(--text-muted)" }}>
                  {mode === "login" ? (
                    <>Chưa có tài khoản? <button onClick={() => setMode("register")} className="font-semibold cursor-pointer" style={{ color: "var(--gold)" }}>Đăng ký</button></>
                  ) : (
                    <>Đã có tài khoản? <button onClick={() => setMode("login")} className="font-semibold cursor-pointer" style={{ color: "var(--gold)" }}>Đăng nhập</button></>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type = "text", placeholder, value, onChange, error, suffix }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; error?: string; suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
      <div className="flex items-center rounded-xl transition-all duration-200"
        style={{ border: error ? "1px solid #ef4444" : focused ? "1px solid var(--border-purple)" : "1px solid var(--border)", background: "var(--bg-card)", boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.1)" : "none" }}>
        <Icon className="w-4 h-4 ml-3 flex-shrink-0" style={{ color: error ? "#ef4444" : focused ? "var(--purple-light)" : "var(--text-muted)" }} />
        <input type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 px-3 py-3 bg-transparent outline-none text-sm font-[family-name:var(--font-body)]"
          style={{ color: "var(--text-primary)" }} />
        {suffix}
      </div>
      {error && <p className="text-xs mt-1 text-red-400">{error}</p>}
    </div>
  );
}
