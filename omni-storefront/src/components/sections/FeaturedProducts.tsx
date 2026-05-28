"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Clock, TrendingDown } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import api from "@/lib/axios";
import Link from "next/link";

const tabs = [
  { id: "bestseller", label: "Bán chạy", icon: Flame },
  { id: "new",        label: "Mới nhất", icon: Clock },
  { id: "sale",       label: "Giảm giá", icon: TrendingDown },
];

export default function FeaturedProducts() {
  const [active, setActive] = useState("bestseller");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/products/featured?tab=${active}`)
      .then(res => setProducts(res.data || []))
      .catch(console.error);
  }, [active]);

  const displayed = products;

  return (
    <section className="py-20 lg:py-28" style={{ background: "var(--bg-surface)" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--purple-light)" }}>Sản phẩm nổi bật</p>
            <h2 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Được yêu thích nhất</h2>
          </motion.div>

          {/* Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="flex items-center gap-1 p-1 rounded-2xl self-start lg:self-auto"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActive(id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer"
                style={active === id
                  ? { background: "var(--grad-purple)", color: "white", boxShadow: "var(--shadow-glow-purple)" }
                  : { color: "var(--text-secondary)" }}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {displayed.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </motion.div>

        <div className="mt-12 text-center">
          <Link href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer glass group"
            style={{ color: "var(--text-primary)", border: "1px solid var(--border-purple)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-purple)"}>
            Xem tất cả sản phẩm
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
}
