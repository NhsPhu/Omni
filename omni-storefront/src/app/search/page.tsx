"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Star, ChevronDown, Grid3X3, List, ArrowUpDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { featuredProducts, categories } from "@/data/mock";
import { formatPrice } from "@/lib/utils";

const SORT_OPTIONS = [
  { id: "popular",  label: "Phổ biến nhất" },
  { id: "newest",   label: "Mới nhất" },
  { id: "price_asc",label: "Giá tăng dần" },
  { id: "price_desc",label:"Giá giảm dần" },
  { id: "rating",   label: "Đánh giá cao" },
];

const PRICE_RANGES = [
  { id: "all",    label: "Tất cả",      min: 0,       max: Infinity },
  { id: "under500",label:"Dưới 500k",   min: 0,       max: 500000  },
  { id: "500_2m", label: "500k – 2M",   min: 500000,  max: 2000000 },
  { id: "2m_10m", label: "2M – 10M",    min: 2000000, max: 10000000},
  { id: "over10m",label: "Trên 10M",    min: 10000000,max: Infinity },
];

export default function SearchPage() {
  const [query] = useState("iPhone");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOpen, setSortOpen] = useState(false);

  // Active filter chips
  const chips: { id: string; label: string; onRemove: () => void }[] = [
    ...(priceRange !== "all" ? [{ id: "price", label: PRICE_RANGES.find(r => r.id === priceRange)!.label, onRemove: () => setPriceRange("all") }] : []),
    ...(minRating > 0 ? [{ id: "rating", label: `${minRating}★ trở lên`, onRemove: () => setMinRating(0) }] : []),
    ...selectedCats.map(id => ({ id: `cat-${id}`, label: categories.find(c => c.id === id)!.name, onRemove: () => setSelectedCats(p => p.filter(c => c !== id)) })),
  ];

  const range = PRICE_RANGES.find(r => r.id === priceRange)!;
  const results = useMemo(() => {
    let list = featuredProducts.filter(p => {
      if (priceRange !== "all" && (p.price < range.min || p.price > range.max)) return false;
      if (minRating > 0 && p.rating < minRating) return false;
      if (selectedCats.length > 0 && !selectedCats.includes(p.categoryId ?? 0)) return false;
      return true;
    });
    if (sort === "price_asc")  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating")     list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [priceRange, minRating, selectedCats, sort, range.min, range.max]);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-sm font-bold mb-3 font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>Danh mục</h3>
        <div className="space-y-2">
          {categories.slice(0, 6).map(cat => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <div onClick={() => setSelectedCats(p => p.includes(cat.id) ? p.filter(c => c !== cat.id) : [...p, cat.id])}
                className="w-4 h-4 rounded flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-150"
                style={{ border: selectedCats.includes(cat.id) ? "none" : "1px solid var(--border)", background: selectedCats.includes(cat.id) ? "var(--purple)" : "transparent" }}>
                {selectedCats.includes(cat.id) && <span className="text-white text-[10px]">✓</span>}
              </div>
              <span className="text-sm transition-colors duration-150 group-hover:text-gold" style={{ color: "var(--text-secondary)" }}>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-bold mb-3 font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>Khoảng giá</h3>
        <div className="space-y-1.5">
          {PRICE_RANGES.map(r => (
            <button key={r.id} onClick={() => setPriceRange(r.id)}
              className="w-full text-left px-3 py-2 rounded-xl text-sm cursor-pointer transition-all duration-150"
              style={{ background: priceRange === r.id ? "var(--purple-dim)" : "transparent", color: priceRange === r.id ? "var(--purple-light)" : "var(--text-secondary)", border: priceRange === r.id ? "1px solid var(--border-purple)" : "1px solid transparent" }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-bold mb-3 font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>Đánh giá tối thiểu</h3>
        <div className="space-y-1.5">
          {[0, 3, 4, 4.5].map(r => (
            <button key={r} onClick={() => setMinRating(r)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer transition-all duration-150"
              style={{ background: minRating === r ? "var(--gold-dim)" : "transparent", color: minRating === r ? "var(--gold)" : "var(--text-secondary)", border: minRating === r ? "1px solid var(--border-gold)" : "1px solid transparent" }}>
              {r === 0 ? "Tất cả" : (
                <>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r ? "fill-gold text-gold" : "text-border"}`} />)}
                  <span>trở lên</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {chips.length > 0 && (
        <button onClick={() => { setPriceRange("all"); setMinRating(0); setSelectedCats([]); }}
          className="w-full py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors duration-150"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <h1 className="text-lg font-bold font-[family-name:var(--font-heading)]" style={{ color: "var(--text-primary)" }}>
                Kết quả tìm kiếm cho &ldquo;<span className="text-gradient-gold">{query}</span>&rdquo;
              </h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Tìm thấy {results.length} sản phẩm</p>
          </div>

          {/* Active chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {chips.map(chip => (
                <span key={chip.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "var(--purple-dim)", color: "var(--purple-light)", border: "1px solid var(--border-purple)" }}>
                  {chip.label}
                  <button onClick={chip.onRemove} className="cursor-pointer hover:text-white transition-colors duration-150"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-8">
            {/* Sidebar — desktop */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24 p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-5">
                  <SlidersHorizontal className="w-4 h-4" style={{ color: "var(--gold)" }} />
                  <span className="font-bold text-sm font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>Bộ lọc</span>
                </div>
                <FilterPanel />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <button onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm cursor-pointer font-semibold glass"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  <SlidersHorizontal className="w-4 h-4" /> Lọc {chips.length > 0 && `(${chips.length})`}
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  {/* Sort */}
                  <div className="relative">
                    <button onClick={() => setSortOpen(!sortOpen)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm cursor-pointer font-medium glass"
                      style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                      <ArrowUpDown className="w-4 h-4" />
                      {SORT_OPTIONS.find(s => s.id === sort)!.label}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {sortOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="absolute right-0 top-full mt-1 w-44 rounded-2xl overflow-hidden z-50"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                          {SORT_OPTIONS.map(opt => (
                            <button key={opt.id} onClick={() => { setSort(opt.id); setSortOpen(false); }}
                              className="w-full px-4 py-2.5 text-sm text-left cursor-pointer transition-colors duration-150"
                              style={{ background: sort === opt.id ? "var(--purple-dim)" : "transparent", color: sort === opt.id ? "var(--purple-light)" : "var(--text-secondary)" }}>
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* View mode */}
                  <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    {(["grid", "list"] as const).map(mode => (
                      <button key={mode} onClick={() => setViewMode(mode)}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors duration-150"
                        style={{ background: viewMode === mode ? "var(--purple-dim)" : "transparent", color: viewMode === mode ? "var(--purple-light)" : "var(--text-muted)" }}>
                        {mode === "grid" ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Search className="w-16 h-16 mb-4" style={{ color: "var(--text-muted)" }} />
                  <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Không tìm thấy sản phẩm</h3>
                  <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  <Button variant="glass" onClick={() => { setPriceRange("all"); setMinRating(0); setSelectedCats([]); }}>Xóa bộ lọc</Button>
                </div>
              ) : (
                <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                  {results.map((p, i) => (
                    viewMode === "grid"
                      ? <ProductCard key={p.id} product={p} index={i} />
                      : (
                        <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          className="flex gap-4 p-4 rounded-2xl cursor-pointer group transition-all duration-200"
                          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-purple)"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}>
                          <div className={`w-24 h-24 rounded-xl flex-shrink-0 bg-gradient-to-br ${["from-violet-600/80 to-indigo-600/80","from-amber-500/80 to-orange-600/80","from-purple-600/80 to-pink-600/80"][i % 3]} flex items-center justify-center`}>
                            <span className="text-white/30 text-2xl">🛒</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium line-clamp-2 text-sm group-hover:text-gold transition-colors duration-200" style={{ color: "var(--text-primary)" }}>{p.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.rating}</span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="font-bold text-gradient-gold">{formatPrice(p.price)}</span>
                              {p.originalPrice && <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>{formatPrice(p.originalPrice)}</span>}
                            </div>
                          </div>
                          <Button variant="gold" size="sm" className="self-center">Mua ngay</Button>
                        </motion.div>
                      )
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile filter bottom sheet */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setFilterOpen(false)} className="fixed inset-0 z-40 lg:hidden"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 lg:hidden max-h-[85vh] overflow-y-auto rounded-t-3xl p-6"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-bold" style={{ color: "var(--text-primary)" }}>Bộ lọc</span>
                  <button onClick={() => setFilterOpen(false)} className="cursor-pointer"><X className="w-5 h-5" style={{ color: "var(--text-muted)" }} /></button>
                </div>
                <FilterPanel />
                <Button variant="gold" className="w-full mt-6" onClick={() => setFilterOpen(false)}>Áp dụng ({results.length} kết quả)</Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
