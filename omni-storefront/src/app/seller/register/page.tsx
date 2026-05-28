"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { Store, MapPin, CreditCard, CheckCircle, AlertCircle } from "lucide-react";

export default function SellerRegistrationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    pickupAddress: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/shops/register", formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để đăng ký trở thành Nhà Bán Hàng.</p>
          <button
            onClick={() => router.push("/auth/login?redirect=/seller/register")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
          <p className="text-gray-600 mb-8">
            Hồ sơ nhà bán hàng của bạn đã được gửi đi. Đội ngũ quản trị viên sẽ xem xét và phê duyệt trong vòng 24-48 giờ làm việc.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Trở về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Trở thành Nhà Bán Hàng trên Omni</h1>
          <p className="mt-4 text-lg text-gray-600">
            Tiếp cận hàng triệu khách hàng và bùng nổ doanh số của bạn
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* 1. Thông tin cửa hàng */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2 border-b pb-2 mb-4">
                <Store className="w-5 h-5 text-blue-600" /> Thông tin cửa hàng
              </h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Tên cửa hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Ví dụ: Omni Official Store"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Mô tả cửa hàng
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Giới thiệu về các sản phẩm bạn đang bán..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Địa chỉ */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2 border-b pb-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" /> Thông tin địa chỉ
              </h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Địa chỉ kinh doanh <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="address"
                      id="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700">
                    Địa chỉ lấy hàng (Kho hàng) <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="pickupAddress"
                      id="pickupAddress"
                      required
                      value={formData.pickupAddress}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Ngân hàng */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2 border-b pb-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" /> Tài khoản ngân hàng (Để nhận tiền)
              </h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                    Tên ngân hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="bankName"
                      id="bankName"
                      required
                      value={formData.bankName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="VD: Vietcombank"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700">
                    Số tài khoản <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="bankAccountNumber"
                      id="bankAccountNumber"
                      required
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="bankAccountName" className="block text-sm font-medium text-gray-700">
                    Tên chủ tài khoản <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="bankAccountName"
                      id="bankAccountName"
                      required
                      value={formData.bankAccountName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="VIET HOA CHU KHONG DAU"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
              >
                {loading ? "Đang gửi đăng ký..." : "Gửi đăng ký trở thành Nhà Bán Hàng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
