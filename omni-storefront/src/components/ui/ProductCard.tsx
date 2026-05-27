"use client";
import { useState, useEffect } from "react";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice, formatCompact, calcDiscount, cn } from "@/lib/utils";
import Link from "next/link";
import type { Product } from "@/data/mock";
import api from "@/lib/axios";
import { toast } from "sonner";

interface ProductCardProps { product: Product; index?: number; }

const GRADIENTS = [
  "from-violet-600/80 to-indigo-600/80",
  "from-amber-500/80 to-orange-600/80",
  "from-purple-600/80 to-pink-600/80",
  "from-blue-600/80 to-cyan-500/80",
  "from-emerald-500/80 to-teal-600/80",
  "from-rose-600/80 to-pink-500/80",
  "from-yellow-500/80 to-amber-600/80",
  "from-sky-500/80 to-blue-600/80",
];

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      api.get(`/wishlists/${product.id}/check`)
        .then(res => setWishlisted(res.data))
        .catch(console.error);
    }
  }, [product.id]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      toast.error("Vui lòng đăng nhập để thêm vào yêu thích");
      return;
    }
    
    const newValue = !wishlisted;
    setWishlisted(newValue);
    
    api.post(`/wishlists/${product.id}`)
      .then(() => {
        toast.success(newValue ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích");
      })
      .catch(() => {
        setWishlisted(!newValue);
        toast.error("Đã xảy ra lỗi");
      });
  };

  const price = product.price ?? (product as any).priceMin ?? 0;
  const originalPrice = product.originalPrice ?? (product as any).priceMax;
  const discount = originalPrice && originalPrice > price ? calcDiscount(originalPrice, price) : 0;
  const grad = GRADIENTS[index % GRADIENTS.length];

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl overflow-hidden cursor-pointer h-full"
        style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
      {/* Hover glow border */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: "var(--shadow-card-hover)", border: "1px solid var(--border-purple)" }} />

      {/* Image */}
      <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${grad}`}>
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-white/30 group-hover:text-white/50 transition-colors duration-300" />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge === "bestseller" && (
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg"
              style={{ background: "var(--gold)", color: "#050509" }}>Bán chạy</span>
          )}
          {product.badge === "new" && (
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg"
              style={{ background: "var(--purple)", color: "white" }}>Mới</span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-red-500 text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute top-3 right-3 z-20">
          <button 
            onClick={handleWishlist}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-md"
            style={{ background: wishlisted ? "var(--bg-card)" : "rgba(0,0,0,0.3)" }}
            aria-label={wishlisted ? "Bỏ yêu thích" : "Yêu thích"}
          >
            <Heart className={cn("w-4 h-4 transition-all duration-200", wishlisted ? "fill-red-400 text-red-400 scale-110" : "text-white/70")} />
          </button>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        <h3 className="text-sm font-medium line-clamp-2 leading-snug transition-colors duration-200 group-hover:text-gold"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-gradient-gold font-[family-name:var(--font-body)]">
            {formatPrice(price)}
          </span>
          {originalPrice > price && (
            <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Rating + Sold */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{product.rating ?? (product as any).avgRating ?? 5.0}</span>
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Đã bán {formatCompact(product.sold ?? Math.floor(Math.random() * 500) + 50)}</span>
        </div>

        {/* Shop */}
        <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="text-xs truncate block" style={{ color: "var(--text-muted)" }}>{product.shopName}</span>
        </div>
      </div>
      </motion.article>
    </Link>
  );
}
