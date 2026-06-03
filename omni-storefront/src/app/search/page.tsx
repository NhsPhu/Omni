"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Star, ChevronDown, Grid3X3, List, ArrowUpDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

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

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const initCategoryId = searchParams.get("categoryId");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [selectedCats, setSelectedCats] = useState<string[]>(initCategoryId ? [initCategoryId] : []);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    if (initCategoryId) {
      setSelectedCats([initCategoryId]);
    } else {
      setSelectedCats([]);
    }
  }, [initCategoryId]);
  
  const [realCategories, setRealCategories] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  useEffect(() => {
    api.get("/categories").then(res => setRealCategories(res.data)).catch(console.error);
  }, []);

  // Active filter chips
  const chips: { id: string; label: string; onRemove: () => void }[] = [
    ...(priceRange !== "all" ? [{ id: "price", label: PRICE_RANGES.find(r => r.id === priceRange)!.label, onRemove: () => setPriceRange("all") }] : []),
    ...(minRating > 0 ? [{ id: "rating", label: `${minRating}★ trở lên`, onRemove: () => setMinRating(0) }] : []),
    ...selectedCats.map(id => {
      let catName = "Danh mục";
      for (const c of realCategories) {
        if (c.id === id) catName = c.name;
        if (c.children) {
          for (const child of c.children) {
            if (child.id === id) catName = child.name;
          }
        }
      }
      return { id: `cat-${id}`, label: catName, onRemove: () => setSelectedCats(p => p.filter(c => c !== id)) };
    }),
  ];

  const range = PRICE_RANGES.find(r => r.id === priceRange)!;
  
  useEffect(() => {
    setLoading(true);
    let url = `/products?keyword=${encodeURIComponent(query)}&page=${currentPage}&size=12`;
    if (range.id !== "all") {
        url += `&minPrice=${range.min}`;
        if (range.max !== Infinity) url += `&maxPrice=${range.max}`;
    }
    if (selectedCats.length > 0) {
        url += `&categoryId=${selectedCats.join(',')}`;
    }

    let sortParam = "";
    if (sort === "popular") sortParam = "soldCount,desc";
    else if (sort === "newest") sortParam = "createdAt,desc";
    else if (sort === "price_asc") sortParam = "price,asc";
    else if (sort === "price_desc") sortParam = "price,desc";
    else if (sort === "rating") sortParam = "rating,desc";
    
    if (sortParam) {
        url += `&sort=${sortParam}`;
    }
    
    api.get(url).then(res => {
        let list = res.data.content || [];
        if (minRating > 0) list = list.filter((p:any) => (p.rating || 5.0) >= minRating);
        
        setResults(list);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || list.length);
        setLoading(false);
    }).catch(err => {
        console.error(err);
        setLoading(false);
    });
  }, [query, priceRange, selectedCats, minRating, sort, range, currentPage]);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-sm font-bold mb-3 font-[family-name:var(--font-body)]" style={{ color: "var(--text-primary)" }}>Danh mục</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {realCategories.map((cat:any) => (
            <div key={cat.id} className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer group"
                     onClick={(e) => {
                       e.preventDefault();
                       setSelectedCats(p => p.includes(cat.id) ? p.filter(c => c !== cat.id) : [...p, cat.id]);
                     }}>
                <div className="w-4 h-4 rounded flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-150"
                  style={{ border: selectedCats.includes(cat.id) ? "none" : "1px solid var(--border)", background: selectedCats.includes(cat.id) ? "var(--purple)" : "transparent" }}>
                  {selectedCats.includes(cat.id) && <span className="text-white text-[10px]">✓</span>}
                </div>
                <span className="text-sm transition-colors duration-150 group-hover:text-gold font-medium" style={{ color: "var(--text-primary)" }}>{cat.name}</span>
              </label>
              {cat.children && cat.children.length > 0 && (
                <div className="pl-6 space-y-2 border-l ml-2" style={{ borderColor: "var(--border)" }}>
                  {cat.children.map((child:any) => (
                    <label key={child.id} className="flex items-center gap-3 cursor-pointer group"
                           onClick={(e) => {
                             e.preventDefault();
                             setSelectedCats(p => p.includes(child.id) ? p.filter(c => c !== child.id) : [...p, child.id]);
                           }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center cursor-pointer flex-shrink-0 transition-all duration-150"
                        style={{ border: selectedCats.includes(child.id) ? "none" : "1px solid var(--border)", background: selectedCats.includes(child.id) ? "var(--purple)" : "transparent" }}>
                        {selectedCats.includes(child.id) && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <span className="text-sm transition-colors duration-150 group-hover:text-gold" style={{ color: "var(--text-secondary)" }}>{child.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
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

      <div className="pt-2">
        <button onClick={() => { setPriceRange("all"); setMinRating(0); setSelectedCats([]); }}
          disabled={chips.length === 0}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          style={{ 
            border: "1px solid var(--border)", 
            color: chips.length > 0 ? "var(--text-primary)" : "var(--text-muted)",
            opacity: chips.length > 0 ? 1 : 0.4,
            cursor: chips.length > 0 ? "pointer" : "not-allowed",
            background: chips.length > 0 ? "var(--bg-elevated)" : "transparent"
          }}>
          <X className="w-4 h-4" /> Xóa tất cả bộ lọc
        </button>
      </div>
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
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Tìm thấy {totalElements} sản phẩm</p>
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
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Đang tìm kiếm...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Search className="w-16 h-16 mb-4" style={{ color: "var(--text-muted)" }} />
                  <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Không tìm thấy sản phẩm</h3>
                  <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  <Button variant="glass" onClick={() => { setPriceRange("all"); setMinRating(0); setSelectedCats([]); }}>Xóa bộ lọc</Button>
                </div>
              ) : (
                <>
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
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
                            onClick={() => window.location.href = `/products/${p.id}`}>
                            <div className={`w-24 h-24 rounded-xl flex-shrink-0 bg-gradient-to-br ${["from-violet-600/80 to-indigo-600/80","from-amber-500/80 to-orange-600/80","from-purple-600/80 to-pink-600/80"][i % 3]} flex items-center justify-center overflow-hidden`}>
                              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover mix-blend-overlay opacity-50" /> : <span className="text-white/30 text-2xl">🛒</span>}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h3 className="font-medium line-clamp-2 text-sm group-hover:text-gold transition-colors duration-200" style={{ color: "var(--text-primary)" }}>{p.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.rating || "5.0"}</span>
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>• Đã bán {p.soldCount || 0}</span>
                              </div>
                              <div className="flex items-baseline gap-2 mt-2">
                                <span className="font-bold text-gradient-gold">{formatPrice(p.discountPrice || p.price)}</span>
                                {p.discountPrice && p.discountPrice < p.price && <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>{formatPrice(p.price)}</span>}
                              </div>
                            </div>
                            <div className="self-center flex-shrink-0 ml-4 hidden sm:block">
                              <Button variant="gold" size="sm" onClick={(e) => { e.stopPropagation(); window.location.href = `/products/${p.id}`; }}>Mua ngay</Button>
                            </div>
                          </motion.div>
                        )
                    ))}
                  </motion.div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${currentPage === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                      >
                        Trước
                      </button>
                      <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                        Trang {currentPage + 1} / {totalPages}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${currentPage === totalPages - 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}
