"use client";
import { Store, Share2, Play, Camera, MessageCircle, Mail, Phone, MapPin, ArrowRight, Send } from "lucide-react";
import { footerLinks } from "@/data/mock";

const socialLinks = [
  { icon: Share2,        label: "Facebook",  href: "#", color: "#3B82F6" },
  { icon: Play,          label: "YouTube",   href: "#", color: "#EF4444" },
  { icon: Camera,        label: "Instagram", href: "#", color: "#EC4899" },
  { icon: MessageCircle, label: "Twitter/X", href: "#", color: "#60A5FA" },
];

export default function Footer() {
  return (
    <footer style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
      {/* Newsletter */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(ellipse 60% 100% at 70% 50%, var(--purple), transparent)" }} />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Nhận ưu đãi mỗi tuần</h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Đăng ký để nhận voucher, flash sale và sản phẩm mới</p>
            </div>
            <div className="flex w-full lg:w-auto max-w-md gap-2">
              <div className="flex-1 flex items-center px-4 rounded-xl glass" style={{ border: "1px solid var(--border)" }}>
                <Send className="w-4 h-4 flex-shrink-0 mr-2" style={{ color: "var(--text-muted)" }} />
                <input type="email" placeholder="Email của bạn..." className="flex-1 py-3 bg-transparent outline-none text-sm font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }} />
              </div>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 font-[family-name:var(--font-body)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)]"
                style={{ background: "var(--grad-gold)", color: "#050509" }}>
                Đăng ký <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <a href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--grad-gold)" }}>
                <Store className="w-5 h-5" style={{ color: "#050509" }} />
              </div>
              <span className="text-2xl font-bold text-gradient-gold font-[family-name:var(--font-heading)]">Omni</span>
            </a>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-secondary)" }}>
              Nền tảng thương mại B2B2C kết nối hàng nghìn cửa hàng với hàng triệu người mua trên toàn quốc.
            </p>
            <div className="space-y-2.5">
              {[[Mail,"support@omni.vn"],[Phone,"1900 1234 (8:00 – 22:00)"],[MapPin,"TP. Hồ Chí Minh, Việt Nam"]].map(([Icon, text], i) => {
                const Ic = Icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
                return (
                  <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Ic className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gold)" }} />
                    <span>{text as string}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2.5">
              {socialLinks.map(({ icon: Icon, label, href, color }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-xl glass cursor-pointer transition-all duration-200"
                  style={{ border: "1px solid var(--border)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.color = color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                  <Icon className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {[["Về Omni", footerLinks.about], ["Hỗ trợ", footerLinks.support], ["Người bán", footerLinks.seller]].map(([title, links]) => (
            <div key={title as string}>
              <h4 className="font-semibold mb-5 font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>{title as string}</h4>
              <ul className="space-y-3">
                {(links as { label: string; href: string }[]).map(l => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm transition-colors duration-150 cursor-pointer"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--gold)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>© 2026 Omni Marketplace. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-4">
            {["Điều khoản","Bảo mật","Cookie"].map(item => (
              <a key={item} href="#" className="text-xs cursor-pointer transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--gold)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
