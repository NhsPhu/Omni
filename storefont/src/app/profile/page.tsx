"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, MapPin, Package, Heart, Ticket, Bell, LogOut, Camera, Shield, CreditCard, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const [avatar, setAvatar] = useState("");
  const [role, setRole] = useState("ROLE_CUSTOMER");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [provider, setProvider] = useState("LOCAL");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      const data = res.data;
      setFullName(data.fullName || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setAvatar(data.avatarUrl || "");
      setRole(data.role || "ROLE_CUSTOMER");
      setCreatedAt(data.createdAt || "");
      setProvider(data.provider || "LOCAL");
      useAuthStore.getState().updateUser({ avatarUrl: data.avatarUrl || "", fullName: data.fullName || "" });
    } catch (e) {
      console.error("Failed to fetch profile", e);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setFullName(currentUser.fullName || "");
        setEmail(currentUser.email || "");
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push("/auth");
    } else {
      fetchProfile();
    }
  }, [isAuthenticated, router]);

  if (!mounted || !user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/users/profile", { fullName, phone, email, avatarUrl: avatar });
      useAuthStore.getState().updateUser({ avatarUrl: avatar, fullName });
      toast.success("Cập nhật thông tin thành công!");
    } catch (e) {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Dung lượng file tối đa là 1MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAvatar(data.url);
        toast.success("Tải ảnh lên thành công! Nhấn Lưu để lưu lại thay đổi.");
      } else {
        toast.error("Lỗi khi tải ảnh lên");
      }
    } catch (e) {
      toast.error("Không thể tải ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  // Rank logic
  const getRank = () => {
    if (role === "ROLE_ADMIN") return "Quản trị viên";
    if (role === "ROLE_VENDOR") return "Đối tác";
    
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const now = new Date();
      const diffMonths = (now.getFullYear() - createdDate.getFullYear()) * 12 + now.getMonth() - createdDate.getMonth();
      if (diffMonths >= 12) return "Thành viên VIP";
      if (diffMonths >= 3) return "Thành viên thân thiết";
    }
    return "Thành viên";
  };

  const isEmailFromProvider = provider === "GOOGLE" || provider === "FACEBOOK";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const sidebarLinks = [
    { id: "profile", label: "Hồ sơ của tôi", icon: User },
    { id: "addresses", label: "Sổ địa chỉ", icon: MapPin },
    { id: "orders", label: "Đơn hàng", icon: Package, href: "/orders" },
    { id: "wishlist", label: "Yêu thích", icon: Heart, href: "/wishlist" },
    { id: "vouchers", label: "Kho Voucher", icon: Ticket },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "payment", label: "Phương thức thanh toán", icon: CreditCard },
    { id: "security", label: "Bảo mật tài khoản", icon: Shield },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16" style={{ background: "var(--bg-base)" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar */}
            <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
              {/* User summary */}
              <div className="p-6 rounded-3xl glass flex items-center gap-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0" style={{ background: "var(--grad-purple)" }}>
                  <User className="w-full h-full p-2 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--gold)" }}>{getRank()}</p>
                  <h3 className="font-bold truncate text-lg" style={{ color: "var(--text-primary)" }}>{fullName || user.fullName}</h3>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-3 rounded-3xl glass" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <nav className="flex flex-col space-y-1">
                  {sidebarLinks.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    const content = (
                      <>
                        <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-gold"}`} />
                        <span className={`text-sm font-medium transition-colors ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                          {item.label}
                        </span>
                        {isActive && (
                          <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" style={{ background: "var(--gold)" }} />
                        )}
                        <ChevronRight className={`w-4 h-4 ml-auto transition-colors ${isActive ? "text-white" : "text-gray-500 opacity-0 group-hover:opacity-100"}`} />
                      </>
                    );

                    const className = `relative flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden group ${isActive ? "shadow-md" : ""}`;
                    const style = isActive ? { background: "var(--grad-purple)", border: "1px solid var(--border-purple)" } : { background: "transparent", border: "1px solid transparent" };

                    if (item.href) {
                      return (
                        <Link key={item.id} href={item.href} className={className} style={style}>
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <button key={item.id} onClick={() => setActiveTab(item.id)} className={className} style={style}>
                        {content}
                      </button>
                    );
                  })}

                  <div className="pt-2 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <button onClick={handleLogout} className="w-full relative flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 group hover:bg-red-500/10 border border-transparent hover:border-red-500/20">
                      <LogOut className="w-5 h-5 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Đăng xuất</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 md:p-8 rounded-3xl glass h-full"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                {activeTab === "profile" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-1 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Hồ sơ của tôi</h2>
                    <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Quản lý thông tin bảo mật để bảo vệ tài khoản</p>

                    <div className="flex flex-col md:flex-row gap-10">
                      {/* Form */}
                      <form onSubmit={handleUpdate} className="flex-1 space-y-5">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Họ và tên</label>
                          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
                            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                            placeholder="Nhập họ tên" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Email</label>
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={isEmailFromProvider}
                            className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none ${isEmailFromProvider ? "opacity-60 cursor-not-allowed" : ""}`}
                            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                            placeholder="Email" required={isEmailFromProvider} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Số điện thoại</label>
                          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={!isEmailFromProvider && !!phone}
                            className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none ${(!isEmailFromProvider && !!phone) ? "opacity-60 cursor-not-allowed" : ""}`}
                            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                            placeholder="Chưa cập nhật" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>Giới tính</label>
                          <div className="flex items-center gap-6">
                            {["male", "female", "other"].map(val => (
                              <label key={val} className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${gender === val ? 'border-gold' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                  {gender === val && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                                </div>
                                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                                  {val === "male" ? "Nam" : val === "female" ? "Nữ" : "Khác"}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button type="submit" variant="gold" className="px-8" disabled={loading}>
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                          </Button>
                        </div>
                      </form>

                      {/* Avatar */}
                      <div className="w-full md:w-64 flex flex-col items-center justify-start border-t md:border-t-0 md:border-l pt-8 md:pt-0" style={{ borderColor: "var(--border)" }}>
                        <div className="relative w-28 h-28 rounded-full overflow-hidden mb-5 group cursor-pointer" style={{ background: "var(--bg-surface)", border: "2px solid var(--gold)" }}>
                          {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-full h-full p-4 text-gray-400" />
                          )}
                          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <Camera className="w-6 h-6 text-white" />
                            <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                          </label>
                        </div>
                        <label className="text-xs py-2 px-4 rounded-full border border-gray-600 hover:border-gray-400 glass cursor-pointer text-gray-300">
                          {uploading ? "Đang tải lên..." : "Chọn ảnh"}
                          <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                        </label>
                        <p className="text-[11px] text-center mt-3" style={{ color: "var(--text-muted)" }}>
                          Dung lượng file tối đa 1 MB.<br />Định dạng: JPEG, PNG
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab !== "profile" && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                    <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                      <Ticket className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Tính năng đang phát triển</h2>
                    <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
                      Khu vực này đang được nâng cấp để mang lại trải nghiệm tốt nhất. Vui lòng quay lại sau!
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
