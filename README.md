# Omni Marketplace - B2B2C E-commerce Platform

![Omni Banner](https://via.placeholder.com/1200x400/1e1b4b/fbbf24?text=Omni+Marketplace)

Omni là một nền tảng thương mại điện tử đa nhà bán (B2B2C) toàn diện, kết nối hàng nghìn cửa hàng với hàng triệu người mua trên toàn quốc. Hệ thống được thiết kế linh hoạt, tối ưu hiệu năng và chia thành 3 cấu phần chính: Storefront (Khách hàng), Dashboard (Người bán/Admin), và Backend (Spring Boot Core).

## 🌟 Tính năng nổi bật

### Khách hàng (Storefront)
*   **Trải nghiệm mua sắm mượt mà**: Giao diện siêu tốc với Next.js, hỗ trợ chế độ Dark Mode, giao diện đẹp mắt (Glassmorphism, Gradient).
*   **Thanh toán đa dạng**: Hỗ trợ VNPay & COD, tích hợp phí vận chuyển linh hoạt từ GHN.
*   **Khám phá thông minh**: Tìm kiếm Full-text bằng Elasticsearch, Flash sale động, Gợi ý sản phẩm.
*   **Quản lý người dùng**: Danh sách yêu thích (Wishlist), Theo dõi đơn hàng theo thời gian thực (Tracking), Hệ thống thông báo Notification.
*   **Hoàn trả / Khiếu nại**: Hệ thống Dispute minh bạch, xử lý hoàn trả nhanh chóng.

### Nhà bán hàng & Quản trị (Dashboard)
*   **Quản lý sản phẩm toàn diện**: Quản lý đa phân loại (SKU), kho hàng, giá nhập, khuyến mãi (Vouchers).
*   **Phân tích thông minh (Analytics)**: Biểu đồ doanh thu tương tác, theo dõi tỷ lệ chuyển đổi và lượt truy cập.
*   **Hệ thống ví (Wallet)**: Quản lý số dư bán hàng, xử lý yêu cầu rút tiền tự động, đối soát minh bạch.
*   **Quản trị viên (Admin)**: Duyệt gian hàng, quản lý người dùng, xử lý khiếu nại Dispute tập trung.

### Backend (Spring Boot)
*   **Bảo mật cao**: JWT Auth, Rate Limiting (Bucket4j), Global Exception Handling, chống spam API.
*   **Tích hợp mạnh mẽ**: VNPay (Thanh toán), Giao Hàng Nhanh (Vận chuyển), AWS S3/Cloudinary (Upload ảnh).
*   **Đồng bộ dữ liệu**: Redis Caching (Giỏ hàng, Session), Elasticsearch.
*   **Tự động hóa (Cronjobs)**: Tự động hủy đơn quá hạn, tự động hoàn tất đơn hàng sau 7 ngày.
*   **Hệ thống thông báo**: Gửi In-app Notification và Email (Thymeleaf Templates) cho mọi sự kiện mua/bán.

## 🏗️ Kiến trúc Công nghệ (Tech Stack)

### Backend
*   **Framework**: Spring Boot 3.2, Java 17
*   **Database**: PostgreSQL 15, Flyway (Migration)
*   **Caching & Session**: Redis 7
*   **Search Engine**: Elasticsearch
*   **Security**: Spring Security, JWT, Bucket4j (Rate Limiting)
*   **ORM**: Spring Data JPA, Hibernate

### Frontend (Storefront & Dashboard)
*   **Core**: Next.js 14, React 18, TypeScript
*   **Styling**: TailwindCSS, Framer Motion (Animations)
*   **State Management**: Zustand, Axios (API Client)
*   **UI Components**: Ant Design (Dashboard), Lucide Icons

## 🚀 Hướng dẫn cài đặt (Local Development)

### Yêu cầu hệ thống
*   Java 17+ & Maven 3.8+
*   Node.js 18+ & npm/yarn
*   Docker & Docker Compose

### 1. Khởi tạo Cơ sở dữ liệu & Services
Sử dụng Docker Compose để chạy PostgreSQL và Redis:
```bash
docker-compose up -d
```

### 2. Cấu hình Backend
Tạo file `application-dev.yml` (hoặc sao chép từ cấu hình mẫu) và thiết lập các biến môi trường cần thiết theo `.env.example`:
```bash
cp .env.example .env
```
Cập nhật chuỗi kết nối Database, cấu hình Redis, VNPay, và GHN Tokens.

Khởi chạy Backend:
```bash
cd omni-backend
mvn spring-boot:run
```
Flyway sẽ tự động chạy 21 migrations để thiết lập cấu trúc database.

### 3. Khởi chạy Storefront
```bash
cd omni-storefront
npm install
npm run dev
```
Truy cập: `http://localhost:3000`

### 4. Khởi chạy Dashboard
```bash
cd omni-dashboard
npm install
npm run dev
```
Truy cập: `http://localhost:5173`

## 📚 API Documentation
Khi Backend đang chạy, bạn có thể truy cập tài liệu OpenAPI / Swagger UI tại:
`http://localhost:8080/swagger-ui.html`

## 👥 Đóng góp (Contributing)
1. Fork dự án
2. Tạo Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên Branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 Giấy phép (License)
Dự án được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm thông tin.
