"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    brand: "",
    price: "",
    stockQuantity: "",
  });

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const catRes = await api.get("/categories");
        const flat: any[] = [];
        const traverse = (cats: any[], prefix = "") => {
          cats.forEach(c => {
            flat.push({ id: c.id, name: prefix + c.name });
            if (c.subCategories) traverse(c.subCategories, prefix + "-- ");
          });
        };
        traverse(catRes.data);
        setCategories(flat);

        // Fetch product
        const prodRes = await api.get(`/public/products/${params.id}`);
        const p = prodRes.data;
        setFormData({
          name: p.name,
          description: p.description,
          categoryId: p.categoryId,
          brand: p.brand || "",
          price: p.skus && p.skus.length > 0 ? p.skus[0].price : "",
          stockQuantity: p.skus && p.skus.length > 0 ? p.skus[0].stockQuantity : "",
        });
        if (p.images && p.images.length > 0) {
          setExistingImageUrl(p.images[0].imageUrl);
          setImagePreview(p.images[0].imageUrl);
        }
      } catch (err: any) {
        console.error(err);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setInitialLoading(false);
      }
    };
    if (user && params.id) {
      fetchInitialData();
    }
  }, [user, params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Vui lòng đăng nhập lại.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      let finalImageUrl = existingImageUrl;

      // 1. Upload Image if new one selected
      if (imageFile) {
        const formDataObj = new FormData();
        formDataObj.append("file", imageFile);
        const uploadRes = await api.post("/upload", formDataObj, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        finalImageUrl = uploadRes.data.url;
      }

      // 2. Create Product Payload
      const payload = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        brand: formData.brand || "OMNI",
        skus: [
          {
            skuCode: `SKU-${Date.now()}`, // Or keep original if we had it
            price: Number(formData.price),
            stockQuantity: Number(formData.stockQuantity)
          }
        ],
        images: finalImageUrl ? [
          { imageUrl: finalImageUrl, isPrimary: true, sortOrder: 0 }
        ] : [],
        attributes: {}
      };

      // 3. Put to API
      await api.put(`/vendor/products/${params.id}`, payload);
      toast.success("Cập nhật sản phẩm thành công!");
      router.push("/seller/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra khi lưu sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-12 text-center text-gray-500">Đang tải thông tin...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/seller/products" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sửa sản phẩm</h1>
          <p className="text-gray-500">Cập nhật thông tin chi tiết của sản phẩm</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Thông tin cơ bản</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Áo thun nam cotton cao cấp..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm *</label>
              <textarea
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả chi tiết về sản phẩm của bạn..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục sản phẩm *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Hình ảnh sản phẩm</h2>
          <div className="flex items-start gap-6">
            {imagePreview ? (
              <div className="relative w-32 h-32 rounded-lg border border-gray-200 overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(""); setExistingImageUrl(""); }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Tải ảnh lên</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">
                - Kích thước hình ảnh nên là 1:1 (vuông).<br/>
                - Kích thước tệp tối đa: 5MB.<br/>
                - Định dạng hỗ trợ: JPG, PNG, WEBP.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Bán hàng & Tồn kho</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VND) *</label>
              <input
                type="number"
                name="price"
                required
                min={0}
                value={formData.price}
                onChange={handleChange}
                placeholder="VD: 150000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng kho *</label>
              <input
                type="number"
                name="stockQuantity"
                required
                min={0}
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="VD: 100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Tên thương hiệu (Tùy chọn)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/seller/products">
            <button type="button" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Hủy bỏ
            </button>
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Đang lưu..." : "Cập nhật sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
