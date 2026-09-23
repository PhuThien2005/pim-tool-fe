# 📚 Tổng Hợp Công Nghệ & Kiến Trúc Frontend (PIM Tool)

Tài liệu này tổng hợp toàn bộ hệ thống công nghệ, kiến trúc mã nguồn, thư viện và các quyết định kỹ thuật đang được áp dụng tại tầng giao diện (Front-end) của dự án **PIM Tool** (Project Information Management).

---

## 1. Core Framework & Môi trường thực thi (Runtime)

| Thành phần | Phiên bản / Công nghệ | Vai trò & Mục đích sử dụng |
|---|---|---|
| **React** | `16.13.1` | Thư viện UI cốt lõi. Sử dụng 100% **Functional Components** kết hợp với **React Hooks** (`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`, `useContext`). |
| **React DOM** | `16.13.1` | Quản lý việc render cây DOM ảo (Virtual DOM) trên trình duyệt. |
| **Node.js Support** | `cross-env ^10.1.0` | Cấu hình cờ `--openssl-legacy-provider` để ứng dụng tương thích hoàn hảo với các phiên bản Node.js hiện đại (Node 17, 18, 20, 22+) mà không phát sinh lỗi mã hóa OpenSSL 3.0. |
| **React Scripts** | `3.4.3` | Nền tảng Create React App đóng gói Webpack 4 và Babel, quản lý quy trình build và hot-reload dev server. |

---

## 2. Quản lý Điều hướng & Định tuyến (Routing)

- **Thư viện:** `react-router-dom: ^5.2.0`
- **Mô hình định tuyến:** Single Page Application (SPA) thông qua `BrowserRouter`, `Switch`, `Route`, `Redirect`, `NavLink`, `Link`.
- **Sơ đồ các tuyến đường (Routes):**
  - `/` hoặc `/projects`: Màn hình danh sách dự án (**ProjectListPage**) — tìm kiếm, bộ lọc nâng cao, sắp xếp, phân trang, xóa.
  - `/project/new` hoặc `/create-project`: Màn hình tạo mới dự án (**ProjectCreateEditPage**).
  - `/project/edit/:projectNumber`: Màn hình chỉnh sửa thông tin dự án theo số dự án (**ProjectCreateEditPage**).
  - `/error`: Màn hình thông báo lỗi kỹ thuật tập trung (**ErrorPage**), tự động nhận query param `?detail=...`.

---

## 3. Kiến trúc Quản lý Trạng thái (State Management & Architecture)

### 3.1 Mô hình Custom Hooks (Tách biệt UI và Business Logic)
Ứng dụng áp dụng triệt để kiến trúc chia tách trách nhiệm: Component JSX chỉ tập trung render giao diện, toàn bộ logic nghiệp vụ được đóng gói trong các Custom Hook:
- [`useProjectList`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx):
  - Quản lý từ khóa tìm kiếm (`searchTerm`), bộ lọc trạng thái (`status`).
  - Quản lý bộ lọc nâng cao (Leader Visa, Member Visa, Date ranges).
  - Cấu hình sắp xếp bảng đa cột (`field`, `direction`).
  - Lựa chọn nhiều dòng bằng Checkbox và mở Modal xác nhận xóa.
- [`useProjectForm`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectForm.jsx):
  - Quản lý toàn bộ dữ liệu form dự án (`formData`).
  - Nạp dữ liệu chi tiết từ backend API khi ở chế độ Edit (`GET /projects/{id}`).
  - Kiểm tra tính hợp lệ dữ liệu (Validation): bắt buộc, trùng số dự án, visa không tồn tại, ngày bắt đầu/kết thúc.
  - Xử lý gửi form với cờ `isSubmitting` chống Double Submit và xử lý lỗi đồng thời (Optimistic Lock).

### 3.2 React Context API (Trạng thái Toàn cục)
- [`ProjectContext`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/context/ProjectContext.jsx):
  - Chia sẻ danh sách dự án, nhóm thực hiện (`groups`), và danh sách nhân viên (`employees`).
  - Cung cấp các thao tác CRUD dự án, tự động cập nhật danh sách sau mỗi thao tác.
  - Cơ chế **Lazy Loading** danh sách nhóm: API `/groups` chỉ được gọi khi người dùng mở bộ lọc nâng cao lần đầu tiên để tối ưu hiệu năng mạng.
- [`LanguageContext`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/context/LanguageContext.jsx):
  - Quản lý ngôn ngữ hiện tại của người dùng, tự động lưu vào `localStorage ('pim_lang')`.
  - Cung cấp hàm dịch `t(path, params)` hỗ trợ thay thế tham số động (ví dụ: `%{details}`, `%{count}`).

---

## 4. Giao diện & Thiết kế (Styling & Design System)

