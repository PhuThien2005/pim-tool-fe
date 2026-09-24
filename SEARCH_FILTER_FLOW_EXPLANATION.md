# Phân Tích Luồng Code: Search & Advanced Filter

Tài liệu này giải thích chi tiết (từng dòng/từng khối code quan trọng) về cách tính năng **Tìm kiếm (Search)** và **Lọc nâng cao (Advanced Filter)** hoạt động trong PIM Tool Frontend. 

Luồng này luân chuyển giữa các phần theo thứ tự:
1. **Khởi tạo trạng thái ban đầu từ URL** (`ProjectContext.jsx`)
2. **Hiển thị giao diện & xử lý logic, đồng bộ State/URL trực tiếp** (`ProjectList.jsx`)
3. **Kích hoạt gọi API khi State thay đổi** (`ProjectContext.jsx` & `projectService.jsx`)

Dưới đây là phần giải thích đan xen theo trình tự luồng dữ liệu (Data Flow) thực tế.

---

## 1. Khởi tạo Trạng thái (State) từ URL 
*(File: `src/context/ProjectContext.jsx`)*

Khi ứng dụng vừa load, bước đầu tiên là phải "đọc" xem trên thanh địa chỉ URL có đang chứa tham số tìm kiếm nào không (ví dụ: `?searchTerm=abc&status=NEW`).

```javascript
// Khởi tạo đối tượng searchParams từ URL hiện tại của trình duyệt
const searchParams = new URLSearchParams(window.location.search);

// Tạo ra một object lưu trữ các tiêu chí tìm kiếm mặc định lúc mới vào trang
const initialCriteriaFromUrl = {
  // Lấy giá trị 'keyword', 'searchTerm' hoặc 'search' từ URL. Nếu không có thì để rỗng ''
  searchTerm: searchParams.get('keyword') || searchParams.get('searchTerm') || searchParams.get('search') || '',
  
  // Trạng thái dự án (status), viết hoa toàn bộ để đồng bộ với backend (VD: 'NEW', 'INP')
  status: (searchParams.get('status') || '').toUpperCase(),
  
  // Mã visa của Leader
  leaderVisa: searchParams.get('leaderVisa') || '',
  
  // Mã visa của Member. Xử lý đặc biệt: xóa các khoảng trắng thừa quanh dấu phẩy (VD: "DTH, BHU" -> "DTH,BHU")
  memberVisas: (searchParams.get('memberVisas') || searchParams.get('memberVisa') || '').replace(/\s*,\s*/g, ','),
  
  // Các trường ngày tháng
  startDateFrom: searchParams.get('startDateFrom') || '',
  startDateTo: searchParams.get('startDateTo') || '',
  endDateFrom: searchParams.get('endDateFrom') || '',
  endDateTo: searchParams.get('endDateTo') || '',
};

// Đưa object vừa tạo vào làm giá trị khởi tạo cho global state (State toàn cục)
const [searchCriteria, setSearchCriteriaState] = useState(initialCriteriaFromUrl);
```

**Tại sao làm ở đây?** Vì `ProjectContext` bọc toàn bộ ứng dụng (`App.js`), nên state này sẽ tồn tại suốt vòng đời app và cung cấp cho bất kỳ component nào cần.

---

## 2. Component Giao Diện (UI Layer)
*(File: `src/components/project/ProjectList.jsx`)*

Giao diện sẽ móc nối với Hook `useProjectList` để lấy ra các biến (state) và hàm xử lý.

```javascript
// Lấy ra các biến và hàm xử lý từ Custom Hook
const {
  searchInput, setSearchInput, statusInput, setStatusInput, 
  showAdvanced, setShowAdvanced, advInputs, handleAdvChange,
  handleSearch, handleReset
} = useProjectList();
```

Khi render ô Input Search cơ bản:
```jsx
<input
  type="text"
  className="pim-input input-keyword"
  placeholder={t('projectList.searchPlaceholder')}
  value={searchInput} // Ràng buộc với state searchInput
  onChange={(e) => setSearchInput(e.target.value)} // Cập nhật state ngay khi gõ
/>
```

Khi render các ô nhập liệu trong **Advanced Filter** (Lọc nâng cao), code sử dụng mảng `ADV_FIELDS` để tự động render (map) ra các ô input cho gọn gàng:

