# BẢNG KỊCH BẢN KIỂM THỬ THỦ CÔNG (MANUAL TEST CASES)
## HỆ THỐNG PIM TOOL (FRONTEND & BACKEND INTEGRATION)

> **Mục đích:** Hướng dẫn chi tiết từng thao tác click chuột, gõ phím, dữ liệu đầu vào và kết quả mong đợi (cả giao diện UI lẫn Network API) để bạn tự tay kiểm thử 100% hệ thống từ đầu đến cuối.  
> **Backend:** `http://localhost:8080` (Spring Boot)  
> **Frontend:** `http://localhost:3000` (React)  
> **Tài liệu tham chiếu:** `On-boarding-PIMTool-Requirements-v4-Exercise.docx` (US01 & US02)

---

## 📋 MỤC LỤC
1. [Chuẩn bị môi trường trước khi Test](#1-chuẩn-bị-môi-trường)
2. [Nhóm 1: Tạo mới Dự án (US01 - New Project)](#nhóm-1-tạo-mới-dự-án-us01---new-project)
3. [Nhóm 2: Chỉnh sửa Dự án (US01 - Edit Project)](#nhóm-2-chỉnh-sửa-dự-án-us01---edit-project)
4. [Nhóm 3: Hiển thị Bảng, Phân trang & Sắp xếp (US02 - List, Pagination, Sort)](#nhóm-3-hiển-thị-bảng-phân-trang--sắp-xếp-us02)
5. [Nhóm 4: Tìm kiếm, Lọc nâng cao & Đồng bộ URL (US02 - Search & Filter)](#nhóm-4-tìm-kiếm-lọc-nâng-cao--đồng-bộ-url-us02)
6. [Nhóm 5: Xóa Dự án đơn lẻ & Hàng loạt (US02 - Delete Rules)](#nhóm-5-xóa-dự-án-đơn-lẻ--hàng-loạt-us02)
7. [Nhóm 6: Đa ngôn ngữ (i18n - English / French)](#nhóm-6-đa-ngôn-ngữ-i18n)

---

## 1. Chuẩn Bị Môi Trường
- [ ] Backend Spring Boot đã start thành công tại cổng `8080` (Database H2/PostgreSQL có dữ liệu mẫu ban đầu).
- [ ] Frontend React đã start tại `http://localhost:3000` (`yarn start`).
- [ ] Mở sẵn **DevTools (F12) $\rightarrow$ Tab Network** trên trình duyệt Chrome để vừa bấm vừa soi request API.

---

## NHÓM 1: TẠO MỚI DỰ ÁN (US01 - NEW PROJECT)

### TC-NEW-01: Giao diện mặc định màn hình New Project
- **Tiền điều kiện:** Đang ở trang chủ `http://localhost:3000`.
- **Các bước thực hiện:**
  1. Click vào menu **Project** (dưới mục **New**) ở thanh Sidebar bên trái.
  2. Quan sát URL và toàn bộ giao diện form.
- **Kết quả mong đợi:**
  - URL chuyển thành `http://localhost:3000/project/new`.
  - Tiêu đề màn hình là **`New Project`**.
  - Các trường bắt buộc có dấu sao đỏ `*`: `Project Number*`, `Project Name*`, `Customer*`, `Group*`, `Status*`, `Start Date*`.
  - Trạng thái `Status` mặc định được chọn là **`New`** (`NEW`).
  - Ô `Project Number`, `Project Name`, `Customer`, `Members`, `Start Date`, `End Date` đều trống.
  - Dropdown `Group` đã được nạp danh sách các group từ backend.
  - Có 2 nút: **`Cancel`** và **`Create Project`**.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-NEW-02: Nút Cancel hủy bỏ tạo mới
- **Tiền điều kiện:** Đang ở `http://localhost:3000/project/new`.
- **Các bước thực hiện:**
  1. Nhập thử vài thông tin vào ô Project Name: `"Dự án thử nghiệm"`.
  2. Bấm nút **`Cancel`**.
- **Kết quả mong đợi:**
  - Trình duyệt điều hướng quay về trang danh sách dự án: `http://localhost:3000/`.
  - Không có API `POST` nào được gọi xuống backend.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-NEW-03: Validate để trống tất cả trường bắt buộc
- **Tiền điều kiện:** Đang ở `http://localhost:3000/project/new`.
- **Các bước thực hiện:**
  1. Không nhập bất kỳ trường nào (để form trắng tinh).
  2. Bấm nút **`Create Project`**.
- **Kết quả mong đợi:**
  - Xuất hiện banner màu đỏ trên đầu form với thông điệp chính xác:  
    👉 **`Please enter all the mandatory fields (*).`**
  - Các ô bắt buộc bị viền đỏ (field-error): `Project Number`, `Project Name`, `Customer`, `Start Date`.
  - Form **KHÔNG** gửi request `POST` xuống backend.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-NEW-04: Validate độ dài tối đa (Max Length 50 ký tự)
- **Tiền điều kiện:** Đang ở `http://localhost:3000/project/new`.
- **Các bước thực hiện:**
  1. Nhập vào ô `Project Name` một chuỗi hơn 60 ký tự (ví dụ: gõ 60 chữ `A`).
  2. Nhập vào ô `Customer` một chuỗi hơn 60 ký tự (ví dụ: gõ 60 chữ `B`).
- **Kết quả mong đợi:**
  - Trình duyệt tự chặn lại ở đúng **50 ký tự**, không thể gõ thêm ký tự thứ 51.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-NEW-05: Validate logic ngày tháng (End Date <= Start Date)
- **Tiền điều kiện:** Đang ở `http://localhost:3000/project/new`.
- **Các bước thực hiện:**
  1. Nhập đầy đủ các trường:
     - Project Number: `9101`
     - Name: `Project Date Test`
     - Customer: `Customer Test`
     - Group: Chọn bất kỳ group nào (VD: `DTH`)
     - Start Date: Chọn ngày `2026-10-15`
     - End Date: Chọn ngày `2026-10-10` (nhỏ hơn ngày bắt đầu).
  2. Bấm **`Create Project`**.
- **Kết quả mong đợi:**
  - Banner đỏ xuất hiện thông báo lỗi:  
    👉 **`End date must be later than Start date.`**
  - Ô `End Date` bị viền đỏ.
  - Không gửi request tạo dự án xuống backend.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-NEW-06: Tính năng gợi ý thành viên (MemberSuggest Autocomplete)
- **Tiền điều kiện:** Đang ở `http://localhost:3000/project/new`.
- **Các bước thực hiện:**
  1. Click vào ô **`Members`**, gõ chữ `d`.
  2. Quan sát hộp gợi ý xổ xuống bên dưới.
  3. Dùng chuột click vào nhân viên `DTH` trong danh sách.
  4. Tiếp tục gõ `, b` vào ô input. Click chọn `BHU`.
- **Kết quả mong đợi:**
  - Khi gõ phím, hiển thị danh sách gợi ý gồm mã VISA và Họ tên nhân viên.
  - Khi click chọn, mã VISA tự động điền vào ô với định dạng chuẩn phân tách bằng dấu phẩy: `DTH, BHU`.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-NEW-07: Xử lý lỗi Backend - Trùng số dự án (Duplicate Number)
- **Tiền điều kiện:** Trong database đã có sẵn dự án số `3116`. Đang ở `http://localhost:3000/project/new`.
- **Các bước thực hiện:**
  1. Nhập các thông tin:
     - Project Number: `3116` *(số đã tồn tại)*
     - Name: `Duplicate Test Project`
     - Customer: `ELCA`
     - Group: Chọn group bất kỳ
     - Start Date: `2026-01-01`
  2. Bấm **`Create Project`**.
  3. Quan sát Network tab và giao diện.
- **Kết quả mong đợi:**
  - Network tab: Request `POST http://localhost:8080/projects` trả về mã **`400 Bad Request`** kèm errorCode `DUPLICATE_NUMBER`.
  - Trên màn hình xuất hiện thông báo lỗi chính xác:  
    👉 **`The project number already existed. Please select a different project number`**
  - Ô `Project Number` bị viền đỏ cảnh báo.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-NEW-08: Xử lý lỗi Backend - VISA không tồn tại (Invalid VISA)
- **Tiền điều kiện:** Đang ở `http://localhost:3000/project/new`.
- **Các bước thực hiện:**
  1. Nhập các thông tin:
     - Project Number: `9888`
     - Name: `Invalid Visa Test`
     - Customer: `ELCA`
     - Group: Chọn group bất kỳ
     - Members: `DTH, XYZ_FAKE, ABC_FAKE` *(chứa visa không có thật trong hệ thống)*
     - Start Date: `2026-01-01`
  2. Bấm **`Create Project`**.
  3. Quan sát Network tab và giao diện.
- **Kết quả mong đợi:**
  - Network tab: Request `POST http://localhost:8080/projects` trả về **`400 Bad Request`** kèm errorCode `INVALID_VISAS`.
  - Trên màn hình xuất hiện thông báo lỗi chính xác:  
    👉 **`The following visas do not exist: XYZ_FAKE, ABC_FAKE.`**
  - Ô `Members` bị viền đỏ cảnh báo.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-NEW-09: Tạo mới dự án thành công hoàn chỉnh
- **Tiền điều kiện:** Đang ở `http://localhost:3000/project/new`.
- **Các bước thực hiện:**
  1. Nhập thông tin hoàn toàn hợp lệ:
     - Project Number: `8899`
     - Name: `PIM Tool Automation System`
     - Customer: `Securitas AG`
     - Group: Chọn group đầu tiên (VD: `DTH`)
     - Members: `DTH, BHU`
     - Status: `New`
     - Start Date: `2026-05-01`
     - End Date: `2026-12-31`
  2. Bấm **`Create Project`**.
  3. Quan sát Network tab và giao diện sau khi bấm.
- **Kết quả mong đợi:**
  - Network tab: Gửi request `POST http://localhost:8080/projects` với payload chuẩn (mảng `visas: ["DTH", "BHU"]`, `version: 1`).
  - Backend trả về mã **`201 Created`**.
  - Ứng dụng tự động điều hướng quay về trang danh sách: `http://localhost:3000/`.
  - Trên bảng danh sách dự án, xuất hiện dòng dự án số `8899` với tên `PIM Tool Automation System`.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

## NHÓM 2: CHỈNH SỬA DỰ ÁN (US01 - EDIT PROJECT)

### TC-EDIT-01: Truy cập trang Edit & Gọi API lấy thông tin chi tiết
- **Tiền điều kiện:** Đang ở trang danh sách dự án `http://localhost:3000/`.
- **Các bước thực hiện:**
  1. Mở DevTools (F12) $\rightarrow$ Tab Network $\rightarrow$ Xóa trắng log (Clear).
  2. Tìm dự án số `3116` trên bảng, click vào con số `3116` (thẻ hyperlink màu xanh).
  3. Quan sát URL, Network log và giao diện form.
- **Kết quả mong đợi:**
  - URL chuyển thành dạng: `http://localhost:3000/project/edit/1` (hoặc `/project/edit/3116`).
  - Network tab: Phải thấy gọi request **`GET http://localhost:8080/projects/{id}`** và trả về mã **`200 OK`**.
  - Tiêu đề màn hình đổi thành: **`Edit Project information`** (khác với `New Project`).
  - Nút bấm chính ở góc dưới đổi thành: **`Edit Project`** (khác với `Create Project`).
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-EDIT-02: Quy tắc BẮT BUỘC - Khóa ô Project Number (Disabled / Read-only)
- **Tiền điều kiện:** Đang ở màn hình Edit Project (từ TC-EDIT-01).
- **Các bước thực hiện:**
  1. Thử click chuột vào ô `Project Number`.
  2. Thử bấm bàn phím hoặc dùng phím xóa Backspace để sửa số dự án.
- **Kết quả mong đợi:**
  - Ô `Project Number` mang giá trị `3116`.
  - Ô input này ở trạng thái **DISABLED / READ-ONLY** (nền xám nhạt, con trỏ chuột không trỏ vào được, không thể sửa đổi bất kỳ số nào).
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-EDIT-03: Form tự động điền sẵn đầy đủ dữ liệu cũ của dự án
- **Tiền điều kiện:** Đang ở màn hình Edit của dự án `3116`.
- **Các bước thực hiện:**
  1. Quan sát toàn bộ các ô nhập trên màn hình so với dữ liệu trong database.
- **Kết quả mong đợi:**
  - Tên dự án: Hiển thị đúng tên cũ (VD: `Facturation / Encaissements`).
  - Khách hàng: Hiển thị đúng khách hàng cũ (VD: `Les Retaites Populaires`).
  - Group: Đã tự động chọn đúng Group của dự án.
  - Members: Đã điền sẵn danh sách VISA thành viên cũ (VD: `DTH, BHU`).
  - Status: Hiển thị đúng trạng thái của dự án.
  - Start Date & End Date: Đã điền sẵn ngày tháng cũ tương ứng.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-EDIT-04: Cập nhật thông tin dự án thành công
- **Tiền điều kiện:** Đang ở màn hình Edit của dự án `3116`.
- **Các bước thực hiện:**
  1. Sửa ô `Project Name` thành: `Facturation / Encaissements - Updated 2026`.
  2. Đổi trạng thái `Status` từ `New` sang `In Progress` (`INP`).
  3. Thêm một thành viên vào ô `Members`: `DTH, BHU, JHV`.
  4. Bấm nút **`Edit Project`**.
  5. Quan sát Network tab và phản hồi của hệ thống.
- **Kết quả mong đợi:**
  - Network tab: Gửi request **`PUT http://localhost:8080/projects/{id}`** với dữ liệu mới và giữ nguyên `version` hiện tại.
  - Backend trả về mã **`200 OK`**.
  - Ứng dụng điều hướng về trang danh sách: `http://localhost:3000/`.
  - Dòng dự án `3116` trên bảng hiển thị tên mới `Facturation / Encaissements - Updated 2026` và trạng thái `In progress`.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-EDIT-05: Xử lý xung đột phiên bản (Optimistic Locking / Concurrent Update)
- **Tiền điều kiện:** Mô phỏng 2 người cùng mở trang edit của dự án `3116` một lúc.
- **Các bước thực hiện:**
  1. Mở tab trình duyệt A vào edit dự án `3116`.
  2. Mở tab trình duyệt B vào edit dự án `3116`.
  3. Tab A sửa tên và bấm "Edit Project" $\rightarrow$ Lưu thành công (version trong DB tăng lên 2).
  4. Quay lại Tab B (lúc này tab B vẫn giữ version 1 cũ), sửa tên và bấm "Edit Project".
- **Kết quả mong đợi:**
  - Backend ném lỗi xung đột khóa lạc quan (Optimistic Locking failure).
  - Tab B hiển thị thông báo lỗi rõ ràng cho người dùng biết dữ liệu đã bị người khác thay đổi trước đó, không ghi đè dữ liệu sai.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-EDIT-06: Truy cập ID dự án không tồn tại
- **Tiền điều kiện:** Đang mở trình duyệt.
- **Các bước thực hiện:**
  1. Gõ thẳng lên thanh URL: `http://localhost:3000/project/edit/99999999` (ID chắc chắn không có trong DB).
  2. Bấm Enter.
- **Kết quả mong đợi:**
  - Network tab gọi `GET /projects/99999999` trả về `404 Not Found`.
  - Hệ thống tự động chuyển hướng sang trang báo lỗi: `http://localhost:3000/error?detail=...`.
  - Hiển thị thông báo thân thiện với người dùng, không bị màn hình trắng (white screen crash).
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

## NHÓM 3: HIỂN THỊ BẢNG, PHÂN TRANG & SẮP XẾP (US02)

### TC-LIST-01: Cấu trúc bảng danh sách dự án đủ 7 cột
- **Tiền điều kiện:** Mở trang chủ `http://localhost:3000/`.
- **Các bước thực hiện:**
  1. Quan sát hàng tiêu đề bảng (`<thead>`).
- **Kết quả mong đợi:**
  - Bảng có chính xác 7 cột theo thứ tự:
    1. Cột Checkbox (chọn dòng)
    2. **Number**
    3. **Name**
    4. **Status**
    5. **Customer**
    6. **Start Date**
    7. **Delete**
  - Cột `Number` hiển thị dưới dạng đường link màu xanh có thể click.
  - Cột `Start Date` hiển thị đúng định dạng: **`DD.MM.YYYY`** (ví dụ: `25.02.2004`, chứ không phải `2004-02-25`).
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-LIST-02: Quy tắc hiển thị nút Delete (Chỉ hiển thị cho status NEW)
- **Tiền điều kiện:** Trong database có ít nhất 1 dự án trạng thái `NEW` và các dự án trạng thái khác (`INP`, `PLA`, `FIN`).
- **Các bước thực hiện:**
  1. Nhìn dọc theo cột **Delete** của từng dòng dự án trên bảng.
- **Kết quả mong đợi:**
  - Dòng nào có Status là **`New`** $\rightarrow$ Có icon thùng rác màu đỏ/đen để bấm xóa.
  - Dòng nào có Status là **`Planned`**, **`In progress`**, **`Finished`** $\rightarrow$ Cột Delete **HOÀN TOÀN TRỐNG**, không hề có icon hay nút bấm nào.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-LIST-03: Sắp xếp động theo từng cột (Column Sorting)
- **Tiền điều kiện:** Đang ở `http://localhost:3000/`.
- **Các bước thực hiện:**
  1. Click vào tiêu đề cột **`Number`** lần 1 $\rightarrow$ Quan sát icon mũi tên và thứ tự số dự án.
  2. Click tiếp vào tiêu đề cột **`Number`** lần 2 $\rightarrow$ Quan sát sự đổi chiều.
  3. Thử click lần lượt vào các cột: **`Name`**, **`Status`**, **`Customer`**, **`Start Date`**.
- **Kết quả mong đợi:**
  - Cạnh tiêu đề cột xuất hiện icon mũi tên chiều tăng dần `▲` hoặc giảm dần `▼`.
  - Network tab: Mỗi lần click gửi request `GET /projects?...&sort=projectNumber,asc` hoặc `sort=projectNumber,desc`.
  - Dữ liệu trên bảng đảo chiều sắp xếp tương ứng chính xác.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-LIST-04: Phân trang chuẩn Server-side (Pagination)
- **Tiền điều kiện:** Hệ thống có hơn 5 dự án (ví dụ có 12 dự án $\rightarrow$ 3 trang).
- **Các bước thực hiện:**
  1. Quan sát số lượng dòng trên trang 1.
  2. Click vào số trang **`2`** ở thanh phân trang bên dưới.
  3. Click nút chuyển trang tiếp theo **`>`**.
  4. Click nút về trang cuối cùng **`>>`**.
  5. Click nút về trang đầu tiên **`<<`**.
- **Kết quả mong đợi:**
  - Mỗi trang hiển thị đúng tối đa **5 dự án**.
  - Khi chuyển trang, Network tab gọi `GET /projects?page=1&size=5` (Spring Boot tính page từ 0).
  - Dữ liệu trang 2 nạp lên mượt mà, số trang hiện tại được highlight nổi bật.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

## NHÓM 4: TÌM KIẾM, LỌC NÂNG CAO & ĐỒNG BỘ URL (US02)

### TC-SEARCH-01: Tìm kiếm nhanh bằng từ khóa (Keyword - Debounce)
- **Tiền điều kiện:** Đang ở `http://localhost:3000/`.
- **Các bước thực hiện:**
  1. Gõ từ khóa `"Facturation"` vào ô Textbox tìm kiếm.
  2. Không cần bấm nút gì cả, buông tay khỏi bàn phím và chờ 0.5 giây.
  3. Quan sát Network tab, URL trình duyệt và bảng kết quả.
- **Kết quả mong đợi:**
  - Sau đúng 350ms ngừng gõ (Debounce), hệ thống tự kích hoạt tìm kiếm.
  - Network tab: Gửi request **`GET http://localhost:8080/projects?keyword=Facturation&page=0&size=5&...`** (chú ý trường là **`keyword`**, không phải `searchTerm`).
  - Thanh địa chỉ URL tự cập nhật thành: `http://localhost:3000/?keyword=Facturation`.
  - Bảng chỉ còn hiển thị đúng dự án có tên hoặc số liên quan đến "Facturation".
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-SEARCH-02: Lọc theo trạng thái (Status Filter)
- **Tiền điều kiện:** Đang ở `http://localhost:3000/`.
- **Các bước thực hiện:**
  1. Mở dropdown Status cạnh ô tìm kiếm, chọn **`New`**.
- **Kết quả mong đợi:**
  - Thanh URL đổi thành: `http://localhost:3000/?status=NEW`.
  - Network tab gọi: `GET /projects?status=NEW&...`.
  - Bảng chỉ hiển thị các dự án có cột Status là `New`.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-SEARCH-03: Kết hợp Từ khóa + Trạng thái
- **Tiền điều kiện:** Đang ở `http://localhost:3000/`.
- **Các bước thực hiện:**
  1. Nhập từ khóa: `"IOC"`.
  2. Chọn Status: `"In progress"`.
- **Kết quả mong đợi:**
  - URL: `http://localhost:3000/?keyword=IOC&status=INP`.
  - Network tab: `GET /projects?keyword=IOC&status=INP&...`.
  - Kết quả trả về đúng dự án thỏa mãn đồng thời cả 2 điều kiện.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-SEARCH-04: Nút Reset Search khôi phục toàn bộ
- **Tiền điều kiện:** Đang có kết quả lọc từ TC-SEARCH-03 (`?keyword=IOC&status=INP`).
- **Các bước thực hiện:**
  1. Bấm vào nút **`Reset search`** (dòng chữ link màu xanh cạnh nút Search).
- **Kết quả mong đợi:**
  - Ô Textbox tìm kiếm được xóa trắng.
  - Dropdown Status trở về mục mặc định `Please select a status`.
  - Các ô trong Advanced Filter (nếu có) đều bị xóa trắng.
  - Thanh URL trở về sạch sẽ: `http://localhost:3000/`.
  - Bảng tự động nạp lại đầy đủ danh sách tất cả các dự án ban đầu.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-ADV-01: Đóng/Mở bảng Lọc nâng cao (Advanced Filter Panel)
- **Tiền điều kiện:** Đang ở `http://localhost:3000/`.
- **Các bước thực hiện:**
  1. Click vào icon chiếc phễu (nút vuông cạnh nút Reset).
  2. Click lại icon chiếc phễu lần 2.
- **Kết quả mong đợi:**
  - Lần 1: Bảng Lọc nâng cao trượt mở ra với 4 mục:
    - Group (Leader Visa) - dropdown
    - Member Visa - input autocomplete
    - Start Date (From) & Start Date (To)
    - End Date (From) & End Date (To)
  - Lần 2: Bảng lọc nâng cao thu gọn biến mất.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-ADV-02: Lọc nâng cao theo Group (Leader Visa)
- **Tiền điều kiện:** Mở Advanced Filter.
- **Các bước thực hiện:**
  1. Ở ô `Group (Leader Visa)`, chọn một leader visa trong dropdown (ví dụ: `DTH`).
- **Kết quả mong đợi:**
  - URL cập nhật: `?leaderVisa=DTH`.
  - Network tab gọi: `GET /projects?leaderVisa=DTH&...`.
  - Bảng chỉ hiển thị các dự án thuộc nhóm do `DTH` làm trưởng nhóm.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-ADV-03: Lọc nâng cao theo Member Visa (Dùng MemberSuggest)
- **Tiền điều kiện:** Mở Advanced Filter.
- **Các bước thực hiện:**
  1. Ở ô `Member Visa`, gõ chữ `b`.
  2. Chọn `BHU` từ danh sách gợi ý.
- **Kết quả mong đợi:**
  - URL cập nhật: `?memberVisas=BHU`.
  - Network tab gọi: `GET /projects?memberVisas=BHU&...`.
  - Bảng chỉ hiển thị các dự án có thành viên mang visa `BHU`.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-ADV-04: Lọc sạch Param rỗng (Clean Params Rule)
- **Tiền điều kiện:** Đang ở `http://localhost:3000/`.
- **Các bước thực hiện:**
  1. Mở Network tab $\rightarrow$ Clear log.
  2. Refresh trang (F5) khi chưa search gì cả.
  3. Bấm vào request `/projects` đầu tiên trong Network tab để soi chi tiết URL.
- **Kết quả mong đợi:**
  - URL request gửi đi là:  
    👉 `http://localhost:8080/projects?page=0&size=5&sort=projectNumber,asc`
  - **TUYỆT ĐỐI KHÔNG CÓ** các param rỗng nối đuôi như: `searchTerm=&status=&leaderVisa=&memberVisas=&startDateFrom=...` (Đảm bảo backend Spring Boot không bị lỗi parse chuỗi rỗng).
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-NAV-01: Đồng bộ 2 chiều với nút Back/Forward của trình duyệt
- **Tiền điều kiện:** Đang ở `http://localhost:3000/`.
- **Các bước thực hiện:**
  1. Gõ từ khóa `"Facturation"` $\rightarrow$ URL thành `?keyword=Facturation`.
  2. Bấm vào menu **Project** (New Project) ở Sidebar $\rightarrow$ URL thành `/project/new`.
  3. Bấm nút **Back** của trình duyệt (mũi tên quay lại góc trên bên trái của Chrome).
  4. Quan sát URL, giá trị ô tìm kiếm và danh sách dự án.
- **Kết quả mong đợi:**
  - URL tự động phục hồi lại: `http://localhost:3000/?keyword=Facturation`.
  - Ô tìm kiếm tự động điền lại chữ `"Facturation"`.
  - Danh sách bảng tự động tải lại đúng dự án Facturation (hoàn toàn đồng bộ, không bị lệch pha giữa URL và giao diện).
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

## NHÓM 5: XÓA DỰ ÁN (US02 - DELETE RULES)

### TC-DEL-01: Popup xác nhận khi Xóa đơn lẻ (Single Delete Confirmation)
- **Tiền điều kiện:** Tìm một dự án có trạng thái `NEW` (ví dụ số `3116`).
- **Các bước thực hiện:**
  1. Bấm vào icon thùng rác ở cột Delete của dòng `3116`.
  2. Quan sát hộp thoại popup mở ra.
  3. Bấm nút **`Cancel`** trong popup.
- **Kết quả mong đợi:**
  - Hộp thoại Modal bật lên yêu cầu xác nhận với câu hỏi rõ ràng (ví dụ: `Are you sure you want to delete project 3116?`).
  - Khi bấm Cancel: Popup đóng lại, dự án `3116` vẫn còn nguyên vẹn trên bảng, không có API xóa nào được gọi.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-DEL-02: Xác nhận xóa đơn lẻ thành công
- **Tiền điều kiện:** Dự án `3116` có status `NEW`.
- **Các bước thực hiện:**
  1. Bấm vào icon thùng rác của dòng `3116`.
  2. Trong popup xác nhận, bấm nút **`OK`** (hoặc Confirm).
  3. Quan sát Network tab và bảng.
- **Kết quả mong đợi:**
  - Network tab: Gửi request **`DELETE http://localhost:8080/projects/1`** (hoặc `/projects/{id}`).
  - Backend trả về mã **`204 No Content`**.
  - Dòng dự án `3116` lập tức biến mất khỏi bảng danh sách.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-DEL-03: Chọn nhiều dòng hiển thị thanh đếm (Multi-selection Bar)
- **Tiền điều kiện:** Đang ở trang danh sách dự án.
- **Các bước thực hiện:**
  1. Tick vào checkbox ở đầu dòng thứ nhất.
  2. Tick vào checkbox ở đầu dòng thứ hai.
- **Kết quả mong đợi:**
  - Cả 2 dòng được đổi màu nền highlight (selected-row).
  - Phía dưới bảng xuất hiện thanh công cụ chọn nhiều với thông điệp:  
    👉 **`2 items selected`** kèm theo nút màu đỏ **`Delete selected projects`** (có icon thùng rác).
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-DEL-04: Xóa hàng loạt nhiều dự án NEW thành công
- **Tiền điều kiện:** Chọn 2 dự án đều có trạng thái là `NEW`.
- **Các bước thực hiện:**
  1. Tick chọn 2 dự án trạng thái `NEW`.
  2. Bấm vào nút màu đỏ **`Delete selected projects`**.
  3. Trong popup xác nhận, bấm **`OK`**.
- **Kết quả mong đợi:**
  - Network tab: Gửi request **`DELETE http://localhost:8080/projects`** với Body là mảng chứa danh sách ID: `[id1, id2]`.
  - Backend trả về **`204 No Content`**.
  - Cả 2 dự án biến mất khỏi bảng; thanh đếm selection tự động ẩn đi.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-DEL-05: Quy tắc CHẶN XÓA khi có dự án khác trạng thái NEW
- **Tiền điều kiện:** Trên bảng có 1 dự án `NEW` và 1 dự án `INP` (In progress).
- **Các bước thực hiện:**
  1. Tick chọn dòng dự án `NEW`.
  2. Tick tiếp dòng dự án `INP`.
  3. Bấm vào nút **`Delete selected projects`**.
- **Kết quả mong đợi:**
  - Hệ thống **LẬP TỨC CHẶN LẠI**, không mở popup và không gửi request DELETE xuống backend.
  - Xuất hiện banner màu đỏ cảnh báo nghiêm ngặt:  
    👉 **`Only projects with status "New" can be deleted`**
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

## NHÓM 6: ĐA NGÔN NGỮ (I18N - ENGLISH / FRENCH)

### TC-I18N-01: Chuyển đổi ngôn ngữ Tiếng Anh $\rightarrow$ Tiếng Pháp (EN $\rightarrow$ FR)
- **Tiền điều kiện:** Đang ở bất kỳ trang nào (ví dụ trang danh sách).
- **Các bước thực hiện:**
  1. Nhìn lên góc trên bên phải thanh Header.
  2. Click vào liên kết **`FR`** (hoặc cờ Pháp).
  3. Quan sát toàn bộ giao diện màn hình.
- **Kết quả mong đợi:**
  - Toàn bộ từ ngữ chuyển sang tiếng Pháp chuẩn:
    - Tiêu đề: `Projects List` $\rightarrow$ **`Liste des projets`**
    - Menu: `Project` $\rightarrow$ **`Projet`**
    - Bảng: `Number`, `Name`, `Status`, `Customer`, `Start Date`, `Delete` $\rightarrow$ **`Numéro`**, **`Nom`**, **`Statut`**, **`Client`**, **`Date de début`**, **`Supprimer`**.
    - Bộ lọc ngày: `Start Date (From)` $\rightarrow$ **`Date début (De)`**; `Start Date (To)` $\rightarrow$ **`Date début (À)`**.
  - Mọi request gửi xuống backend có đính kèm header: `Accept-Language: fr`.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

### TC-I18N-02: Chuyển đổi ngôn ngữ Tiếng Pháp $\rightarrow$ Tiếng Anh (FR $\rightarrow$ EN)
- **Tiền điều kiện:** Đang ở giao diện tiếng Pháp.
- **Các bước thực hiện:**
  1. Click vào liên kết **`EN`** trên thanh Header.
- **Kết quả mong đợi:**
  - Toàn bộ chữ chuyển lại về tiếng Anh chuẩn ban đầu.
  - Header request gửi backend: `Accept-Language: en`.
- **Đánh giá:** [ ] PASS  [ ] FAIL

---

## 📊 BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ (TEST SUMMARY)

| Nhóm chức năng | Số lượng Test Cases | Đạt (PASS) | Chưa đạt (FAIL) | Ghi chú lỗi (nếu có) |
| :--- | :---: | :---: | :---: | :--- |
| **Nhóm 1: Tạo mới Dự án (US01)** | 9 | [ ] | [ ] | |
| **Nhóm 2: Chỉnh sửa Dự án (US01)** | 6 | [ ] | [ ] | |
| **Nhóm 3: Hiển thị Bảng, Phân trang & Sort (US02)** | 4 | [ ] | [ ] | |
| **Nhóm 4: Tìm kiếm & Lọc nâng cao (US02)** | 6 | [ ] | [ ] | |
| **Nhóm 5: Quy tắc Xóa Dự án (US02)** | 5 | [ ] | [ ] | |
| **Nhóm 6: Đa ngôn ngữ i18n (EN/FR)** | 2 | [ ] | [ ] | |
| **TỔNG CỘNG** | **32 Test Cases** | | | |

---
*Tài liệu này được tạo độc lập để phục vụ kiểm thử thủ công và nghiệm thu sản phẩm PIM Tool.*
