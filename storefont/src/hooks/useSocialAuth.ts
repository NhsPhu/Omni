"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { toast } from "sonner";

/**
 * Hook xử lý Social Login (Google + Facebook)
 * Dùng Token Exchange Pattern:
 *   1. FE lấy access_token từ SDK
 *   2. Gửi lên /api/auth/social
 *   3. Backend verify → trả JWT Omni
 *   4. Lưu JWT → redirect
 */
export function useSocialAuth() {
  const { setToken } = useAuthStore();
  const router = useRouter();

  const loginWithSocial = async (
    provider: "GOOGLE" | "FACEBOOK",
    accessToken: string
  ) => {
    try {
      const res = await api.post("/auth/social", { provider, accessToken });
      setToken(res.data.accessToken);
      toast.success("Đăng nhập thành công!", { description: `Đã đăng nhập qua ${provider === "GOOGLE" ? "Google" : "Facebook"}` });
      setTimeout(() => router.push("/"), 800);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Đăng nhập thất bại";
      toast.error(msg);
    }
  };

  return { loginWithSocial };
}
