"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, ShoppingCart, Zap, Shield, Truck, RefreshCw, Share2, ChevronRight, Minus, Plus, Store, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";

import { formatPrice, calcDiscount } from "@/lib/utils";
import api from "@/lib/axios";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useFlashSaleStore } from "@/store/flashSaleStore";
import { useChatStore } from "@/store/chatStore";
import { toast } from "sonner";

const GRADS = ["from-violet-600/80 to-indigo-600/80","from-amber-500/80 to-orange-600/80","from-purple-600/80 to-pink-600/80","from-blue-600/80 to-cyan-500/80"];
const TABS = ["Mô tả sản phẩm", "Thông số kỹ thuật", "Đánh giá"];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  // GLOBAL PRICING: Check if product is in an active flash sale
  const activeEvent = useFlashSaleStore(state => state.activeEvent);
  
  const [p, setP] = useState<any>(null); // State for product details
  const [activeImg, setActiveImg] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (p && isAuthenticated()) {
      api.get(`/wishlists/${p.id}/check`)
        .then(res => setWishlisted(res.data))
        .catch(console.error);
    }
  }, [p, isAuthenticated]);

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  useEffect(() => {
    if (params?.id) {
      Promise.all([
        api.get("/products/" + params.id),
        api.get("/products/" + params.id + "/reviews"),
        api.get("/products/" + params.id + "/recommendations"),
        api.post("/products/" + params.id + "/view").catch(() => {}) // Track view
      ]).then(([resP, resR, resRec]) => {
         const productData = resP.data;
         productData.reviews = resR.data.content;
         setP(productData);
         setRecommendations(resRec.data);
      }).catch((e: any) => {
        if (e.response?.status !== 401 && e.response?.status !== 403) console.error(e);
      });
    }
  }, [params?.id]);

  if (!p) return null;

  // Extract all attribute keys and unique values from SKUs
  const attributeKeys = new Set<string>();
  const attributeOptions: Record<string, string[]> = {};
  
  p?.skus?.forEach((s: any) => {
    // Normalize mock to attributes
    const attrs = { ...(s.attributes || {}) };
    if (s.color) attrs["Màu sắc"] = s.color;
    if (s.storage) attrs["Dung lượng"] = s.storage;
    if (s.size) attrs["Kích thước"] = s.size;
    
    Object.entries(attrs).forEach(([k, v]) => {
      attributeKeys.add(k);
      if (!attributeOptions[k]) attributeOptions[k] = [];
      if (!attributeOptions[k].includes(v as string)) attributeOptions[k].push(v as string);
    });
    s._normAttributes = attrs;
  });
  
  const availableKeys = Array.from(attributeKeys);

  // Find matching SKU
  const activeSku = p?.skus?.find((s:any) => {
    const attrs = s._normAttributes || {};
    return availableKeys.every(k => !selectedAttributes[k] || attrs[k] === selectedAttributes[k]);
  });
  
  // GLOBAL PRICING: Check if product is in an active flash sale
  const flashItem = activeEvent?.items?.find((item: any) => item.productId === p.id && item.flashStock > item.soldCount);
  
  const basePrice = activeSku?.price ?? p?.skus?.[0]?.price ?? 0;
  const currentPrice = flashItem ? flashItem.flashPrice : basePrice;
  const originalPriceForDiscount = flashItem ? basePrice : (activeSku?.originalPrice ?? p?.skus?.[0]?.originalPrice);
  const stockLeft = flashItem ? (flashItem.flashStock - flashItem.soldCount) : (activeSku?.stockQuantity ?? activeSku?.stock ?? p?.skus?.[0]?.stockQuantity ?? 0);
  
  const sold = p.sold ?? p.soldCount ?? 0;
  const rawRating = p.rating ?? p.avgRating ?? 0.0;
  const finalRating = sold === 0 ? 0 : rawRating;
  
  const canAdd = availableKeys.every(k => !!selectedAttributes[k]) && stockLeft > 0;

  const handleAddToCart = () => {
    if (!canAdd) return;
    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để mua hàng", {
        action: {
          label: "Đăng nhập",
          onClick: () => router.push("/auth")
        }
      });
      return;
    }
    
    api.post("/cart/items", {
      productId: p.id,
      skuId: activeSku?.id,
      quantity: qty
    }).then(() => {
      // Track cart addition
      api.post(`/products/${p.id}/track-cart`).catch(() => {});
      
      setAddedToCart(true);
      useCartStore.getState().fetchCart();
      toast.success("Đã thêm vào giỏ hàng!");
      setTimeout(() => setAddedToCart(false), 2000);
    }).catch((e: any) => {
       toast.error(e.response?.data?.message || "Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    });
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để mua hàng", {
        action: {
          label: "Đăng nhập",
          onClick: () => router.push("/auth")
        }
      });
      return;
    }
    
    api.post("/cart/items?overwrite=true", {
      productId: p.id,
      skuId: activeSku?.id,
      quantity: qty
    }).then(() => {
      // Track cart addition
      api.post(`/products/${p.id}/track-cart`).catch(() => {});
      
      useCartStore.getState().fetchCart();
      // Save selected SKU for checkout and redirect
      localStorage.setItem("checkout_skus", JSON.stringify([activeSku?.id]));
      router.push("/checkout");
    }).catch((e: any) => {
       toast.error(e.response?.data?.message || "Không thể mua ngay. Vui lòng thử lại.");
    });
  };

  const handleWishlist = () => {
    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để thêm vào yêu thích");
      return;
    }
    const newValue = !wishlisted;
    setWishlisted(newValue);
    api.post(`/wishlists/${p.id}`).then(() => {
      if (newValue) {
        toast.success("Đã thêm vào danh sách yêu thích");
      } else {
        toast.success("Đã xóa khỏi danh sách yêu thích");
      }
    }).catch(() => {
      setWishlisted(!newValue);
      toast.error("Đã xảy ra lỗi");
    });
  };

  const handleChat = async () => {
    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để chat với Shop", {
        action: { label: "Đăng nhập", onClick: () => router.push("/auth") }
      });
      return;
    }
    try {
      const res = await api.post(`/chat/rooms/shop/${p.shopId}`);
      const roomId = res.data.id;
      const contextMsg = `Tôi đang quan tâm đến sản phẩm này: ${p.name}`;
      useChatStore.getState().startChatWithShop(roomId, contextMsg);
    } catch (e) {
      toast.error("Không thể kết nối với Shop. Vui lòng thử lại sau.");
    }
  };

  const mediaList: any[] = [];
  if (p.videoUrl) {
    let vidType = 'video';
    let vidUrl = p.videoUrl;
    const ytMatch = p.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    if (ytMatch && ytMatch[1]) {
      vidType = 'iframe';
      vidUrl = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
    } else if (p.videoUrl.includes('tiktok.com')) {
      const match = p.videoUrl.match(/video\/(\d+)/);
      if (match && match[1]) {
        vidType = 'iframe';
        vidUrl = `https://www.tiktok.com/embed/v2/${match[1]}`;
      } else {
        vidType = 'link'; // Fallback if we can't parse tiktok id
      }
    } else if (!p.videoUrl.startsWith('http')) {
      vidUrl = `http://localhost:8080${p.videoUrl}`;
    }

    mediaList.push({ type: vidType, url: vidUrl, originalUrl: p.videoUrl });
  }
  if (p.images && p.images.length > 0) {
    p.images.forEach((img: any) => {
      mediaList.push({ type: 'image', url: img.imageUrl });
    });
  }

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
            {["Trang chủ", "Điện tử", "Điện thoại", p.name].map((crumb, i, arr) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
                <span className={i === arr.length - 1 ? "truncate max-w-xs" : "cursor-pointer hover:text-gold transition-colors duration-150"}
                  style={{ color: i === arr.length - 1 ? "var(--text-secondary)" : undefined }}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            {/* ── Left Column: Gallery & Tabs ────────────────── */}
            <div className="flex flex-col">
              <div className="space-y-3">
              {/* Main image */}
              <motion.div
                key={activeImg}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br ${GRADS[activeImg % 4]}`}
                style={{ border: "1px solid var(--border)" }}>
                {mediaList.length > 0 && mediaList[activeImg] ? (
                  mediaList[activeImg].type === 'iframe' ? (
                    <div className="absolute inset-0 w-full h-full bg-black">
                      <iframe 
                        className="w-full h-full"
                        src={mediaList[activeImg].url} 
                        title="Video" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                      </iframe>
                    </div>
                  ) : mediaList[activeImg].type === 'video' ? (
                    <div className="absolute inset-0 w-full h-full bg-black">
                      <video 
                        controls 
                        className="w-full h-full object-contain"
                        src={mediaList[activeImg].url}
                      />
                    </div>
                  ) : mediaList[activeImg].type === 'link' ? (
                    <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
                      <a href={mediaList[activeImg].originalUrl} target="_blank" rel="noreferrer" className="text-white hover:text-indigo-400 underline flex items-center gap-2">
                        Xem Video <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <img 
                      src={mediaList[activeImg].url?.startsWith('http') ? mediaList[activeImg].url : `http://localhost:8080${mediaList[activeImg].url}`} 
                      alt={p.name} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingCart className="w-20 h-20 text-white/20" />
                  </div>
                )}
                {p.discount && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 text-sm font-bold rounded-xl bg-red-500 text-white">
                    -{p.discount}%
                  </div>
                )}
                <button onClick={handleWishlist}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl glass cursor-pointer z-10">
                  <Heart className={`w-5 h-5 transition-all ${wishlisted ? "fill-red-400 text-red-400" : "text-white/70"}`} />
                </button>
              </motion.div>

              {/* Thumbnails */}
              {mediaList.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {mediaList.map((mediaItem: any, i: number) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${GRADS[i % 4]} cursor-pointer transition-all duration-200 relative flex items-center justify-center`}
                      style={{ border: activeImg === i ? "2px solid var(--gold)" : "1px solid var(--border)", opacity: activeImg === i ? 1 : 0.6 }}>
                      {mediaItem.type === 'video' || mediaItem.type === 'iframe' || mediaItem.type === 'link' ? (
                        <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white/70 hover:text-white">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          <span className="text-[10px] mt-1 font-medium">Video</span>
                        </div>
                      ) : (
                        <img 
                          src={mediaItem.url?.startsWith('http') ? mediaItem.url : `http://localhost:8080${mediaItem.url}`} 
                          alt="thumbnail" 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2">
                {[[Shield,"Hàng chính hãng, bảo hành 12T"],[Truck,"Giao hàng toàn quốc, nhanh 2-5 ngày"],[RefreshCw,"Đổi trả trong 7 ngày"],[MessageCircle,"Hỗ trợ 24/7"]].map(([Icon, text], i) => {
                  const Ic = Icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
                  return (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <Ic className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gold)" }} />
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{text as string}</span>
                    </div>
                  );
                })}
              </div>
              </div>

              <div className="mt-12">
                <div className="flex gap-1 p-1 rounded-2xl mb-8 flex-wrap w-fit" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  {TABS.map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(i)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300"
                      style={activeTab === i
                        ? { background: "var(--grad-purple)", color: "white", boxShadow: "var(--shadow-glow-purple)" }
                        : { color: "var(--text-secondary)" }}>
                      {tab} {tab === "Đánh giá" && `(${p.reviews?.length ?? 0})`}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {/* Description */}
                  {activeTab === 0 && (
                    <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="p-6 rounded-2xl prose-sm max-w-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                      {p.description?.split("\n").map((line: any, i: number) => <p key={i} className="mb-3">{line}</p>)}
                    </motion.div>
                  )}

                  {/* Specs */}
                  {activeTab === 1 && (
                    <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="relative rounded-3xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                      
                      <div className={`transition-all duration-500 overflow-hidden ${!showFullSpecs && Object.entries(p.specs ?? {}).length > 6 ? 'max-h-[380px]' : ''}`}>
                        {Object.entries(p.specs ?? {}).length === 0 ? (
                          <div className="p-10 text-center text-sm font-medium" style={{ color: "var(--text-muted)" }}>Chưa có thông số kỹ thuật</div>
                        ) : (
                          Object.entries(p.specs ?? {}).map(([key, val]: any, i: number) => (
                            <div key={key} className="flex items-start transition-colors duration-200" 
                                 style={{ background: i % 2 === 0 ? "transparent" : "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                              <span className="w-1/3 md:w-1/4 flex-shrink-0 px-6 py-4 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{key}</span>
                              <span className="flex-1 px-6 py-4 text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{val}</span>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {Object.entries(p.specs ?? {}).length > 6 && !showFullSpecs && (
                        <div className="absolute bottom-[52px] left-0 right-0 h-28 pointer-events-none" 
                             style={{ background: "linear-gradient(to top, var(--bg-card), transparent)" }} />
                      )}
                      
                      {Object.entries(p.specs ?? {}).length > 6 && (
                        <button 
                          onClick={() => setShowFullSpecs(!showFullSpecs)}
                          className="w-full py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-black/5"
                          style={{ color: "var(--gold)", borderTop: "1px solid var(--border)" }}
                        >
                          {showFullSpecs ? (
                            <>Thu gọn <ChevronUp className="w-4 h-4" /></>
                          ) : (
                            <>Xem cấu hình chi tiết ({Object.entries(p.specs ?? {}).length}) <ChevronDown className="w-4 h-4" /></>
                          )}
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* Reviews */}
                  {activeTab === 2 && (
                    <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      {/* Rating summary */}
                      <div className="flex items-center gap-6 p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="text-center">
                          <div className="text-5xl font-bold text-gradient-gold font-[family-name:var(--font-heading)]">{Number(finalRating).toFixed(1)}</div>
                          <div className="flex justify-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(finalRating) ? "fill-gold text-gold" : "text-border"}`} />)}
                          </div>
                          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{p.reviews?.length ?? 0} đánh giá</p>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {[5,4,3,2,1].map(star => {
                            const count = p.reviews?.filter((r:any) => Math.floor(r.rating) === star).length ?? 0;
                            const pct = p.reviews?.length ? (count / p.reviews.length) * 100 : 0;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <span className="text-xs w-4" style={{ color: "var(--text-muted)" }}>{star}</span>
                                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--grad-gold)" }} />
                                </div>
                                <span className="text-xs w-6 text-right" style={{ color: "var(--text-muted)" }}>{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Review cards */}
                      {p.reviews?.map((review:any) => (
                        <div key={review.id} className="p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--purple-dim)", color: "var(--purple-light)" }}>
                                {review.userName[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{review.userName}</p>
                                {review.sku && <p className="text-xs" style={{ color: "var(--text-muted)" }}>Phân loại: {review.sku}</p>}
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-gold text-gold" : "text-border"}`} />)}
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{review.comment}</p>
                          {review.replyContent && (
                            <div className="mt-3 p-3 rounded-xl" style={{ background: "var(--bg-elevated)", borderLeft: "2px solid var(--gold)" }}>
                              <p className="text-xs font-semibold mb-1" style={{ color: "var(--gold)" }}>Phản hồi từ Người bán:</p>
                              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{review.replyContent}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(review.date).toLocaleDateString("vi-VN")}</span>
                            <button className="text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>👍 Hữu ích ({review.helpful})</button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Right: Product Info ──────────────────────────── */}
            <div className="lg:w-full">
              <div className="space-y-6 sticky top-24">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg" style={{ background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--border-gold)" }}>Bán chạy</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Đã bán {((sold).toLocaleString("vi-VN"))}</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold leading-tight font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
                  {p.name}
                </h1>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(finalRating) ? "fill-gold text-gold" : "text-border"}`} />
                    ))}
                    <span className="text-sm font-semibold ml-1" style={{ color: "var(--gold)" }}>{Number(finalRating).toFixed(1)}</span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>({p.reviews?.length ?? 0} đánh giá)</span>
                  <button className="ml-auto flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                    <Share2 className="w-4 h-4" /> Chia sẻ
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="p-5 rounded-2xl relative overflow-hidden" style={{ background: flashItem ? "var(--red-dim, rgba(239, 68, 68, 0.05))" : "var(--bg-card)", border: flashItem ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid var(--border)" }}>
                {flashItem && (
                  <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white flex items-center gap-1"
                       style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", borderBottomLeftRadius: "1rem" }}>
                    <span className="animate-pulse">⚡</span> Đang trong Flash Sale
                  </div>
                )}
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-bold font-[family-name:var(--font-heading)]" style={{ color: flashItem ? "#ef4444" : "var(--gold)" }}>{formatPrice(currentPrice)}</span>
                  {originalPriceForDiscount && <span className="text-lg line-through" style={{ color: "var(--text-muted)" }}>{formatPrice(originalPriceForDiscount)}</span>}
                  {originalPriceForDiscount && <span className="px-2 py-0.5 text-sm font-bold rounded-lg bg-red-500 text-white">-{calcDiscount(originalPriceForDiscount, currentPrice)}%</span>}
                </div>
                {originalPriceForDiscount && (
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    Tiết kiệm {formatPrice(originalPriceForDiscount - currentPrice)}
                  </p>
                )}
              </div>

              {/* Dynamic Attribute Selectors */}
              {availableKeys.map(key => (
                <div key={key} className="mb-4">
                  <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                    {key}: <span style={{ color: "var(--text-primary)" }}>{selectedAttributes[key] ?? "Chưa chọn"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attributeOptions[key].map((val) => {
                       // Find if this option is in stock when combined with other currently selected attributes
                       const testAttrs = { ...selectedAttributes, [key]: val };
                       const sku = p.skus?.find((s:any) => {
                          const a = s._normAttributes || {};
                          return Object.entries(testAttrs).every(([k, v]) => !v || a[k] === v);
                       });
                       const skuStock = sku ? (sku.stockQuantity ?? sku.stock ?? 0) : 0;
                       const outOfStock = sku ? skuStock === 0 : false;
                       const isSelected = selectedAttributes[key] === val;
                       
                       return (
                        <button key={val} disabled={outOfStock} onClick={() => setSelectedAttributes({...selectedAttributes, [key]: val})}
                          className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            border: isSelected ? "2px solid var(--gold)" : "1px solid var(--border)",
                            background: isSelected ? "var(--gold-dim)" : "var(--bg-card)",
                            color: isSelected ? "var(--gold)" : "var(--text-secondary)",
                          }}>
                          {val}
                          {outOfStock && <span className="text-xs text-red-400 ml-1">(Hết)</span>}
                        </button>
                       );
                    })}
                  </div>
                </div>
              ))}

              {/* Quantity + Stock */}
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-glass"
                    style={{ color: "var(--text-secondary)" }}><Minus className="w-4 h-4" /></button>
                  <span className="w-12 text-center font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(stockLeft, q + 1))} disabled={qty >= stockLeft}
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-glass disabled:opacity-30"
                    style={{ color: "var(--text-secondary)" }}><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-sm" style={{ color: stockLeft > 10 ? "var(--text-muted)" : "var(--gold)" }}>
                  {stockLeft > 0 ? `Còn ${stockLeft} sản phẩm` : "Hết hàng"}
                </span>
              </div>

              {/* Validation hint */}
              {!availableKeys.every(k => !!selectedAttributes[k]) && (
                <p className="text-xs" style={{ color: "var(--gold)" }}>⚠ Vui lòng chọn phân loại sản phẩm trước khi đặt hàng</p>
              )}

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="gold" size="lg" className="flex-1" onClick={handleAddToCart}
                  disabled={!canAdd}>
                  <AnimatePresence mode="wait">
                    {addedToCart
                      ? <motion.span key="added" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex items-center gap-2">✓ Đã thêm vào giỏ!</motion.span>
                      : <motion.span key="add"   initial={{ opacity: 0, y: 8  }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Thêm vào giỏ</motion.span>
                    }
                  </AnimatePresence>
                </Button>
                <Button variant="purple" size="lg" className="flex-1" disabled={!canAdd} onClick={handleBuyNow}>
                  <Zap className="w-5 h-5" /> Mua ngay
                </Button>
              </div>

              {/* Shop info */}
              <div className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-gold)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-gold)" }}>
                    <Store className="w-5 h-5" style={{ color: "var(--gold)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.shopName || "Unknown Shop"}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Kho hàng tại: {p.shopLocation || "Đang cập nhật"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="glass" size="sm" onClick={handleChat}>Chat</Button>
                  {p.shopId && (
                    <Link href={`/shop/${p.shopId}`}>
                      <Button variant="glass" size="sm">Xem shop</Button>
                    </Link>
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky CTA mobile */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden p-4 z-40" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--border)", backdropFilter: "blur(20px)" }}>
          <div className="flex gap-3">
            <Button variant="glass" size="md" className="flex-1" onClick={handleAddToCart} disabled={!canAdd}>
              <ShoppingCart className="w-4 h-4" /> Giỏ hàng
            </Button>
            <Button variant="gold" size="md" className="flex-1" disabled={!canAdd} onClick={handleBuyNow}>
              <Zap className="w-4 h-4" /> Mua ngay
            </Button>
          </div>
        </div>

        {/* Recommended Products */}
        {recommendations.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 border-t mt-12" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-6" style={{ color: "var(--text-primary)" }}>Sản phẩm cùng danh mục</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {recommendations.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
