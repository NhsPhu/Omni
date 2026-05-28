"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Check, X, ShieldAlert } from "lucide-react";

export default function AdminShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchPendingShops = async () => {
      try {
        const res = await api.get("/admin/shops/pending");
        setShops(res.data.content || res.data); // Adjust depending on if it's paginated
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản Admin.");
        } else {
          setError("Không thể tải danh sách cửa hàng.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      router.push("/auth/login?redirect=/admin/shops");
    } else {
      fetchPendingShops();
    }
  }, [user, router]);

  const handleApprove = async (id: string, approve: boolean) => {
    if (!confirm(`Bạn có chắc chắn muốn ${approve ? "DUYỆT" : "TỪ CHỐI"} cửa hàng này?`)) return;
    try {
      await api.patch(`/admin/shops/${id}/approve?approve=${approve}`);
      setShops(shops.filter((s) => s.id !== id));
      alert(approve ? "Đã duyệt thành công!" : "Đã từ chối cửa hàng.");
    } catch (err: any) {
      alert("Đã xảy ra lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản trị viên - Phê duyệt Shop</h1>
          <p className="text-gray-500">Xem xét và duyệt các yêu cầu đăng ký nhà bán hàng mới</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center font-medium border border-red-200">
          {error}
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200 text-gray-500">
          Không có yêu cầu đăng ký cửa hàng nào đang chờ duyệt.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-medium">Tên cửa hàng</th>
                <th className="p-4 font-medium">Mô tả</th>
                <th className="p-4 font-medium">Địa chỉ kinh doanh</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{shop.name}</div>
                    <div className="text-xs text-gray-500 mt-1">Chủ sở hữu ID: {shop.ownerId}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{shop.description || "Không có"}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <div><span className="font-medium text-gray-800">Kho:</span> {shop.pickupAddress}</div>
                    <div className="mt-1"><span className="font-medium text-gray-800">KD:</span> {shop.address}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(shop.id, true)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Duyệt
                      </button>
                      <button
                        onClick={() => handleApprove(shop.id, false)}
                        className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200 transition flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
