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

export const productDetail: Product = {
  id: 1,
  name: "iPhone 16 Pro Max 256GB Chính Hãng Apple VN/A",
  price: 28990000,
  originalPrice: 34990000,
  image: "/images/products/phone.jpg",
  rating: 4.8,
  sold: 12500,
  shopName: "Apple Store VN",
  shopId: 10,
  badge: "bestseller",
  discount: 17,
  categoryId: 1,
  categoryName: "Điện tử",
  stock: 48,
  images: [
    "/images/products/phone.jpg",
    "/images/products/phone2.jpg",
    "/images/products/phone3.jpg",
    "/images/products/phone4.jpg",
  ],
  description: `**iPhone 16 Pro Max** — Thiết kế titanium cao cấp, chip A18 Pro mạnh nhất từ trước đến nay, camera 48MP ProRAV, màn hình 6.9" Super Retina XDR ProMotion 120Hz.\n\nThời lượng pin vượt trội lên đến 33 giờ xem video. Kết nối USB-C với tốc độ USB 3.`,
  specs: {
    "Màn hình": "6.9\" Super Retina XDR, 120Hz ProMotion",
    "Chip": "Apple A18 Pro",
    "Camera": "48MP + 48MP + 12MP (Triple camera)",
    "Pin": "4685 mAh, sạc MagSafe 25W",
    "RAM": "8 GB",
    "Hệ điều hành": "iOS 18",
    "Kết nối": "5G, Wi-Fi 7, Bluetooth 5.3, USB-C",
    "Kích thước": "163 x 77.6 x 8.25 mm",
    "Trọng lượng": "227g",
    "Màu sắc": "Titan Đen, Titan Trắng, Titan Vàng, Titan Sa Mạc",
  },
  skus: [
    { id: "iphone-black-256",   color: "Titan Đen",    storage: "256GB", price: 28990000, stock: 15, colorHex: "#1c1c1e" },
    { id: "iphone-white-256",   color: "Titan Trắng",  storage: "256GB", price: 28990000, stock: 8,  colorHex: "#f5f5f7" },
    { id: "iphone-gold-256",    color: "Titan Vàng",   storage: "256GB", price: 29490000, stock: 5,  colorHex: "#d4a94e" },
    { id: "iphone-desert-256",  color: "Titan Sa Mạc", storage: "256GB", price: 28990000, stock: 20, colorHex: "#c8b89a" },
    { id: "iphone-black-512",   color: "Titan Đen",    storage: "512GB", price: 33490000, stock: 12, colorHex: "#1c1c1e" },
    { id: "iphone-white-512",   color: "Titan Trắng",  storage: "512GB", price: 33490000, stock: 3,  colorHex: "#f5f5f7" },
    { id: "iphone-black-1tb",   color: "Titan Đen",    storage: "1TB",   price: 38990000, stock: 0,  colorHex: "#1c1c1e" },
    { id: "iphone-white-1tb",   color: "Titan Trắng",  storage: "1TB",   price: 38990000, stock: 2,  colorHex: "#f5f5f7" },
  ],
  reviews: [
    { id: 1, userName: "Nguyễn Văn An", rating: 5, comment: "Máy đẹp lắm, mượt không có chỗ chê. Camera chụp đêm cực sắc nét, pin dùng cả ngày không lo hết. Đóng gói cẩn thận, giao nhanh hơn dự kiến!", date: "2025-11-14", helpful: 48, sku: "Titan Đen / 256GB" },
    { id: 2, userName: "Trần Thị Bình", rating: 5, comment: "Dùng iPhone từ đời 12 đến giờ, đây là đời ngon nhất. Màn hình sáng đẹp, hiệu năng đỉnh, camera siêu đẹp. Rất hài lòng!", date: "2025-11-10", helpful: 31, sku: "Titan Vàng / 512GB" },
    { id: 3, userName: "Lê Hoàng Cường", rating: 4, comment: "Sản phẩm tốt, đúng hàng. Chỉ tiếc giá còn cao. Hộp seal nguyên, có đủ phụ kiện. Shop nhiệt tình.", date: "2025-11-08", helpful: 12, sku: "Titan Trắng / 256GB" },
    { id: 4, userName: "Phạm Thu Dung", rating: 5, comment: "Màu Titan Vàng quá đẹp, sang chảnh hơn hình nhiều. Cầm trên tay chắc chắn, không trơn. Camera chụp portrait xịn thật!", date: "2025-11-05", helpful: 25, sku: "Titan Vàng / 256GB" },
  ],
};

