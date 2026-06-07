"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function ShopRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const fetchMyShop = async () => {
      try {
        const res = await api.get('/shops/me');
        if (res.data && res.data.id) {
          router.replace(`/shop/${res.data.id}`);
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.error("Failed to load shop", err);
        router.replace("/");
      }
    };
    fetchMyShop();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
      <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "4px solid var(--border)", borderTopColor: "var(--gold)" }}></div>
    </div>
  );
}
