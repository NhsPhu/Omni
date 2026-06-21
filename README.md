# 🌐 Omni Marketplace - Comprehensive B2B2C E-commerce Platform

![Omni Banner](https://via.placeholder.com/1200x400/1e1b4b/fbbf24?text=Omni+Marketplace)

**Omni Marketplace** là một nền tảng thương mại điện tử đa nhà bán (Multi-Vendor Marketplace) toàn diện theo mô hình **B2B2C** (tương tự Shopee, Tiki). Hệ thống kết nối hàng nghìn cửa hàng với hàng triệu người mua, được thiết kế với kiến trúc linh hoạt, tối ưu hiệu năng cao và đáp ứng nhu cầu giao dịch theo thời gian thực.

Hệ sinh thái Omni bao gồm 3 cấu phần chính:
1. **Omni Storefront** (Khách hàng)
2. **Omni Dashboard** (Người bán / Quản trị viên)
3. **Omni Backend Core** (Spring Boot)

---

## 🌟 Tính Năng Nổi Bật

### 🛒 Khách Hàng (Storefront)
*   **Trải nghiệm mua sắm mượt mà:** Xây dựng với Next.js (App Router), hỗ trợ Dark Mode và giao diện UI/UX hiện đại (Glassmorphism).
*   **Khám phá thông minh:** Tìm kiếm Full-text cực nhanh với Elasticsearch, hệ thống Gợi ý sản phẩm và Flash Sale động.
*   **Thanh toán & Vận chuyển:** Tích hợp thanh toán **VNPay**, COD và API vận chuyển **Giao Hàng Nhanh (GHN)**.
*   **Tương tác thời gian thực:** Real-time Chat với Shop, AI Chatbot hỗ trợ thông minh, hệ thống Push Notification in-app & Email.
*   **Quản lý tài khoản:** Danh sách yêu thích, theo dõi đơn hàng, hạng thẻ thành viên (Loyalty), đánh giá và khiếu nại (Dispute).

### 🏪 Nhà Bán Hàng & Quản Trị (Dashboard)
*   **Quản lý cửa hàng toàn diện:** Quản lý sản phẩm đa phân loại (SKU), kiểm soát kho hàng, tạo mã giảm giá (Shop Vouchers).
*   **Phân tích & Thống kê (Analytics):** Biểu đồ doanh thu tương tác, báo cáo tỷ lệ chuyển đổi (Funnel Analytics), theo dõi Traffic thời gian thực qua Redis.
*   **Hệ thống Ví (Wallet):** Quản lý số dư, yêu cầu rút tiền tự động và đối soát doanh thu.
*   **Quản trị viên (Admin):** Duyệt gian hàng mới, quản lý Flash Sale nền tảng, xử lý khiếu nại Dispute tập trung.

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án áp dụng kiến trúc **Modular Monolith** kết hợp với **Hexagonal Architecture (Ports & Adapters)** trong phần Backend để đảm bảo Separation of Concerns và dễ dàng mở rộng, bảo trì. Hệ thống sử dụng **Event-Driven Architecture** (RabbitMQ) để giao tiếp giữa các domains.

### 📦 Các Core Modules (Domains):
*   **IAM**: Quản lý Người dùng, Shop, Xác thực (JWT/OAuth2), Địa chỉ.
*   **Catalog**: Quản lý Sản phẩm, SKU, Danh mục, Wishlist, Elasticsearch Sync.
*   **Sales**: Giỏ hàng, Đặt hàng, Voucher, Flash Sale, Analytics.
*   **Finance**: Thanh toán VNPay, Ví điện tử, Đối soát.
*   **Shipping**: Tích hợp GHN, Webhook tracking.
*   **Notification**: Email (Thymeleaf), Push Notification.
*   **Chat & AIChat**: WebSocket Chat, tích hợp n8n AI Proxy.
*   **Review & Admin**: Đánh giá sản phẩm, Quản lý tranh chấp.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend
*   **Core:** Java 17, Spring Boot 3.2.5
*   **Database:** PostgreSQL 16, Flyway (Migration)
*   **Caching & Rate Limit:** Redis 7, Bucket4j
*   **Search Engine:** Elasticsearch 8.13
*   **Message Broker:** RabbitMQ 3
*   **Security:** Spring Security, JWT Auth
*   **Storage:** Cloudinary / S3
*   **Observability:** Zipkin (Tracing), Prometheus + Grafana (Metrics), Sentry

### Frontend
*   **Storefront:** Next.js 16 (App Router), React 19, TypeScript 5
*   **Dashboard:** Vite, React 19 SPA, TypeScript
*   **Styling & UI:** TailwindCSS 4, Ant Design 6, Framer Motion
*   **State & Data Fetching:** Zustand 5, TanStack Query 5, Axios
*   **Realtime:** SockJS, STOMP.js

### Third-party Integrations
*   **VNPay** (Thanh toán)
*   **Giao Hàng Nhanh - GHN** (Vận chuyển)
*   **n8n** (AI Workflow / LLM Proxy)
*   **Firebase Admin** (Push Notifications)
*   **Cloudinary** (Image Hosting)

---

## 🚀 Hướng Dẫn Cài Đặt (Local Development)

### Yêu cầu hệ thống
*   Java 17 & Maven 3.8+
*   Node.js 18+ & npm/yarn
*   Docker & Docker Compose

### 1. Khởi động Hạ tầng (Infrastructure)
Dự án sử dụng Docker Compose để spin-up các dịch vụ như DB, Redis, ES, RabbitMQ, v.v.
```bash
docker-compose up -d
```

### 2. Cấu hình & Chạy Backend
Tạo file môi trường từ file mẫu:
```bash
cd omni-backend
cp .env.example .env
```
Cập nhật các biến môi trường cần thiết (DB credentials, VNPay keys, GHN token, Cloudinary URL, v.v.).

Chạy server Backend (Flyway sẽ tự động chạy migrations để tạo DB schema):
```bash
mvn clean install -DskipTests
mvn spring-boot:run
```
*Backend sẽ chạy tại `http://localhost:8080`*

### 3. Khởi chạy Storefront (Khách hàng)
```bash
cd omni-storefront
npm install
npm run dev
```
*Truy cập: `http://localhost:3000`*

### 4. Khởi chạy Dashboard (Vendor/Admin)
```bash
cd omni-dashboard
npm install
npm run dev
```
*Truy cập: `http://localhost:5173`*

---

## 📚 API Documentation

Sau khi khởi chạy Backend thành công, bạn có thể xem và tương tác với tài liệu OpenAPI/Swagger UI trực tiếp tại:
👉 **`http://localhost:8080/swagger-ui.html`**

---

## 🧪 Kiểm Thử (Testing)

Dự án có sẵn Test Suite toàn diện (Unit Test & Integration Test) sử dụng JUnit 5, Mockito và Testcontainers.
Để chạy bộ test:
```bash
cd omni-backend
mvn clean test
```

---

## 👥 Đóng Góp (Contributing)
1. Fork dự án
2. Tạo Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên Branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request (PR)

---

## 📄 Giấy Phép (License)
Dự án được phân phối dưới giấy phép **MIT License**. Xem file `LICENSE` để biết thêm chi tiết.
