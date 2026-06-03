"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { TrendingUp, Package, ShoppingCart, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const [vendorStats, setVendorStats] = useState<any>(null);
  const [activeProductsCount, setActiveProductsCount] = useState(0);

  useEffect(() => {
    const fetchShopInfo = async () => {
      if (!user) {
        router.push("/auth/login?redirect=/seller");
        return;
      }

      try {
        // Fetch the user's shop
        const res = await api.get(`/shops/me`);
        setShop(res.data);
        
        // Fetch stats if shop is active
        if (res.data.status === "ACTIVE") {
          const [statsRes, productsRes] = await Promise.all([
            api.get("/vendor/statistics"),
            api.get("/vendor/products?page=0&size=1")
          ]);
          setVendorStats(statsRes.data);
          setActiveProductsCount(productsRes.data.totalElements || 0);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          // No shop found, redirect to registration
          router.push("/seller/register");
        } else {
          console.error("Failed to load shop", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShopInfo();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (shop?.status === "PENDING_REVIEW") {
    return (
      <div className="glass border border-amber-500/30 bg-amber-500/10 p-8 rounded-2xl text-center">
        <h2 className="text-xl font-bold text-amber-400 mb-2 font-[family-name:var(--font-heading)]">Đang chờ phê duyệt</h2>
        <p className="text-amber-200/80">
          Cửa hàng của bạn đang được ban quản trị xem xét. Vui lòng quay lại sau!
        </p>
      </div>
    );
  }

  if (shop?.status === "REJECTED") {
    return (
      <div className="glass border border-red-500/30 bg-red-500/10 p-8 rounded-2xl text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2 font-[family-name:var(--font-heading)]">Đăng ký bị từ chối</h2>
        <p className="text-red-200/80">
          Rất tiếc, đăng ký cửa hàng của bạn không được phê duyệt. Vui lòng liên hệ hỗ trợ.
        </p>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const stats = [
    { title: "Tổng Doanh Thu", value: formatCurrency(vendorStats?.totalRevenue || 0), icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { title: "Đơn Hàng Mới", value: `${vendorStats?.newOrdersCount || 0}`, icon: ShoppingCart, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { title: "Đang Xử Lý", value: `${vendorStats?.pendingOrdersCount || 0}`, icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { title: "Sản Phẩm Đang Bán", value: `${activeProductsCount}`, icon: Package, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary font-[family-name:var(--font-heading)]">Tổng quan cửa hàng</h1>
        <p className="text-text-secondary mt-2">Chào mừng trở lại, <span className="text-gold font-medium">{shop?.name}</span>!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass p-6 rounded-2xl border border-border shadow-lg flex items-center gap-4 hover:border-gold/50 transition-colors">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${stat.bg}`}>
                <Icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass border border-border rounded-2xl p-6 shadow-lg flex flex-col">
          <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-4">Biểu đồ doanh thu 7 ngày qua</h2>
          <div className="flex-1 min-h-[300px] mt-4">
            {vendorStats?.revenueChart && vendorStats.revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vendorStats.revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                      return value;
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                    labelFormatter={(label) => `Ngày ${label}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-card)', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--gold)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                <TrendingUp className="w-12 h-12 opacity-20 mb-3" />
                <p>Chưa có dữ liệu doanh thu.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products Placeholder */}
        <div className="glass border border-border rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-4">Sản phẩm bán chạy</h2>
          <div className="text-center py-16 text-text-muted flex flex-col items-center justify-center">
            <Package className="w-12 h-12 mx-auto opacity-20 mb-3" />
            <p>Chưa có dữ liệu sản phẩm.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
