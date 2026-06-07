"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Store, Wallet, MessageSquare, Star } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Do not show sidebar for the registration page and info page
  if (pathname === "/seller/register" || pathname === "/seller/info") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Tổng quan", href: "/seller", icon: LayoutDashboard },
    { name: "Sản phẩm", href: "/seller/products", icon: Package },
    { name: "Đơn hàng", href: "/seller/orders", icon: ShoppingBag },
    { name: "Tài chính", href: "/seller/wallet", icon: Wallet },
    { name: "Tin nhắn", href: "/seller/chat", icon: MessageSquare },
    { name: "Đánh giá", href: "/seller/reviews", icon: Star },
    { name: "Cài đặt Shop", href: "/seller/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-border flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/seller" className="flex items-center gap-2 text-gold font-bold text-xl font-[family-name:var(--font-heading)]">
            <Store className="w-6 h-6" />
            <span>Kênh Người Bán</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/seller" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gold/10 text-gold border border-gold/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-gold" : "text-text-muted"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-surface-hover/30">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-surface border border-border shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">{user?.fullName?.charAt(0) || 'A'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">{user?.fullName}</p>
              <p className="text-xs text-text-muted truncate">Nhà bán hàng</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 opacity-70" />
            Về trang mua sắm
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
        <div className="p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
