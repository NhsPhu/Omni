"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CategoryCard from "@/components/ui/CategoryCard";
import { categories } from "@/data/mock";

export default function CategoriesSection() {
  return (
    <section id="categories" className="py-20 lg:py-28" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--gold)" }}>Danh mục</p>
            <h2 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
              Khám phá danh mục
            </h2>
            <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>
              Hàng trăm nghìn sản phẩm từ các cửa hàng uy tín
            </p>
          </motion.div>
          <motion.a href="#" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="hidden lg:flex items-center gap-2 text-sm font-semibold transition-all duration-200 cursor-pointer group"
            style={{ color: "var(--purple-light)" }}>
            Xem tất cả
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </motion.a>
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
        </div>

        <div className="lg:hidden mt-6 text-center">
          <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: "var(--purple-light)" }}>
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