```jsx
{ADV_FIELDS.map(({ label, key, type, placeholder, isDate, isSelect, isMemberSuggest }) => (
  <div key={key} className="advanced-filter-item">
    {/* Label tương ứng */}
    <label className="advanced-filter-label" htmlFor={key}>{t(`projectList.${label}`)}</label>
    
    {/* Dựa vào loại field mà render component tương ứng */}
    {isDate ? (
      <LocaleDatePicker id={key} value={advInputs[key]} onChange={(val) => handleAdvChange(key, val)} />
    ) : isSelect ? (
      <select id={key} className="pim-select input-md" value={advInputs[key]} onChange={(e) => handleAdvChange(key, e.target.value)}>
        {/* Dropdown lấy danh sách groups để load các visa của Leader */}
      </select>
    ) : isMemberSuggest ? (
      {/* Ô tìm kiếm Member có khả năng gợi ý danh sách */}
      <MemberSuggest value={advInputs[key]} onChange={(v) => handleAdvChange(key, v)} employees={employees} />
    ) : (
      {/* Input text thông thường */}
      <input id={key} type={type} className="pim-input" placeholder={placeholder} value={advInputs[key]} onChange={(e) => handleAdvChange(key, e.target.value)} />
    )}
  </div>
))}
```

---

## 3. Xử lý Logic và Đồng Bộ Trạng Thái
*(File: `src/hooks/useProjectList.jsx`)*

Đây là "bộ não" của trang danh sách. Khi người dùng gõ vào ô tìm kiếm ở Bước 2, hàm `setSearchInput` làm thay đổi biến `searchInput`. Điều này sẽ kích hoạt các logic dưới đây:

### 3.1. Gom dữ liệu và format (Hàm `syncSearch`)
```javascript
// Hàm này có nhiệm vụ gom nhặt tất cả các input hiện tại và chuẩn hóa lại thành 1 object gọn gàng
const syncSearch = () => ({
  searchTerm: searchInput, 
  status: (statusInput || '').toUpperCase(),
  leaderVisa: (advInputs.leaderVisa || '').toUpperCase(), 
  // Loại bỏ khoảng trắng quanh dấu phẩy và chuyển thành chữ in hoa
  memberVisas: (advInputs.memberVisas || '').replace(/\s*,\s*/g, ',').toUpperCase(),
  startDateFrom: advInputs.startDateFrom, 
  startDateTo: advInputs.startDateTo,
  endDateFrom: advInputs.endDateFrom, 
  endDateTo: advInputs.endDateTo,
});
```

### 3.2. Đẩy thông số lên URL của trình duyệt (Hàm `updateUrlParams`)
```javascript
// Hàm này lấy object tìm kiếm, nếu trường nào có dữ liệu thì gắn vào URL
const updateUrlParams = (c) => {
  const params = {};
  if (c.searchTerm) params.searchTerm = c.searchTerm;
  if (c.status) params.status = c.status;
  // ... tương tự cho các trường khác
  
  // Dùng hàm setSearchParams của React Router để đổi URL trên thanh địa chỉ (thay vì push lịch sử mới, dùng replace: true để không làm dài lịch sử back)
  setSearchParams(params, { replace: true });
};
```

### 3.3. Tự động Search sau khi ngừng gõ (Debounce)
Người dùng không cần phải nhấn nút "Search" liên tục. Hook này dùng kỹ thuật **Debounce** để tự tìm kiếm sau khi người dùng ngừng gõ 350 milliseconds.

```javascript
useEffect(() => {
  if (isInitialMountDebounce.current) { isInitialMountDebounce.current = false; return; }
  
  // Hủy bỏ cái hẹn giờ cũ nếu người dùng vẫn đang gõ liên tiếp
  clearTimeout(debounceTimer.current);
  
  // Đặt một lịch hẹn 350ms sau sẽ thực thi code
  debounceTimer.current = setTimeout(() => {
    // 1. Gom dữ liệu
    const next = syncSearch();
    // 2. Lưu vào global Context (Điều này sẽ kích hoạt API chạy, xem phần 4)
    setSearchCriteria(next);
    // 3. Đẩy lên URL
    updateUrlParams(next);
  }, 350);
  
  // Hàm dọn dẹp (cleanup) khi component re-render
  return () => clearTimeout(debounceTimer.current);
  
// Effect này chạy MỖI KHI 1 trong 3 biến input này thay đổi
}, [searchInput, statusInput, advInputs]);
```

