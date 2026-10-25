# Phân tích Vai trò và Tính năng (Roles & Features)

## 1. Các vai trò (Roles) trong hệ thống
Hệ thống CivicGuide được thiết kế phục vụ 3 nhóm người dùng chuyên biệt:

*   **Role 1: Công dân (Citizen)** 
    *   *Mục tiêu:* Nhanh chóng tìm hiểu thủ tục, chuẩn bị đủ giấy tờ và nộp hồ sơ mô phỏng.
    *   *Tính năng:* Đăng ký/Đăng nhập, Tìm kiếm, Tạo checklist, Nộp hồ sơ, Theo dõi tiến độ.
*   **Role 2: Biên tập viên (Editor)**
    *   *Mục tiêu:* Đảm bảo nội dung hướng dẫn thủ tục trên hệ thống luôn chính xác và cập nhật theo luật mới.
    *   *Tính năng:* Quản lý hàng đợi bài viết, Chỉnh sửa thủ tục, Xử lý cảnh báo thay đổi luật.
*   **Role 3: Quản trị viên (Admin)**
    *   *Mục tiêu:* Giám sát hệ thống, đảm bảo hiệu suất và quản lý quyền truy cập.
    *   *Tính năng:* Xem Dashboard KPI, Quản lý tài khoản (khóa/mở), Cấu hình hệ thống.

## 2. Tích hợp Trải nghiệm AI (AI UX)
Dự án áp dụng 3 tính năng AI đặc thù, tuân thủ luồng 6 bước (Input -> Processing -> Output -> Explain -> Control -> Save):

*   **AI 1: Đề xuất thủ tục theo ngữ cảnh (Dành cho Công dân)**
    *   *Mô tả:* Người dùng nhập "Tôi mới sinh con", AI phân tích và đề xuất gói: Đăng ký khai sinh + Cấp BHYT + Nhập hộ khẩu.
    *   *Giải thích (Explainability):* AI giải thích mức độ liên quan dựa trên từ khóa "sinh con".
*   **AI 2: Cảnh báo đồng bộ pháp lý (Dành cho Biên tập viên)**
    *   *Mô tả:* Tự động quét Cổng DVC Quốc gia, phát hiện giấy tờ mới bị thêm/bớt trong một thủ tục và tạo cảnh báo (Alert) rủi ro cao/thấp.
    *   *Xử lý lỗi (Failure UX):* Khi nguồn luật ngoài không truy cập được, AI hiển thị trạng thái "Không chắc chắn/Thiếu dữ liệu" và yêu cầu Biên tập viên kiểm tra thủ công.
*   **AI 3: Dự báo ùn tắc hồ sơ (Dành cho Admin)**
    *   *Mô tả:* Phân tích lượng hồ sơ nộp vào theo thời gian để dự báo khu vực/loại thủ tục sẽ quá tải trong tuần tới, giúp Admin có phương án điều phối.