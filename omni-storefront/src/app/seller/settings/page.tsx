"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Store, MapPin, CreditCard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function SellerSettingsPage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await api.get(`/shops/me`);
        setShop(res.data);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 403) {
          router.push("/seller/register");
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchShopInfo();
  }, [user, router]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  if (!shop) return null;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt Cửa hàng</h1>
        <p className="text-gray-500">Quản lý thông tin và thiết lập cơ bản của bạn</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" /> Thông tin cơ bản
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-gray-700">Tên cửa hàng</div>
            <div className="md:col-span-2 text-gray-900 font-semibold">{shop.name}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-gray-700">Mô tả</div>
            <div className="md:col-span-2 text-gray-600">{shop.description || "Chưa có mô tả"}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-gray-700">Trạng thái</div>
            <div className="md:col-span-2">
              <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                shop.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
              }`}>
                {shop.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> Địa chỉ
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-gray-700">Địa chỉ kinh doanh</div>
            <div className="md:col-span-2 text-gray-900">{shop.address}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-gray-700">Kho lấy hàng</div>
            <div className="md:col-span-2 text-gray-900">{shop.pickupAddress}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" /> Thanh toán
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 mb-4">Thông tin ngân hàng đã được ẩn vì lý do bảo mật. Vui lòng liên hệ Admin nếu bạn muốn thay đổi.</p>
          <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed">
            Yêu cầu thay đổi tài khoản ngân hàng
          </button>
        </div>
      </div>
    </div>
  );
}
