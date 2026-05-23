"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Bell, Menu, X, ChevronDown, Store, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Button from "@/components/ui/Button";

const navLinks = [
  { label: "Danh mục", href: "#categories", children: ["Điện tử", "Thời trang", "Nhà cửa", "Làm đẹp", "Thể thao"] },
  { label: "Flash Sale", href: "#flash-sale" },
  { label: "Cửa hàng", href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
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
              {navLinks.map(link => (
                <div key={link.label} className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}>
                  <a href={link.href}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    {link.label === "Flash Sale" && <Sparkles className="w-3.5 h-3.5 text-gold" />}
                    {link.label}
                    {link.children && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                  </a>

                  <AnimatePresence>
                    {link.children && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-44 rounded-2xl overflow-hidden z-50"
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
                      >
                        {link.children.map(child => (
                          <a key={child} href="#categories"
                            className="block px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
                            {child}
                          </a>
                        ))}
                        <a href="#categories"
                          className="block px-4 py-2.5 text-sm font-semibold text-gradient-gold"
                          style={{ borderTop: "1px solid var(--border)" }}>
                          Xem tất cả →
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              <ThemeToggle />

              {/* Notification */}
              <Link href="/wishlist" className="relative w-9 h-9 flex items-center justify-center rounded-xl glass hover:bg-glass-hover transition-all duration-200 cursor-pointer" aria-label="Thông báo">
                <Bell className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 flex items-center justify-center bg-purple text-white text-[10px] font-bold rounded-full">2</span>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-xl glass hover:bg-glass-hover transition-all duration-200 cursor-pointer" aria-label="Giỏ hàng">
                <ShoppingCart className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold rounded-full"
                  style={{ background: "var(--gold)", color: "#050509" }}>3</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth"><Button variant="glass" size="sm">Đăng nhập</Button></Link>
                <Link href="/auth"><Button variant="gold" size="sm">Đăng ký</Button></Link>
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
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 w-72 z-50 flex flex-col lg:hidden"
            style={{ background: "var(--bg-elevated)", borderLeft: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="text-lg font-bold text-gradient-gold font-[family-name:var(--font-heading)]">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg glass cursor-pointer hover:bg-glass-hover">
                <X className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navLinks.map(link => (
                <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="p-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)" }}>
              <Link href="/auth" className="w-full"><Button variant="glass" className="w-full">Đăng nhập</Button></Link>
              <Link href="/auth" className="w-full"><Button variant="gold" className="w-full">Đăng ký</Button></Link>
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
