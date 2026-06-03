"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Star, ShoppingCart } from "lucide-react";
import { formatPrice, formatCompact } from "@/lib/utils";


function useCountdown(ms: number) {
  const [t, setT] = useState(ms);
  useEffect(() => {
    if (t <= 0) return;
    const id = setInterval(() => setT(p => Math.max(0, p - 1000)), 1000);
    return () => clearInterval(id);
  }, [t]);
  return {
    h: String(Math.floor(t / 3_600_000)).padStart(2, "0"),
    m: String(Math.floor((t % 3_600_000) / 60_000)).padStart(2, "0"),
    s: String(Math.floor((t % 60_000) / 1000)).padStart(2, "0"),
  };
}

const GRADS = ["from-red-600 to-orange-500","from-violet-600 to-purple-500","from-blue-600 to-cyan-500","from-emerald-600 to-teal-500","from-amber-500 to-yellow-400"];

export default function FlashSaleSection() {
  const { h, m, s } = useCountdown(4 * 3_600_000 + 23 * 60_000 + 47_000);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/featured?tab=sale`)
      .then(res => res.json())
      .then(data => {
        const mappedProducts = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.priceMin,
          originalPrice: p.priceMax > p.priceMin ? p.priceMax : undefined,
          discount: p.priceMax > p.priceMin ? Math.round((1 - p.priceMin / p.priceMax) * 100) : 0,
          rating: p.avgRating || 5.0,
          sold: p.soldCount || 0,
          stockPercent: (p.stockQuantity || 0) + (p.soldCount || 0) > 0 
            ? Math.min(100, Math.round(((p.soldCount || 0) / ((p.stockQuantity || 0) + (p.soldCount || 0))) * 100)) 
            : 0,
        }));
        setProducts(mappedProducts);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="flash-sale" className="py-20 lg:py-28" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl mb-8 p-8 lg:p-10"
          style={{ background: "var(--grad-sale)", boxShadow: "0 20px 60px rgba(239,68,68,0.25)" }}>
          {/* Orb */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(251,191,36,0.6), transparent 70%)", filter: "blur(40px)" }} />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              </div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white font-[family-name:var(--font-heading)]">Flash Sale</h2>
                <p className="text-red-200 text-sm mt-1">Ưu đãi kết thúc sau</p>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-3">
              {[{ v: h, l: "Giờ" }, { v: m, l: "Phút" }, { v: s, l: "Giây" }].map(({ v, l }, i) => (
                <div key={l} className="flex items-center gap-3">
                  {i > 0 && <span className="text-3xl font-bold text-white/60 pb-5">:</span>}
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <span className="text-2xl lg:text-3xl font-bold text-white tabular-nums font-[family-name:var(--font-heading)]">{v}</span>
                    </div>
                    <span className="text-[10px] text-red-200 mt-1.5 uppercase tracking-widest">{l}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {loading ? (
           <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>Đang tải...</div>
        ) : error ? (
           <div className="text-center py-10 text-red-500">Lỗi: {error}</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scroll-hide snap-x snap-mandatory">
            {products.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22,1,0.36,1] }}
                className="flex-shrink-0 w-56 lg:w-64 snap-start rounded-2xl overflow-hidden cursor-pointer group"
                style={{ background: "var(--bg-card)", backdropFilter: "blur(20px)", border: "1px solid var(--border)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(239,68,68,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                {/* Image */}
                <div className={`relative aspect-square bg-gradient-to-br ${GRADS[i % 5]} flex items-center justify-center`}>
                  <ShoppingCart className="w-10 h-10 text-white/25" />
                  {item.discount > 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500 text-white">
                      -{item.discount}%
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-red-400 transition-colors duration-200"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{item.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-red-400">{formatPrice(item.price)}</span>
                    {item.originalPrice && <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>{formatPrice(item.originalPrice)}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.rating}</span>
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Đã bán {formatCompact(item.sold)}</span>
                  </div>
                  {/* Stock bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      <span>Đã bán</span>
                      <span className={item.stockPercent > 70 ? "text-red-400 font-semibold" : ""}>{item.stockPercent}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.stockPercent}%` }} viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: item.stockPercent > 70 ? "linear-gradient(90deg,#ef4444,#f97316)" : "linear-gradient(90deg,var(--gold),var(--purple))" }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
