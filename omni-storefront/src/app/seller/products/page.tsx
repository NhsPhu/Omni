"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Plus, Edit, Trash2, Search, PackageX } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/vendor/products?page=0&size=50");
        setProducts(res.data.content);
      } catch (err: any) {
        if (err.response?.status === 403 || err.response?.status === 404) {
          router.push("/seller/register");
        } else {
          setError("Không thể tải danh sách sản phẩm.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProducts();
  }, [user, router]);

  const handleDelete = async (id: string) => {
    try {
      if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        await api.delete(`/vendor/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
        toast.success("Xóa sản phẩm thành công!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Xóa thất bại!");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-500">Tất cả sản phẩm của cửa hàng</p>
        </div>
        <button
          onClick={() => router.push("/seller/products/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm mới
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <PackageX className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">Chưa có sản phẩm nào</p>
            <p className="text-gray-500 mb-6">Bắt đầu bán hàng bằng cách thêm sản phẩm đầu tiên của bạn.</p>
            <button onClick={() => router.push("/seller/products/create")} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
              <Plus className="w-5 h-5" /> Thêm sản phẩm
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                  <th className="p-4 font-medium">Tên sản phẩm</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 text-ellipsis overflow-hidden whitespace-nowrap max-w-xs">{product.description}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        product.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => router.push(`/seller/products/edit/${product.id}`)} className="p-2 text-gray-400 hover:text-blue-600 transition" title="Sửa">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 transition" title="Xóa">
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
