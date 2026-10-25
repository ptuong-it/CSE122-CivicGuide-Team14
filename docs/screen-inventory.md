# Bảng kiểm kê màn hình (Screen Inventory)
**Dự án:** CivicGuide (BTL-23) - Hệ thống hỗ trợ thủ tục hành chính  
**Thành viên:** Phạm Chí Tường (SV1), Nam (SV2), Thành (SV3)  
**Quy mô hệ thống:** 15 màn hình cốt lõi (5 màn hình/thành viên) + 11 màn hình mở rộng (Tổng cộng 26 màn hình HTML hoàn chỉnh).

---

## 1. Bảng kiểm kê 15 màn hình cốt lõi (Core Prototype Screens)
*Phục vụ đánh giá cá nhân chuẩn (5 màn hình/SV), quay video minh chứng OBS và kiểm tra các trạng thái giao diện + AI UX.*

| # | Vai trò | Mục tiêu người dùng | Nhiệm vụ người dùng | Màn hình | Tệp giao diện | CRUD | Trạng thái (UI States) | Tích hợp AI | Phụ trách | Mã việc | Nhánh Git | OBS |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **I** | **Khách & Công dân** | | | | | | | | **Tường (SV1)** | | | |
| 1 | Khách | Khám phá hệ thống | Tìm kiếm, xem danh mục dịch vụ nổi bật | Trang chủ | `index.html` | R | Normal | Không | Tường | TASK-01 | `feature/home` | [Link] |
| 2 | Khách | Truy cập hệ thống | Điền thông tin đăng nhập tài khoản | Đăng nhập | `pages/public/public-auth-login.html` | C, R | Normal, Error (sai thông tin) | Không | Tường | TASK-03 | `feature/auth` | [Link] |
| 3 | Công dân | Quản lý công việc | Xem tổng quan hồ sơ & nhận gợi ý DVC | Dashboard Công dân | `pages/citizen/citizen-dashboard-view.html` | R | Normal, Empty | **AI-1** (Gợi ý DVC theo ngữ cảnh) | Tường | TASK-05 | `feature/cit-dash` | [Link] |
| 4 | Công dân | Chuẩn bị giấy tờ | Tạo, đánh dấu checklist giấy tờ cá nhân | Quản lý Checklist | `pages/citizen/citizen-checklist-manage.html` | C, R, U | Normal, Success | Không | Tường | TASK-04 | `feature/cit-check` | [Link] |
| 5 | Công dân | Nộp hồ sơ dịch vụ | Điền hồ sơ trực tuyến qua Wizard 3 bước | Nộp hồ sơ (Wizard) | `pages/citizen/citizen-application-create.html` | C | Normal, Error (Validate), Success | Không | Tường | TASK-04 | `feature/cit-apply` | [Link] |
| **II**| **Biên tập viên** | | | | | | | | **Nam (SV2)** | | | |
| 6 | Biên tập | Giám sát nội dung | Xem thống kê số lượng thủ tục và cảnh báo | Dashboard Biên tập | `pages/editor/editor-dashboard-view.html` | R | Normal, Empty | Không | Nam | TASK-08 | `feature/ed-dash` | [Link] |
| 7 | Biên tập | Quản lý dữ liệu | Lọc, tra cứu danh sách các thủ tục DVC | Quản lý danh sách thủ tục | `pages/editor/editor-procedure-manage.html` | R, U | Normal, Filter, Empty | Không | Nam | TASK-08 | `feature/ed-manage` | [Link] |
| 8 | Biên tập | Cập nhật thông tin | Chỉnh sửa biểu mẫu, giấy tờ, căn cứ pháp lý | Biên tập thủ tục | `pages/editor/editor-procedure-edit.html` | R, U | Normal, Loading, Success | Không | Nam | TASK-08 | `feature/ed-edit` | [Link] |
| 9 | Biên tập | Kiểm duyệt nội dung | Rà soát hàng đợi các bản thảo chờ phê duyệt | Hàng đợi phê duyệt | `pages/editor/editor-approval-queue.html` | R, U | Normal, Empty, Filter | Không | Nam | TASK-09 | `feature/ed-queue` | [Link] |
| 10| Biên tập | Đồng bộ pháp lý | Xử lý cảnh báo rà soát thay đổi luật pháp | Quản lý AI Alerts | `pages/editor/editor-aialert-manage.html` | R, U, D | Normal, Loading, AI Failure | **AI-2** (Rà soát đồng bộ pháp lý) | Nam | TASK-09 | `feature/ed-ai` | [Link] |
| **III**| **Quản trị viên & Tìm kiếm** | | | | | | | | **Thành (SV3)** | | | |
| 11| Khách / Công dân | Tìm thủ tục | Tra cứu DVC theo từ khóa, cơ quan, lĩnh vực | Tra cứu thủ tục | `pages/public/public-procedure-search.html` | R | Loading, Empty, Normal | Không | Thành | TASK-14 | `feature/search` | [Link] |
| 12| Admin | Giám sát hệ thống | Theo dõi KPI hệ thống và dự báo ùn tắc hồ sơ | Dashboard Admin | `pages/admin/admin-dashboard-view.html` | R | Normal, Loading | **AI-3** (Dự báo ùn tắc hồ sơ) | Thành | TASK-15 | `feature/adm-dash` | [Link] |
| 13| Admin | Quản trị thủ tục | Giám sát toàn bộ trạng thái công khai của DVC | Quản trị thủ tục Admin | `pages/admin/admin-procedure-manage.html` | R, U | Normal, Filter | Không | Thành | TASK-15 | `feature/adm-proc` | [Link] |
| 14| Admin | Phân quyền hệ thống | Quản lý danh sách người dùng, khóa/mở quyền | Quản lý Người dùng | `pages/admin/admin-user-manage.html` | R, U | Normal, Success (Toast) | Không | Thành | TASK-16 | `feature/adm-user` | [Link] |
| 15| Admin | Thiết lập cấu hình | Cấu hình nguồn API, hạn ngạch và sao lưu | Cài đặt hệ thống | `pages/admin/admin-system-settings.html` | R, U | Normal, Saved | Không | Thành | TASK-16 | `feature/adm-set` | [Link] |

