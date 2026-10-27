# Phân công trách nhiệm chéo (Cross-Responsibility Assignment)

Để đảm bảo hệ thống là một khối thống nhất và mỗi cá nhân có năng lực Fullstack (Lát cắt dọc), nhóm phân công như sau:

| Thành viên | Phụ trách Nghiệp vụ (Vertical Slice) | Trách nhiệm chéo toàn hệ thống (Cross-Responsibility) |
| :--- | :--- | :--- |
| **Tường (SV1)** | Giao diện Khách (Public) & Công dân | **Hệ thống thiết kế (Design System) & A11y:** Chịu trách nhiệm file `style.css` (biến màu, font). Xử lý Navigation, Role Switcher và chuẩn khả năng tiếp cận (thẻ alt, focus-visible). |
| **Nam (SV2)** | Không gian Biên tập viên (Editor) | **Kiến trúc JS & AI UX:** Chịu trách nhiệm file `api.js`. Xây dựng dữ liệu giả lập JSON, xử lý localStorage và quy chuẩn giao diện 6 bước tương tác AI (bao gồm AI Failure UX). |
| **Thành (SV3)**| Không gian Quản trị viên (Admin) | **Responsive, QA & Deploy:** Chịu trách nhiệm file `responsive.css` (đảm bảo không vỡ khung 320px/768px). Quản lý GitHub (Merge PR) và triển khai web lên Vercel/GitHub Pages. |

---

## Chi tiết từng vai trò

### 👤 Tường (SV1) - Public & Citizen + Design System
**Trang phụ trách (5 trang):**
- `index.html` (Trang chủ)
- `pages/public/public-procedure-search.html` (Tìm kiếm)
- `pages/public/public-procedure-detail.html` (Chi tiết thủ tục)
- `pages/public/public-auth-login.html` (Đăng nhập)
- `pages/citizen/citizen-dashboard-view.html` (Dashboard Công dân)

**Trách nhiệm chéo:**
- File `css/style.css`: định nghĩa biến CSS, layout cơ bản, dark mode.
- File `js/ui-components.js`: `renderHeader()`, `renderSubnav()`.
- Chuẩn A11y: `alt`, `aria-label`, `focus-visible`.

---

### 👤 Nam (SV2) - Không gian Công dân (Citizen)
**Trang phụ trách (5 trang):**
- `pages/citizen/citizen-checklist-manage.html` (Checklist)
- `pages/citizen/citizen-application-create.html` (Nộp hồ sơ)
- `pages/citizen/citizen-application-track.html` (Theo dõi hồ sơ)
- `pages/citizen/citizen-notification-list.html` (Thông báo)
- `pages/citizen/citizen-account-settings.html` (Tài khoản)

**Trách nhiệm chéo:**
- File `js/api.js`: fetch JSON, cache.
- Xây dựng tất cả file JSON trong `assets/data/`.
- Xử lý localStorage toàn hệ thống (session, checklist, application drafts).
- Quy chuẩn giao diện 6 bước AI UX (bao gồm AI Failure UX).

---

### 👤 Thành (SV3) - Biên tập viên & Quản trị viên (Editor + Admin)
**Trang phụ trách (5 trang):**
- `pages/editor/editor-aialert-manage.html` (Cảnh báo AI)
- `pages/editor/editor-approval-queue.html` (Hàng đợi duyệt)
- `pages/admin/admin-dashboard-view.html` (Admin Dashboard)
- `pages/admin/admin-user-manage.html` (Quản lý người dùng)
- `pages/admin/admin-system-settings.html` (Cài đặt hệ thống)

**Trách nhiệm chéo:**
- File `css/responsive.css`: media queries 320px / 768px / 1024px+.
- Kiểm tra không vỡ khung trên mobile.
- Quản lý GitHub: merge PR, review code.
- Deploy lên Vercel hoặc GitHub Pages.
- File `pages/shared/shared-error-403.html` và `shared-error-404.html`.