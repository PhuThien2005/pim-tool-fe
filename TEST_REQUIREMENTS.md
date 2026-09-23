# PIM Tool - Test Requirements Specification (US01 & US02)

Tài liệu này tổng hợp toàn bộ các yêu cầu kiểm thử (Functional Test Cases & Generic GUI Checklists) từ hai bộ tài liệu kiểm thử chính thức:
- **US01:** `S25.2-ScreenLiveTestsWebGUI - US01.DOCX` (Projects Detail - New & Update Project)
- **US02:** `S25.2-ScreenLiveTestsWebGUI - US02.DOCX` (Projects List - Search, Filter, Sort & Delete)
- **Requirements v4:** `On-boarding-PIMTool-Requirements-v4-Exercise.docx`

---

## 1. US01 - Project Creation & Update (Projects Detail)

### 1.1 Yêu cầu Chức năng (Functional Test Cases)
| Mã | Mô tả ca kiểm thử | Kết quả mong đợi |
|---|---|---|
| **TC-US01-01** | Tạo dự án không điền thông tin | Hiển thị thông báo lỗi bắt buộc: *"Please enter all the mandatory fields (\*)."* và bôi đỏ các trường thiếu. |
| **TC-US01-02** | Tạo dự án hợp lệ với đầy đủ thông tin | Lưu dự án thành công, điều hướng về trang danh sách dự án (`/`). |
| **TC-US01-03** | Trùng số dự án (Duplicate Project Number) | Báo lỗi: *"The project number already existed. Please select a different project number"* cả trên banner thông báo và ngay cạnh ô Project Number. |
| **TC-US01-04** | Kiểm tra Visa thành viên không tồn tại | Nhập visa không có trong database (ví dụ: `INVALID_XYZ`) → Báo lỗi: *"The following visas do not exist: {visa list}."* |
| **TC-US01-05** | Khoảng thời gian ngày bắt đầu và kết thúc | Nếu có End Date mà `End Date <= Start Date` → Báo lỗi không hợp lệ và bôi đỏ ô End Date. |
| **TC-US01-06** | Cập nhật dự án thành công (Edit Mode) | Khi vào `/project/edit/:number`: dữ liệu cũ được điền đầy đủ, trường Project Number bị disable/readonly; sửa thông tin và Submit → lưu thành công, điều hướng về `/`. |
| **TC-US01-07** | Tiêu đề màn hình theo chế độ | Khi tạo mới: *"New Project"*. Khi cập nhật: *"Edit Project information"* (hoặc *"Edit Project Information"*). |
| **TC-US01-08** | Lỗi bất ngờ / mất kết nối (Unexpected Technical Error) | Điều hướng sang trang lỗi riêng biệt (`/error?detail=...`) hiển thị: *"Unexpected error occurred [\<detail\>]. Please contact your administrator or back to search project"*. |
| **TC-US01-09** | Xung đột phiên bản (Optimistic Locking) | Nếu dự án bị chỉnh sửa bởi user khác (`version` tăng) → Báo lỗi Optimistic Lock để bảo vệ toàn vẹn dữ liệu. |
| **TC-US01-10** | Chống Double Submit | Nút Submit bị disable trong quá trình đang gửi request (`isSubmitting = true`), tránh click đúp tạo 2 lần. |

### 1.2 Yêu cầu Giao diện & Tương tác Nâng cao (Advanced & GUI Checklists)
- **Thanh tìm kiếm Suggest Member (Chips/Tags):**
  - Khi gõ ký tự, hiển thị danh sách gợi ý dưới dạng: `VISA: FirstName LastName` (ví dụ: `MQD: Dang Vu Minh Quang`).
  - Khi chọn thành viên, tạo thành một thẻ (Chip/Tag) có viền và nút `✕`: `[ ATN: NGUYEN BA ANH THU ✕ ]`.
  - Có thể xóa thẻ bằng cách click vào `✕` hoặc bấm phím `Backspace` khi ô gõ đang rỗng.
  - Hỗ trợ cuộn vô tận (Infinite Scroll) với debounce cho dữ liệu `Slice<EmployeeListResponse>`.
- **Date Picker theo Locale:**
  - Định dạng hiển thị chuẩn `YYYY-MM-DD` (căn giữa theo tiêu chuẩn GUI `date field -> center`).
  - Popup lịch hiển thị tên tháng và thứ trong tuần theo ngôn ngữ ứng dụng (`EN` / `FR`), không bị phụ thuộc vào ngôn ngữ hệ điều hành Windows.
- **Trạng thái Sidebar khi Edit:**
  - Khi đang ở trang Edit (`/project/edit/:number`): mục **Project** được active (màu xanh `#2E84FB`), tiêu đề **New** KHÔNG active.
- **Trường Read-only:**
  - Ô Project Number ở trang Edit có màu nền xám (`readonly-field`), không cho phép chỉnh sửa.

---

## 2. US02 - Projects List (Search, Filter, Sort, Pagination & Delete)