---

## 2. Phụ lục: Các màn hình mở rộng đã hoàn thiện trên Website (Extended Screens)
*Các màn hình bổ trợ đã được code và kết nối hoàn chỉnh vào luồng người dùng của hệ thống CivicGuide:*

| # | Nhóm vai trò | Màn hình | Tệp giao diện | Chức năng chính |
| :--- | :--- | :--- | :--- | :--- |
| 16 | Khách / Công dân | Chi tiết thủ tục | `pages/public/public-procedure-detail.html` | Xem toàn văn quy trình, hồ sơ yêu cầu, biểu mẫu tải về và hướng dẫn sự kiện |
| 17 | Khách / Công dân | Danh mục Dịch vụ công | `pages/public/public-service-catalog.html` | Phân loại toàn bộ thủ tục theo nhóm lĩnh vực (Hộ tịch, Cư trú, Đất đai, v.v.) |
| 18 | Khách | Đăng ký tài khoản | `pages/public/public-auth-register.html` | Form đăng ký tài khoản công dân mới kèm kiểm tra xác thực dữ liệu |
| 19 | Khách | Khôi phục mật khẩu | `pages/public/public-password-reset.html` | Quy trình gửi yêu cầu mã xác nhận và đặt lại mật khẩu |
| 20 | Khách / Công dân | Trung tâm trợ giúp (FAQ) | `pages/public/public-help-center.html` | Câu hỏi thường gặp, hướng dẫn sử dụng và hỗ trợ giải đáp |
| 21 | Khách / Công dân | Liên hệ hỗ trợ | `pages/public/public-contact-support.html` | Biểu mẫu phản ánh kiến nghị, gửi thông tin liên hệ |
| 22 | Dùng chung | Điều khoản & Quyền riêng tư | `pages/public/shared-terms-privacy.html` | Cam kết bảo mật thông tin, trách nhiệm dữ liệu và quy định sử dụng |
| 23 | Công dân | Trang chủ Checklist cá nhân | `pages/citizen/citizen-checklist-home.html` | Trung tâm điều hướng nhanh các mẫu checklist giấy tờ công dân |
| 24 | Công dân | Thủ tục đã lưu (Bookmark) | `pages/citizen/citizen-procedure-saved.html` | Danh sách thủ tục công dân đã gắn dấu sao để theo dõi |
| 25 | Công dân | Theo dõi & Chi tiết hồ sơ | `pages/citizen/citizen-application-track.html`<br>`pages/citizen/citizen-application-detail.html` | Bảng danh sách tiến độ hồ sơ đã nộp và trang chi tiết kết quả xử lý |
| 26 | Công dân | Thông báo & Tài khoản | `pages/citizen/citizen-notification-list.html`<br>`pages/citizen/citizen-account-settings.html` | Hộp thư thông báo biến động hồ sơ và giao diện quản lý hồ sơ cá nhân |
| 27 | Dùng chung | Xử lý lỗi 403 & 404 | `pages/shared/shared-error-403.html`<br>`pages/shared/shared-error-404.html` | Trang hiển thị khi không có quyền truy cập hoặc không tìm thấy đường dẫn |
