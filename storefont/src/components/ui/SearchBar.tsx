"use client";
import { useState, useRef, useEffect } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { popularSearches } from "@/data/mock";

interface SearchBarProps { size?: "default" | "large"; className?: string; }

export default function SearchBar({ size = "default", className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isLarge = size === "large";

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    setFocused(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const suggestions = query
    ? popularSearches.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : popularSearches;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className || ""}`}>
      <div className={`flex items-center gap-3 rounded-2xl transition-all duration-300 ${isLarge ? "px-6 py-4" : "px-4 py-2.5"}`}
        style={{
          background: "var(--bg-glass)",
          backdropFilter: "blur(20px)",
          border: focused ? "1px solid var(--border-purple)" : "1px solid var(--border)",
          boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.15), var(--shadow-glow-purple)" : "none",
        }}
      >
        <Search className={`flex-shrink-0 transition-colors duration-200 ${isLarge ? "w-6 h-6" : "w-5 h-5"}`}
          style={{ color: focused ? "var(--purple-light)" : "var(--text-muted)" }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={e => e.key === "Enter" && handleSearch(query)}
          placeholder="Tìm kiếm sản phẩm, cửa hàng..."
          className={`flex-1 bg-transparent outline-none font-[family-name:var(--font-body)] ${isLarge ? "text-lg" : "text-sm"}`}
          style={{ color: "var(--text-primary)" }}
        />
        {query && (
          <button onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="flex-shrink-0 p-1 rounded-full hover:bg-glass transition-colors duration-150 cursor-pointer">
            <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          </button>
        )}
        <button onClick={() => handleSearch(query)} className="flex-shrink-0 px-5 py-2 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 font-[family-name:var(--font-body)]"
          style={{ background: "var(--grad-gold)", color: "#050509" }}>
          Tìm kiếm
        </button>
      </div>

      <AnimatePresence>
        {focused && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="p-3">
              <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                <TrendingUp className="w-3.5 h-3.5" />
                Tìm kiếm phổ biến
              </div>
              {suggestions.slice(0, 6).map((s, i) => (
                <button key={i} onClick={() => { setQuery(s); handleSearch(s); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left cursor-pointer transition-all duration-150 group"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-glass)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                >
                  <Search className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
