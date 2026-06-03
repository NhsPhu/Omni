"use client";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import { popularSearches, trustStats } from "@/data/mock";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: "var(--grad-hero)" }}>

      {/* Animated orbs — Liquid Glass effect */}
      <div className="orb orb-purple w-[600px] h-[600px] -top-32 -left-32 animate-orb-drift" style={{ opacity: 0.6 }} />
      <div className="orb orb-gold w-[400px] h-[400px] bottom-0 right-0 animate-orb-drift" style={{ opacity: 0.5, animationDelay: "-4s" }} />
      <div className="orb orb-blue w-[300px] h-[300px] top-1/3 right-1/4 animate-orb-drift" style={{ opacity: 0.3, animationDelay: "-8s" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Gradient noise for premium feel */}
      <div className="absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.3) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-6 pt-24 pb-16 flex flex-col items-center text-center gap-8">

        {/* Top badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium glass"
            style={{ border: "1px solid var(--border-purple)", color: "var(--purple-light)" }}>
            <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: "var(--gold)" }} />
            Nền tảng thương mại B2B2C #1 Việt Nam
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22,1,0.36,1] }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight font-[family-name:var(--font-heading)]"
          style={{ color: "var(--text-primary)" }}>
          Mua sắm{" "}
          <span className="text-gradient-iridescent italic">thông minh,</span>
          <br />
          <span className="text-gradient-gold">Bán hàng</span>{" "}
          <span style={{ color: "var(--text-secondary)" }}>dễ dàng</span>
        </motion.h1>

        {/* Sub */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg lg:text-xl max-w-xl leading-relaxed font-light" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
          Kết nối hàng nghìn cửa hàng uy tín với hàng triệu người mua.
          Hạ tầng đầy đủ — thanh toán, vận chuyển, quản lý.
        </motion.p>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl" style={{ filter: "drop-shadow(var(--shadow-glow-purple))" }}>
          <SearchBar size="large" />
        </motion.div>

        {/* Popular searches */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 items-center">
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>Phổ biến:</span>
          {popularSearches.slice(0, 5).map(term => (
            <button key={term} onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
              className="px-3 py-1 text-sm rounded-full glass transition-all duration-200 cursor-pointer"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-gold)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
              {term}
            </button>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => router.push('/search')} variant="gold" size="lg" className="shadow-[0_8px_40px_rgba(245,158,11,0.35)]">
            Khám phá ngay <ArrowRight className="w-5 h-5" />
          </Button>
          <Button onClick={() => window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5173'} variant="glass" size="lg">Bắt đầu bán hàng</Button>
        </motion.div>

        {/* Trust stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-2xl">
          {trustStats.map(({ label, value, icon }) => {
            const IconComp = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[icon] || LucideIcons.Package;
            return (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-2xl glass transition-all duration-300 hover:bg-glass-hover cursor-default">
                <IconComp className="w-5 h-5" style={{ color: "var(--gold)" }} />
                <span className="text-xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>{value}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Mini trust */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
          {[{ icon: ShieldCheck, text: "Bảo vệ người mua" }, { icon: Truck, text: "Giao hàng toàn quốc" }, { icon: RefreshCw, text: "Đổi trả 7 ngày" }].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="w-4 h-4" style={{ color: "var(--purple-light)" }} />
              {text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg-base))" }} />
    </section>
  );
}
