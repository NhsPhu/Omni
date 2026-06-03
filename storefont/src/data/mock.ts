/**
 * Mock data for Omni Marketplace — All Pages
 */

// ─── Core Interfaces ────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  shopName: string;
  shopId: number;
  badge?: "bestseller" | "new" | "sale";
  discount?: number;
  categoryId?: number;
  categoryName?: string;
  description?: string;
  stock?: number;
  images?: string[];
  specs?: Record<string, string>;
  skus?: SKU[];
  reviews?: Review[];
}

export interface SKU {
  id: string;
  color?: string;
  size?: string;
  storage?: string;
  price: number;
  stock: number;
  colorHex?: string;
}

export interface Review {
  id: number;
  userName: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  helpful: number;
  sku?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  productCount: number;
  color: string;
}

export interface FlashSaleItem extends Product {
  stockPercent: number;
}

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  shopId: number;
  shopName: string;
  quantity: number;
  sku?: string;
  selected: boolean;
  stock: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  shopName: string;
  shopId: number;
  items: { name: string; quantity: number; price: number; image: string }[];
  total: number;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  createdAt: string;
  trackingCode?: string;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories: Category[] = [
  { id: 1, name: "Điện tử",   icon: "Smartphone",       productCount: 12450, color: "#3b82f6" },
  { id: 2, name: "Thời trang",icon: "Shirt",            productCount: 34200, color: "#ec4899" },
  { id: 3, name: "Nhà cửa",   icon: "Home",             productCount: 8930,  color: "#f59e0b" },
  { id: 4, name: "Làm đẹp",   icon: "Sparkles",         productCount: 15600, color: "#a855f7" },
  { id: 5, name: "Thể thao",  icon: "Dumbbell",         productCount: 7840,  color: "#22c55e" },
  { id: 6, name: "Sách",      icon: "BookOpen",         productCount: 21300, color: "#6366f1" },
  { id: 7, name: "Đồ ăn",     icon: "UtensilsCrossed",  productCount: 9100,  color: "#ef4444" },
  { id: 8, name: "Xe cộ",     icon: "Car",              productCount: 5670,  color: "#0ea5e9" },
];

// ─── Product Detail Data ──────────────────────────────────────────────────────

export const productDetail: Product = null as any;

// ─── Featured Products ────────────────────────────────────────────────────────

export const featuredProducts: Product[] = [];

// ─── Flash Sale ───────────────────────────────────────────────────────────────

export const flashSaleItems: FlashSaleItem[] = [];

// ─── Cart Mock ────────────────────────────────────────────────────────────────

export const mockCartItems: CartItem[] = [];

// ─── Addresses ────────────────────────────────────────────────────────────────

export const mockAddresses: Address[] = [];

// ─── Orders ──────────────────────────────────────────────────────────────────

export const mockOrders: Order[] = [];

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const popularSearches = ["iPhone 16", "Áo khoác nam", "Tai nghe bluetooth", "Nồi chiên không dầu", "Laptop gaming", "Giày thể thao", "Son môi", "Robot hút bụi"];

export const trustStats = [
  { label: "Cửa hàng",    value: "10,000+", icon: "Store"       },
  { label: "Sản phẩm",    value: "500,000+",icon: "Package"     },
  { label: "Đơn hàng",    value: "1M+",     icon: "ShoppingBag" },
  { label: "Đánh giá 5★", value: "98%",     icon: "Star"        },
];

export const sellerBenefits = [
  { title: "Quản lý cửa hàng", description: "Dashboard trực quan, quản lý sản phẩm và đơn hàng dễ dàng",      icon: "LayoutDashboard" },
  { title: "Ví & Thanh toán",  description: "Ví nội bộ an toàn, rút tiền nhanh chóng về tài khoản ngân hàng", icon: "Wallet"          },
  { title: "Phân tích doanh số",description: "Biểu đồ chi tiết, funnel chuyển đổi, hiểu rõ khách hàng",       icon: "BarChart3"       },
  { title: "Voucher & Khuyến mãi",description: "Tạo voucher shop, flash sale, thu hút khách hàng mới",          icon: "Ticket"          },
];

export const footerLinks = {
  about:   [{ label: "Giới thiệu Omni",   href: "#" }, { label: "Tuyển dụng",          href: "#" }, { label: "Điều khoản",        href: "#" }, { label: "Bảo mật",        href: "#" }, { label: "Blog", href: "#" }],
  support: [{ label: "Trung tâm trợ giúp",href: "#" }, { label: "Hướng dẫn mua hàng", href: "#" }, { label: "Chính sách đổi trả",href: "#" }, { label: "Chính sách ship",href: "#" }, { label: "Liên hệ", href: "#" }],
  seller:  [{ label: "Đăng ký bán hàng",  href: "#" }, { label: "Seller Center",       href: "#" }, { label: "Quy định người bán",href: "#" }, { label: "Biểu phí",       href: "#" }, { label: "Hỗ trợ người bán", href: "#" }],
};

export const shippingMethods = [
  { id: "standard", label: "Giao hàng tiêu chuẩn", desc: "3-5 ngày làm việc", price: 30000 },
  { id: "express",  label: "Giao hàng nhanh",       desc: "1-2 ngày làm việc",  price: 50000 },
  { id: "same_day", label: "Giao trong ngày",        desc: "Nhận trước 12h, giao trong ngày", price: 85000 },
];

export const paymentMethods = [
  { id: "vnpay",  label: "VNPay",          desc: "Thanh toán qua VNPay (ATM/Visa/QR)",   icon: "CreditCard"  },
  { id: "momo",   label: "MoMo",           desc: "Ví điện tử MoMo",                       icon: "Smartphone"  },
  { id: "zalopay",label: "ZaloPay",        desc: "Thanh toán qua ZaloPay",                icon: "Wallet"      },
  { id: "cod",    label: "Thanh toán COD", desc: "Trả tiền mặt khi nhận hàng",            icon: "Banknote"    },
];
