# Phân công trách nhiệm chéo (Cross-Responsibility Assignment)

Để đảm bảo hệ thống là một khối thống nhất và mỗi cá nhân có năng lực Fullstack (Lát cắt dọc), nhóm phân công như sau:

| Thành viên | Phụ trách Nghiệp vụ (Vertical Slice) | Trách nhiệm chéo toàn hệ thống (Cross-Responsibility) |
| :--- | :--- | :--- |
| **Tường (SV1)** | Giao diện Khách (Public) & Công dân | **Hệ thống thiết kế (Design System) & A11y:** Chịu trách nhiệm file `style.css` (biến màu, font). Xử lý Navigation, Role Switcher và chuẩn khả năng tiếp cận (thẻ alt, focus-visible). |
| **Nam (SV2)** | Không gian Biên tập viên (Editor) | **Kiến trúc JS & AI UX:** Chịu trách nhiệm file `api.js`. Xây dựng dữ liệu giả lập JSON, xử lý localStorage và quy chuẩn giao diện 6 bước tương tác AI (bao gồm AI Failure UX). |
| **Thành (SV3)**| Không gian Quản trị viên (Admin) | **Responsive, QA & Deploy:** Chịu trách nhiệm file `responsive.css` (đảm bảo không vỡ khung 320px/768px). Quản lý GitHub (Merge PR) và triển khai web lên Vercel/GitHub Pages. |