"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, MapPin, Package, Ticket, Bell, LogOut, Camera, Shield, CreditCard, ChevronRight, Plus, Trash2, Edit2, Info, X, CheckCircle } from "lucide-react";
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
  const [addresses, setAddresses] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [publicVouchers, setPublicVouchers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loyaltyInfo, setLoyaltyInfo] = useState<any>(null);

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
  
  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({
    receiverName: "", receiverPhone: "", detail: "",
    ghnProvinceId: 0, ghnDistrictId: 0, ghnWardCode: "",
    province: "", district: "", ward: "",
    isDefault: false
  });

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  // PIN Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [pinForm, setPinForm] = useState({ oldPin: "", newPin: "", confirmPin: "" });
  const [savingPin, setSavingPin] = useState(false);

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
      
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('tab')) {
        setActiveTab(searchParams.get('tab')!);
      }
      if (searchParams.get('action') === 'set-password') {
        setActiveTab('security');
        setIsPasswordModalOpen(true);
      }
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (activeTab === "addresses") {
      fetchAddresses();
      if (provinces.length === 0) fetchProvinces();
    } else if (activeTab === "vouchers") {
      api.get("/me/vouchers").then(res => setVouchers(res.data)).catch(() => {});
      api.get("/public/vouchers/platform").then(res => setPublicVouchers(res.data)).catch(() => {});
    } else if (activeTab === "notifications") {
      api.get("/me/notifications?page=0&size=50").then(res => {
        if (res.data && res.data.content) setNotifications(res.data.content);
      }).catch(() => {});
    } else if (activeTab === "profile") {
      api.get("/me/loyalty").then(res => setLoyaltyInfo(res.data)).catch(() => {});
    }
  }, [activeTab]);

  const fetchAddresses = () => {
    api.get("/me/addresses").then(res => setAddresses(res.data)).catch(() => {});
  };

  const fetchProvinces = async () => {
    try {
      const res = await api.get('/public/ghn/provinces');
      setProvinces(res.data);
    } catch (e) {}
  };

  const fetchDistricts = async (provinceId: number) => {
    try {
      const res = await api.get(`/public/ghn/districts?provinceId=${provinceId}`);
      setDistricts(res.data);
    } catch (e) {}
  };

  const fetchWards = async (districtId: number) => {
    try {
      const res = await api.get(`/public/ghn/wards?districtId=${districtId}`);
      setWards(res.data);
    } catch (e) {}
  };

  const openAddressModal = (addr: any = null) => {
    setEditingAddress(addr);
    if (addr) {
      setAddrForm({
        receiverName: addr.receiverName, receiverPhone: addr.receiverPhone, detail: addr.detail,
        ghnProvinceId: addr.ghnProvinceId, ghnDistrictId: addr.ghnDistrictId, ghnWardCode: addr.ghnWardCode,
        province: addr.province, district: addr.district, ward: addr.ward, isDefault: addr.isDefault
      });
      fetchDistricts(addr.ghnProvinceId);
      fetchWards(addr.ghnDistrictId);
    } else {
      setAddrForm({ receiverName: "", receiverPhone: "", detail: "", ghnProvinceId: 0, ghnDistrictId: 0, ghnWardCode: "", province: "", district: "", ward: "", isDefault: false });
      setDistricts([]); setWards([]);
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      if (editingAddress) {
        await api.put(`/me/addresses/${editingAddress.id}`, addrForm);
        toast.success("Cập nhật địa chỉ thành công!");
      } else {
        await api.post("/me/addresses", addrForm);
        toast.success("Thêm địa chỉ thành công!");
      }
      setIsAddressModalOpen(false);
      fetchAddresses();
    } catch (err) {
      toast.error("Lỗi khi lưu địa chỉ. Vui lòng thử lại.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await api.delete(`/me/addresses/${id}`);
      toast.success("Xóa địa chỉ thành công!");
      fetchAddresses();
    } catch (e) {
      toast.error("Xóa địa chỉ thất bại.");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await api.patch(`/me/addresses/${id}/default`);
      toast.success("Đã đặt làm địa chỉ mặc định!");
      fetchAddresses();
    } catch (e) {
      toast.error("Thao tác thất bại.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/users/password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Cập nhật mật khẩu thành công!");
      setIsPasswordModalOpen(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      
      // Update hasPassword state locally
      useAuthStore.getState().updateUser({ hasPassword: true });
      
      // If there's a redirect parameter
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(redirect);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật mật khẩu thất bại.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinForm.newPin !== pinForm.confirmPin) {
      toast.error("Mã PIN mới không khớp!");
      return;
    }
    if (pinForm.newPin.length !== 6 || !/^\d+$/.test(pinForm.newPin)) {
      toast.error("Mã PIN phải là 6 chữ số!");
      return;
    }
    setSavingPin(true);
    try {
      await api.put("/users/pin", {
        oldPin: pinForm.oldPin,
        newPin: pinForm.newPin
      });
      toast.success("Thiết lập mã PIN thành công!");
      setIsPinModalOpen(false);
      setPinForm({ oldPin: "", newPin: "", confirmPin: "" });
      useAuthStore.getState().updateUser({ hasPin: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thiết lập mã PIN thất bại.");
    } finally {
      setSavingPin(false);
    }
  };

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

                    <div className="perspective-1000 mb-8" style={{ perspective: "1000px" }}>
                      <motion.div
                        onMouseMove={(e: any) => {
                          const card = e.currentTarget;
                          const rect = card.getBoundingClientRect();
                          const x = e.clientX - rect.left - rect.width / 2;
                          const y = e.clientY - rect.top - rect.height / 2;
                          card.style.transform = `rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`;
                        }}
                        onMouseLeave={(e: any) => {
                          e.currentTarget.style.transform = `rotateX(0deg) rotateY(0deg)`;
                        }}
                        style={{
                          background: "linear-gradient(135deg, #1f1f23 0%, #050509 100%)",
                          border: "1px solid var(--gold)",
                          transformStyle: "preserve-3d",
                          transition: "transform 0.1s ease-out"
                        }}
                        className="relative w-full max-w-sm mx-auto aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl cursor-pointer"
                      >
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, var(--gold) 0%, transparent 50%)", transform: "translateZ(0)" }}></div>
                        <div style={{ transform: "translateZ(30px)" }}>
                          <h3 className="text-lg font-bold text-gradient-gold uppercase tracking-widest flex items-center gap-2">
                            {loyaltyInfo?.tier || getRank()}
                            <Info 
                              className="w-4 h-4 text-gold/60 cursor-pointer hover:text-gold transition-colors" 
                              onClick={(e) => { e.stopPropagation(); setIsTierModalOpen(true); }}
                            />
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">OMNI VIP MEMBER</p>
                        </div>
                        <div style={{ transform: "translateZ(40px)" }} className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Card Holder</p>
                            <p className="text-base font-semibold text-white tracking-widest">{fullName || user.fullName}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 mb-1">
                              <p className="text-xs text-gray-400 uppercase tracking-wider">Omni Coins</p>
                              <Info 
                                className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gold transition-colors" 
                                onClick={() => toast.info("Omni Coin là điểm thưởng tích lũy, 1 xu = 1 VNĐ. Bạn có thể dùng để giảm giá trực tiếp khi thanh toán đơn hàng.")}
                              />
                            </div>
                            <p className="text-lg font-bold text-gold">{loyaltyInfo?.points || 0}</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

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

                {activeTab === "addresses" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Sổ địa chỉ</h2>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Quản lý địa chỉ nhận hàng của bạn</p>
                      </div>
                      <Button variant="gold" size="sm" onClick={() => openAddressModal()}><Plus className="w-4 h-4 mr-1" /> Thêm địa chỉ mới</Button>
                    </div>
                    
                    <div className="space-y-4">
                      {addresses.length > 0 ? addresses.map((addr) => (
                        <div key={addr.id} className="p-4 rounded-xl flex justify-between" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{addr.receiverName}</span>
                              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>| {addr.receiverPhone}</span>
                            </div>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{addr.detail}, {addr.ward}, {addr.district}, {addr.province}</p>
                            {addr.isDefault && <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded text-red-500 bg-red-500/10 border border-red-500/20">Mặc định</span>}
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <div className="flex gap-2">
                              <button onClick={() => openAddressModal(addr)} className="text-sm text-blue-500 hover:underline">Cập nhật</button>
                              {!addr.isDefault && <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm text-red-500 hover:underline">Xóa</button>}
                            </div>
                            {!addr.isDefault && <Button onClick={() => handleSetDefaultAddress(addr.id)} variant="ghost" size="sm" className="mt-2 text-xs h-7 px-2">Thiết lập mặc định</Button>}
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>Bạn chưa có địa chỉ nào được lưu.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "vouchers" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-1 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Kho Voucher</h2>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Các mã giảm giá bạn đã lưu</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {vouchers.length > 0 ? vouchers.map((v) => (
                        <div key={v.id} className="flex rounded-xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                          <div className="w-24 flex flex-col items-center justify-center p-2" style={{ background: "var(--grad-purple)" }}>
                            <Ticket className="w-8 h-8 text-white mb-1" />
                            <span className="text-xs text-white font-bold text-center">{v.voucherType === "SHOP" ? "SHOP" : "OMNI"}</span>
                          </div>
                          <div className="flex-1 p-3 flex flex-col justify-center">
                            <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{v.code} - Giảm {v.discountType?.toUpperCase() === 'PERCENTAGE' ? `${v.discountValue}%` : `${v.discountValue}đ`}</h4>
                            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Đơn tối thiểu {v.minOrderValue}đ</p>
                            <p className="text-[10px] mt-2 text-red-400">HSD: {new Date(v.validTo).toLocaleDateString("vi-VN")}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-2 text-center py-10 border border-dashed rounded-2xl border-[var(--border)]">
                          <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: "var(--text-muted)" }} />
                          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Kho voucher của bạn đang trống</p>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mt-10 mb-4 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Săn Voucher Omni</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {publicVouchers.filter((v: any) => v.category !== "SHIPPING").length > 0 ? publicVouchers.filter((v: any) => v.category !== "SHIPPING").map((v) => {
                        const myVoucher = vouchers.find(my => my.voucherId === v.id);
                        const isSaved = !!myVoucher;
                        if (myVoucher?.isUsed) return null; // Hide used vouchers
                        return (
                          <div key={v.id} className="flex rounded-xl overflow-hidden relative" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", opacity: isSaved ? 0.7 : 1 }}>
                            <div className="w-24 flex flex-col items-center justify-center p-2" style={{ background: "var(--grad-gold)" }}>
                              <Ticket className="w-8 h-8 text-black mb-1" />
                              <span className="text-xs text-black font-bold text-center">OMNI</span>
                            </div>
                            <div className="flex-1 p-3 flex flex-col justify-center pr-20">
                              <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{v.code} - Giảm {v.discountType?.toUpperCase() === 'PERCENTAGE' ? `${v.discountValue}%` : `${v.discountValue}đ`}</h4>
                              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Đơn tối thiểu {v.minOrderValue}đ</p>
                              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>HSD: {new Date(v.validTo).toLocaleDateString("vi-VN")}</p>
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isSaved ? (
                                <Button variant="glass" size="sm" disabled className="text-[10px] h-7 px-2">Đã lưu</Button>
                              ) : (
                                <Button variant="gold" size="sm" className="text-[10px] h-7 px-2" onClick={async () => {
                                  try {
                                    await api.post("/me/vouchers/save", { voucherId: v.id, voucherType: "PLATFORM" });
                                    toast.success("Lưu voucher thành công!");
                                    api.get("/me/vouchers").then(res => setVouchers(res.data));
                                  } catch (e: any) {
                                    toast.error(e.response?.data?.message || "Lỗi lưu voucher");
                                  }
                                }}>Lưu ngay</Button>
                              )}
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="col-span-2 text-center py-6">
                          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Hiện tại không có voucher nào khả dụng.</p>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mt-10 mb-4 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Săn Voucher Vận Chuyển</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {publicVouchers.filter((v: any) => v.category === "SHIPPING").length > 0 ? publicVouchers.filter((v: any) => v.category === "SHIPPING").map((v) => {
                        const myVoucher = vouchers.find(my => my.voucherId === v.id);
                        const isSaved = !!myVoucher;
                        if (myVoucher?.isUsed) return null;
                        return (
                          <div key={v.id} className="flex rounded-xl overflow-hidden relative" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", opacity: isSaved ? 0.7 : 1 }}>
                            <div className="w-24 flex flex-col items-center justify-center p-2 bg-green-500/20">
                              <Ticket className="w-8 h-8 text-green-500 mb-1" />
                              <span className="text-xs text-green-500 font-bold text-center">FREESHIP</span>
                            </div>
                            <div className="flex-1 p-3 flex flex-col justify-center pr-20">
                              <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{v.code} - Giảm {v.discountType?.toUpperCase() === 'PERCENTAGE' ? `${v.discountValue}%` : `${v.discountValue}đ`} phí vận chuyển</h4>
                              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Đơn tối thiểu {v.minOrderValue}đ</p>
                              <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>HSD: {new Date(v.validTo).toLocaleDateString("vi-VN")}</p>
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isSaved ? (
                                <Button variant="glass" size="sm" disabled className="text-[10px] h-7 px-2">Đã lưu</Button>
                              ) : (
                                <Button variant="gold" size="sm" className="text-[10px] h-7 px-2" onClick={async () => {
                                  try {
                                    await api.post("/me/vouchers/save", { voucherId: v.id, voucherType: "PLATFORM" });
                                    toast.success("Lưu voucher thành công!");
                                    api.get("/me/vouchers").then(res => setVouchers(res.data));
                                  } catch (e: any) {
                                    toast.error(e.response?.data?.message || "Lỗi lưu voucher");
                                  }
                                }}>Lưu ngay</Button>
                              )}
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="col-span-2 text-center py-6">
                          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Hiện tại không có voucher vận chuyển nào khả dụng.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-1 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Thông báo</h2>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Cập nhật mới nhất từ hệ thống</p>
                    <div className="space-y-3">
                      {notifications.length > 0 ? notifications.map((notif) => (
                        <div key={notif.id} className="p-4 rounded-xl flex gap-4" style={{ background: notif.isRead ? "var(--bg-surface)" : "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--grad-gold)" }}>
                            <Bell className="w-5 h-5 text-black" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-sm ${notif.isRead ? "font-medium" : "font-bold"}`} style={{ color: "var(--text-primary)" }}>{notif.title}</h4>
                            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{notif.message}</p>
                            <span className="text-[10px] mt-2 block" style={{ color: "var(--text-muted)" }}>{new Date(notif.createdAt).toLocaleString("vi-VN")}</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>Không có thông báo nào.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "payment" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Phương thức thanh toán</h2>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Quản lý thẻ và ví điện tử</p>
                      </div>
                      <Button variant="gold" size="sm"><Plus className="w-4 h-4 mr-1" /> Thêm thẻ/ví mới</Button>
                    </div>
                    <div className="p-6 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-surface)", border: "1px dashed var(--border)" }}>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bạn chưa liên kết phương thức thanh toán nào.</p>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-1 font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Bảo mật tài khoản</h2>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Cài đặt mật khẩu và các lớp bảo mật</p>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl flex justify-between items-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                        <div>
                          <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Mật khẩu đăng nhập</p>
                          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
                        </div>
                        <Button variant="glass" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
                          {user.hasPassword ? "Cập nhật" : "Thiết lập"}
                        </Button>
                      </div>
                      <div className="p-4 rounded-xl flex justify-between items-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                        <div>
                          <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Thiết lập mã PIN</p>
                          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Dùng để xác thực giao dịch</p>
                        </div>
                        <Button variant="glass" size="sm" onClick={() => setIsPinModalOpen(true)}>
                          {user.hasPin ? "Cập nhật" : "Thiết lập"}
                        </Button>
                      </div>
                      <div className="p-4 rounded-xl flex justify-between items-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                        <div>
                          <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Liên kết mạng xã hội</p>
                          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{provider}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab !== "profile" && activeTab !== "addresses" && activeTab !== "vouchers" && activeTab !== "notifications" && activeTab !== "payment" && activeTab !== "security" && (
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

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddressModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-xl rounded-3xl p-6 shadow-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>{editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h3>
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Họ và tên</label>
                  <input type="text" required value={addrForm.receiverName} onChange={e => setAddrForm({...addrForm, receiverName: e.target.value})} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="Tên người nhận" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Số điện thoại</label>
                  <input type="tel" required value={addrForm.receiverPhone} onChange={e => setAddrForm({...addrForm, receiverPhone: e.target.value})} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="Số điện thoại" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Tỉnh/Thành phố</label>
                  <select required value={addrForm.ghnProvinceId || ""} 
                    onChange={e => {
                      const id = Number(e.target.value);
                      const name = e.target.options[e.target.selectedIndex].text;
                      setAddrForm({...addrForm, ghnProvinceId: id, province: name, ghnDistrictId: 0, district: "", ghnWardCode: "", ward: ""});
                      setDistricts([]); setWards([]); fetchDistricts(id);
                    }} 
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="">Chọn Tỉnh/Thành</option>
                    {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Quận/Huyện</label>
                  <select required disabled={!addrForm.ghnProvinceId} value={addrForm.ghnDistrictId || ""} 
                    onChange={e => {
                      const id = Number(e.target.value);
                      const name = e.target.options[e.target.selectedIndex].text;
                      setAddrForm({...addrForm, ghnDistrictId: id, district: name, ghnWardCode: "", ward: ""});
                      setWards([]); fetchWards(id);
                    }} 
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none disabled:opacity-50" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Phường/Xã</label>
                <select required disabled={!addrForm.ghnDistrictId} value={addrForm.ghnWardCode || ""} 
                  onChange={e => {
                    const code = e.target.value;
                    const name = e.target.options[e.target.selectedIndex].text;
                    setAddrForm({...addrForm, ghnWardCode: code, ward: name});
                  }} 
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none disabled:opacity-50" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map(w => <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Địa chỉ cụ thể</label>
                <input type="text" required value={addrForm.detail} onChange={e => setAddrForm({...addrForm, detail: e.target.value})} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="Số nhà, tên đường..." />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="isDefault" checked={addrForm.isDefault} onChange={e => setAddrForm({...addrForm, isDefault: e.target.checked})} className="w-4 h-4 rounded border-gray-500 text-gold focus:ring-gold" style={{ accentColor: "var(--gold)" }} />
                <label htmlFor="isDefault" className="text-sm cursor-pointer" style={{ color: "var(--text-primary)" }}>Đặt làm địa chỉ mặc định</label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <Button type="button" variant="glass" onClick={() => setIsAddressModalOpen(false)}>Hủy</Button>
                <Button type="submit" variant="gold" disabled={savingAddress}>{savingAddress ? "Đang lưu..." : "Lưu địa chỉ"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md rounded-3xl p-6 shadow-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>{user.hasPassword ? "Đổi mật khẩu" : "Thiết lập mật khẩu"}</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {user.hasPassword && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Mật khẩu hiện tại</label>
                  <input type="password" required value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="Nhập mật khẩu hiện tại" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Mật khẩu mới</label>
                <input type="password" required minLength={6} value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="Nhập mật khẩu mới" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Xác nhận mật khẩu mới</label>
                <input type="password" required minLength={6} value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="Nhập lại mật khẩu mới" />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <Button type="button" variant="glass" onClick={() => setIsPasswordModalOpen(false)}>Hủy</Button>
                <Button type="submit" variant="gold" disabled={savingPassword}>{savingPassword ? "Đang xử lý..." : "Xác nhận"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* PIN Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPinModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md rounded-3xl p-6 shadow-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>{user.hasPin ? "Đổi mã PIN" : "Thiết lập mã PIN"}</h3>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              {user.hasPin && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Mã PIN hiện tại</label>
                  <input type="password" required maxLength={6} value={pinForm.oldPin} onChange={e => setPinForm({...pinForm, oldPin: e.target.value.replace(/\D/g, '')})} className="w-full px-4 py-3 rounded-xl text-sm outline-none tracking-[0.5em]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="******" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Mã PIN mới (6 chữ số)</label>
                <input type="password" required minLength={6} maxLength={6} value={pinForm.newPin} onChange={e => setPinForm({...pinForm, newPin: e.target.value.replace(/\D/g, '')})} className="w-full px-4 py-3 rounded-xl text-sm outline-none tracking-[0.5em]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="******" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Xác nhận mã PIN mới</label>
                <input type="password" required minLength={6} maxLength={6} value={pinForm.confirmPin} onChange={e => setPinForm({...pinForm, confirmPin: e.target.value.replace(/\D/g, '')})} className="w-full px-4 py-3 rounded-xl text-sm outline-none tracking-[0.5em]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="******" />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <Button type="button" variant="glass" onClick={() => setIsPinModalOpen(false)}>Hủy</Button>
                <Button type="submit" variant="gold" disabled={savingPin}>{savingPin ? "Đang xử lý..." : "Xác nhận"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Tier Info Modal */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTierModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md rounded-3xl p-6 shadow-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Hạng thành viên Omni</h3>
               <button onClick={() => setIsTierModalOpen(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-200 transition-colors" /></button>
            </div>
            
            <div className="space-y-4">
               {[
                 { name: "BRONZE", minPoints: 0, freeship: false, discount: "0%" },
                 { name: "SILVER", minPoints: 1000, freeship: false, discount: "2%" },
                 { name: "GOLD", minPoints: 5000, freeship: true, discount: "5%" },
                 { name: "DIAMOND", minPoints: 10000, freeship: true, discount: "10%" }
               ].map(tier => (
                 <div key={tier.name} className={`p-4 rounded-xl border ${loyaltyInfo?.tier === tier.name ? 'border-gold bg-gold/5' : 'border-[var(--border)] bg-[var(--bg-surface)]'}`}>
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-bold uppercase tracking-widest" style={{ color: loyaltyInfo?.tier === tier.name ? "var(--gold)" : "var(--text-primary)" }}>{tier.name}</span>
                     <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Từ {tier.minPoints.toLocaleString()} Omni Coins</span>
                   </div>
                   <ul className="text-sm space-y-1 mt-3" style={{ color: "var(--text-secondary)" }}>
                     <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Tích lũy 1 xu với mỗi 10,000đ mua sắm</li>
                     {tier.discount !== "0%" && <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Giảm giá tự động {tier.discount} khi mua sắm</li>}
                     {tier.freeship && <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Luôn được Miễn phí giao hàng (Freeship)</li>}
                   </ul>
                 </div>
               ))}
            </div>
            
            <p className="text-xs mt-6 text-center" style={{ color: "var(--text-muted)" }}>Omni Coins được cộng vào tài khoản ngay sau khi bạn xác nhận Đã nhận được hàng.</p>
          </motion.div>
        </div>
      )}

    </>
  );
}
