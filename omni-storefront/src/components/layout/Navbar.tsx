"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Bell, Menu, X, ChevronDown, Store, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/axios";
import SearchBar from "@/components/ui/SearchBar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useFlashSaleStore } from "@/store/flashSaleStore";
import { User as UserIcon, LogOut } from "lucide-react";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
const staticNavLinks = [
  { label: "Danh mục", href: "/#categories" },
  { label: "Flash Sale", href: "/#flash-sale" },
  { label: "Cửa hàng", href: "/seller/info" }, // Default to info, dynamic below
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const { user, isAuthenticated, logout } = useAuthStore();
  const isAuth = isAuthenticated();
  
  const itemCount = useCartStore(state => state.itemCount);
  const fetchCart = useCartStore(state => state.fetchCart);

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    
    api.get("/categories")
       .then(res => setCategories(res.data))
       .catch(console.error);
       
    useFlashSaleStore.getState().fetchActiveEvent();
       
    if (isAuthenticated()) {
      fetchCart();
      api.get("/users/profile").then(res => {
        if (res.data) {
          useAuthStore.getState().updateUser({ 
            avatarUrl: res.data.avatarUrl,
            fullName: res.data.fullName
          });
        }
      }).catch(() => {});
    }
       
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="relative overflow-hidden py-2 px-4 text-center text-xs font-medium"
        style={{ background: "linear-gradient(90deg, var(--purple) 0%, var(--gold) 50%, var(--purple) 100%)", backgroundSize: "200% 100%", animation: "shimmer-text 4s linear infinite" }}>
        <span className="text-white/90">
          ✦ Miễn phí vận chuyển cho đơn từ <strong>199.000đ</strong> — Mã: <strong className="text-white">OMNI2026</strong> ✦
        </span>
      </div>

      {/* Main header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "var(--bg-glass)" : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          boxShadow: scrolled ? "var(--shadow-card)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <a href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                style={{ background: "var(--grad-gold)" }}>
                <Store className="w-5 h-5" style={{ color: "#050509" }} />
              </div>
              <span className="text-xl font-bold hidden sm:block text-gradient-gold font-[family-name:var(--font-heading)]">
                Omni
              </span>
            </a>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-4">
              <SearchBar className="w-full" />
            </div>

            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-1">
              {staticNavLinks.map(link => {
                const isCategories = link.label === "Danh mục";
                const isStore = link.label === "Cửa hàng";
                const finalHref = isStore && user?.role === "ROLE_VENDOR" ? "/seller" : link.href;
                
                return (
                <div key={link.label} className="relative"
                  onMouseEnter={() => isCategories && setActiveDropdown(link.label)}
                  onMouseLeave={() => {
                    setActiveDropdown(null);
                    setActiveSubCategory(null);
                  }}>
                  <Link href={finalHref}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    {link.label === "Flash Sale" && <Sparkles className="w-3.5 h-3.5 text-gold" />}
                    {link.label}
                    {isCategories && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                  </Link>

                  <AnimatePresence>
                    {isCategories && activeDropdown === link.label && categories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-56 rounded-2xl z-50 flex"
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
                      >
                        <div className="w-full relative py-2">
                          {categories.slice(0, 8).map((cat: any) => (
                            <div key={cat.id} 
                              onMouseEnter={() => setActiveSubCategory(cat.id)}
                              className="relative"
                            >
                              <Link href={`/search?categoryId=${cat.id}`}
                                className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer"
                                style={{ color: "var(--text-secondary)", background: activeSubCategory === cat.id ? "var(--bg-glass)" : "transparent" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                                onMouseLeave={e => { if (activeSubCategory !== cat.id) (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
                                {cat.name}
                                {cat.children && cat.children.length > 0 && <ChevronDown className="w-3.5 h-3.5 opacity-50 -rotate-90" />}
                              </Link>
                              
                              {/* Subcategories */}
                              {activeSubCategory === cat.id && cat.children && cat.children.length > 0 && (
                                <div className="absolute top-0 left-[95%] w-48 rounded-2xl overflow-hidden z-50 py-2 shadow-xl" 
                                     style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                                  {cat.children.map((child: any) => (
                                    <Link key={child.id} href={`/search?categoryId=${child.id}`}
                                      className="block px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer"
                                      style={{ color: "var(--text-secondary)" }}
                                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          <Link href="/search"
                            className="block px-4 py-2.5 mt-2 text-sm font-semibold text-gradient-gold"
                            style={{ borderTop: "1px solid var(--border)" }}>
                            Xem tất cả danh mục →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )})}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              <ThemeToggle />

              {/* Notification */}
              {!mounted || !isAuth ? (
                <Link href="/auth" className="relative w-9 h-9 flex items-center justify-center rounded-xl glass hover:bg-glass-hover transition-all duration-200 cursor-pointer" aria-label="Thông báo">
                  <Bell className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                </Link>
              ) : (
                <NotificationDropdown />
              )}

              {/* Cart */}
              <Link href="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-xl glass hover:bg-glass-hover transition-all duration-200 cursor-pointer" aria-label="Giỏ hàng">
                <ShoppingCart className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                {mounted && isAuth && itemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white rounded-full"
                    style={{ background: "var(--grad-gold)", boxShadow: "0 2px 4px rgba(245, 158, 11, 0.4)" }}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </Link>

              <div className="hidden sm:flex items-center gap-2">
                {!mounted ? (
                   <div className="w-20 h-9"></div>
                ) : isAuth ? (
                  <div className="relative group cursor-pointer">
                    <div className="flex items-center gap-2 w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-xl glass hover:bg-glass-hover transition-all duration-200">
                      <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "var(--grad-purple)" }}>
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-full h-full p-1 text-white" />
                        )}
                      </div>
                      <span className="hidden sm:block text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user?.fullName?.split(" ").pop() || "User"}</span>
                      <ChevronDown className="hidden sm:block w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                    </div>
                    {/* User Dropdown */}
                    <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 rounded-xl overflow-hidden z-50"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                      {user?.role === "ROLE_VENDOR" && (
                        <>
                          <Link href="/seller" className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>Kênh Người Bán</Link>
                          <Link href="/shop/me" className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>Shop của bạn</Link>
                        </>
                      )}
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>Tài khoản của tôi</Link>
                      <Link href="/orders" className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>Đơn hàng của tôi</Link>
                      <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-white/5 text-red-400 cursor-pointer">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link href="/auth"><Button variant="glass" size="sm">Đăng nhập</Button></Link>
                    <Link href="/auth"><Button variant="gold" size="sm">Đăng ký</Button></Link>
                  </>
                )}
              </div>

              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl glass hover:bg-glass-hover transition-colors duration-200 cursor-pointer">
                {mobileOpen ? <X className="w-5 h-5" style={{ color: "var(--text-primary)" }} /> : <Menu className="w-5 h-5" style={{ color: "var(--text-primary)" }} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="lg:hidden pb-3"><SearchBar /></div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, x: "100%", filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: "100%", filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[85%] sm:w-80 z-50 flex flex-col lg:hidden"
            style={{ background: "var(--bg-elevated)", borderLeft: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-lg font-bold text-gradient-gold font-[family-name:var(--font-heading)]">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg glass cursor-pointer hover:bg-glass-hover">
                <X className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {categories.slice(0, 5).map(link => (
                <Link key={link.id} href={`/search?category=${link.id}`} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)" }}>
              {!mounted ? (
                  <div className="h-10"></div>
              ) : isAuth ? (
                <>
                  <div className="flex items-center gap-3 mb-2 px-2">
                    <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center overflow-hidden" style={{ background: "var(--grad-purple)" }}>
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{user?.fullName}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{user?.email}</div>
                    </div>
                  </div>
                  {user?.role === "ROLE_VENDOR" && (
                    <>
                      <Link href="/seller" onClick={() => setMobileOpen(false)} className="w-full"><Button variant="glass" className="w-full justify-start">Kênh Người Bán</Button></Link>
                      <Link href="/shop/me" onClick={() => setMobileOpen(false)} className="w-full"><Button variant="glass" className="w-full justify-start">Shop của bạn</Button></Link>
                    </>
                  )}
                  <Link href="/orders" onClick={() => setMobileOpen(false)} className="w-full"><Button variant="glass" className="w-full justify-start">Đơn hàng của tôi</Button></Link>
                  <Button variant="glass" className="w-full justify-start text-red-400" onClick={() => { logout(); setMobileOpen(false); }}>Đăng xuất</Button>
                </>
              ) : (
                <>
                  <Link href="/auth" onClick={() => setMobileOpen(false)} className="w-full"><Button variant="glass" className="w-full">Đăng nhập</Button></Link>
                  <Link href="/auth" onClick={() => setMobileOpen(false)} className="w-full"><Button variant="gold" className="w-full">Đăng ký</Button></Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} />
        )}
      </AnimatePresence>
    </>
  );
}
