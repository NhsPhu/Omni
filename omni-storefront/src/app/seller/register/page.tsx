"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { Store, MapPin, CreditCard, CheckCircle, AlertCircle, ArrowRight, PackageOpen } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function SellerRegistrationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    pickupAddress: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/shops/register", formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center p-8 rounded-3xl glass border border-border max-w-md w-full mx-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-gradient-gold" style={{ color: "var(--gold)" }} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-heading)] mb-3">Vui lòng đăng nhập</h2>
          <p className="text-text-secondary mb-8 text-sm">Bạn cần đăng nhập bằng tài khoản Omni để tiếp tục đăng ký trở thành Nhà Bán Hàng.</p>
          <Button
            onClick={() => router.push("/auth/login?redirect=/seller/register")}
            variant="gold"
            className="w-full"
          >
            Đăng nhập ngay
          </Button>
        </motion.div>
      </div>
    );
  }

  if (user && user.hasPassword === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center p-8 rounded-3xl glass border border-border max-w-md w-full mx-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-heading)] mb-3">Bổ sung mật khẩu</h2>
          <p className="text-text-secondary mb-8 text-sm leading-relaxed">
            Tài khoản của bạn được tạo qua Google/Facebook nên chưa có mật khẩu. Để đăng nhập vào Kênh Người Bán sau này, bạn cần thiết lập mật khẩu trước khi đăng ký mở Shop.
          </p>
          <Button
            onClick={() => router.push("/profile/settings?action=set-password&redirect=/seller/register")}
            variant="gold"
            className="w-full shadow-[0_8px_30px_rgba(245,158,11,0.2)]"
          >
            Thiết lập mật khẩu ngay
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!mounted) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden p-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 glass border border-border max-w-md w-full p-10 rounded-3xl shadow-2xl text-center"
        >
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-text-primary font-[family-name:var(--font-heading)] mb-3">Đăng ký thành công!</h2>
          <p className="text-text-secondary mb-8 leading-relaxed text-sm">
            Hồ sơ nhà bán hàng của bạn đã được gửi đi. Đội ngũ Omni sẽ xem xét và phê duyệt trong vòng 24-48 giờ làm việc.
          </p>
          <Button onClick={() => router.push("/")} variant="gold" className="w-full">
            Trở về trang chủ
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold glass border border-gold/30 text-gold mb-6 uppercase tracking-wider">
            <PackageOpen className="w-4 h-4" /> Bán hàng cùng Omni
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary font-[family-name:var(--font-heading)] tracking-tight">
            Trở thành <span className="text-gradient-gold">Nhà Bán Hàng</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Tiếp cận hàng triệu khách hàng tiềm năng và bùng nổ doanh số với hệ sinh thái Omni.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="glass border border-border p-8 md:p-12 rounded-3xl shadow-2xl backdrop-blur-xl"
        >
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-8 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <form className="space-y-12" onSubmit={handleSubmit}>
            {/* 1. Thông tin cửa hàng */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-text-primary font-[family-name:var(--font-heading)]">Thông tin cửa hàng</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Tên cửa hàng <span className="text-red-400">*</span></label>
                  <input
                    type="text" name="name" required value={formData.name} onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    placeholder="Ví dụ: Omni Official Store"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Mô tả cửa hàng</label>
                  <textarea
                    name="description" rows={3} value={formData.description} onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                    placeholder="Giới thiệu về các sản phẩm bạn đang bán..."
                  />
                </div>
              </div>
            </div>

            {/* 2. Địa chỉ */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-text-primary font-[family-name:var(--font-heading)]">Thông tin địa chỉ</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Địa chỉ kinh doanh <span className="text-red-400">*</span></label>
                  <input
                    type="text" name="address" required value={formData.address} onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    placeholder="Số nhà, Tên đường, Phường/Xã..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Địa chỉ lấy hàng (Kho hàng) <span className="text-red-400">*</span></label>
                  <input
                    type="text" name="pickupAddress" required value={formData.pickupAddress} onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    placeholder="Nhập địa chỉ kho hàng để đơn vị vận chuyển đến lấy"
                  />
                </div>
              </div>
            </div>

            {/* 3. Ngân hàng */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-text-primary font-[family-name:var(--font-heading)]">Tài khoản nhận tiền</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Ngân hàng <span className="text-red-400">*</span></label>
                  <input
                    type="text" name="bankName" required value={formData.bankName} onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    placeholder="Ví dụ: Vietcombank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Số tài khoản <span className="text-red-400">*</span></label>
                  <input
                    type="text" name="bankAccountNumber" required value={formData.bankAccountNumber} onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    placeholder="Ví dụ: 0123456789"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Tên chủ tài khoản <span className="text-red-400">*</span></label>
                  <input
                    type="text" name="bankAccountName" required value={formData.bankAccountName} onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all uppercase"
                    placeholder="VIET HOA CHU KHONG DAU"
                  />
                  <p className="mt-2 text-xs text-text-muted">Tên chủ tài khoản phải khớp với tên trên Căn cước công dân.</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                disabled={loading}
                variant="gold"
                size="lg"
                className="w-full shadow-[0_8px_30px_rgba(245,158,11,0.2)]"
              >
                {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
