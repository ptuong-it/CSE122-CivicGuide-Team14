# CivicGuide

CivicGuide là ứng dụng hướng dẫn thủ tục hành chính với giao diện HTML/CSS và backend JavaScript thuần trên Node.js. Dữ liệu được lưu trong các tệp JSON tại `assets/data/`.

## Chạy ứng dụng

Yêu cầu Node.js 18 trở lên. Không cần cài thư viện bên ngoài.

```powershell
npm start
```

Mở <http://localhost:3000>. Có thể đổi cổng bằng biến môi trường `PORT`.

## Tài khoản demo

Các tài khoản mẫu được tạo tự động khi khởi động lần đầu:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Công dân | `citizen@civicguide.vn` | `Civic123!` |
| Cán bộ | `officer@civicguide.vn` | `Civic123!` |
| Biên tập viên | `editor@civicguide.vn` | `Civic123!` |
| Quản trị viên | `admin@civicguide.vn` | `Civic123!` |

## Chức năng chính

- Tra cứu thủ tục theo từ khóa/lĩnh vực, xem quy trình và hỏi đáp theo dữ liệu CivicGuide.
- Đăng ký, đăng nhập, quản lý hồ sơ cá nhân và theo dõi hồ sơ minh họa.
- Lưu tiến độ danh sách giấy tờ cần chuẩn bị.
- Cán bộ gửi nội dung thủ tục để chờ duyệt, quản lý câu hỏi thường gặp và xử lý góp ý.
- Biên tập viên duyệt nội dung, theo dõi lần cập nhật và quản lý nguồn tham khảo.
- Quản trị viên xem số liệu, quản lý danh mục và phân quyền tài khoản.

## Lưu ý về bản demo

Đây là ứng dụng chạy cục bộ phục vụ học tập, không gửi hồ sơ đến cơ quan nhà nước. Tài khoản mẫu và dữ liệu JSON chỉ phù hợp để phát triển/demo; session được lưu trong bộ nhớ máy chủ và bị đăng xuất khi máy chủ khởi động lại. Chức năng gửi email khôi phục mật khẩu và tích hợp cổng dịch vụ công chưa được cấu hình.