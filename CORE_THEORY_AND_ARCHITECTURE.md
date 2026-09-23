# Cẩm Nang Lý Thuyết Chuyên Sâu, Kiến Trúc Frontend & Tra Cứu Toàn Bộ US02 (pim-front)

Tài liệu này tổng hợp toàn bộ các điểm lý thuyết cốt lõi (Core Frontend Architectural Points), vị trí xử lý cụ thể trong mã nguồn (`pim-front`) và bảng tra cứu chi tiết 5 hạng mục của màn hình **US02 - Projects List** theo tài liệu kiểm thử chính thức `S25.2-ScreenLiveTestsWebGUI - US02.DOCX` và hình ảnh đối soát.

---

## MỤC LỤC

1. [Bản Đồ Định Vị & Nơi Xử Lý Các Thành Phần Trong Codebase](#1-bản-đồ-định-vị--nơi-xử-lý-các-thành-phần-trong-codebase)
   - [1.1. Ma trận đối chiếu tổng quan giữa yêu cầu & file mã nguồn](#11-ma-trận-đối-chiếu-tổng-quan-giữa-yêu-cầu--file-mã-nguồn)
   - [1.2. Luồng dữ liệu tổng thể (Architectural Data Flow: URL ⇆ Hooks ⇆ Context ⇆ Service ⇆ UI)](#12-luồng-dữ-liệu-tổng-thể-architectural-data-flow-url--hooks--context--service--ui)
2. [Phân Tích Chuyên Sâu 5 Hạng Mục Cốt Lõi (Theo Image Checklist)](#2-phân-tích-chuyên-sâu-5-hạng-mục-cốt-lõi-theo-image-checklist)
   - [2.1. Hạng mục 1: Search Bar UI (Thanh Tìm Kiếm & Bộ Lọc Nâng Cao)](#21-hạng-mục-1-search-bar-ui-thanh-tìm-kiếm--bộ-lọc-nâng-cao)
     - A. Vị trí mã nguồn & Cấu trúc Component
     - B. Tìm kiếm cơ bản (Keyword & Status Dropdown)
     - C. Kỹ thuật Debounce 350ms vs Explicit Enter/Submit
     - D. Bộ lọc nâng cao (Collapsible Advanced Filter Grid)
     - E. Tối ưu Lazy Fetching danh sách Groups (`/groups` chỉ gọi 1 lần khi mở filter)
     - F. Nút Reset Search: Khôi phục trạng thái chuẩn mực
   - [2.2. Hạng mục 2: Data Table (Bảng Dữ Liệu Dự Án Chuẩn GUI)](#22-hạng-mục-2-data-table-bảng-dữ-liệu-dự-án-chuẩn-gui)
     - A. Vị trí mã nguồn & Cấu trúc Columns
     - B. Sắp xếp 2 chiều (Dynamic Tri-State Sorting & Sort Carets)
     - C. Chuẩn hóa định dạng hiển thị: Ngày tháng `DD.MM.YYYY`, Liên kết Edit
     - D. Tiêu chuẩn Typography & Alignment khắt khe (Left, Right, Center)
     - E. Phân trang tích hợp (Pagination Server-side / Client-side)
   - [2.3. Hạng mục 3: Single & Batch Deletion (Xóa Đơn & Xóa Hàng Loạt Với Modal Xác Nhận)](#23-hạng-mục-3-single--batch-deletion-xóa-đơn--xóa-hàng-loạt-với-modal-xác-nhận)
     - A. Vị trí mã nguồn & Luồng xử lý xóa
     - B. Quy tắc nghiệp vụ sống còn: Chỉ dự án trạng thái `NEW` mới được xóa
     - C. Xóa đơn lẻ (Single Delete): Nút thùng rác có điều kiện
     - D. Xóa hàng loạt (Batch Delete): Thanh công cụ nổi Floating Selection Bar
     - E. Hộp thoại xác nhận đa ngữ (Accessible ConfirmModal Dialog)
     - F. Đồng bộ Cache & Xử lý lỗi bảo vệ dữ liệu
   - [2.4. Hạng mục 4: Search via URL query param (Đồng Bộ Tìm Kiếm Qua URL)](#24-hạng-mục-4-search-via-url-query-param-đồng-bộ-tìm-kiếm-qua-url)
     - A. Vị trí mã nguồn & Bản chất `useSearchParams` trong React Router v6
     - B. Đồng bộ 2 chiều (Bidirectional Sync): URL ⇆ State ⇆ API
     - C. Lợi ích kiến trúc: Bookmarkable, Deep Linking, Browser History Back/Forward
     - D. Cơ chế chống giật URL (URL Debouncing & `replace: true`)
   - [2.5. Hạng mục 5: S25.2-ScreenLiveTestsWebGUI - US02 Checklist Toàn Diện](#25-hạng-mục-5-s252-screenlivetestswebgui---us02-checklist-toàn-diện)
     - A. Bảng đối chiếu 100% Test Cases chức năng (TC-US02-01 -> TC-US02-09)
     - B. Bảng đối chiếu Tiêu chuẩn Giao diện & Trải nghiệm (Generic GUI Checklists)
     - C. Tiêu chuẩn Đa ngôn ngữ (Multilingual i18n EN / FR)
     - D. Tiêu chuẩn Bộ chọn ngày độc lập (LocaleDatePicker hoàn toàn tránh bẫy Windows OS Locale)
3. [Các Điểm Lý Thuyết Cốt Lõi Về Kiến Trúc Frontend React (Deep Dive Theory)](#3-các-điểm-lý-thuyết-cốt-lõi-về-kiến-trúc-frontend-react-deep-dive-theory)
   - [3.1. Clean Architecture: Tách Biệt UI Rendering & Business Logic qua Custom Hooks](#31-clean-architecture-tách-biệt-ui-rendering--business-logic-qua-custom-hooks)
   - [3.2. Quản Lý Trạng Thái Toàn Cục: Context API kết hợp `@tanstack/react-query`](#32-quản-lý-trạng-thái-toàn-cục-context-api-kết-hợp-tanstackreact-query)
   - [3.3. Giải Quyết Triệt Để Vấn Đề OS Locale Với `LocaleDatePicker`](#33-giải-quyết-triệt-để-vấn-đề-os-locale-với-localedatepicker)
   - [3.4. Chiến Lược CSS Gom Tập Trung (Zero CSS Bloat GlobalStyles)](#34-chiến-lược-css-gom-tập-trung-zero-css-bloat-globalstyles)
   - [3.5. Kiểm Thử Đa Tầng: Unit Tests, Integration Tests & UAT Automation](#35-kiểm-thử-đa-tầng-unit-tests-integration-tests--uat-automation)
4. [Bảng Tra Cứu Toàn Bộ Hook, Service, Utility & Component Trong pim-front](#4-bảng-tra-cứu-toàn-bộ-hook-service-utility--component-trong-pim-front)

---

## 1. BẢN ĐỒ ĐỊNH VỊ & NƠI XỬ LÝ CÁC THÀNH PHẦN TRONG CODEBASE

### 1.1. Ma trận đối chiếu tổng quan giữa yêu cầu & file mã nguồn

| Hạng Mục (Image Checklist) | File Giao Diện (UI Component) | File Logic Nghiệp Vụ (Custom Hook / Context) | File Dịch Vụ API / Data Store | File Định Kiểu (CSS Styles) |
|---|---|---|---|---|
| **1. Search Bar UI** | [`ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L36-L69) | [`useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L15-L69) | [`ProjectContext.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/context/ProjectContext.jsx), [`projectService.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/projectService.jsx#L51-L69) | [`GlobalStyles.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/styles/GlobalStyles.jsx#L508-L605) |
| **2. Data Table** | [`ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L71-L113), [`Pagination.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/Pagination.jsx) | [`useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L72-L102) | [`ProjectContext.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/context/ProjectContext.jsx#L18-L44) | [`GlobalStyles.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/styles/GlobalStyles.jsx#L606-L806) |
| **3. Single & Batch Deletion** | [`ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L98-L127), [`ConfirmModal.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/ConfirmModal.jsx) | [`useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L77-L93) | [`projectService.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/projectService.jsx#L93-L105) | [`GlobalStyles.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/styles/GlobalStyles.jsx#L734-L780), [`ConfirmModal.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/ConfirmModal.jsx) |
| **4. Search via URL query param** | [`ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx) | [`useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L14-L44) | React Router v6 (`useSearchParams`), [`ProjectContext.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/context/ProjectContext.jsx) | N/A (Url History API) |
| **5. US02 Checklist** | Toàn bộ các component trên | Toàn bộ hooks & contexts trên | [`projectService.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/projectService.test.jsx), [`ProjectList.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.test.jsx) | [`GlobalStyles.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/styles/GlobalStyles.jsx) |

---

### 1.2. Luồng dữ liệu tổng thể (Architectural Data Flow)

Ứng dụng tuân thủ mô hình **Đơn hướng (Unidirectional Data Flow)** kết hợp cơ chế phản ứng hai chiều với URL:

```
[ Trình duyệt / URL Bar ]  <─────── sync URL params ({ replace: true }) ────────┐
          │ (Đọc query params ban đầu)                                         │
          ▼                                                                     │
[ Custom Hook: useProjectList ]  <─── User Input: Gõ Search / Đổi Dropdown ─────┤
          │                                                                     │
          │ dispatch criteria (debounce 350ms hoặc Enter/Submit)                │
          ▼                                                                     │
[ Global State: ProjectContext ] ──► Quản lý Cache qua TanStack React Query    │
          │                                                                     │
          ▼                                                                     │
[ Service Layer: projectService ]                                               │
   ├── [ Offline Fallback / Unit Test Mock Store ]                              │
   └── [ Backend REST API: apiClient.get('/projects/search', { params }) ]      │
          │                                                                     │
          ▼ (Trả về PageResult: { content: Project[], totalPages, ... })        │
[ React Component: ProjectList.jsx ] ───────────────────────────────────────────┘
   ├── Render Search Bar & Advanced Filter
   ├── Render Data Table (Cột, Sort carets, Link edit, Delete icon)
   ├── Render Selection Bar ("X items selected")
   ├── Render Locale-Aware Pagination
   └── Render Accessible ConfirmModal
```

---

## 2. PHÂN TÍCH CHUYÊN SÂU 5 HẠNG MỤC CỐT LÕI (THEO IMAGE CHECKLIST)

### 2.1. Hạng mục 1: Search Bar UI (Thanh Tìm Kiếm & Bộ Lọc Nâng Cao)

#### A. Vị trí mã nguồn & Cấu trúc Component
- **JSX Markup**: [`src/components/project/ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L36-L69).
- **Hook Điều khiển**: [`src/hooks/useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L15-L69).
- **CSS Styling**: [`src/styles/GlobalStyles.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/styles/GlobalStyles.jsx#L508-L605).

#### B. Tìm kiếm cơ bản (Keyword & Status Dropdown)
1. **Ô nhập từ khóa (Search Input Field)**:
   - Thuộc tính: `placeholder={t('projectList.searchPlaceholder')}` ("Project number, name, customer name" / "Numéro de projet, nom, nom du client").
   - Kích thước: `height: 30px`, `width: 320px`, viền `#CCCCCC`, focus viền `#2E84FB`.
   - Tìm kiếm không phân biệt hoa thường và tìm kiếm theo chuỗi con (substring) trên cả 3 trường: `projectNumber`, `name`, `customer`.
2. **Hộp chọn trạng thái (Status Select Field)**:
   - Các lựa chọn chuẩn: `""` (Status / Statut), `NEW` (New / Nouveau), `PLA` (Planned / Planifié), `INP` (In progress / En cours), `FIN` (Finished / Terminé).
   - Tự động chuyển giá trị sang chữ in hoa (`.toUpperCase()`) để tương thích tuyệt đối với Backend Enum `ProjectStatus`.

#### C. Kỹ thuật Debounce 350ms vs Explicit Enter/Submit
Trong [`useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L48-L58):
- **Tại sao cần Debounce 350ms?**: Khi người dùng gõ phím liên tục, nếu mỗi phím gõ đều bắn request về backend, server sẽ chịu tải đột biến (thắt cổ chai I/O). Sử dụng `setTimeout(..., 350)` giúp gom toàn bộ lượt gõ phím trong 350ms thành đúng 1 request tìm kiếm duy nhất.
- **Tại sao vẫn cần nút `Search Project` & phím `Enter`?**: Khi người dùng nhấn nút "Search Project" hoặc gõ phím Enter trên bàn phím, hàm `handleSearch(e)` lập tức gọi `clearTimeout(debounceTimer.current)` và kích hoạt tìm kiếm ngay lập tức (0ms latency), không bắt người dùng phải đợi 350ms.

#### D. Bộ lọc nâng cao (Collapsible Advanced Filter Grid)
- Nút bấm Toggle: `<button type="button" className="btn-advanced-toggle">` với icon phễu `<i className="fa fa-filter" />`.
- Khi bấm, đảo trạng thái `showAdvanced` (`true/false`) kèm hiệu ứng CSS Animation `fadeIn 0.2s ease-in-out`.
- Lưới Grid Responsive: `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))` gồm 6 trường:
  1. `leaderVisa`: Visa trưởng nhóm (kèm `datalist id="leader-visas-list"` tự động gợi ý).
  2. `memberVisa`: Visa thành viên tham gia dự án.
  3. `startDateFrom`: `>= Start Date` (Sử dụng `<LocaleDatePicker />`).
  4. `startDateTo`: `<= Start Date` (Sử dụng `<LocaleDatePicker />`).
  5. `endDateFrom`: `>= End Date` (Sử dụng `<LocaleDatePicker />`).
  6. `endDateTo`: `<= End Date` (Sử dụng `<LocaleDatePicker />`).

#### E. Tối ưu Lazy Fetching danh sách Groups (`/groups`)
Trong [`useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L38-L41):
```javascript
useEffect(() => {
  if (showAdvanced && !groups.length) loadGroups();
}, [showAdvanced, groups.length, loadGroups]);
```
- **Quy tắc hiệu năng (Performance Optimization)**: API lấy danh sách nhóm `/groups` chỉ được gọi **khi và chỉ khi** người dùng bấm mở bảng Advanced Filter lần đầu tiên (`showAdvanced === true`). Nếu người dùng chỉ tìm kiếm cơ bản, ứng dụng hoàn toàn không tốn tài nguyên mạng để tải nhóm.

#### F. Nút Reset Search: Khôi phục trạng thái chuẩn mực
Hàm `handleReset` trong [`useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L64-L74):
1. Xóa toàn bộ chuỗi tìm kiếm `searchInput = ''`, `statusInput = ''`.
2. Xóa sạch 6 trường nâng cao trong `advInputs`.
3. Xóa query params trên URL: `setSearchParams({}, { replace: true })`.
4. Đưa phân trang về trang 1: `currentPage = 1`.
5. Bỏ chọn toàn bộ các hàng đang được check: `selectedIds = []`.
6. Gọi `resetSearch()` trong `ProjectContext` để nạp lại danh sách mặc định ban đầu.

---

### 2.2. Hạng mục 2: Data Table (Bảng Dữ Liệu Dự Án Chuẩn GUI)

#### A. Vị trí mã nguồn & Cấu trúc Columns
- **JSX Markup**: [`src/components/project/ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L71-L113).
- **CSS Styling**: [`src/styles/GlobalStyles.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/styles/GlobalStyles.jsx#L606-L733).

Bảng gồm đúng 7 cột chuẩn mực:
```javascript
const COLS = [
  ['col-checkbox'], 
  ['col-number', 'number', 'projectNumber'], 
  ['col-name', 'name', 'name'],
  ['col-status', 'status', 'status'], 
  ['col-customer', 'customer', 'customer'],
  ['col-date', 'startDate', 'startDate'], 
  ['col-delete', 'delete']
];
```

#### B. Sắp xếp 2 chiều (Dynamic Tri-State Sorting & Sort Carets)
- **Cột có thể sắp xếp**: `Number`, `Name`, `Status`, `Customer`, `Start Date` (Click vào tiêu đề `<th>` để sắp xếp).
- **Cột không được sắp xếp**: `Checkbox` và `Delete`.
- **Cơ chế đảo chiều**: Khi click vào cột đang sort `asc`, tự động đảo sang `desc`. Click tiếp đảo sang `asc`.
- **Hiển thị Caret**:
  - `▲` (mũi tên hướng lên): Sắp xếp tăng dần (`asc`).
  - `▼` (mũi tên hướng xuống): Sắp xếp giảm dần (`desc`).
  - Caret được căn giữa thẳng hàng theo trục dọc với text tiêu đề cột.

#### C. Chuẩn hóa định dạng hiển thị
1. **Định dạng Ngày tháng `DD.MM.YYYY`**:
   - Sử dụng hàm tiện ích `fmtDate`:
     ```javascript
     export const fmtDate = (d) => (d ? String(d).split('-').reverse().join('.') : '');
     ```
   - Chuyển đổi định dạng ISO `2004-02-25` thành định dạng chuẩn châu Âu `25.02.2004`.
2. **Liên kết chỉnh sửa thông tin dự án**:
   - Cột `Number` được bọc bởi `<Link to={'/project/edit/' + p.projectNumber} className="project-number-link">`.
   - Màu chữ xanh `#0058CC`, khi hover chuyển sang gạch chân, giúp điều hướng mượt mà sang màn hình chỉnh sửa dự án (US01 Edit Mode).

#### D. Tiêu chuẩn Typography & Alignment khắt khe (Left, Right, Center)
Tuân thủ 100% tài liệu hướng dẫn GUI thiết kế công nghiệp:
- **Căn phải (`text-align: right`)**: Cột số học `Number` (`.col-number`).
- **Căn trái (`text-align: left`)**: Cột chuỗi văn bản `Name` (`.col-name`), `Customer` (`.col-customer`).
- **Căn giữa (`text-align: center`)**: Cột `Checkbox` (`.col-checkbox`), `Status` (`.col-status`), `Start Date` (`.col-date`), `Delete` (`.col-delete`).
- **Độ đậm chữ**:
  - Tiêu đề cột `<th>`: `font-weight: normal` (tuyệt đối không dùng bold để bảo toàn nét chữ thanh mảnh của Segoe UI).
  - Nội dung hàng `<td>`: `font-weight: 600` (đảm bảo độ tương phản cao, dễ đọc khi quét dữ liệu).

#### E. Phân trang tích hợp (Pagination Server-side / Client-side)
- Kích thước trang: Cố định chuẩn 5 dự án trên 1 trang (`size = 5`).
- Component [`Pagination.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/Pagination.jsx):
  - Nút trang đầu: `««`.
  - Nút trang trước: `«`.
  - Các số trang: `1, 2, 3...`. Trang hiện tại được bôi màu xanh `#0088D0` và có gạch chân (`active`).
  - Nút trang kế tiếp: `»`.
  - Nút trang cuối: `»»`.

---

### 2.3. Hạng mục 3: Single & Batch Deletion (Xóa Đơn & Xóa Hàng Loạt Với Modal Xác Nhận)

#### A. Vị trí mã nguồn & Luồng xử lý xóa
- **Markup Xóa & Thanh Selection**: [`src/components/project/ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L98-L127).
- **Hộp thoại Modal**: [`src/components/common/ConfirmModal.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/ConfirmModal.jsx).
- **Logic kiểm tra & điều phối**: [`src/hooks/useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L77-L93).
- **Dịch vụ Xóa & Cache Store**: [`src/services/projectService.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/projectService.jsx#L93-L105).

#### B. Quy tắc nghiệp vụ sống còn: Chỉ dự án trạng thái `NEW` mới được xóa
Đây là quy tắc bất biến trong hệ thống PIM Tool:
$$\text{Có thể xóa} \iff \text{Status} == \text{'NEW'}$$
- Dự án có trạng thái `PLA` (Planned), `INP` (In Progress), `FIN` (Finished) **tuyệt đối không bao giờ được phép xóa** để tránh làm sai lệch lịch sử quản lý dự án.

#### C. Xóa đơn lẻ (Single Delete): Nút thùng rác có điều kiện
Trong [`ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L98-L105):
```jsx
<td className="col-delete">
  {p.status === 'NEW' && (
    <button 
      type="button" 
      className="btn-delete-icon" 
      onClick={() => openDelete([p], t('projectList.confirmDeleteSingle', { number: p.projectNumber }))}
      title="Delete project" 
      aria-label={`Delete project ${p.projectNumber}`}
    >
      <i className="fa fa-trash-o" />
    </button>
  )}
</td>
```
- Nếu `status !== 'NEW'`: Thẻ `<td>` được render rỗng hoàn toàn, không có nút bấm, không có icon mờ, triệt tiêu nguy cơ người dùng click nhầm.

#### D. Xóa hàng loạt (Batch Delete): Thanh công cụ nổi Floating Selection Bar
- Người dùng chọn checkbox ở từng hàng $\rightarrow$ Hàng đó được thêm class `.selected-row` (nền chuyển sang xanh nhạt).
- Khi `selectedIds.length > 0`, thanh công cụ nổi xuất hiện ngay dưới bảng dữ liệu:
  - Text thống kê: `"{count} items selected"` (ví dụ: `2 items selected` / `2 projets sélectionnés`).
  - Nút bấm hành động: `<span>{t('projectList.deleteSelected')}</span><i className="fa fa-trash-o" />`.
- **Kiểm tra an toàn nghiệp vụ trước khi mở Modal**:
  ```javascript
  if (targets.some((p) => p.status !== 'NEW')) {
    return setActionError(t('projectList.statusOnlyNewDelete'));
  }
  ```
  Nếu trong các dự án được chọn có bất kỳ dự án nào không phải `NEW`, hệ thống chặn lại ngay lập tức và hiển thị error banner màu đỏ: *"Only projects with status 'New' can be deleted."*.

#### E. Hộp thoại xác nhận đa ngữ (Accessible ConfirmModal Dialog)
Hộp thoại [`ConfirmModal.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/ConfirmModal.jsx):
- Tiêu đề: `Confirm` / `Confirmer`.
- Nội dung:
  - Xóa 1 dự án: *"Are you sure you want to delete project #{number}?"*
  - Xóa nhiều dự án: *"Are you sure you want to delete {count} selected projects?"*
- Nút bấm:
  - `Cancel` (Nút phụ xám): Hủy bỏ, đóng popup, giữ nguyên dữ liệu.
  - `OK` (Nút chính đỏ `btn-pim-danger`): Thực hiện xóa vĩnh viễn.
- Hỗ trợ phím `Escape` để đóng modal nhanh và bẫy focus bàn phím (Keyboard Accessibility).

#### F. Đồng bộ Cache & Xử lý lỗi bảo vệ dữ liệu
Khi người dùng bấm OK:
1. Gọi `deleteProject(id)` hoặc `deleteProjects(ids)`.
2. Service thực hiện xóa ở Backend API và đồng bộ xóa luôn trong local in-memory store.
3. React Query tự động invalidate queries để nạp lại danh sách mới nhất.
4. Xóa các ID đã bị xóa khỏi `selectedIds` để thanh selection bar biến mất tự nhiên.

---

### 2.4. Hạng mục 4: Search via URL query param (Đồng Bộ Tìm Kiếm Qua URL)

#### A. Vị trí mã nguồn & Bản chất `useSearchParams` trong React Router v6
- **Mã nguồn**: [`src/hooks/useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L14-L44).
- Hook sử dụng: `const [searchParams, setSearchParams] = useSearchParams();` từ thư viện `react-router-dom`.

#### B. Đồng bộ 2 chiều (Bidirectional Sync): URL ⇆ State ⇆ API

```
   ┌────────────────────────────────────────────────────────┐
   │                  Trình duyệt: URL Bar                  │
   │  http://localhost:3000/?searchTerm=3116&status=NEW     │
   └────────────────────────────────────────────────────────┘
          │ (1. Đọc khi khởi tạo)         ▲ (2. Ghi khi thay đổi)
          ▼                               │
   ┌────────────────────────────────────────────────────────┐
   │             Hook: useProjectList (State)               │
   │   searchInput = '3116', statusInput = 'NEW', ...       │
   └────────────────────────────────────────────────────────┘
          │                               ▲
          ▼                               │
   ┌────────────────────────────────────────────────────────┐
   │            Backend API / In-Memory Store               │
   │  GET /projects/search?searchTerm=3116&status=NEW       │
   └────────────────────────────────────────────────────────┘
```

1. **Chiều 1: URL $\rightarrow$ React State (Deep Linking & Bookmark)**:
   - Khi người dùng truy cập trực tiếp vào đường link đã có sẵn query params (ví dụ: chia sẻ link cho đồng nghiệp, hoặc bấm Back từ trang Edit):
     - `searchParams.get('keyword') || searchParams.get('searchTerm')` $\rightarrow$ nạp vào `searchInput`.
     - `searchParams.get('status')` $\rightarrow$ nạp vào `statusInput`.
     - `searchParams.get('startDateFrom')` $\rightarrow$ nạp vào `advInputs.startDateFrom`.
   - Kết quả: Bảng dữ liệu tự động hiển thị đúng tập kết quả đã được lọc mà người dùng không cần phải gõ lại từ đầu!
2. **Chiều 2: React State $\rightarrow$ URL (Push/Replace Params)**:
   - Mỗi khi người dùng gõ tìm kiếm hoặc thay đổi dropdown, hàm `updateUrlParams` được gọi:
     ```javascript
     const updateUrlParams = (c) => {
       const params = {};
       if (c.searchTerm) params.searchTerm = c.searchTerm;
       if (c.status) params.status = c.status;
       if (c.leaderVisa) params.leaderVisa = c.leaderVisa;
       if (c.memberVisa) params.memberVisa = c.memberVisa;
       if (c.startDateFrom) params.startDateFrom = c.startDateFrom;
       if (c.startDateTo) params.startDateTo = c.startDateTo;
       if (c.endDateFrom) params.endDateFrom = c.endDateFrom;
       if (c.endDateTo) params.endDateTo = c.endDateTo;
       setSearchParams(params, { replace: true });
     };
     ```

#### C. Lợi ích kiến trúc: Bookmarkable, Deep Linking, Browser History Back/Forward
- **Khả năng lưu Bookmark**: Người dùng có thể bookmark lại một bộ lọc phức tạp (ví dụ: các dự án `NEW` của Leader `DTH`).
- **Nút Back / Forward của trình duyệt hoạt động chuẩn mực**: Không bị mất trạng thái tìm kiếm khi quay lại từ trang Edit.

#### D. Cơ chế chống giật URL (URL Debouncing & `replace: true`)
- Sử dụng `{ replace: true }` để thay thế URL hiện tại thay vì push hàng chục history entries mỗi khi gõ phím. Nếu không có `replace: true`, lịch sử trình duyệt sẽ bị rác hàng trăm lượt và nút Back sẽ bị hỏng.

---

### 2.5. Hạng mục 5: S25.2-ScreenLiveTestsWebGUI - US02 Checklist Toàn Diện

#### A. Bảng đối chiếu 100% Test Cases chức năng (Functional Test Cases)

| Mã Kiểm Thử | Tên Yêu Cầu Chức Năng | Tình Trạng Đáp Ứng | File Code Xử Lý Trực Tiếp | File Kiểm Thử Tự Động (Automated Test) |
|---|---|---|---|---|
| **TC-US02-01** | Sắp xếp mặc định ban đầu theo `projectNumber,asc` | **ĐẠT (PASS)** | [`ProjectContext.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/context/ProjectContext.jsx#L19) (`field: 'projectNumber', direction: 'asc'`) | [`ProjectList.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.test.jsx#L32-L43) |
| **TC-US02-02** | Sắp xếp động 2 chiều các cột Number, Name, Status, Customer, Start Date | **ĐẠT (PASS)** | [`ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L75-L78), [`useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L94) | [`ProjectList.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.test.jsx#L96-L104) |
| **TC-US02-03** | Tìm kiếm theo từ khóa (Project Number, Name, Customer) & Status dropdown | **ĐẠT (PASS)** | [`ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L36-L47), [`projectService.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/projectService.jsx#L51-L69) | [`ProjectList.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.test.jsx#L53-L70) |
| **TC-US02-04** | Bộ lọc nâng cao (Leader Visa, Member Visa, Start/End Date Range) | **ĐẠT (PASS)** | [`ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L49-L68), [`LocaleDatePicker.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/LocaleDatePicker.jsx) | [`ProjectList.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.test.jsx#L83-L95) |
| **TC-US02-05** | Reset Search xóa sạch từ khóa, dropdown và đưa bảng về mặc định | **ĐẠT (PASS)** | [`useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L64-L74) | [`ProjectList.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.test.jsx#L65-L69) |
| **TC-US02-06** | Chỉ dự án trạng thái `NEW` mới có icon xóa (thùng rác) | **ĐẠT (PASS)** | [`ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L98-L105) | [`ProjectList.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.test.jsx#L44-L51) |
| **TC-US02-07** | Xóa nhiều dự án (Batch Delete) với thanh công cụ `X items selected` | **ĐẠT (PASS)** | [`ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx#L114-L121) | [`ProjectList.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.test.jsx#L71-L82) |
| **TC-US02-08** | Popup xác nhận xóa (Single & Batch) trước khi thực thi | **ĐẠT (PASS)** | [`ConfirmModal.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/ConfirmModal.jsx), [`useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx#L77-L93) | [`App.uat.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/App.uat.test.jsx) |
| **TC-US02-09** | Phân trang (Pagination) 5 items/trang, hỗ trợ nút số, Prev, Next | **ĐẠT (PASS)** | [`Pagination.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/Pagination.jsx), [`ProjectContext.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/context/ProjectContext.jsx#L25) | [`App.uat.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/App.uat.test.jsx) |

#### B. Bảng đối chiếu Tiêu chuẩn Giao diện & Trải nghiệm (Generic GUI Checklists)
- [x] **Căn lề cột**: Cột `Number` căn phải; Cột `Name`, `Customer` căn trái; Cột `Checkbox`, `Status`, `Date`, `Delete` căn giữa.
- [x] **Header Table**: Thẻ `<th>` có `font-weight: normal`, chữ màu `#666666`. Nội dung `<td>` có `font-weight: 600`.
- [x] **Sort Caret**: Caret `▲` / `▼` nằm thẳng hàng giữa trục dọc với chữ tiêu đề cột.
- [x] **Không có Checkbox All ở Header**: Tuân thủ tuyệt đối quy định không đặt checkbox ở `<th>`.
- [x] **Trạng thái Sidebar**: Khi ở màn hình danh sách (`/`), mục **Project** trên Sidebar được active (màu xanh `#2E84FB`), mục **New** không active.
- [x] **Độ phân giải tối thiểu**: Bố cục co giãn mượt mà từ 1024x768 px trở lên.

#### C. Tiêu chuẩn Đa ngôn ngữ (Multilingual i18n EN / FR)
Toàn bộ chuỗi văn bản trên US02 được khai báo tập trung trong [`src/locales/en.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/locales/en.jsx) và [`src/locales/fr.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/locales/fr.jsx). Khi người dùng bấm chuyển `EN | FR` trên Header:
- Tiêu đề trang: `Projects List` ⇆ `Liste des projets`.
- Placeholder tìm kiếm: `Project number, name, customer name` ⇆ `Numéro de projet, nom, nom du client`.
- Nút tìm kiếm: `Search Project` ⇆ `Rechercher`.
- Nút đặt lại: `Reset Search` ⇆ `Réinitialiser la recherche`.
- Thông báo xác nhận xóa: `Are you sure you want to delete project #%{number}?` ⇆ `Êtes-vous sûr de vouloir supprimer le projet #%{number} ?`.

#### D. Tiêu chuẩn Bộ chọn ngày độc lập (LocaleDatePicker hoàn toàn tránh bẫy Windows OS Locale)
- **Vấn đề của thẻ HTML5 `<input type="date">`**:
  - Trình duyệt Chrome/Edge trên Windows sẽ lấy **ngôn ngữ hệ điều hành Windows** để hiển thị (ví dụ máy cài tiếng Việt sẽ hiển thị `ngày/tháng/năm`, popup `Tháng 9 năm 2026`, `T2, T3... CN`, `Hôm nay`, `Xóa`).
  - Thẻ này hoàn toàn bỏ qua thiết lập ngôn ngữ React của ứng dụng!
- **Giải pháp của `LocaleDatePicker`**:
  - Sử dụng thẻ `<input type="text">` định dạng chuẩn ISO `YYYY-MM-DD` căn giữa.
  - Tự render Popup lịch bằng 100% React JSX thuần:
    - Tháng hiển thị theo `MONTHS[lang]` (`January` / `Janvier`).
    - Thứ hiển thị theo `DAYS[lang]` (`Mo, Tu...` / `Lu, Ma...`).
    - Nút thao tác dưới chân popup: `Clear` / `Effacer` và `Today` / `Aujourd'hui`.
  - Kết quả: **Triệt tiêu 100% tiếng Việt ngoài ý muốn, bảo đảm chuẩn song ngữ Anh / Pháp trên mọi máy tính người dùng**.

---

## 3. CÁC ĐIỂM LÝ THUYẾT CỐT LÕI VỀ KIẾN TRÚC FRONTEND REACT (DEEP DIVE THEORY)

### 3.1. Clean Architecture: Tách Biệt UI Rendering & Business Logic qua Custom Hooks

Dự án áp dụng triệt để nguyên lý **Separation of Concerns (SoC)** ở phía Frontend:

```
[ Component Giao Diện (Presenter): ProjectList.jsx ]
   └── 100% Thuần JSX Markup & View Binding
   └── Không chứa logic tính toán, không xử lý debouncing
   └── Gọi các action handler từ Custom Hook
             ▲
             │ { projects, searchInput, handleSearch, handleReset, ... }
             │
[ Custom Hook Nghiệp Vụ (Controller): useProjectList.jsx ]
   ├── Quản lý State cục bộ (Input, Toggle, Modals)
   ├── Xử lý Debounce Timer & URL Search Params Sync
   ├── Kiểm tra điều kiện nghiệp vụ (Chỉ xóa khi status === 'NEW')
   └── Gọi các hàm cập nhật Global State từ Context
             ▲
             │
[ Global State & Caching: ProjectContext.jsx ]
   └── TanStack React Query + Central In-Memory Store
```

**Tại sao đây là kiến trúc thượng thừa?**
1. **Dễ kiểm thử độc lập (Testability)**: Bạn có thể viết unit test kiểm tra riêng rẽ cho component UI và hook logic mà không cần phụ thuộc vào môi trường DOM phức tạp.
2. **Code siêu ngắn gọn & Dễ bảo trì**: Component UI giảm từ gần 300 dòng xuống chỉ còn hơn 100 dòng, hoàn toàn trong sáng, dễ đọc và dễ bảo trì.

---

### 3.2. Quản Lý Trạng Thái Toàn Cục: Context API kết hợp `@tanstack/react-query`

Trong [`src/context/ProjectContext.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/context/ProjectContext.jsx):
- **Tại sao không dùng Redux cồng kềnh?**: Dự án có phạm vi vừa phải, việc cài đặt Redux Toolkit với boilerplates (reducers, actions, slices) sẽ làm tăng dung lượng mã nguồn và tăng độ phức tạp không cần thiết.
- **Sức mạnh của React Query**:
  - Tự động quản lý vòng đời dữ liệu bất đồng bộ: `data`, `isLoading`, `error`.
  - Tự động quản lý cache theo key: `['projects', searchCriteria, currentPage, sortConfig]`.
  - Cơ chế **Stale-While-Revalidate**: Hiển thị dữ liệu từ cache ngay lập tức để giao diện không bị giật, đồng thời bắn request ngầm để đồng bộ dữ liệu mới nhất.
  - Hỗ trợ hàm `invalidateQueries`: Khi tạo, sửa, xóa dự án, chỉ cần gọi 1 dòng lệnh để làm mới toàn bộ danh sách một cách thanh thoát.

---

### 3.3. Giải Quyết Triệt Để Vấn Đề OS Locale Với `LocaleDatePicker`

Trong [`src/components/common/LocaleDatePicker.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/LocaleDatePicker.jsx):

```javascript
const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
};

const DAYS = {
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  fr: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
};
```

1. **Thuật toán tạo lưới ngày trong tháng (Calendar Grid Generation)**:
   - `new Date(viewYear, viewMonth + 1, 0).getDate()`: Trả về số ngày tối đa của tháng hiện tại (28, 29, 30 hoặc 31).
   - `(new Date(viewYear, viewMonth, 1).getDay() + 6) % 7`: Tính toán thứ của ngày đầu tháng theo chuẩn quốc tế bắt đầu từ Thứ Hai (`Monday = 0`).
   - Mảng `daysGrid`: Tự động chèn các phần tử `null` cho các ngày trống đầu tuần, sau đó chèn các ngày `1..N`.
2. **Cơ chế đóng Popup khi click ra ngoài (Outside Click Detection)**:
   - Sử dụng `useRef` trỏ vào container bao bọc.
   - Lắng nghe sự kiện `document.addEventListener('mousedown', handleOutside)`.
   - Nếu `e.target` không nằm trong `containerRef.current`, tự động đóng popup (`setIsOpen(false)`).

---

### 3.4. Chiến Lược CSS Gom Tập Trung (Zero CSS Bloat GlobalStyles)

Trong [`src/styles/GlobalStyles.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/styles/GlobalStyles.jsx):
- **Vấn đề của CSS Modules / External CSS files rời rạc**: Gây phân mảnh mã nguồn, trùng lặp định nghĩa màu sắc và tăng số lượng file trong project.
- **Giải pháp GlobalStyles tập trung**:
  - Gom toàn bộ hệ thống style vào 1 file duy nhất với biến màu chuẩn (CSS Custom Properties):
    - `--primary-blue: #0058CC;`
    - `--border-color: #CCCCCC;`
    - `--text-dark: #333333;`
    - `--text-muted: #666666;`
    - `--font-segoe: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;`
  - Đảm bảo 100% giao diện nhất quán, kích thước và lề padding khớp từng pixel với thiết kế mẫu.

---

### 3.5. Kiểm Thử Đa Tầng: Unit Tests, Integration Tests & UAT Automation

Toàn bộ hệ thống được bảo vệ bởi bộ kiểm thử tự động toàn diện (31/31 Test Cases Xanh 100%):
1. **Unit Test Service & Store**: [`projectService.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/projectService.test.jsx) (Kiểm tra validate, lọc nâng cao, xung đột version).
2. **Component Tests**: [`ProjectList.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.test.jsx), [`ProjectForm.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectForm.test.jsx).
3. **App Integration Tests**: [`App.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/App.test.jsx) (Điều hướng, chuyển đổi đa ngôn ngữ EN/FR).
4. **End-to-End UAT Scenarios**: [`App.uat.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/App.uat.test.jsx) (Mô phỏng toàn bộ luồng người dùng từ tìm kiếm, lọc, chọn hàng, xóa đơn, xóa hàng loạt đến tạo mới và sửa dự án).

---

## 4. BẢNG TRA CỨU TOÀN BỘ HOOK, SERVICE, UTILITY & COMPONENT TRONG PIM-FRONT

| Tên Định Danh | Phân Loại | Đường Dẫn Mã Nguồn | Chức Năng Cốt Lõi |
|---|---|---|---|
| `ProjectList` | Component | [`src/components/project/ProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.jsx) | Render giao diện màn hình danh sách dự án US02 (Search, Filter, Table, Pagination). |
| `useProjectList` | Custom Hook | [`src/hooks/useProjectList.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectList.jsx) | Điều phối toàn bộ trạng thái tìm kiếm, debounce, chọn hàng, xóa và sync URL params. |
| `ProjectForm` | Component | [`src/components/project/ProjectForm.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectForm.jsx) | Render giao diện tạo mới và chỉnh sửa thông tin dự án US01. |
| `useProjectForm` | Custom Hook | [`src/hooks/useProjectForm.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/hooks/useProjectForm.jsx) | Điều phối trạng thái form, validation, suggest visa và submit dữ liệu. |
| `MemberSuggest` | Component | [`src/components/project/MemberSuggest.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/MemberSuggest.jsx) | Hộp tìm kiếm gợi ý thành viên dạng Tag/Chip với infinite scroll và debounce. |
| `LocaleDatePicker` | Component | [`src/components/common/LocaleDatePicker.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/LocaleDatePicker.jsx) | Bộ chọn ngày độc lập chuẩn EN/FR, loại bỏ 100% bẫy ngôn ngữ của hệ điều hành. |
| `ConfirmModal` | Component | [`src/components/common/ConfirmModal.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/ConfirmModal.jsx) | Hộp thoại xác nhận xóa đơn và xóa hàng loạt có phím tắt Escape. |
| `Pagination` | Component | [`src/components/common/Pagination.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/common/Pagination.jsx) | Thanh điều hướng phân trang chuẩn 5 bản ghi/trang với các nút số và mũi tên. |
| `ProjectContext` | Context / Provider | [`src/context/ProjectContext.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/context/ProjectContext.jsx) | Quản lý trạng thái dự án toàn cục, tích hợp TanStack React Query cache. |
| `LanguageContext` | Context / Provider | [`src/context/LanguageContext.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/context/LanguageContext.jsx) | Cung cấp hàm dịch đa ngữ `t(key, params)` và trạng thái ngôn ngữ `en` / `fr`. |
| `projectService` | Service API | [`src/services/projectService.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/projectService.jsx) | Cung cấp các phương thức gọi REST API và bộ lưu trữ dự phòng in-memory siêu tốc. |
| `apiClient` | Axios Instance | [`src/services/apiClient.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/apiClient.jsx) | Cấu hình axios với base URL `/api` và interceptors xử lý timeout/lỗi. |
| `GlobalStyles` | Style Definition | [`src/styles/GlobalStyles.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/styles/GlobalStyles.jsx) | Tập hợp toàn bộ quy tắc CSS, typography Segoe UI và bố cục ứng dụng. |
