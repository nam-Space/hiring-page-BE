# Hiring Page Backend – Hệ Thống Tuyển Dụng IT

## 📌 Tổng quan dự án

**Hiring Page Backend** là phần máy chủ (Server-side) của hệ thống website tuyển dụng IT, được xây dựng bằng **NestJS** kết hợp với **MongoDB**. Backend chịu trách nhiệm xử lý toàn bộ logic nghiệp vụ, xác thực & phân quyền người dùng, quản lý tin tuyển dụng, hồ sơ ứng viên và luồng ứng tuyển.

Hệ thống được thiết kế theo kiến trúc **RESTful API**, phục vụ frontend viết bằng **ReactJS + Vite + Ant Design**.

---

## 🎯 Mục tiêu hệ thống

* Xây dựng backend **ổn định – bảo mật – dễ mở rộng** cho website tuyển dụng IT
* Áp dụng kiến trúc module của NestJS để dễ bảo trì
* Tách biệt rõ **Controller – Service – Database**
* Hỗ trợ nhiều vai trò người dùng (Admin / Recruiter / Candidate)
* Sẵn sàng triển khai production (VPS / Docker / Cloud)

---

## 🚀 Công nghệ & Thư viện sử dụng

### Core

* **NestJS** – Node.js Framework
* **TypeScript** – Ngôn ngữ chính
* **Node.js** >= 18

### Database

* **MongoDB** – NoSQL Database
* **Mongoose** – ODM cho MongoDB

### Authentication & Security

* **JWT (JSON Web Token)**
* **PassportJS (JWT Strategy)**
* **bcrypt** – mã hoá mật khẩu

### Validation & Config

* **class-validator**
* **class-transformer**
* **@nestjs/config** – quản lý biến môi trường

### Documentation & Dev Tools

* **Swagger (OpenAPI)**
* **ESLint**
* **Prettier**

---

## 🧱 Kiến trúc hệ thống

Backend được xây dựng theo **Modular Architecture** của NestJS:

```
Request → Controller → Service → Model (Mongoose) → MongoDB
                     ↓
                 DTO / Guard
```

### Nguyên tắc thiết kế

* **Controller**: nhận request, trả response
* **Service**: xử lý logic nghiệp vụ
* **DTO**: validate & chuẩn hoá dữ liệu
* **Guard**: bảo vệ route & phân quyền
* **Model/Schema**: định nghĩa dữ liệu MongoDB

---

## 📂 Cấu trúc thư mục chi tiết

```bash
hiring-page-BE/
├── src/
│   ├── auth/                   # Xác thực & phân quyền
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── dto/
│   ├── users/                  # Người dùng (Admin / Recruiter / Candidate)
│   ├── jobs/                   # Tin tuyển dụng
│   ├── applications/           # Ứng tuyển
│   ├── companies/              # Thông tin công ty
│   ├── common/                 # Guard, decorator dùng chung
│   ├── config/                 # Cấu hình hệ thống
│   ├── app.module.ts
│   └── main.ts
├── .env
├── package.json
├── nest-cli.json
└── README.md
```

---

## 👥 Vai trò người dùng & Phân quyền

### 👨‍💼 Admin

* Quản lý toàn bộ người dùng
* Quản lý tin tuyển dụng
* Quản lý hệ thống

### 🧑‍💼 Recruiter (Nhà tuyển dụng)

* Tạo, chỉnh sửa, xoá tin tuyển dụng
* Quản lý danh sách ứng viên ứng tuyển
* Quản lý thông tin công ty

### 👨‍🎓 Candidate (Ứng viên)

* Đăng ký / đăng nhập
* Cập nhật hồ sơ cá nhân
* Ứng tuyển việc làm
* Xem lịch sử ứng tuyển

---

## 🔐 Authentication & Authorization

### Cơ chế xác thực

1. Người dùng đăng nhập
2. Server xác thực thông tin
3. Trả về **JWT Access Token**
4. Client gửi token kèm header cho mỗi request

```http
Authorization: Bearer <access_token>
```

### Bảo vệ API

* `JwtAuthGuard`: kiểm tra đăng nhập
* `RolesGuard`: kiểm tra quyền truy cập theo role

---

## 📝 Luồng tuyển dụng (Business Flow)

### Luồng ứng viên

1. Đăng ký tài khoản Candidate
2. Đăng nhập hệ thống
3. Tìm kiếm tin tuyển dụng
4. Gửi đơn ứng tuyển
5. Theo dõi trạng thái ứng tuyển

### Luồng nhà tuyển dụng

1. Đăng ký / đăng nhập Recruiter
2. Tạo thông tin công ty
3. Đăng tin tuyển dụng
4. Xem danh sách ứng viên
5. Quản lý trạng thái ứng tuyển

---

## 📘 API Documentation (Swagger)

Sau khi chạy project, truy cập:

👉 **[http://localhost:3001/api](http://localhost:3001/api)**

Swagger cung cấp:

* Danh sách toàn bộ API
* Test API trực tiếp
* Xem schema request / response
* Test Authorization

---

## ⚙️ Cài đặt & Chạy project

### 1️⃣ Clone repository

```bash
git clone https://github.com/nam-Space/hiring-page-BE.git
cd hiring-page-BE
```

---

### 2️⃣ Cài đặt dependencies

```bash
npm install
```

Nếu gặp lỗi dependency:

```bash
npm install --legacy-peer-deps
```

---

### 3️⃣ Cấu hình môi trường (.env)

```env
PORT=3001
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/hiring_page

JWT_SECRET=hiring_page_secret
JWT_EXPIRES_IN=7d
```

---

### 4️⃣ Chạy development

```bash
npm run start:dev
```

Server chạy tại:
👉 [http://localhost:3001](http://localhost:3001)

---

## 🌐 Kết nối Frontend

Frontend repository:
👉 [https://github.com/nam-Space/hiring-page-FE](https://github.com/nam-Space/hiring-page-FE)

Cấu hình CORS:

```ts
app.enableCors({
  origin: '*',
  credentials: true,
});
```

---

## 🧪 Scripts

```bash
npm run start:dev   # Chạy dev
npm run build       # Build production
npm run start:prod  # Chạy production
npm run lint        # Kiểm tra code
```

---

## 🚀 Build & Deploy

### Production

```bash
npm run build
npm run start:prod
```

### Hình thức deploy

* VPS (PM2 + Nginx)
* Docker / Docker Compose
* Cloud Hosting

---

## 🔒 Security Considerations

* Mã hoá mật khẩu bằng bcrypt
* JWT có thời hạn
* Phân quyền rõ ràng theo role
* Validate dữ liệu đầu vào bằng DTO

---

## 🔮 Hướng phát triển tương lai

* Advanced search & filter
* Upload CV (PDF)
* Realtime notification (WebSocket)
* Email notification
* Analytics & dashboard

---

## 👨‍💻 Tác giả

* **Nam Nguyen**
* GitHub: [https://github.com/nam-Space](https://github.com/nam-Space)

---

## 📄 License

Dự án phục vụ mục đích **học tập, nghiên cứu và xây dựng hệ thống tuyển dụng IT thực tế**.
