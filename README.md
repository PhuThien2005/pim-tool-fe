# PIM Tool Frontend (Project Information Management)

Hệ thống quản lý thông tin và hồ sơ dự án (**PIM Tool Frontend**) được xây dựng bằng **React**, giao tiếp với Backend **Spring Boot** qua RESTful API.

---

## 📋 Mục lục
1. [Yêu cầu môi trường (Prerequisites)](#-yêu-cầu-môi-trường-prerequisites)
2. [Cài đặt & Khởi chạy (Getting Started)](#-cài-đặt--khởi-chạy-getting-started)
3. [Cấu hình Backend API](#-cấu-hình-backend-api)
4. [Các lệnh thông dụng (Available Scripts)](#-các-lệnh-thông-dụng-available-scripts)
5. [Lưu ý & Mẹo khắc phục sự cố (Troubleshooting)](#-lưu-ý--mẹo-khắc-phục-sự-cố-troubleshooting)
6. [Cấu trúc thư mục (Project Structure)](#-cấu-trúc-thư-mục-project-structure)
7. [Các tính năng chính (Features)](#-các-tính-năng-chính-features)

---

## 💻 Yêu cầu môi trường (Prerequisites)

Trước khi chạy dự án, hãy đảm bảo máy tính đã cài đặt:
- **Node.js**: Phiên bản 16.x, 18.x hoặc 20.x ([Tải Node.js](https://nodejs.org/))
- **Trình quản lý gói**: `yarn` (khuyên dùng) hoặc `npm`
- **Backend Server**: Dự án `pilot-project-back` (Spring Boot) đang chạy tại cổng `http://localhost:8080`

---

## 🚀 Cài đặt & Khởi chạy (Getting Started)

### Bước 1: Mở thư mục dự án
Mở terminal (PowerShell, Command Prompt hoặc Git Bash) tại thư mục `pim-front`:
```bash
cd "C:\Users\dptn\Downloads\pim-front 1\pim-front"
```

### Bước 2: Cài đặt các thư viện phụ thuộc (Dependencies)
```bash
yarn install
# hoặc nếu dùng npm:
npm install
```

### Bước 3: Khởi chạy môi trường phát triển (Development Server)
```bash
yarn start
# hoặc nếu dùng npm:
npm start
```

Sau khi biên dịch xong, ứng dụng sẽ tự động mở tại trình duyệt:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Cấu hình Backend API

Ứng dụng kết nối tới Backend thông qua biến môi trường `REACT_APP_API_BASE_URL`.

- Mặc định: `http://localhost:8080`
- Nếu backend chạy ở cổng hoặc IP khác, bạn có thể tạo/sửa file `.env` tại thư mục gốc:
```env
REACT_APP_API_BASE_URL=http://localhost:8080
FAST_REFRESH=true
GENERATE_SOURCEMAP=false
```

---

## 🛠️ Các lệnh thông dụng (Available Scripts)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `yarn start` | Chạy dev server tại `http://localhost:3000` (hỗ trợ Hot Reload / Fast Refresh). |
| `yarn test` | Chạy bộ kiểm thử tự động (Unit Tests & UAT Journey Tests). |
| `npm test -- --watchAll=false` | Chạy kiểm thử 1 lần cho toàn bộ 5 test suites (31/31 passed). |
| `yarn build` | Đóng gói sản phẩm tối ưu (Production Build) vào thư mục `build/`. |

---

## ⚠️ Lưu ý & Mẹo khắc phục sự cố (Troubleshooting)

### 1. Lỗi OpenSSL trên Node.js v17+
Nếu gặp lỗi `error:0308010C:digital envelope routines::unsupported`:
- Dự án đã tích hợp sẵn cờ `NODE_OPTIONS=--openssl-legacy-provider` trong `package.json` thông qua `cross-env`.
- Chỉ cần chạy qua `yarn start` hoặc `npm start` là sẽ tự động kích hoạt chế độ tương thích này.

### 2. Tối ưu tốc độ khởi động trên Windows (Khuyên dùng)
Nếu lệnh `yarn start` chạy lâu trên Windows:
1. Bấm phím **Windows**, tìm **Virus & threat protection**.
2. Chọn **Manage settings** $\rightarrow$ cuộn xuống **Exclusions** $\rightarrow$ chọn **Add an exclusion** $\rightarrow$ **Folder**.
3. Chọn thư mục dự án `pim-front`. *(Tránh việc Windows Defender quét đi quét lại 30.000 file trong `node_modules`)*.

---

## 📂 Cấu trúc thư mục (Project Structure)

```text
pim-front/
├── public/                 # Assets tĩnh (index.html, logo_elca.png, favicon...)
├── src/
│   ├── components/
│   │   ├── common/         # Component dùng chung: Header, Sidebar, Pagination, ConfirmModal, LocaleDatePicker
│   │   └── project/        # Component màn hình:
│   │       ├── ProjectList.jsx     # Trang danh sách, tìm kiếm & bộ lọc nâng cao
│   │       ├── ProjectForm.jsx     # Form Tạo mới & Cập nhật dự án
│   │       └── MemberSuggest.jsx   # Input autocomplete gợi ý mã VISA thành viên
│   ├── context/
│   │   ├── ProjectContext.jsx      # Quản lý State dự án, React Query, cache & sync
│   │   └── LanguageContext.jsx     # Đa ngôn ngữ (i18n) tiếng Anh & tiếng Pháp
│   ├── locales/            # Từ điển ngôn ngữ: en.jsx (Tiếng Anh), fr.jsx (Tiếng Pháp)
│   ├── pages/              # Khung giao diện (MainLayout, ErrorPage, ProjectListPage...)
│   ├── services/           # Tầng kết nối mạng: api.jsx (Axios interceptors), projectService.jsx
│   ├── styles/             # CSS & Styled Components
│   ├── App.jsx             # Entry component & cấu hình React Query Provider
│   └── index.js            # Điểm khởi chạy của ứng dụng React
├── SEARCH_FILTER_FLOW_EXPLANATION.md # Tài liệu chi tiết luồng Search & Filter
├── .env                    # Cấu hình biến môi trường
├── package.json            # Danh sách thư viện & scripts
└── README.md               # Tài liệu hướng dẫn sử dụng
```

---

## 🌟 Các tính năng chính (Features)

1. **US01 - Tạo mới & Cập nhật Dự án:**
   - **Tạo mới:** Tự động chọn trạng thái `NEW`, kiểm tra trùng `Project Number`, kiểm tra tính hợp lệ của mã VISA thành viên.
   - **Cập nhật:** Khóa trường `Project Number` (Read-only), tự động tải dữ liệu chi tiết qua `GET /projects/{id}`, gửi cập nhật qua `PUT /projects/{id}` kèm kiểm tra xung đột phiên bản (`version`).
   - **Gợi ý thành viên (Member Suggest):** Ô tìm kiếm tự động gợi ý mã VISA và họ tên nhân viên khi nhập.

2. **US02 - Danh sách & Tìm kiếm Dự án:**
   - **Tìm kiếm tức thì (Debounced Search):** Tự động tìm kiếm sau 350ms ngừng gõ phím.
   - **Bộ lọc nâng cao (Advanced Filter):** Lọc theo Group (Leader Visa), Member Visa (MemberSuggest), Ngày bắt đầu (From/To), Ngày kết thúc (From/To).
   - **Đồng bộ 2 chiều với URL:** Lưu trạng thái tìm kiếm vào URL params, hỗ trợ bookmark, share link và nút Back/Forward của trình duyệt.
   - **Lọc sạch tham số:** Tự động loại bỏ các param rỗng trước khi gửi request xuống backend.
   - **Phân trang & Sắp xếp:** Hỗ trợ sắp xếp theo cột (Asc/Desc) và phân trang chuẩn Server-side.
   - **Xóa dự án:** Chỉ cho phép xóa các dự án có trạng thái `NEW` (hỗ trợ xóa đơn lẻ và xóa nhiều dòng đã tick chọn).

3. **Đa ngôn ngữ (i18n):**
   - Hỗ trợ chuyển đổi nhanh giữa **Tiếng Anh (EN)** và **Tiếng Pháp (FR)** trực tiếp trên Header.
