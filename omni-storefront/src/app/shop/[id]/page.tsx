"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Store, Star, MapPin, Package, Calendar } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import api from "@/lib/axios";

export default function ShopPage() {
  const { id } = useParams();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchShopAndProducts = async () => {
      try {
        const [shopRes, productsRes] = await Promise.all([
          api.get(`/shops/${id}`),
          api.get(`/products/shops/${id}`)
        ]);
        setShop(shopRes.data);
        setProducts(productsRes.data.content);
      } catch (err) {
        console.error("Failed to load shop details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopAndProducts();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#121212]">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!shop) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-[#121212]">
          <Store className="w-16 h-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Không tìm thấy Shop</h1>
          <button onClick={() => router.push("/")} className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg">Về trang chủ</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8f9fa] dark:bg-[#121212] py-8">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Shop Header */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <div className="h-32 md:h-48 bg-gradient-to-r from-violet-600 to-indigo-600 w-full relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 md:-mt-16 mb-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white dark:border-[#1e1e1e] bg-white dark:bg-[#1e1e1e] overflow-hidden flex items-center justify-center flex-shrink-0 relative z-10 shadow-md">
                  {shop.logoUrl ? (
                    <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-12 h-12 text-violet-500" />
                  )}
                </div>
                
                <div className="flex-1 pb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{shop.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-900 dark:text-gray-200">4.9</span>
                      <span>(1.2k đánh giá)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{products.length} Sản phẩm</span>
                    </div>
                    {shop.taxCode && (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Đã xác thực</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pb-2">
                  <button className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors w-full md:w-auto">
                    Theo dõi
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base max-w-3xl">
                  {shop.description || "Chào mừng bạn đến với shop của chúng tôi. Chúng tôi cam kết mang lại những sản phẩm chất lượng nhất!"}
                </p>
              </div>
            </div>
          </div>

          {/* Shop Products */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sản phẩm của Shop</h2>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-500 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Shop chưa đăng sản phẩm nào</p>
              </div>
            )}
          </div>
          
        </div>
      </main>
      <Footer />
    </>
  );
}

function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