- **Mô hình Styling:** **Consolidated JSX Styles** ([`GlobalStyles.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/styles/GlobalStyles.jsx))
  - Toàn bộ phong cách CSS được gom gọn và quản lý tập trung trong một file duy nhất, loại bỏ CSS bloat và không sử dụng file `.css` phân tán ngoài.
- **Hệ thống Font chữ:**
  - Font chữ chủ đạo: **Segoe UI** (kèm fallback `-apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif`), mang phong cách Desktop GUI chuẩn mực của ELCA S25.2.
- **Bảng màu Chuẩn mực (Design Palette):**
  - Màu chủ đạo (Primary Blue): `#0088D0` / `#0058CC`
  - Nút tìm kiếm (Search Button): Gradient từ dưới lên `linear-gradient(to top, #0058CC, #0084CC)`
  - Màu chữ nội dung: `#666666` (chuẩn mockup, không dùng màu đen tuyền `#333333`)
  - Màu trạng thái Active thanh Sidebar: `#2E84FB`
  - Nút Reset Search: `#2E85F9`
  - Liên kết Ngôn ngữ (`EN | FR`) & Trợ giúp (`Help`): `#018FE1`
  - Nút xóa / Cảnh báo nguy hiểm: `#D9534F`
- **Bộ Icon:**
  - **Font Awesome 4.7.0** tích hợp qua CDN (`fa-filter`, `fa-trash-o`, `fa-calendar`, `fa-exclamation-circle`, v.v.).

---

## 5. Các Thành phần Tự Phát triển (Custom Components)

| Component | Vị trí file | Đặc tính nổi bật |
|---|---|---|
| **LocaleDatePicker** | [`LocaleDatePicker.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/LocaleDatePicker.jsx) | Bộ chọn ngày độc lập, hiển thị định dạng `YYYY-MM-DD` căn giữa. Popup lịch hiển thị tên tháng và thứ trong tuần theo ngôn ngữ ứng dụng (`EN` / `FR`), hoàn toàn không bị ảnh hưởng bởi ngôn ngữ của hệ điều hành Windows. |
| **MemberSuggest** | [`MemberSuggest.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/MemberSuggest.jsx) | Hộp chọn gợi ý thành viên đa năng dạng thẻ (Chip/Tag) `[ VISA: HỌ TÊN ✕ ]`. Tách biệt chữ gõ tìm kiếm và thẻ đã chọn. Hỗ trợ cuộn vô tận (Infinite scroll dropdown) và debounce 300ms khi tìm kiếm từ API. |
| **Pagination** | [`Pagination.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/Pagination.jsx) | Thanh phân trang 5 dự án/trang, hỗ trợ nút trang trước/sau, hiển thị trang active với màu `#0088D0` gạch chân. |
| **ConfirmModal** | [`ConfirmModal.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/ConfirmModal.jsx) | Hộp thoại xác nhận trước các thao tác nhạy cảm (xóa 1 dự án hoặc xóa hàng loạt). |
| **Header** | [`Header.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/Header.jsx) | Thanh điều hướng đầu trang với Logo ELCA, tiêu đề ứng dụng, chuyển đổi đa ngôn ngữ `EN | FR`, Help, và Logout. |
| **Sidebar** | [`Sidebar.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/Sidebar.jsx) | Thanh điều hướng trái với cơ chế căn thẳng hàng nội dung (`.sidebar-inner`), nhận biết chính xác trạng thái active giữa Project List, New và Edit. |

---

## 6. Tầng Giao tiếp Mạng & API (Networking Layer)

- **Thư viện HTTP Client:** `axios: ^0.20.0`
- **Cấu hình Client tập trung:** [`src/services/api.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/api.jsx)
  - Base URL mặc định: `http://localhost:8080` (kết nối trực tiếp tới Spring Boot backend, không phụ thuộc dev proxy).
  - Interceptors tự động chuẩn hóa Request Headers và chuẩn hóa cấu trúc lỗi từ backend (`errorCode`, `message`, `details`).
- **Cơ chế Local-First & Bền bỉ (Resilience Pattern):**
  - Tầng dịch vụ [`projectService.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/projectService.jsx) duy trì một kho lưu trữ dữ liệu cục bộ (`localStorage` kết hợp mock ban đầu).
  - Khi backend offline hoặc gặp sự cố mạng, ứng dụng tự động chuyển sang dữ liệu nội bộ giúp giao diện không bị gián đoạn.
  - Khi backend online, hệ thống tự động đồng bộ bất đồng bộ dữ liệu hai chiều.

---

## 7. Đa ngôn ngữ (Internationalization - i18n)

- **Thư viện:** `counterpart: ^0.18.6`
- **Bộ từ điển bản dịch:**
  - Tiếng Anh: [`src/locales/en.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/locales/en.jsx)
  - Tiếng Pháp: [`src/locales/fr.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/locales/fr.jsx)
- **Cơ chế chuyển ngữ:** Chuyển đổi tức thì toàn bộ nhãn, thông báo lỗi, tiêu đề, placeholder mà không cần reload trang.

---

## 8. Kiểm thử Tự động & Đảm bảo Chất lượng (Testing & QA)

- **Test Runner & Assertions:** **Jest** đi kèm Create React App.
- **Thư viện Kiểm thử UI:**
  - `@testing-library/react: ^9.3.2`
  - `@testing-library/jest-dom: ^4.2.4`
  - `@testing-library/user-event: ^7.1.2`
- **Độ bao phủ:** **31/31 bài test tự động vượt qua thành công (100% PASS)** trên 5 Test Suites:
  1. `projectService.test.jsx`: Kiểm thử toàn diện tầng Service, API Client, Local Storage và các giải thuật tìm kiếm/lọc/xóa.
  2. `ProjectForm.test.jsx`: Kiểm thử giao diện nhập liệu, các quy tắc kiểm tra tính hợp lệ (mandatory fields, duplicate project number, invalid visas) và nạp dữ liệu Edit.
  3. `ProjectList.test.jsx`: Kiểm thử bảng hiển thị, sắp xếp cột, bộ lọc, quy tắc chỉ xóa dự án trạng thái New và xóa nhiều dự án.
  4. `App.test.jsx`: Kiểm thử toàn bộ hệ thống Routing, Context Providers và chuyển đổi giao diện.
  5. `App.uat.test.jsx`: Kiểm thử luồng trải nghiệm người dùng thực tế (End-to-End User Journeys: Tạo dự án -> Báo lỗi -> Nhập đúng -> Lưu -> Điều hướng về danh sách -> Bảo lưu bộ lọc).
