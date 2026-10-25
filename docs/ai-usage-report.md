# Báo cáo khai báo sử dụng AI (AI Usage Report)

Tuân thủ quy chế môn học CSE122, nhóm khai báo việc sử dụng AI minh bạch như sau:

## 1. Trường hợp 1: Sử dụng AI để sinh cấu trúc dữ liệu giả lập (JSON)
*   **Công cụ:** ChatGPT (GPT-4o)
*   **Câu lệnh (Prompt):** "Viết cho tôi một file JSON chứa 5 tài khoản users (có role admin, editor, citizen) và một file JSON chứa 10 thủ tục hành chính có các trường: id, title, required_documents, fee."
*   **AI sinh ra:** Trả về 2 đoạn code JSON chuẩn format.
*   **Sinh viên chỉnh sửa:** Bổ sung thêm trường `status` và `last_updated_date` vào các thủ tục cho phù hợp với luồng Bảng kiểm kê màn hình của nhóm.
*   **Cách kiểm chứng:** Gọi thử hàm `fetch()` trong `api.js` để in dữ liệu ra console.
*   **Điều học được:** Cách thiết kế database schema cho frontend.

## 2. Trường hợp 2: Hỗ trợ CSS Responsive
*   **Công cụ:** Claude 3.5 Sonnet
*   **Câu lệnh (Prompt):** "Làm sao để cái table hiển thị danh sách hồ sơ của tôi không bị tràn màn hình khi xem trên iPhone SE (chiều rộng 320px)?"
*   **AI sinh ra:** AI đề xuất sử dụng `overflow-x: auto` bọc ngoài thẻ table hoặc chuyển đổi layout table thành các thẻ Card khi ở màn hình nhỏ (`@media (max-width: 768px)`).
*   **Sinh viên chỉnh sửa:** Áp dụng phương pháp đổi Table thành Card. Nhóm tự viết lại HTML structure cho Card và tự tinh chỉnh CSS margin/padding bằng biến hệ thống thay vì copy paste code CSS thuần của AI.
*   **Cách kiểm chứng:** Mở Chrome DevTools, kéo màn hình về 320px không thấy thanh cuộn ngang.
*   **Điều học được:** (Sinh viên tự đúc kết về kỹ thuật Mobile-first).

*(Ghi chú: Khi code gặp lỗi, nhóm sẽ tiếp tục cập nhật file này trước ngày nộp)*