"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import Button from "@/components/ui/Button";
import { sellerBenefits } from "@/data/mock";

export default function SellerCTASection() {
  return (
    <section className="py-16 lg:py-24 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <span className="inline-block px-4 py-2 bg-cta/10 text-cta text-sm font-semibold rounded-full mb-4 font-[family-name:var(--font-heading)]">
                Dành cho người bán
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary font-[family-name:var(--font-heading)] leading-tight">
                Bắt đầu bán hàng trên{" "}
                <span className="text-primary">Omni</span> ngay hôm nay
              </h2>
              <p className="text-text-secondary mt-4 text-lg leading-relaxed">
                Hạ tầng công nghệ đầy đủ — từ cửa hàng, thanh toán đến vận chuyển.
                Bạn chỉ cần tập trung vào sản phẩm và khách hàng.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sellerBenefits.map((benefit, index) => {
                const IconComp =
                  (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[benefit.icon] ||
                  LucideIcons.Package;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card-bg border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-200">
                      <IconComp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-heading)]">
                        {benefit.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="gold" size="lg" className="group">
                Đăng ký bán hàng miễn phí
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button variant="ghost" size="lg">
                Tìm hiểu thêm
              </Button>
            </div>

            {/* Trust micro stats */}
            <div className="flex items-center gap-6 pt-2">
              {[
                { value: "0đ", label: "Phí đăng ký" },
                { value: "5%", label: "Hoa hồng thấp" },
                { value: "24h", label: "Hỗ trợ" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-xl font-bold text-primary font-[family-name:var(--font-heading)]">{value}</div>
                  <div className="text-xs text-text-muted">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            {/* Dashboard mockup */}
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-card-bg">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-hover">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-text-muted font-medium">Seller Dashboard — Omni</span>
                <div className="w-20" />
              </div>

              <div className="p-6 space-y-5">
                {/* Metric cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Doanh thu", value: "124.5M", color: "#22c55e", trend: "+12%" },
                    { label: "Đơn mới", value: "48", color: "#3b82f6", trend: "+5%" },
                    { label: "Chuyển đổi", value: "3.8%", color: "#f59e0b", trend: "+0.3%" },
                  ].map(({ label, value, color, trend }) => (
                    <div key={label} className="p-3 rounded-xl bg-surface-hover border border-border">
                      <p className="text-xs text-text-muted">{label}</p>
                      <p className="text-lg font-bold text-text-primary font-[family-name:var(--font-heading)] mt-1">{value}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color }}>{trend}</p>
                    </div>
                  ))}
                </div>

                {/* Fake chart */}
                <div className="rounded-xl bg-surface-hover border border-border p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-text-primary">Doanh thu 7 ngày</span>
                    <span className="text-xs text-cta font-semibold">+18.4%</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-20">
                    {[40, 65, 50, 80, 70, 95, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.07, ease: "easeOut" }}
                        className="flex-1 rounded-t-md"
                        style={{ background: i === 5 ? "var(--primary)" : "var(--border)" }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {["T2","T3","T4","T5","T6","T7","CN"].map((d) => (
                      <span key={d} className="text-[10px] text-text-muted flex-1 text-center">{d}</span>
                    ))}
                  </div>
                </div>

                {/* Recent orders */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-text-primary">Đơn hàng chờ xử lý</span>
                    <span className="text-xs text-primary">Xem tất cả →</span>
                  </div>
                  <div className="space-y-2">
                    {["#DH-20241", "#DH-20242", "#DH-20243"].map((id, i) => (
                      <div key={id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-hover border border-border">
                        <span className="text-xs font-mono text-text-secondary">{id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          i === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          i === 1 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>
                          {["Chờ xác nhận","Đang chuẩn bị","Đã giao vận"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-cta text-white px-4 py-2 rounded-xl shadow-lg text-sm font-bold font-[family-name:var(--font-heading)]"
            >
              Miễn phí 100%
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
