# CivicGuide

CivicGuide là một mô hình thử nghiệm bằng tiếng Việt dùng để tra cứu các thủ tục dịch vụ công, chuẩn bị danh mục tài liệu mẫu và mô phỏng việc theo dõi hồ sơ. Đây chỉ là bản demo giao diện; đây không phải là dịch vụ chính thức của chính phủ và tuyệt đối không được sử dụng với giấy tờ định danh hay dữ liệu cá nhân thực tế.

## Chạy cục bộ (Local)

Khởi chạy thư mục gốc của repository qua giao thức HTTP (ví dụ: sử dụng extension **Live Server** trong VS Code và mở file `index.html`). Các trang sẽ tải dữ liệu JSON mẫu bằng hàm `fetch`, do đó việc mở trực tiếp file HTML qua giao thức `file://` có thể khiến dữ liệu không tải được.

## Cấu trúc dự án

| Vị trí | Vai trò / Nhiệm vụ |
| --- | --- |
| `index.html` | Trang chủ công khai |
| `pages/public/` | Các trang tìm kiếm, danh mục và chi tiết thủ tục, xác thực tài khoản, trợ giúp, liên hệ và bảo mật |
| `pages/citizen/` | Bảng điều khiển công dân, danh mục tài liệu, thủ tục đã lưu, quy trình nộp hồ sơ, theo dõi hồ sơ, thông báo và cài đặt tài khoản |
| `pages/editor/` | Tổng quan biên tập viên, quản lý/chỉnh sửa thủ tục, hàng đợi phê duyệt và cảnh báo kiểm duyệt AI |
| `pages/admin/` | Tổng quan hệ thống, quản lý nội dung thủ tục, phân quyền người dùng và cài đặt hệ thống |
| `pages/shared/` | Màn hình truy cập bị từ chối (403) và không tìm thấy trang (404) |
| `css/style.css` | Thiết lập thiết kế cơ bản (design tokens) và kiểu dáng các component dùng chung |
| `css/components.css` | Kiểu dáng chi tiết cho trang và các component |
| `css/responsive.css` | Ghi đè giao diện mẫu CivicGuide và các quy tắc giao diện phản hồi (responsive layout) |
| `js/main.js` | Xử lý giao diện dùng chung, tìm kiếm và hiển thị thông báo toast |
| `js/ui-components.js` | Thanh điều hướng/Header cho Admin & Editor, và các thao tác bảng/form demo |
| `js/modules/` | Xử lý tính năng riêng biệt cho các màn hình public, citizen và admin |
| `assets/data/` | Dữ liệu JSON mẫu cho thủ tục, người dùng, hồ sơ, danh mục tài liệu, thông báo và cảnh báo AI |
| `design/mockups/` | Màn hình giao diện mẫu dạng PDF được sử dụng để tham chiếu |

## Bảng ánh xạ Màn hình - Trang (Screen-to-page map)

| Nhóm giao diện | Trang tương ứng |
| --- | --- |
| Khám phá dịch vụ công (01) | `index.html`, `pages/public/public-service-catalog.html`, `pages/public/public-procedure-search.html`, `pages/public/public-procedure-detail.html` |
| Xác thực tài khoản (02) | `pages/public/public-auth-login.html`, `pages/public/public-auth-register.html`, `pages/public/public-password-reset.html` |
| Không gian công dân (03, 05) | `pages/citizen/citizen-dashboard-view.html`, `pages/citizen/citizen-checklist-home.html`, `pages/citizen/citizen-checklist-manage.html`, `pages/citizen/citizen-procedure-saved.html`, `pages/citizen/citizen-account-settings.html`, `pages/citizen/citizen-notification-list.html` |
| Quy trình nộp hồ sơ (04) | `pages/citizen/citizen-application-create.html` (Luồng 3 bước động có kiểm tra dữ liệu và gửi hồ sơ) |
| Theo dõi và trợ giúp (05, 06) | `pages/citizen/citizen-application-track.html`, `pages/citizen/citizen-application-detail.html`, `pages/public/public-help-center.html`, `pages/public/public-contact-support.html`, `pages/shared-terms-privacy.html` |
| Biên tập và quản trị (07) | `pages/editor/editor-dashboard-view.html`, `pages/editor/editor-procedure-manage.html`, `pages/editor/editor-procedure-edit.html`, `pages/editor/editor-approval-queue.html`, `pages/editor/editor-aialert-manage.html`, `pages/admin/admin-dashboard-view.html`, `pages/admin/admin-procedure-manage.html`, `pages/admin/admin-user-manage.html`, `pages/admin/admin-system-settings.html` |
| Xử lý lỗi | `pages/shared/shared-error-403.html`, `pages/shared/shared-error-404.html` |

Các trang nằm trong thư mục tương ứng với vai trò bên dưới thư mục `pages/`. Script tính năng được tải bởi trang HTML sử dụng nó; các tệp style dùng chung và `main.js` được tải ở tất cả các màn hình.