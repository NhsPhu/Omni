"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Ticket } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function VoucherBannerSection() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<any[]>([]);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    api.get("/public/vouchers/platform").then(res => {
      setVouchers(res.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      api.get("/me/vouchers").then(res => {
        setSavedVouchers(res.data || []);
      }).catch(() => {});
    } else {
      setSavedVouchers([]);
    }
  }, [user]);

  const handleSave = async (voucherId: string) => {
    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để lưu voucher");
      router.push("/auth");
      return;
    }
    try {
      await api.post("/me/vouchers/save", { voucherId, voucherType: "PLATFORM" });
      toast.success("Lưu voucher thành công!");
      setSavedVouchers(prev => [...prev, { voucherId, isUsed: false }]);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Không thể lưu voucher");
    }
  };

  const visibleVouchers = vouchers.filter(v => {
    const saved = savedVouchers.find(sv => sv.voucherId === v.id);
    return !saved?.isUsed;
  });

  if (visibleVouchers.length === 0) return null;

  const marqueeVouchers = [...visibleVouchers, ...visibleVouchers, ...visibleVouchers];

  return (
    <section className="py-4 overflow-hidden" style={{ background: "var(--grad-gold)" }}>
      <div className="flex w-max animate-marquee space-x-4">
        {marqueeVouchers.map((v, i) => {
          const saved = savedVouchers.find(sv => sv.voucherId === v.id);
          const isSaved = !!saved;
          return (
            <div key={`${v.id}-${i}`} className="flex items-center gap-3 px-4 py-2 rounded-xl flex-shrink-0" style={{ background: "rgba(0,0,0,0.8)", minWidth: "300px" }}>
              <div className="flex-shrink-0 p-2 rounded-full" style={{ background: "var(--gold-dim)" }}>
                <Ticket className="w-5 h-5" style={{ color: "var(--gold)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  GIẢM {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                </p>
                <p className="text-[10px] text-gray-300">Đơn từ {formatPrice(v.minOrderValue)}</p>
                {v.usageLimit > 0 && <p className="text-[9px] text-orange-300">Giới hạn {v.usageLimit} lượt/tài khoản</p>}
              </div>
              <Button 
                variant={isSaved ? "glass" : "gold"} 
                size="sm" 
                className="h-7 text-[10px] px-3" 
                disabled={isSaved}
                onClick={() => !isSaved && handleSave(v.id)}
              >
                {isSaved ? "Đã lưu" : "Lưu"}
              </Button>
            </div>
          );
        })}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}
