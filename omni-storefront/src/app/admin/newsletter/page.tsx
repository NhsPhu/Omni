"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Mail, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminNewsletterPage() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user || user.role !== "ROLE_ADMIN") {
    // Basic protection, the API will also protect it
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-xl text-red-500 font-bold">Unauthorized Access</div>
      </div>
    );
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      setError("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await api.post("/newsletter/admin/broadcast", {
        subject,
        content
      });
      setMessage(res.data.message);
      setSubject("");
      setContent("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi gửi bản tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-gold/30 rounded-3xl p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center shadow-lg shadow-gold/20">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-[family-name:var(--font-heading)]">Gửi Bản Tin (Newsletter)</h1>
            <p className="text-text-secondary mt-1">Gửi email hàng loạt đến tất cả người đăng ký nhận tin</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl mb-6 font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider">Tiêu đề Email</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors"
              placeholder="VD: Flash Sale Giữa Tháng - Giảm đến 50%"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider">Nội dung (Hỗ trợ HTML)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-gold transition-colors min-h-[250px]"
              placeholder="<h1>Xin chào!</h1><p>Omni Marketplace gửi bạn mã giảm giá...</p>"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold to-orange-500 hover:from-orange-500 hover:to-gold text-white font-bold py-4 rounded-xl shadow-lg shadow-gold/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Gửi Bản Tin
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
