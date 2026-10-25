# Đề xuất dự án (Project Proposal)

**Tên dự án:** CivicGuide - Hệ thống hỗ trợ thủ tục hành chính
**Mã đề tài:** BTL-23
**Lĩnh vực:** Dịch vụ công / GovTech

## 1. Ngữ cảnh (Context)
Hiện nay, việc tra cứu và chuẩn bị hồ sơ thủ tục hành chính trên các cổng Dịch vụ công (DVC) truyền thống thường gây khó khăn cho người dân do ngôn ngữ pháp lý phức tạp, thông tin rải rác và thiếu tính cá nhân hóa. Người dân mất nhiều thời gian để biết chính xác mình cần chuẩn bị giấy tờ gì cho hoàn cảnh cụ thể của mình.

## 2. Phát biểu vấn đề (Problem Statement)
*   **P1 (Với Công dân):** Không biết bắt đầu từ đâu khi có nhu cầu thực hiện thủ tục (VD: Kết hôn, khai sinh), thường chuẩn bị thiếu giấy tờ dẫn đến phải đi lại nhiều lần.
*   **P2 (Với Công dân):** Khó theo dõi tiến độ hồ sơ một cách trực quan, không nhận được cảnh báo kịp thời khi cần bổ sung giấy tờ.
*   **P3 (Với Biên tập viên):** Khó khăn trong việc theo dõi sự thay đổi của pháp luật để cập nhật hướng dẫn thủ tục kịp thời, dễ xảy ra sai sót.
*   **P4 (Với Quản trị viên):** Thiếu công cụ giám sát tổng thể để biết khu vực nào/loại thủ tục nào đang bị ùn tắc để điều phối nguồn lực.

## 3. Mục tiêu dự án (Objectives)
*   **O1:** Cung cấp công cụ tìm kiếm và lọc thủ tục hành chính thân thiện, dễ hiểu.
*   **O2:** Trợ lý AI giúp phân tích ngữ cảnh người dùng để đề xuất các thủ tục liên quan.
*   **O3:** Cho phép người dân tạo và quản lý Checklist giấy tờ cần chuẩn bị.
*   **O4:** Mô phỏng quy trình nộp hồ sơ trực tuyến (Wizard 3 bước) và theo dõi trạng thái.
*   **O5:** Cung cấp không gian làm việc cho Biên tập viên cập nhật nội dung thủ tục.
*   **O6:** AI hỗ trợ Biên tập viên rà soát các thay đổi luật từ Cổng DVC Quốc gia.
*   **O7:** Bảng điều khiển (Dashboard) dành cho Quản trị viên để giám sát KPI và dự báo ùn tắc.

## 4. Các thực thể dữ liệu chính (Entities)
1.  **User:** Lưu trữ thông tin tài khoản (ID, Name, Role, Email, Status).
2.  **Procedure:** Lưu thông tin thủ tục (ID, Title, Category, Checklist_Template, Status, Last_Updated).
3.  **Application:** Lưu hồ sơ người dân nộp (ID, User_ID, Procedure_ID, Status, Submitted_Date, Activity_Logs).
4.  **AI_Alert:** Cảnh báo thay đổi luật pháp do AI phát hiện (ID, Procedure_ID, Risk_Level, Description, Status).