// ─── Featured Products ────────────────────────────────────────────────────────

export const featuredProducts: Product[] = [
  { id: 1, name: "iPhone 16 Pro Max 256GB Chính Hãng", price: 28990000, originalPrice: 34990000, image: "/images/products/phone.jpg", rating: 4.8, sold: 12500, shopName: "Apple Store VN", shopId: 10, badge: "bestseller", discount: 17, categoryId: 1 },
  { id: 2, name: "Tai Nghe Bluetooth Sony WH-1000XM5",  price: 6490000,  originalPrice: 8490000,  image: "/images/products/headphone.jpg", rating: 4.9, sold: 5600,  shopName: "Sony Official", shopId: 11,    badge: "bestseller", discount: 24, categoryId: 1 },
  { id: 3, name: "Laptop Gaming ASUS ROG Strix G16",    price: 32990000, originalPrice: 39990000, image: "/images/products/laptop.jpg", rating: 4.8, sold: 3200,  shopName: "ASUS Official", shopId: 12,    badge: "bestseller", discount: 18, categoryId: 1 },
  { id: 4, name: "Robot Hút Bụi Roborock S8 Pro Ultra", price: 18990000, originalPrice: 24990000, image: "/images/products/robot.jpg",  rating: 4.9, sold: 2100,  shopName: "SmartHome VN",  shopId: 13,    badge: "bestseller", discount: 24, categoryId: 3 },
  { id: 5, name: "Sách Atomic Habits - Thay Đổi Tí Hon",price: 135000,   originalPrice: 189000,   image: "/images/products/book.jpg",  rating: 4.9, sold: 42000, shopName: "Nhà Sách Online",shopId: 14,    badge: "bestseller", discount: 29, categoryId: 6 },
  { id: 6, name: "Áo Khoác Gió Nam Chống Nước Premium", price: 450000,   originalPrice: 890000,   image: "/images/products/jacket.jpg",rating: 4.6, sold: 8300,  shopName: "Fashion Hub",   shopId: 15,    badge: "new",        discount: 49, categoryId: 2 },
  { id: 7, name: "Giày Chạy Bộ Nike Air Max 270",       price: 2890000,  originalPrice: 3690000,  image: "/images/products/shoes.jpg", rating: 4.5, sold: 9800,  shopName: "Nike VN",        shopId: 16,    badge: "new",        discount: 22, categoryId: 2 },
  { id: 8, name: "Bộ Skincare Hàn Quốc Innisfree",      price: 750000,   originalPrice: 1200000,  image: "/images/products/skincare.jpg",rating: 4.7, sold: 15200, shopName: "K-Beauty Store",shopId: 17, badge: "sale",       discount: 38, categoryId: 4 },
];

// ─── Flash Sale ───────────────────────────────────────────────────────────────

export const flashSaleItems: FlashSaleItem[] = [
  { id: 101, name: "Máy Pha Cà Phê Espresso Delonghi",    price: 3490000,  originalPrice: 7990000,  image: "/images/products/coffee.jpg",   rating: 4.7, sold: 450,  shopName: "Home Appliance", shopId: 20, discount: 56, stockPercent: 78 },
  { id: 102, name: "Đồng Hồ Thông Minh Apple Watch S9",   price: 8990000,  originalPrice: 12990000, image: "/images/products/watch.jpg",    rating: 4.8, sold: 320,  shopName: "Apple Store VN",  shopId: 10, discount: 31, stockPercent: 45 },
  { id: 103, name: "Bàn Phím Cơ Keychron K2 Pro",         price: 1690000,  originalPrice: 2890000,  image: "/images/products/keyboard.jpg", rating: 4.6, sold: 890,  shopName: "Gear Store",      shopId: 21, discount: 42, stockPercent: 23 },
  { id: 104, name: "Nồi Chiên Không Dầu Philips 6.2L",    price: 1990000,  originalPrice: 3990000,  image: "/images/products/airfryer.jpg", rating: 4.8, sold: 1200, shopName: "Philips VN",      shopId: 22, discount: 50, stockPercent: 62 },
  { id: 105, name: "Loa JBL Flip 6 Bluetooth Chống Nước", price: 1890000,  originalPrice: 2990000,  image: "/images/products/speaker.jpg",  rating: 4.7, sold: 670,  shopName: "JBL Official",    shopId: 23, discount: 37, stockPercent: 55 },
];

