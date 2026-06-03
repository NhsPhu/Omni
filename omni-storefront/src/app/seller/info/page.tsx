"use client";
import { motion } from "framer-motion";
import { Store, TrendingUp, ShieldCheck, Truck, Percent, ArrowRight, Phone, Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

const benefits = [
  { icon: Percent, title: "Hoa hồng thấp nhất", desc: "Omni cam kết mức phí nền tảng chỉ 5%, giúp bạn tối ưu lợi nhuận kinh doanh so với các sàn thương mại điện tử khác." },
  { icon: Truck, title: "Vận chuyển dễ dàng", desc: "Tích hợp sẵn hệ thống Giao Hàng Nhanh (GHN) và AhaMove. Tự động tính toán phí vận chuyển và cập nhật trạng thái đơn hàng thời gian thực." },
  { icon: TrendingUp, title: "Tăng trưởng doanh thu", desc: "Tiếp cận hàng triệu khách hàng tiềm năng. Hỗ trợ các công cụ marketing mạnh mẽ như Flash Sale, Mã giảm giá, và Đề xuất thông minh." },
  { icon: ShieldCheck, title: "Bảo vệ nhà bán hàng", desc: "Hệ thống quản lý tranh chấp công bằng, minh bạch. Chống gian lận và bảo vệ nhà bán hàng khỏi các đơn hàng ảo." }
];

export default function SellerInfoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
        {/* Hero Section */}
        <div className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-base) 100%)" }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 bg-purple-500" />
          
          <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-6 text-center space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4" style={{ background: "var(--gold-dim)", color: "var(--gold)" }}>
                Cơ hội kinh doanh 2026
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold font-[family-name:var(--font-heading)] leading-tight" style={{ color: "var(--text-primary)" }}>
                Bán hàng cùng <span className="text-gradient-gold">Omni</span>
                <br />Thành công trong tầm tay
              </h1>
              <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                Nền tảng thương mại điện tử hiện đại, hỗ trợ tận tình từ A-Z. Hãy để chúng tôi đồng hành cùng sự phát triển kinh doanh của bạn.
              </p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="pt-8">
              <Button onClick={() => router.push('/seller/register')} variant="gold" size="lg" className="shadow-xl">
                Đăng ký mở gian hàng ngay <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="py-20">
          <div className="max-w-5xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>Tại sao nên chọn Omni?</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-3xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
                      <Icon className="w-7 h-7" style={{ color: "var(--purple-light)" }} />
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>{b.title}</h3>
                    <p style={{ color: "var(--text-secondary)" }}>{b.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="py-20" style={{ background: "var(--bg-elevated)" }}>
          <div className="max-w-5xl mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-16" style={{ color: "var(--text-primary)" }}>Quy trình đăng ký đơn giản</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">
              {[
                { step: "1", title: "Tạo tài khoản", desc: "Điền thông tin cơ bản" },
                { step: "2", title: "Xác thực hồ sơ", desc: "Cung cấp CCCD/GPKD" },
                { step: "3", title: "Đăng sản phẩm", desc: "Sẵn sàng đón đơn hàng" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center z-10 w-48">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg"
                    style={{ background: "var(--grad-gold)", color: "#000" }}>
                    {s.step}
                  </div>
                  <h4 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{s.title}</h4>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                </div>
              ))}
              <div className="hidden md:block absolute top-8 left-1/2 -translate-x-1/2 w-[60%] h-0.5 border-t-2 border-dashed" style={{ borderColor: "var(--border)" }} />
            </div>
          </div>
        </div>

        {/* Support CTA */}
        <div className="py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="p-10 rounded-3xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <Store className="w-12 h-12 mx-auto mb-6" style={{ color: "var(--gold)" }} />
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Cần hỗ trợ thêm?</h2>
              <p className="mb-8" style={{ color: "var(--text-secondary)" }}>Đội ngũ hỗ trợ nhà bán hàng của Omni luôn sẵn sàng giải đáp thắc mắc của bạn 24/7.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="glass" className="w-full sm:w-auto"><Phone className="w-4 h-4 mr-2" /> 1900 8888</Button>
                <Button variant="glass" className="w-full sm:w-auto"><Mail className="w-4 h-4 mr-2" /> seller@omni.vn</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
