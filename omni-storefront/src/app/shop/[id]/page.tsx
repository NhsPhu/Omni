"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Store, Star, MapPin, Package, Calendar, CheckCircle, Heart, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import api from "@/lib/axios";

export default function ShopPage() {
  const { id } = useParams();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [shopVouchers, setShopVouchers] = useState<any[]>([]);
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { isAuthenticated } = require("@/store/authStore").useAuthStore();

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      toast.success(`Bạn đã theo dõi ${shop?.name}!`, { icon: "🎉" });
    } else {
      toast.info(`Đã bỏ theo dõi ${shop?.name}`);
    }
  };

  const handleLocation = () => {
    if (shop?.address || shop?.name) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address || shop.name)}`, '_blank');
    } else {
      toast.error("Shop chưa cập nhật địa chỉ cụ thể");
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchShopAndProducts = async () => {
      try {
        const [shopRes, productsRes, vouchersRes] = await Promise.all([
          api.get(`/shops/${id}`),
          api.get(`/products/shops/${id}`),
          api.get(`/public/vouchers/shop/${id}`).catch(() => ({ data: [] }))
        ]);
        setShop(shopRes.data);
        setProducts(productsRes.data.content || productsRes.data);
        setShopVouchers(vouchersRes.data);

        if (isAuthenticated()) {
          api.get("/me/vouchers").then(res => setMyVouchers(res.data)).catch(() => {});
        }
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
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
          <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "4px solid var(--border)", borderTopColor: "var(--gold)" }}></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!shop) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--bg-base)" }}>
          <Store className="w-16 h-16 mb-4" style={{ color: "var(--text-muted)" }} />
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-4" style={{ color: "var(--text-primary)" }}>Không tìm thấy Shop</h1>
          <Button variant="gold" onClick={() => router.push("/")}>Về trang chủ</Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8" style={{ background: "var(--bg-base)" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          
          {/* Shop Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-[2rem] overflow-hidden mb-12 relative" 
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
            
            {/* Banner Cover */}
            <div className="h-48 md:h-64 w-full relative overflow-hidden">
               {shop.bannerUrl ? (
                 <img src={shop.bannerUrl.startsWith('http') ? shop.bannerUrl : `http://localhost:8080${shop.bannerUrl}`} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
               ) : (
                 <div className="absolute inset-0" style={{ background: "var(--grad-purple)" }}></div>
               )}
               {/* Optional Abstract Pattern overlay */}
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            
            <div className="px-6 md:px-10 pb-8 relative">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 md:-mt-20 mb-6">
                
                {/* Avatar */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden flex items-center justify-center flex-shrink-0 relative z-10"
                  style={{ background: "var(--bg-elevated)", border: "4px solid var(--bg-card)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                  {shop.logoUrl ? (
                    <img src={shop.logoUrl.startsWith('http') ? shop.logoUrl : `http://localhost:8080${shop.logoUrl}`} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-16 h-16" style={{ color: "var(--gold)" }} />
                  )}
                </motion.div>
                
                {/* Info */}
                <div className="flex-1 pb-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] text-gradient-gold">{shop.name}</h1>
                    {shop.taxCode && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Xác thực
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                      <Star className="w-4 h-4 fill-gold text-gold" />
                      <span className="font-bold" style={{ color: "var(--text-primary)" }}>{shop.rating?.toFixed(1) || "5.0"}</span>
                      <span style={{ color: "var(--text-muted)" }}>({shop.reviewCount || 0})</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                      <Package className="w-4 h-4" style={{ color: "var(--gold)" }} />
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{products.length}</span>
                      <span style={{ color: "var(--text-muted)" }}>Sản phẩm</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="pb-2 w-full md:w-auto flex gap-3">
                  <Button variant="glass" className="flex-1 md:flex-none" onClick={handleLocation}>
                    <MapPin className="w-4 h-4 mr-2" /> {shop.city || shop.province || "Vị trí"}
                  </Button>
                  <Button variant={isFollowing ? "glass" : "gold"} className="flex-1 md:flex-none transition-all duration-300" onClick={handleFollow}>
                    {isFollowing ? (
                      <><CheckCircle className="w-4 h-4 mr-2" /> Đang theo dõi</>
                    ) : (
                      <><Heart className="w-4 h-4 mr-2" /> Theo dõi</>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-sm md:text-base leading-relaxed max-w-4xl" style={{ color: "var(--text-secondary)" }}>
                  {shop.description || "Chào mừng bạn đến với shop của chúng tôi. Chúng tôi cam kết mang lại những sản phẩm chất lượng, chuẩn phong cách Biệt phủ Omni!"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Shop Vouchers Section */}
          {shopVouchers.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Ticket className="w-6 h-6 text-gold" />
                <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Mã Giảm Giá Của Shop</h2>
              </div>
              
              <div className="flex overflow-x-auto pb-4 gap-4 scroll-hide">
                {shopVouchers.map((v) => {
                  const myVoucher = myVouchers.find(my => my.voucherId === v.id);
                  const isSaved = !!myVoucher;
                  if (myVoucher?.isUsed) return null; // Hide used vouchers
                  return (
                    <div key={v.id} className="flex rounded-xl overflow-hidden flex-shrink-0" style={{ width: "320px", background: "var(--bg-card)", border: "1px solid var(--border)", opacity: isSaved ? 0.7 : 1 }}>
                      <div className="w-24 flex flex-col items-center justify-center p-2 relative" style={{ background: "var(--grad-purple)" }}>
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: "var(--bg-base)" }}></div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: "var(--bg-card)" }}></div>
                        <Ticket className="w-8 h-8 text-white mb-1" />
                        <span className="text-xs text-white font-bold text-center">SHOP</span>
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-center relative">
                        <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{v.code} - Giảm {v.discountType?.toUpperCase() === 'PERCENTAGE' ? `${v.discountValue}%` : `${require('@/lib/utils').formatPrice(v.discountValue)}`}</h4>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-secondary)" }}>Đơn tối thiểu {require('@/lib/utils').formatPrice(v.minOrderValue)}</p>
                        <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>HSD: {new Date(v.validTo).toLocaleDateString("vi-VN")}</p>
                        
                        <div className="absolute right-3 bottom-3">
                          {isSaved ? (
                            <Button variant="glass" size="sm" disabled className="text-[10px] h-7 px-2">Đã lưu</Button>
                          ) : (
                            <Button variant="gold" size="sm" className="text-[10px] h-7 px-2" onClick={async () => {
                              if (!isAuthenticated()) {
                                toast.error("Vui lòng đăng nhập để lưu mã");
                                router.push("/auth");
                                return;
                              }
                              try {
                                await api.post("/me/vouchers/save", { voucherId: v.id, voucherType: "SHOP" });
                                toast.success("Lưu voucher thành công!");
                                setMyVouchers(prev => [...prev, { voucherId: v.id }]);
                              } catch (e: any) {
                                toast.error(e.response?.data?.message || "Lỗi lưu voucher");
                              }
                            }}>Lưu ngay</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Shop Products */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Khám phá Sản Phẩm</h2>
              <div className="flex items-center gap-2">
                {/* Phễu lọc tùy chọn nếu muốn thêm sau */}
              </div>
            </div>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {products.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * (i % 10) }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center rounded-3xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <Package className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Shop chưa có sản phẩm</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Hãy quay lại sau nhé!</p>
              </div>
            )}
          </motion.div>
          
        </div>
      </main>
      <Footer />
    </>
  );
}