// ─── Cart Mock ────────────────────────────────────────────────────────────────

export const mockCartItems: CartItem[] = [
  { id: "ci-1", productId: 1, name: "iPhone 16 Pro Max 256GB Chính Hãng", price: 28990000, originalPrice: 34990000, image: "/images/products/phone.jpg", shopId: 10, shopName: "Apple Store VN", quantity: 1, sku: "Titan Đen / 256GB", selected: true, stock: 15 },
  { id: "ci-2", productId: 3, name: "Tai Nghe Bluetooth Sony WH-1000XM5",  price: 6490000,  originalPrice: 8490000,  image: "/images/products/headphone.jpg", shopId: 11, shopName: "Sony Official",  quantity: 1, sku: "Màu Đen",       selected: true, stock: 30 },
  { id: "ci-3", productId: 8, name: "Bộ Skincare Hàn Quốc Innisfree",      price: 750000,   originalPrice: 1200000,  image: "/images/products/skincare.jpg",  shopId: 17, shopName: "K-Beauty Store", quantity: 2, selected: true,  stock: 100 },
  { id: "ci-4", productId: 6, name: "Áo Khoác Gió Nam Chống Nước Premium", price: 450000,   originalPrice: 890000,   image: "/images/products/jacket.jpg",    shopId: 15, shopName: "Fashion Hub",    quantity: 1, sku: "XL / Đen",      selected: false, stock: 0 },
];

// ─── Addresses ────────────────────────────────────────────────────────────────

export const mockAddresses: Address[] = [
  { id: "addr-1", name: "Nguyễn Văn An", phone: "0901234567", street: "123 Lê Lợi", ward: "Phường Bến Nghé", district: "Quận 1", city: "TP. Hồ Chí Minh", isDefault: true },
  { id: "addr-2", name: "Nguyễn Văn An", phone: "0901234567", street: "456 Cách Mạng Tháng 8", ward: "Phường 11", district: "Quận 3", city: "TP. Hồ Chí Minh", isDefault: false },
];

// ─── Orders ──────────────────────────────────────────────────────────────────

export const mockOrders: Order[] = [
  { id: "OMN-20241101",  shopName: "Apple Store VN",  shopId: 10, items: [{ name: "iPhone 16 Pro Max 256GB", quantity: 1, price: 28990000, image: "/images/products/phone.jpg" }],    total: 28990000, status: "delivered", createdAt: "2024-11-01", trackingCode: "GHN123456789" },
  { id: "OMN-20241115",  shopName: "Sony Official",   shopId: 11, items: [{ name: "Sony WH-1000XM5",         quantity: 1, price: 6490000,  image: "/images/products/headphone.jpg" }], total: 6490000,  status: "shipping",  createdAt: "2024-11-15", trackingCode: "GHN987654321" },
  { id: "OMN-20241120",  shopName: "K-Beauty Store",  shopId: 17, items: [{ name: "Bộ Skincare Innisfree",   quantity: 2, price: 750000,   image: "/images/products/skincare.jpg" }],  total: 1500000,  status: "confirmed", createdAt: "2024-11-20" },
  { id: "OMN-20241122",  shopName: "Fashion Hub",     shopId: 15, items: [{ name: "Áo Khoác Gió Nam",        quantity: 1, price: 450000,   image: "/images/products/jacket.jpg" }],    total: 450000,   status: "pending",   createdAt: "2024-11-22" },
  { id: "OMN-20241101B", shopName: "Nike VN",         shopId: 16, items: [{ name: "Giày Nike Air Max 270",   quantity: 1, price: 2890000,  image: "/images/products/shoes.jpg" }],     total: 2890000,  status: "cancelled", createdAt: "2024-10-29" },
];

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
