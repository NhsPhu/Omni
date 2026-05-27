"use client";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import type { Category } from "@/data/mock";

interface CategoryCardProps { category: any; index?: number; }

const CATEGORY_MAP: Record<string, { icon: string; color: string; productCount: number }> = {
  "dien-tu-cong-nghe": { icon: "Smartphone", color: "#3B82F6", productCount: 12450 },
  "thoi-trang": { icon: "Shirt", color: "#EC4899", productCount: 34200 },
  "nha-cua-noi-that": { icon: "Home", color: "#F59E0B", productCount: 8930 },
  "lam-dep-suc-khoe": { icon: "Sparkles", color: "#8B5CF6", productCount: 15600 },
  "the-thao-du-lich": { icon: "Dumbbell", color: "#10B981", productCount: 7840 },
  "sach-van-phong-pham": { icon: "BookOpen", color: "#6366F1", productCount: 21300 },
  "am-thuc-thuc-pham": { icon: "Utensils", color: "#EF4444", productCount: 9100 },
  "xe-co": { icon: "Car", color: "#06B6D4", productCount: 5670 }
};

export default function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const mapped = CATEGORY_MAP[category.slug] || { 
    icon: category.icon || "Package", 
    color: category.color || "#888888", 
    productCount: category.productCount || Math.floor(Math.random() * 5000) + 1000 
  };
  
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[mapped.icon] || LucideIcons.Package;

  return (
    <Link href={`/search?categoryId=${category.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -6 }}
        className="group flex flex-col items-center gap-3 p-5 rounded-2xl cursor-pointer transition-all duration-300 h-full"
        style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.border = `1px solid ${mapped.color}40`;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${mapped.color}20`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.border = "1px solid var(--border)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${mapped.color}18`, border: `1px solid ${mapped.color}30` }}
        >
          <IconComponent className="w-6 h-6 transition-colors duration-300" style={{ color: mapped.color }} />
        </div>

        <span className="text-xs font-semibold text-center leading-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
          {category.name}
        </span>

        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {mapped.productCount.toLocaleString("vi-VN")}+
        </span>
      </motion.div>
    </Link>
  );
}
