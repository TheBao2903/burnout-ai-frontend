# 💻 Burnout AI Platform - Admin & User Web UI

Giao diện Web Frontend dành cho Người dùng (Daily Check-in, Kết quả Phân tích, Chat AI) và Quản trị viên Admin (Dashboard Sức khỏe Tổ chức, Top Stressors Leaderboard, Quản lý User Profile).

---

## 🛠️ THÔNG TIN KỸ THUẬT
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Ant Design (Table, Modal, Badges, Tabs) + Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts (Burnout Trend, Risk Distribution Progress, Dynamic Charts)
- **Routing**: React Router DOM v6

---

## 🚀 TÍNH NĂNG CHÍNH

### 1. Daily Check-in Survey v3.0 (Giao diện Khảo sát trạng thái)
- **Thiết kế tối ưu 4 bước gọn gàng**:
  1. *Năng lượng & Gắn kết* (Likert 1-5 cho Exhaustion & Disengagement).
  2. *Áp lực công việc* (Likert 1-5 cho Job Demands).
  3. *Giấc ngủ & Hồi phục* (Slider thời lượng ngủ + Likert đảo màu cho Điểm hồi phục).
  4. *Đánh giá quá tải* (Likert 1-5 Quá tải + Phân nhánh động lý do quá tải & trường nhập ý kiến riêng).
- **Tự động đồng bộ Work Baseline**: Hiển thị thẻ thông tin công việc cố định từ Profile (chức danh, giờ làm/ngày, ngày làm/tuần, số giờ OT trung bình).
- **GPS Location & Healing Places**: Tự động gợi ý công viên, spa, quán cà phê yên tĩnh dựa trên tọa độ GPS người dùng.

### 2. Dashboard Kết quả Phân tích & Xu hướng (User Analytics)
- **Thẻ Cảnh báo Allostatic Overload**: Hiển thị banner đỏ cảnh báo nguy cơ quá tải kéo dài khi 3 ngày liên tiếp kiệt sức cao & thiếu ngủ.
- **Biểu đồ Xu hướng 7 ngày (Rolling Stats)**: Hiển thị chỉ số trung bình trượt 7 ngày kèm mũi tên xu hướng (Tăng ↑, Giảm ↓, Ổn định →).
- **Lịch sử khảo sát**: Accordion xem lại chi tiết từng lần làm bài kiểm tra.

### 3. Dashboard Quản trị Tổ chức (Admin Dashboard)
- **Bảng xếp hạng yếu tố gây stress (Top Stressors Leaderboard)**:
  - Xếp hạng các nguyên nhân stress phổ biến nhất trong công ty (Quá nhiều việc, Deadline gấp, Thiếu hỗ trợ...).
  - Filter xem danh sách cụ thể từng nhân viên đang gặp phải yếu tố stress đó.
- **Tổng quan Sức khỏe Tổ chức (Org Health Overview)**:
  - Biểu đồ xu hướng rủi ro toàn công ty theo thời gian.
  - Phân bổ rủi ro (Critical, High, Medium, Low).
  - Danh sách nhân sự nguy cơ cao (High Risk Users Table) hỗ trợ hành động can thiệp sớm.
- **Quản lý Nhân sự & Phân quyền**:
  - Trang chi tiết profile hiển thị đầy đủ thông tin cá nhân & baseline công việc.
  - Chức năng vô hiệu hóa / kích hoạt tài khoản an toàn (Soft Delete, bảo lưu lịch sử).

---

## 📦 CẤU TRÚC THƯ MỤC FRONTEND

```
admin-ui/
├── src/
│   ├── components/         # Reusable UI components (LikertScale, Header, Navbar)
│   ├── constants/          # Survey v3.0 questions, Likert labels, Risk colors
│   ├── pages/              # Main App Pages
│   │   ├── AdminDashboard.tsx  # Admin Dashboard & Top Stressors Leaderboard
│   │   ├── ProfilePage.tsx     # User & Admin Profile Detail view
│   │   ├── SurveyTest.tsx      # Daily Check-in Survey & Analysis UI
│   │   ├── UserDashboard.tsx   # User personal dashboard
│   │   └── UsersPage.tsx       # Admin user management & soft delete
│   ├── services/           # Axios API services (admin, auth, survey, user)
│   ├── types/              # TypeScript interfaces (survey, admin, user)
│   ├── App.tsx             # Main Routing setup
│   └── main.tsx            # Entry point
├── package.json
└── README.md
```

---

## 🔧 CÀI ĐẶT & CHẠY ỨNG DỤNG

```bash
# 1. Cài đặt npm dependencies
npm install

# 2. Khởi chạy Development Server
npm run dev

# 3. Build sản phẩm (Typecheck & Vite production build)
npm run build
```