### 2.1 Yêu cầu Chức năng (Functional Test Cases)
| Mã | Mô tả ca kiểm thử | Kết quả mong đợi |
|---|---|---|
| **TC-US02-01** | Sắp xếp mặc định danh sách dự án | Danh sách hiển thị ban đầu luôn được sắp xếp theo `projectNumber,asc`. |
| **TC-US02-02** | Sắp xếp động theo cột (Sorting) | Click vào tiêu đề các cột Number, Name, Status, Customer, Start Date để đảo chiều tăng/giảm (`asc`/`desc`). |
| **TC-US02-03** | Tìm kiếm theo từ khóa và trạng thái | Tìm theo chuỗi con của Project Number, Name, Customer và chọn Status (`New`, `Planned`, `In progress`, `Finished`). |
| **TC-US02-04** | Bộ lọc nâng cao (Advanced Filter) | Nút Toggle icon phễu mở panel lọc nâng cao: Leader Visa, Member Visa, Start Date From/To, End Date From/To. API `/groups` chỉ gọi khi mở filter lần đầu. |
| **TC-US02-05** | Reset Search | Nút "Reset Search" xóa toàn bộ từ khóa, dropdown và đưa bảng về danh sách mặc định. |
| **TC-US02-06** | Quy tắc xóa dự án đơn lẻ (Single Delete) | **Chỉ những dự án có trạng thái "New" mới có icon thùng rác** để xóa. Dự án trạng thái khác không có icon xóa. |
| **TC-US02-07** | Xóa nhiều dự án (Batch Delete) | Checkbox từng hàng chọn dự án. Khi có hàng được chọn, hiển thị thanh thanh công cụ dưới bảng: `X items selected` và nút `delete selected items [thùng rác]`. |
| **TC-US02-08** | Xác nhận xóa (Delete Confirmation Modal) | Khi bấm xóa (đơn hoặc nhiều), popup xác nhận hiển thị: *"Are you sure you want to delete the selected project(s)?"*. Bấm Confirm mới thực hiện xóa. |
| **TC-US02-09** | Phân trang (Pagination) | 5 dự án trên một trang. Các nút số trang, Next (`»`), Prev (`«`). Số trang active có màu `#0088D0` gạch chân. |

### 2.2 Yêu cầu Giao diện & Bố cục (Generic GUI Checklists)
- **Căn lề cột trong bảng:**
  - Cột Text (`Name`, `Customer`) → Căn trái (`left`).
  - Cột Numeric (`Number`) → Căn phải (`right`).
  - Cột Date (`Start Date`) → Căn giữa (`center`).
  - Cột Checkbox & Delete Icon → Căn giữa (`center`).
- **Header Table:**
  - Tiêu đề cột `th` có `font-weight: normal` (không dùng semibold).
  - Nội dung các hàng `td` có `font-weight: 600`.
  - Icon tam giác sắp xếp (`.sort-caret`) căn giữa thẳng hàng theo chiều dọc với chữ tiêu đề.
  - Không có checkbox chọn tất cả ở Header (`th`).

---

## 3. Generic Web & GUI Checklists (Áp dụng Toàn hệ thống)

### 3.1 Bố cục & Thuộc tính Trang (Page Properties & Layout)
- **Minimal Resolution:** Giao diện co giãn tốt và hiển thị chuẩn mực trên màn hình tối thiểu 1024x768 px.
- **Tiêu đề cửa sổ (Window Title):** Luôn hiển thị `PIM tool` chuẩn chính tả.
- **Trang Lỗi (Error Page `/error`):**
  - **Không hiển thị Sidebar** trên trang lỗi (chiếm toàn bộ chiều rộng).
  - Biểu tượng tròn đỏ lớn nằm bên trái.
  - Văn bản bên phải:
    - Dòng 1: `Unexpected error occurred.` (hoặc `Unexpected error occurred [<detail>].`)
    - Dòng 2: `Please ` `<span class="red-text">contact your administrator</span>`
    - Dòng 3: `or ` `<Link to="/" class="back-link">back to search project</Link>`

### 3.2 Ngôn ngữ & Bản địa hóa (Multilingual - i18n)
- Hỗ trợ đầy đủ hai ngôn ngữ: **English (EN)** và **Français (FR)**.
- Chuyển đổi ngôn ngữ cập nhật tức thì tất cả nhãn, dropdown, placeholder, tiêu đề và thông báo lỗi.
- Nút chuyển `EN | FR`:
  - Trạng thái inactive: màu `#666666`, không gạch chân.
  - Trạng thái active: màu `#018FE1`, **không gạch chân**.
  - Hover: màu `#018FE1`, có gạch chân.
- Liên kết **Help** và **Log out**:
  - `font-weight: 600`.
  - Trạng thái bình thường màu `#666666`, hover đổi sang `#018FE1` (Help) và `#333333` (Log out).

### 3.3 An toàn dữ liệu & Điều hướng Web (Security & Navigation)
- **Ngăn chặn XSS & HTML Tag:** Các ký tự `<script>`, `<table>` không được thực thi khi nhập vào ô dữ liệu.
- **SQL Injection:** Dữ liệu tìm kiếm và nhập liệu được tham số hóa an toàn.
- **Điều hướng Trình duyệt:** Hỗ trợ nút Back / Forward / Refresh của trình duyệt hoạt động mượt mà.

---

## 4. Ma trận Theo dõi Kiểm thử Tự động (Automated Test Coverage Matrix)

| Test Suite | File Test | Số lượng Test | Trạng thái |
|---|---|---|---|
| **Service Layer** | [`projectService.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/services/projectService.test.jsx) | 8 tests | ✅ PASS |
| **Project Form Unit** | [`ProjectForm.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectForm.test.jsx) | 6 tests | ✅ PASS |
| **Project List Unit** | [`ProjectList.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/components/project/ProjectList.test.jsx) | 7 tests | ✅ PASS |
| **App Routing & Context** | [`App.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/App.test.jsx) | 5 tests | ✅ PASS |
| **UAT End-to-End Scenarios** | [`App.uat.test.jsx`](file:///C:/Users/dptn/Downloads/pim-front%201/pim-front/src/App.uat.test.jsx) | 5 tests | ✅ PASS |
| **TỔNG CỘNG** | **5 Test Suites** | **31 Tests** | **✅ 100% PASS** |
