"use client";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { Category } from "@/data/mock";

interface CategoryCardProps { category: Category; index?: number; }

export default function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[category.icon] || LucideIcons.Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group flex flex-col items-center gap-3 p-5 rounded-2xl cursor-pointer transition-all duration-300"
      style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.border = `1px solid ${category.color}40`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${category.color}20`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.border = "1px solid var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${category.color}18`, border: `1px solid ${category.color}30` }}
      >
        <IconComponent className="w-6 h-6 transition-colors duration-300" style={{ color: category.color }} />
      </div>

      <span className="text-xs font-semibold text-center leading-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
        {category.name}
      </span>

      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
        {category.productCount.toLocaleString("vi-VN")}+
      </span>
    </motion.div>
  );
}
