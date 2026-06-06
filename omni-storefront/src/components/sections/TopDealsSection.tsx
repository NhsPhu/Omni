"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, ArrowRight, TrendingDown, Sparkles, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function TopDealsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/products/featured?tab=sale&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        const withDiscount = (data || []).filter((p: any) => p.priceMax > p.priceMin);
        setProducts(withDiscount.slice(0, 6).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.priceMin,
          originalPrice: p.priceMax,
          discount: Math.round((1 - p.priceMin / p.priceMax) * 100),
          sold: p.soldCount || 0,
          image: p.imageUrl || null,
          shopName: p.shopName,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="py-20 lg:py-28" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-dim)", border: "1px solid var(--border-gold)" }}>
                <Tag className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>Đang giảm giá</p>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
              Ưu đãi hot hôm nay
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>Sản phẩm đang được giảm giá tốt nhất, cập nhật liên tục</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Link href="/search?sort=discount"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
              style={{ background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--border-gold)" }}>
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Grid: 1 large + 5 small */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Hero Card (first item) */}
          {products[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="lg:col-span-1 lg:row-span-2"
            >
              <Link href={`/products/${products[0].id}`}>
                <div className="h-full rounded-3xl overflow-hidden cursor-pointer group relative"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  {/* Image */}
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {products[0].image ? (
                      <img
                        src={products[0].image.startsWith('http') ? products[0].image : `http://localhost:8080${products[0].image}`}
                        alt={products[0].name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
                        <ShoppingBag className="w-16 h-16" style={{ color: "var(--border)" }} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-sm font-bold text-white flex items-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #ef4444, #b91c1c)" }}>
                      <TrendingDown className="w-3.5 h-3.5" />
                      -{products[0].discount}%
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{products[0].shopName}</p>
                    <h3 className="font-semibold text-base line-clamp-2 mb-3 group-hover:text-gold transition-colors"
                      style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
                      {products[0].name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold" style={{ color: "var(--gold)" }}>{formatPrice(products[0].price)}</span>
                      <span className="text-sm line-through" style={{ color: "var(--text-muted)" }}>{formatPrice(products[0].originalPrice)}</span>
                    </div>
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Đã bán {products[0].sold?.toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Small Cards (remaining items) */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {products.slice(1).map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}>
                <Link href={`/products/${item.id}`}>
                  <div className="rounded-2xl overflow-hidden cursor-pointer group flex gap-3 p-3 transition-all duration-200"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-gold)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(245,158,11,0.1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                    {/* Thumbnail */}
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-50">
                      {item.image ? (
                        <img
                          src={item.image.startsWith('http') ? item.image : `http://localhost:8080${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
                          <Sparkles className="w-6 h-6" style={{ color: "var(--border)" }} />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs font-medium line-clamp-2 mb-1.5 group-hover:text-gold transition-colors"
                        style={{ color: "var(--text-primary)" }}>
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: "var(--gold)" }}>{formatPrice(item.price)}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                          -{item.discount}%
                        </span>
                      </div>
                      <span className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>Đã bán {item.sold?.toLocaleString('vi-VN') || 0}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
