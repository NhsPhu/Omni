"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Star, ShoppingCart } from "lucide-react";
import { formatPrice, formatCompact } from "@/lib/utils";
import Link from "next/link";

function useCountdown(endTime: string | null) {
  const getMs = () => {
    if (!endTime) return 0;
    const diff = new Date(endTime).getTime() - Date.now();
    return diff > 0 ? diff : 0;
  };

  const [t, setT] = useState(getMs());

  useEffect(() => {
    const id = setInterval(() => setT(getMs()), 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return {
    h: String(Math.floor(t / 3_600_000)).padStart(2, "0"),
    m: String(Math.floor((t % 3_600_000) / 60_000)).padStart(2, "0"),
    s: String(Math.floor((t % 60_000) / 1000)).padStart(2, "0"),
    expired: t <= 0,
  };
}

const GRADS = ["from-red-600 to-orange-500","from-violet-600 to-purple-500","from-blue-600 to-cyan-500","from-emerald-600 to-teal-500","from-amber-500 to-yellow-400"];

export default function FlashSaleSection() {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/public/flash-sale/active?t=${Date.now()}`)
      .then(res => {
        if (res.status === 204) return null;
        return res.json();
      })
      .then(data => setEvent(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { h, m, s, expired } = useCountdown(event?.endTime || null);

  // Don't render if no active event or loading
  if (loading) return null;
  if (!event || !event.items || event.items.length === 0) {
    // Fallback to featured products if no flash sale event
    return <FallbackFlashSale />;
  }
  if (event.status !== 'ACTIVE') {
    return <FallbackFlashSale />;
  }

  const products = event.items.map((item: any) => ({
    id: item.productId,
    name: item.productName,
    price: item.flashPrice,
    originalPrice: item.originalPrice,
    discount: Math.round((1 - item.flashPrice / item.originalPrice) * 100),
    image: item.productImage,
    sold: item.soldCount || 0,
    flashStock: item.flashStock,
    stockPercent: item.flashStock > 0 ? Math.min(100, Math.round(((item.soldCount || 0) / item.flashStock) * 100)) : 0,
  }));

  return (
    <section id="flash-sale" className="py-20 lg:py-28" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl mb-8 p-8 lg:p-10"
          style={{ background: "var(--grad-sale)", boxShadow: "0 20px 60px rgba(239,68,68,0.25)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(251,191,36,0.6), transparent 70%)", filter: "blur(40px)" }} />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              </div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white font-[family-name:var(--font-heading)]">{event.title || 'Flash Sale'}</h2>
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

        <div className="flex gap-4 overflow-x-auto pb-4 scroll-hide snap-x snap-mandatory">
          {products.map((item: any, i: number) => (
            <Link key={item.id} href={`/products/${item.id}`}>
              <motion.div
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22,1,0.36,1] }}
                className="flex-shrink-0 w-56 lg:w-64 snap-start rounded-2xl overflow-hidden cursor-pointer group"
                style={{ background: "var(--bg-card)", backdropFilter: "blur(20px)", border: "1px solid var(--border)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(239,68,68,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                {/* Image */}
                <div className={`relative aspect-square ${!item.image ? `bg-gradient-to-br ${GRADS[i % 5]}` : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                  {item.image ? (
                    <img
                      src={item.image.startsWith('http') ? item.image : `http://localhost:8080${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ShoppingCart className="w-10 h-10 text-white/25" />
                  )}
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
                  {/* Stock bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                      <span>Đã bán {item.sold}/{item.flashStock}</span>
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Fallback component — uses the old featured products API when no Flash Sale is active
function FallbackFlashSale() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getMsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  };

  const [t, setT] = useState(getMsUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setT(getMsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(t / 3_600_000)).padStart(2, "0");
  const m = String(Math.floor((t % 3_600_000) / 60_000)).padStart(2, "0");
  const s = String(Math.floor((t % 60_000) / 1000)).padStart(2, "0");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/products/featured?tab=sale&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setProducts((data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.priceMin,
          originalPrice: p.priceMax > p.priceMin ? p.priceMax : undefined,
          discount: p.priceMax > p.priceMin ? Math.round((1 - p.priceMin / p.priceMax) * 100) : 0,
          sold: p.soldCount || 0,
          stockPercent: 0,
          image: p.imageUrl || null,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section id="flash-sale" className="py-20 lg:py-28" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl mb-8 p-8 lg:p-10"
          style={{ background: "var(--grad-sale)", boxShadow: "0 20px 60px rgba(239,68,68,0.25)" }}>
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

        <div className="flex gap-4 overflow-x-auto pb-4 scroll-hide snap-x snap-mandatory">
          {products.map((item: any, i: number) => (
            <Link key={item.id} href={`/products/${item.id}`}>
              <motion.div
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22,1,0.36,1] }}
                className="flex-shrink-0 w-56 lg:w-64 snap-start rounded-2xl overflow-hidden cursor-pointer group"
                style={{ background: "var(--bg-card)", backdropFilter: "blur(20px)", border: "1px solid var(--border)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(239,68,68,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <div className={`relative aspect-square ${!item.image ? `bg-gradient-to-br ${GRADS[i % 5]}` : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                  {item.image ? (
                    <img src={item.image.startsWith('http') ? item.image : `http://localhost:8080${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingCart className="w-10 h-10 text-white/25" />
                  )}
                  {item.discount > 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500 text-white">-{item.discount}%</div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-red-400 transition-colors duration-200"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{item.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-red-400">{formatPrice(item.price)}</span>
                    {item.originalPrice && <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>{formatPrice(item.originalPrice)}</span>}
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Đã bán {formatCompact(item.sold)}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
