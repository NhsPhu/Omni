"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Store, MapPin, CreditCard, Save, X, Edit2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function SellerSettingsPage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    pickupAddress: "",
  });

  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await api.get(`/shops/me`);
        setShop(res.data);
        setFormData({
          name: res.data.name || "",
          description: res.data.description || "",
          address: res.data.address || "",
          pickupAddress: res.data.pickupAddress || "",
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/shops/me", formData);
      setShop(res.data);
      setIsEditing(false);
      alert("Cập nhật thông tin cửa hàng thành công!");
    } catch (err: any) {
      alert("Lỗi khi cập nhật cửa hàng: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  if (!shop) return null;

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt Cửa hàng</h1>
          <p className="text-gray-500">Quản lý thông tin và thiết lập cơ bản của bạn</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
          >
            <Edit2 className="w-4 h-4" /> Chỉnh sửa
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" /> Thông tin cơ bản
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="font-medium text-gray-700 pt-2">Tên cửa hàng</div>
              <div className="md:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="text-gray-900 font-semibold py-2">{shop.name}</div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="font-medium text-gray-700 pt-2">Mô tả</div>
              <div className="md:col-span-2">
                {isEditing ? (
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="text-gray-600 py-2">{shop.description || "Chưa có mô tả"}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="font-medium text-gray-700">Trạng thái</div>
              <div className="md:col-span-2">
                <span className={`px-3 py-1.5 text-xs rounded-full font-bold ${
                  shop.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {shop.status === "ACTIVE" ? "ĐANG HOẠT ĐỘNG" : "CHỜ DUYỆT"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" /> Địa chỉ
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="font-medium text-gray-700 pt-2">Địa chỉ kinh doanh</div>
              <div className="md:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="text-gray-900 py-2">{shop.address}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="font-medium text-gray-700 pt-2">Kho lấy hàng</div>
              <div className="md:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="pickupAddress"
                    required
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="text-gray-900 py-2">{shop.pickupAddress}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-4 mb-6">
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                // Reset form data to current shop state
                setFormData({
                  name: shop.name || "",
                  description: shop.description || "",
                  address: shop.address || "",
                  pickupAddress: shop.pickupAddress || "",
                });
              }}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <X className="w-4 h-4" /> Hủy bỏ
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        )}
      </form>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" /> Thanh toán
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 mb-4">Thông tin ngân hàng đã được ẩn vì lý do bảo mật. Vui lòng liên hệ Admin nếu bạn muốn thay đổi.</p>
          <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed font-medium">
            Yêu cầu thay đổi tài khoản ngân hàng
          </button>
        </div>
      </div>
    </div>
  );
}
