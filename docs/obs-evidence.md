# Minh chứng Video OBS - Nhóm 14 (CivicGuide)

Theo quy chế của học phần CSE122, nhóm 14 đính kèm danh sách video minh chứng OBS cho toàn bộ 15 màn hình giao diện cốt lõi đã thiết kế (mỗi thành viên 5 màn hình).

**Quy tắc đặt tên video:** `SVx-XX-tên-màn-hình.mp4`  
*(Yêu cầu bắt buộc trong video: Bật webcam rõ mặt, thu âm giọng nói thật, giải thích cấu trúc HTML/CSS/JS, gõ code chỉnh sửa trực tiếp (live code) 1 dòng, thực hiện git commit & push trên terminal).*

---

## 👨‍💻 SV1: Tường (Public & Công dân + Design System)

| # | Màn hình | Tệp giao diện | Video OBS (Link Drive/Youtube) | Ghi chú kiểm thử |
| :-: | :--- | :--- | :--- | :--- |
| 1 | Trang chủ | `index.html` | [Chưa điền link] | Live code hero / search form, giải thích biến CSS |
| 2 | Đăng nhập | `pages/public/public-auth-login.html` | [Chưa điền link] | Demo validation error, lưu session LocalStorage |
| 3 | Tra cứu thủ tục | `pages/public/public-procedure-search.html` | [Chưa điền link] | Demo filter, empty/loading state, phân trang |
| 4 | Chi tiết thủ tục | `pages/public/public-procedure-detail.html` | [Chưa điền link] | Live code render dữ liệu từ JSON theo URL params `?id=` |
| 5 | Dashboard Công dân | `pages/citizen/citizen-dashboard-view.html` | [Chưa điền link] | Demo gợi ý thủ tục (AI-1), link nhanh |

---

## 👨‍💻 SV2: Nam (Không gian Công dân)

| # | Màn hình | Tệp giao diện | Video OBS (Link Drive/Youtube) | Ghi chú kiểm thử |
| :-: | :--- | :--- | :--- | :--- |
| 6 | Quản lý Checklist | `pages/citizen/citizen-checklist-manage.html` | [Chưa điền link] | Demo tick checkbox, lưu tiến độ LocalStorage, tính % |
| 7 | Nộp hồ sơ (Wizard) | `pages/citizen/citizen-application-create.html` | [Chưa điền link] | Demo wizard 3 bước, validate form, upload file, submit |
| 8 | Theo dõi hồ sơ | `pages/citizen/citizen-application-track.html` | [Chưa điền link] | Demo filter trạng thái, tìm kiếm, render bảng động |
| 9 | Thông báo | `pages/citizen/citizen-notification-list.html` | [Chưa điền link] | Demo lọc thông báo, đánh dấu đã đọc |
| 10| Tài khoản & Bảo mật | `pages/citizen/citizen-account-settings.html` | [Chưa điền link] | Demo đổi thông tin, tùy chọn thông báo |

---

## 👨‍💻 SV3: Thành (Editor + Admin + Responsive & Deploy)

| # | Màn hình | Tệp giao diện | Video OBS (Link Drive/Youtube) | Ghi chú kiểm thử |
| :-: | :--- | :--- | :--- | :--- |
| 11| Quản lý AI Alerts (AI-2) | `pages/editor/editor-aialert-manage.html` | [Chưa điền link] | Demo AI rà soát & AI Failure UX (6 bước) |
| 12| Hàng đợi phê duyệt | `pages/editor/editor-approval-queue.html` | [Chưa điền link] | Demo so sánh 2 phiên bản, duyệt/từ chối |
| 13| Dashboard Admin (AI-3) | `pages/admin/admin-dashboard-view.html` | [Chưa điền link] | Demo KPI động, Chart.js, AI dự báo ùn tắc |
| 14| Quản lý người dùng | `pages/admin/admin-user-manage.html` | [Chưa điền link] | Demo bảng CRUD, filter, panel chi tiết, đổi trạng thái |
| 15| Cài đặt hệ thống | `pages/admin/admin-system-settings.html` | [Chưa điền link] | Demo cấu hình nguồn API, test responsive trên mobile |

---

## 📌 Ghi chú bổ sung cho giảng viên

- **Tường (SV1)** phụ trách 5 màn hình: Trang chủ, Đăng nhập, Tra cứu, Chi tiết, Dashboard Công dân. Trách nhiệm chéo: Design System & A11y (`style.css`, `ui-components.js`).
- **Nam (SV2)** phụ trách 5 màn hình thuộc Không gian Công dân: Checklist, Nộp hồ sơ, Theo dõi, Thông báo, Tài khoản. Trách nhiệm chéo: Kiến trúc JS & AI UX (`api.js`, JSON, `editor-ai.js`, localStorage).
- **Thành (SV3)** phụ trách 5 màn hình Editor + Admin: AI Alerts, Hàng đợi duyệt, Admin Dashboard, Quản lý người dùng, Cài đặt hệ thống. Trách nhiệm chéo: Responsive, QA & Deploy (`responsive.css`, GitHub, Vercel).
- Mỗi video đều có **live code 1 dòng** và **git commit & push** trên terminal như yêu cầu môn học.