### 3.4. Xử lý nút "Back" của trình duyệt
Nếu người dùng nhấn nút Back, URL thay đổi, nhưng state nội bộ không tự động thay đổi. Đoạn code sau lắng nghe sự thay đổi URL để cập nhật lại UI:

```javascript
useEffect(() => {
  // Đọc các giá trị từ URL mới
  const kw = searchParams.get('searchTerm') || searchParams.get('keyword') || searchParams.get('search') || '';
  const st = (searchParams.get('status') || '').toUpperCase();
  // ... (đọc các param khác)

  // So sánh URL mới với State đang hiển thị trên UI. Nếu lệch nhau, thì ép UI cập nhật theo URL
  if (kw !== searchInput || st !== statusInput || /*...*/) {
    setSearchInput(kw);
    setStatusInput(st);
    setAdvInputs({
      leaderVisa: ld, memberVisas: mb,
      startDateFrom: sf, startDateTo: st2,
      endDateFrom: ef, endDateTo: et,
    });
  }
// Lắng nghe sự thay đổi của biến searchParams (từ hook useSearchParams)
}, [searchParams]);
```

---

## 4. Kích hoạt gọi API (Data Fetching)
*(File: `src/context/ProjectContext.jsx` & `src/services/projectService.jsx`)*

Lúc nãy, khi hàm debounce chạy, nó đã gọi `setSearchCriteria(next);`. Hàm này làm thay đổi state `searchCriteria` trong Context.

Trong `ProjectContext.jsx`, thư viện `@tanstack/react-query` đang theo dõi (lắng nghe) biến này:

```javascript
// Hàm useQuery sẽ TỰ ĐỘNG chạy lại queryFn mỗi khi một giá trị trong mảng queryKey bị thay đổi
const { data: pageResult = EMPTY_PAGE, isLoading: loading } = useQuery({
  // queryKey đóng vai trò như là định danh độc nhất. Khi searchCriteria thay đổi, queryKey thay đổi
  queryKey: ['projects', searchCriteria, currentPage, sortConfig],
  
  // Hàm thực hiện gọi API
  queryFn: async () => {
    // Tính toán trang hiện tại (Backend bắt đầu từ 0)
    const pageIndex = Math.max(0, currentPage - 1);
    
    // Gom chuỗi sort (VD: "projectNumber,asc")
    const sort = `${sortConfig.field},${sortConfig.direction}`;
    
    // Gọi tới service API
    return projectService.searchProjects(searchCriteria, { page: pageIndex, size: 5, sort });
  },
});
```

Sau đó, trong `projectService.jsx`, lời gọi này được dịch thành API Call thực sự:

```javascript
searchProjects: (criteria = {}, pageable = {}) =>
  apiClient.get('/projects', { 
    // Gộp tất cả các field của criteria (searchTerm, status, memberVisas...) và pageable (page, size, sort) 
    // thành các querystring gắn phía sau URL (VD: /projects?searchTerm=abc&status=NEW&page=0&size=5)
    params: { ...criteria, ...pageable } 
  }).then((r) => r.data),
```

### Tóm Lược Toàn Bộ Chu Trình Của Một Chữ Được Gõ:
1. Gõ chữ "DTH" vào ô Member Visa (`ProjectList.jsx`).
2. Kích hoạt sự kiện `onChange`, gọi hàm `handleAdvChange('memberVisas', 'DTH')` -> State `advInputs` thay đổi (`useProjectList.jsx`).
3. Hook `useEffect` lắng nghe `advInputs` nhận diện sự thay đổi. Nó chờ 350ms (Debounce).
4. Sau 350ms, hàm `syncSearch()` chạy để chuẩn hóa data (loại bỏ khoảng trắng, in hoa).
5. Kích hoạt `setSearchCriteria` lưu vào State tổng (`useProjectList.jsx`).
6. Kích hoạt `updateUrlParams` thay đổi URL trình duyệt thành `?memberVisas=DTH`.
7. `useQuery` trong `ProjectContext.jsx` thấy `searchCriteria` bị đổi, nó hủy kết quả cũ và gọi hàm `queryFn`.
8. `projectService.searchProjects` gửi request `GET /projects?memberVisas=DTH` xuống Backend Spring Boot.
9. Backend trả về List Project mới. `useQuery` nhận data và cập nhật biến `pageResult`.
10. `ProjectList.jsx` nhận được biến `projects` mới từ Context và re-render lại bảng danh sách dự án. 

Và thế là luồng được hoàn tất mượt mà!
