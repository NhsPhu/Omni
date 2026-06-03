"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, Plus, X, Upload } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function CreateProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
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
  
  useEffect(() => {
    api.get("/categories").then(res => {
      const flat: any[] = [];
      const traverse = (cats: any[], prefix = "") => {
        cats.forEach(c => {
          flat.push({ id: c.id, name: prefix + c.name });
          if (c.children) traverse(c.children, prefix + "-- ");
        });
      };
      traverse(res.data);
      setCategories(flat);
      if (flat.length > 0) setFormData(f => ({ ...f, categoryId: flat[0].id }));
    }).catch(console.error);
  }, []);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      let uploadedImageUrl = "";

      // 1. Upload Image First
      if (imageFile) {
        const formDataObj = new FormData();
        formDataObj.append("file", imageFile);
        const uploadRes = await api.post("/upload", formDataObj, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploadedImageUrl = uploadRes.data.url;
      }

      // 2. Create Product Payload
      const payload = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        brand: formData.brand || "OMNI",
        skus: [
          {
            skuCode: `SKU-${Date.now()}`,
            price: Number(formData.price),
            stockQuantity: Number(formData.stockQuantity)
          }
        ],
        images: uploadedImageUrl ? [
          { imageUrl: uploadedImageUrl, isPrimary: true, sortOrder: 0 }
        ] : [],
        attributes: {}
      };

      // 3. Post to API
      await api.post("/vendor/products", payload);
      toast.success("Thêm sản phẩm thành công!");
      router.push("/seller/products");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/seller/products" className="p-2 hover:bg-surface-hover rounded-xl transition border border-transparent hover:border-border">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-heading)]">Thêm sản phẩm mới</h1>
          <p className="text-text-secondary mt-1">Điền thông tin chi tiết để đăng bán sản phẩm</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 border border-red-500/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass border border-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-lg font-bold text-text-primary mb-6 border-b border-border pb-4">Thông tin cơ bản</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Tên sản phẩm *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Áo thun nam cotton cao cấp..."
                className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Mô tả sản phẩm *</label>
              <textarea
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả chi tiết về sản phẩm của bạn..."
                className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Danh mục sản phẩm *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id} className="bg-gray-900 text-white py-2">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="glass border border-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-lg font-bold text-text-primary mb-6 border-b border-border pb-4">Hình ảnh sản phẩm</h2>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {imagePreview ? (
              <div className="relative w-40 h-40 rounded-xl border border-border overflow-hidden group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(""); }}
                  className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="w-40 h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gold hover:bg-gold/5 transition">
                <UploadCloud className="w-10 h-10 text-text-muted mb-2" />
                <span className="text-sm font-medium text-text-secondary">Tải ảnh lên</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
            <div className="flex-1 mt-2 sm:mt-0">
              <p className="text-sm text-text-secondary mb-2 leading-relaxed">
                - Kích thước hình ảnh nên là 1:1 (vuông).<br/>
                - Kích thước tệp tối đa: 5MB.<br/>
                - Định dạng hỗ trợ: JPG, PNG, WEBP.
              </p>
            </div>
          </div>
        </div>

        <div className="glass border border-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-lg font-bold text-text-primary mb-6 border-b border-border pb-4">Bán hàng & Tồn kho</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Giá bán (VND) *</label>
              <input
                type="number"
                name="price"
                required
                min={0}
                value={formData.price}
                onChange={handleChange}
                placeholder="VD: 150000"
                className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">Số lượng kho *</label>
              <input
                type="number"
                name="stockQuantity"
                required
                min={0}
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="VD: 100"
                className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-text-secondary mb-2">Thương hiệu</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Tên thương hiệu (Tùy chọn)"
                className="w-full px-4 py-3 bg-surface-hover border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link href="/seller/products">
            <Button type="button" variant="glass" size="lg">
              Hủy bỏ
            </Button>
          </Link>
          <Button 
            type="submit" 
            variant="gold"
            size="lg"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? "Đang lưu..." : "Lưu & Đăng bán"}
          </Button>
        </div>
      </form>
    </div>
  );
}
