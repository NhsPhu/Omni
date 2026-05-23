"use client";
import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, RefreshCw, Headphones } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Bảo vệ người mua",    desc: "Hoàn tiền 100% nếu không nhận được hàng hoặc hàng không đúng mô tả.",           color: "#10B981", dim: "rgba(16,185,129,0.1)" },
  { icon: CreditCard,  title: "Thanh toán an toàn",  desc: "Hỗ trợ VNPay, MoMo, ZaloPay và COD. Mã hóa dữ liệu chuẩn PCI-DSS.",            color: "var(--blue)",   dim: "var(--blue-dim)" },
  { icon: RefreshCw,   title: "Đổi trả 7 ngày",      desc: "Không hài lòng? Đổi trả dễ dàng trong 7 ngày kể từ khi nhận hàng.",             color: "var(--gold)",   dim: "var(--gold-dim)" },
  { icon: Headphones,  title: "Hỗ trợ 24/7",         desc: "Đội ngũ chăm sóc khách hàng sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.",            color: "var(--purple-light)", dim: "var(--purple-dim)" },
];

export default function TrustSection() {
  return (
    <section className="py-20 lg:py-28" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--gold)" }}>Cam kết</p>
          <h2 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
            Mua sắm an tâm, không lo rủi ro
          </h2>
          <p className="mt-3 max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
            Chúng tôi đặt sự an toàn và hài lòng của bạn lên hàng đầu
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ icon: Icon, title, desc, color, dim }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group p-6 rounded-2xl text-center cursor-default transition-all duration-300"
              style={{ background: "var(--bg-card)", backdropFilter: "blur(20px)", border: "1px solid var(--border)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${color}25`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: dim, border: `1px solid ${color}30` }}>
                <Icon className="w-7 h-7" style={{ color }} />
              </div>
              <h3 className="font-bold mb-2 font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-10 p-6 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-5"
          style={{ background: "var(--gold-dim)", border: "1px solid var(--border-gold)" }}>
          <div className="text-center lg:text-left">
            <p className="font-bold font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>Omni được chứng nhận bởi Bộ Công Thương</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Đã đăng ký và hoạt động hợp pháp theo quy định pháp luật Việt Nam</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["VNPay","MoMo","ZaloPay","COD"].map(m => (
              <span key={m} className="px-3 py-2 text-xs font-semibold rounded-xl glass" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>{m}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
