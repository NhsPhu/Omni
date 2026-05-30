"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { TrendingUp, Package, ShoppingCart, DollarSign } from "lucide-react";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (shop?.status === "PENDING_REVIEW") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
        <h2 className="text-xl font-bold text-yellow-800 mb-2">Đang chờ phê duyệt</h2>
        <p className="text-yellow-700">
          Cửa hàng của bạn đang được ban quản trị xem xét. Vui lòng quay lại sau!
        </p>
      </div>
    );
  }

  if (shop?.status === "REJECTED") {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
        <h2 className="text-xl font-bold text-red-800 mb-2">Đăng ký bị từ chối</h2>
        <p className="text-red-700">
          Rất tiếc, đăng ký cửa hàng của bạn không được phê duyệt. Vui lòng liên hệ hỗ trợ.
        </p>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const stats = [
    { title: "Tổng Doanh Thu", value: formatCurrency(vendorStats?.totalRevenue || 0), icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { title: "Đơn Hàng Mới", value: `${vendorStats?.newOrdersCount || 0}`, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Đang Xử Lý", value: `${vendorStats?.pendingOrdersCount || 0}`, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Sản Phẩm Đang Bán", value: `${activeProductsCount}`, icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan cửa hàng</h1>
        <p className="text-gray-500">Chào mừng trở lại, {shop?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Biểu đồ doanh thu 7 ngày qua</h2>
          <div className="flex-1 min-h-[200px] flex items-end justify-between gap-2 mt-4 pt-8 border-t border-gray-100 relative">
            {vendorStats?.revenueChart && vendorStats.revenueChart.length > 0 ? (
              vendorStats.revenueChart.map((point: any, idx: number) => {
                const maxRev = Math.max(...vendorStats.revenueChart.map((p:any) => p.revenue));
                const height = maxRev > 0 ? (point.revenue / maxRev) * 100 : 0;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group h-full justify-end">
                    <div className="relative w-full flex justify-center h-full items-end">
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 text-center">
                        {formatCurrency(point.revenue)}<br/>{point.orders} đơn
                      </div>
                      <div 
                        className="w-full max-w-[40px] bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all duration-500"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 truncate w-full text-center">{point.date}</span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
                <p>Chưa có dữ liệu doanh thu.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products Placeholder */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm bán chạy</h2>
          <div className="text-center py-10 text-gray-500">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Chưa có dữ liệu sản phẩm.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
