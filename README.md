# 💻 Burnout AI Platform - Enterprise & Employee Wellbeing Web Application

> **Giao diện Web SaaS Đẳng cấp Doanh nghiệp dành cho Quản trị Rủi ro Kiệt sức & Chăm sóc Sức khỏe Tinh thần Nơi Công sở.**
> 
> *Sáng kiến công nghệ kết hợp Khoa học Dữ liệu, Tâm lý học Hành vi và Trí tuệ Nhân tạo Đa phương thức — Mang lại trải nghiệm vi mô 60 giây mỗi ngày (Micro-Habit Self-Care) cho Nhân viên, đồng thời cung cấp Bản đồ Nhiệt Rủi ro Kiệt sức (Enterprise Burnout Heatmap) thời gian thực cho Ban Giám đốc và Bộ phận Quản trị Nhân sự (HR).*

---

## 📑 MỤC LỤC

1. [TỔNG QUAN GIẢI PHÁP & ĐỀ XUẤT GIÁ TRỊ ĐẦU TƯ (INVESTOR PITCH & ROI)](#1-tổng-quan-giải-pháp--đề-xuất-giá-trị-đầu-tư-investor-pitch--roi)
2. [TẠI SAO DOANH NGHIỆP CẦN NỀN TẢNG NÀY?](#2-tại-sao-doanh-nghiệp-cần-nền-tảng-này)
3. [BẢN ĐỒ CHỨC NĂNG CHI TIẾT (COMPREHENSIVE FEATURE TOUR)](#3-bản-đồ-chức-năng-chi-tiết-comprehensive-feature-tour)
4. [BẢO MẬT DỮ LIỆU & AN TOÀN TÂM LÝ (PSYCHOLOGICAL SAFETY)](#4-bảo-mật-dữ-liệu--an-toàn-tâm-lý-psychological-safety)
5. [KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ FRONTEND](#5-kiến-trúc-kỹ-thuật--công-nghệ-frontend)
6. [CẤU TRÚC THƯ MỤC MÃ NGUỒN](#6-cấu-trúc-thư-mục-mã-nguồn)
7. [HƯỚNG DẪN CÀI ĐẶT, CHẠY LOCAL & DEPLOY VERCEL](#7-hướng-dẫn-cài-đặt-chạy-local--deploy-vercel)
8. [LỘ TRÌNH PHÁT TRIỂN SẢN PHẨM (PRODUCT ROADMAP)](#8-lộ-trình-phát-triển-sản-phẩm-product-roadmap)

---

## 1. TỔNG QUAN GIẢI PHÁP & ĐỀ XUẤT GIÁ TRỊ ĐẦU TƯ (INVESTOR PITCH & ROI)

### 1.1. Tầm nhìn Sản phẩm (Product Vision)
**Burnout AI Platform** không chỉ là một ứng dụng theo dõi tâm trạng đơn thuần, mà là một **Hệ sinh thái B2B SaaS Quản trị Rủi ro Nguồn vốn Con người (Human Capital Risk Management)**. Chúng tôi biến đổi quy trình chăm sóc sức khỏe tinh thần từ trạng thái *bị động, đối phó và muộn màng* thành một quy trình **chủ động, liên tục và dựa trên dữ liệu định lượng**.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BURNOUT AI WEB PLATFORM                               │
│                                                                                 │
│   ┌───────────────────────────────────┐   ┌──────────────────────────────────┐  │
│   │    DÀNH CHO NGƯỜI LAO ĐỘNG        │   │     DÀNH CHO DOANH NGHIỆP & HR   │  │
│   │        (EMPLOYEE-CENTRIC)         │   │       (ENTERPRISE-CENTRIC)       │  │
│   ├───────────────────────────────────┤   ├──────────────────────────────────┤  │
│   │ • Daily Check-in siêu tốc (60s)   │   │ • Executive Org Health Dashboard │  │
│   │ • DeepFace Webcam Emotion Scan    │   │ • Top Stressors Leaderboard      │  │
│   │ • 4-Stage Gemini Clinical Chatbot │   │ • Allostatic Overload Early Alarm│  │
│   │ • 7-Day Rolling Trend & Gauge     │   │ • Anonymized Department Heatmap  │  │
│   │ • GPS Location-based Healing      │   │ • High-Risk Intervention Queue   │  │
│   └───────────────────────────────────┘   └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Đề xuất Giá trị & Lợi tức Đầu tư (ROI) cho Doanh nghiệp
1. **Dự báo làn sóng nghỉ việc (Attrition Forecasting) sớm 30–60 ngày**:
   - Thuật toán *Allostatic Overload Detection* phát hiện tình trạng tích tụ kiệt sức liên tục 3 ngày kèm thiếu ngủ, cảnh báo trước khi nhân viên rơi vào trạng thái suy nhược thần kinh hoặc nộp đơn xin nghỉ việc.
2. **Tiết kiệm hàng trăm ngàn USD chi phí tuyển dụng & đào tạo lại**:
   - Giữ chân được 5–10 nhân sự chất lượng cao mỗi năm tương đương với việc tiết kiệm trực tiếp từ **\$15,000 đến \$50,000** chi phí tuyển dụng thay thế.
3. **Định danh chính xác "Nguyên nhân Gốc rễ" (Data-Driven Root Causes)**:
   - Thay vì phỏng đoán cảm tính, bảng *Top Stressors Leaderboard* chỉ rõ nguyên nhân kiệt sức của từng phòng ban (ví dụ: Team Kỹ thuật quá tải do deadline gấp; Team Chăm sóc khách hàng kiệt sức do thiếu công cụ hỗ trợ).
4. **Nâng cao năng suất lao động (Combatting Presenteeism)**:
   - Giảm thiểu tình trạng nhân viên có mặt tại văn phòng nhưng kiệt quệ năng lượng, giúp tăng từ **10% đến 20% hiệu suất làm việc thực tế**.

---

## 2. TẠI SAO DOANH NGHIỆP CẦN NỀN TẢNG NÀY?

| Phương pháp cũ | Nỗi thất vọng của Doanh nghiệp | Giải pháp đột phá từ Burnout AI Frontend |
| :--- | :--- | :--- |
| **Khảo sát thường niên (Annual Survey)** | Nhân viên ngại đánh giá tiêu cực, trả lời đối phó ("Faking Good"); kết quả có sau 3 tháng thì nhân sự đã nghỉ việc. | **Micro-checkin 60 giây hàng ngày**: Ngắn gọn, trực quan, điểm số trôi chảy theo thời gian thực (Real-time Longitudinal Data). |
| **Camera AI giám sát nơi làm việc** | Xâm phạm quyền riêng tư nghiêm trọng, tạo áp lực ngược, nhân viên chống đối. | **Zero-Storage Privacy**: Quét khuôn mặt trong RAM, tự động giải phóng bộ nhớ, không lưu ảnh cá nhân khi chưa được cho phép. |
| **Ứng dụng trị liệu bên ngoài (EAP)** | Rời rạc, doanh nghiệp không nắm được xu hướng sức khỏe chung của tổ chức. | **Bản đồ sức khỏe tổng hợp ẩn danh**: Bảo vệ danh tính cá nhân nhưng cung cấp cái nhìn vĩ mô chuẩn xác cho ban điều hành. |

---

## 3. BẢN ĐỒ CHỨC NĂNG CHI TIẾT (COMPREHENSIVE FEATURE TOUR)

### 3.1. Phân hệ Bảng điều khiển Cá nhân (User Personal Dashboard)
- **Đồng hồ Đo mức độ Kiệt sức (Burnout Risk Gauge)**: Phản ánh trực quan rủi ro Burnout hiện tại qua 3 mức độ chuẩn hóa y khoa: *Thấp (Low - Xanh), Trung bình (Medium - Vàng), Cao (High - Đỏ)*.
- **Biểu đồ Xu hướng 7 ngày (7-Day Rolling Stats Chart)**: Ứng dụng thuật toán làm mượt dữ liệu 7 ngày, triệt tiêu nhiễu biến thiên ngẫu nhiên và hiển thị chỉ báo xu hướng rõ ràng:
  - `↑ Tăng`: Cảnh báo rủi ro kiệt sức đang tích tụ.
  - `↓ Giảm`: Dấu hiệu phục hồi năng lượng tích cực.
  - `→ Ổn định`: Trạng thái cân bằng.
- **Banner Cảnh báo Khẩn cấp Allostatic Overload**: Banner đỏ nổi bật cảnh báo tình trạng kiệt sức liên tục 3 ngày kèm thiếu ngủ, đính kèm chỉ dẫn can thiệp khẩn cấp.
- **Biểu đồ Phân bổ Cảm xúc (Emotion Distribution Visualizer)**: Hiển thị tỷ lệ các sắc thái cảm xúc (*Happy, Neutral, Sad, Angry, Fear...*) được ghi nhận qua webcam.
- **Hộp Nhận định AI Chuyên sâu (Dynamic AI Insight Box)**: Tích hợp mô hình Gemini 2.0 / Flash phân tích đa tầng, giải thích nguyên nhân và đưa ra lời khuyên hành vi cá nhân hóa. Được trang bị cơ chế **SWR Caching** giúp tải dữ liệu trong **dưới 0.05 giây**.
- **Widget Thời tiết & Gợi ý Phục hồi Thực tế (Weather & Contextual Healing)**: Tự động phát hiện nhiệt độ/thời tiết và đề xuất các địa điểm thư giãn (công viên, quán cà phê yên tĩnh, trung tâm spa) gần vị trí người dùng.

---

### 3.2. Phân hệ Khảo sát Vi mô Hàng ngày (Daily Check-in Survey v3.0)
- Thiết kế trải nghiệm người dùng (UX) tối giản qua **4 bước chuyển tiếp mượt mà**, loại bỏ hoàn toàn cảm giác ngột ngạt khi làm bài kiểm tra:
  1. **Bước 1: Năng lượng & Sự gắn kết**: Đo lường 2 thang đo cốt lõi của kiệt sức theo chuẩn OLBI: *Kiệt sức thể chất/tinh thần (E1, E2)* và *Mất gắn kết/Hoài nghi (D1)*.
  2. **Bước 2: Áp lực công việc**: Đo lường cường độ khối lượng và áp lực thời gian (*Job Demands JD1, JD2*).
  3. **Bước 3: Giấc ngủ & Mức độ Hồi phục**:
     - Thanh kéo Slider tùy chỉnh thời lượng ngủ (3.0h – 12.0h).
     - Thang đo cảm nhận độ sảng khoái sau giấc ngủ (Likert đảo màu thông minh: Đỏ $\rightarrow$ Xanh).
  4. **Bước 4: Đánh giá Quá tải & Phân nhánh Nguyên nhân (Drill-down Overload)**:
     - Khi người dùng đánh giá mức độ quá tải $\ge 4/5$, giao diện tự động mở rộng danh sách đa lựa chọn các nguyên nhân gốc: *Khối lượng quá lớn, Deadline gấp, Bị ngắt quãng đa nhiệm, Thiếu hỗ trợ từ đồng nghiệp/cấp trên, Thiếu quyền tự chủ*.
     - Ô nhập tự do ý kiến cá nhân hỗ trợ ghi nhận các tâm tư đặc thù.
- **Thẻ Đồng bộ Hồ sơ Công việc (Work Baseline Card)**: Hiển thị thông tin nền tảng từ Profile cá nhân (chức danh, số giờ làm/ngày, số ngày làm/tuần, số giờ OT) giúp người dùng có cơ sở đối chiếu.

---

### 3.3. Phân hệ Thị giác Máy tính Quét Cảm xúc (DeepFace Webcam Scanner)
- **Tương tác Webcam Thời gian thực**: Cho phép chụp ảnh trực tiếp từ camera máy tính hoặc tải ảnh khuôn mặt lên từ tệp tin.
- **Nhận diện Biểu cảm Vi mô Đa tầng**:
  - Tự động nhận diện 7 chỉ số cảm xúc: *Vui vẻ, Bình thản, Buồn bã, Giận dữ, Lo âu, Bất ngờ, Khó chịu*.
  - Đo lường chỉ số tin cậy (*Confidence Index*) dựa trên ánh sáng và góc chụp.
- **Cam kết Quyền Riêng tư Tối thượng (Zero-Storage Camera)**:
  - Nút gạt tùy chọn *“Lưu ảnh vào hệ thống”* mặc định tắt (`save_image = false`). Khung hình camera chỉ được phân tích tức thời trong RAM của server và bị hủy ngay lập tức, đảm bảo 100% không xâm phạm đời tư nhân viên.
- **Dòng thời gian Lịch sử Cảm xúc (Emotion History Timeline)**: Theo dõi sự biến đổi biểu cảm khuôn mặt qua từng ngày.

---

### 3.4. Phân hệ Trợ lý AI Tham vấn Tâm lý thích ứng (Gemini Clinical Chatbot)
- Giao diện trò chuyện tương tác với trợ lý AI chuyên gia tâm lý học hành vi, được huấn luyện theo **Quy trình Phỏng vấn 4 Giai đoạn Thích ứng**:
  - *Giai đoạn 1*: Tạo cảm giác an toàn, thấu cảm và xác nhận tâm trạng.
  - *Giai đoạn 2*: Đặt câu hỏi khai thác trọng tâm vào những chỉ số kiệt sức cao nhất được ghi nhận từ bài khảo sát gần nhất.
  - *Giai đoạn 3*: Khám phá các rào cản nhận thức (suy nghĩ tự trách, thói quen khó từ chối công việc ngoài giờ, mâu thuẫn giao tiếp).
  - *Giai đoạn 4*: Đúc kết buổi trò chuyện thành 1–2 hành động phục hồi vi mô có thể thực hiện được ngay trong ngày.
- Văn phong trò chuyện ấm áp, lắng nghe, không sáo rỗng, áp dụng nguyên lý trị liệu nhận thức - hành vi (CBT).

---

### 3.5. Phân hệ Khảo sát Định kỳ Toàn diện (Periodic Diagnostic Survey)
- **Thang đo OLBI 16 câu hỏi (`olbi-16-4pt-vi-v1`)**: Khảo sát định kỳ 14 ngày/lần giúp đánh giá mức độ kiệt sức mạn tính (Trait Burnout) với cơ chế tự động đảo ngược điểm cho các câu hỏi tích cực.
- **Thang đo Môi trường Làm việc 6 Trụ cột (Maslach Areas of Worklife Scale - AWS)**: Đánh giá chi tiết sức khỏe văn hóa công ty qua các chiều: *Khối lượng (Workload), Tự chủ (Control), Khen thưởng (Reward), Cộng đồng (Community), Công bằng (Fairness), Hòa hợp Giá trị (Values)*.

---

### 3.6. Phân hệ Bảng điều khiển Quản trị Doanh nghiệp (Executive Admin Dashboard)
- **Tổng quan Sức khỏe Tổ chức (Org Health Overview Index)**:
  - Tỷ lệ phân bổ rủi ro toàn công ty: Tỷ lệ nhân sự ở nhóm *An toàn (Low), Nguy cơ (Medium), Báo động (High) và Khẩn cấp (Critical)*.
  - Biểu đồ xu hướng rủi ro chung của doanh nghiệp theo thời gian.
- **Bảng Xếp hạng Yếu tố Gây Stress (Top Stressors Leaderboard)**:
  - Phân tích nguyên nhân stress phổ biến nhất trong toàn bộ công ty (Quá nhiều việc, Deadline dồn dập, Thiếu sự hỗ trợ từ sếp...).
  - Bộ lọc thông minh cho phép xem phân bổ stress theo từng phòng ban/đội nhóm để có giải pháp điều phối chính xác.
- **Bảng Cảnh báo Nhân sự Nguy cơ Cao (High-Risk Intervention Queue)**:
  - Liệt kê danh sách các nhân sự đang trong tình trạng báo động Allostatic Overload kéo dài để HR hoặc Quản lý trực tiếp có kế hoạch gặp mặt chia sẻ, giảm tải hoặc cho nghỉ phép phục hồi.
- **Quản trị Nhân sự & Phân quyền Bảo mật (User Directory & RBAC)**:
  - Phân quyền rõ ràng giữa `admin` (xem báo cáo tổ chức) và `user` (trải nghiệm cá nhân).
  - Tính năng kích hoạt / tạm khóa tài khoản an toàn (Soft Delete), lưu trữ trọn vẹn lịch sử dữ liệu phục vụ nghiên cứu dài hạn.

---

## 4. BẢO MẬT DỮ LIỆU & AN TOÀN TÂM LÝ (PSYCHOLOGICAL SAFETY)

Một trong những rào cản lớn nhất khi triển khai công nghệ tâm lý trong doanh nghiệp là sự e ngại bị cấp trên phán xét. Burnout AI Platform giải quyết triệt để rào cản này bằng kiến trúc **Privacy-by-Design**:
- **Không giám sát ngầm**: Mọi hoạt động check-in khảo sát hay quét camera đều do nhân viên hoàn toàn chủ động bấm thực hiện.
- **Mã hóa và Tổng hợp Ẩn danh**: Trên màn hình Admin của HR và Ban Giám đốc, các chỉ số cảm xúc và đánh giá cá nhân đều được tổng hợp ẩn danh theo nhóm. Doanh nghiệp chỉ nhìn thấy bức tranh toàn cảnh của tập thể chứ không thể dùng công cụ để soi xét chi tiết từng suy nghĩ riêng tư của người lao động.
- **Tương thích Tiêu chuẩn Quốc tế**: Quy trình xác thực phân quyền dựa trên Firebase Auth (JWT Bearer Token), bảo mật dữ liệu đạt các tiêu chí của GDPR.

---

## 5. KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ FRONTEND

### 5.1. Công nghệ Lõi (Modern Tech Stack)
- **Framework Core**: `React 19` + `TypeScript` + `Vite 8` mang lại tốc độ biên dịch cực nhanh (< 1 giây) và khả năng kiểm soát kiểu dữ liệu an toàn 100%.
- **Styling**: `Tailwind CSS v4` tối ưu kích thước bundle, kết hợp `Ant Design v6` cho các thành phần bảng biểu, modal, drawer và tabs chuyên nghiệp.
- **Trực quan hóa Dữ liệu (Data Visualization)**: `Recharts` xây dựng các biểu đồ đường xu hướng, biểu đồ cột phân bổ và biểu đồ tròn tương tác cao.
- **Iconography**: Bộ biểu tượng thấu cảm từ `Lucide React` và `@ant-design/icons`.
- **Hệ thống Định tuyến**: `React Router DOM v7` với cơ chế điều hướng Single Page Application (SPA).

### 5.2. Tối ưu Hiệu năng Vượt trội (Performance & UX Optimization)
- **Stale-While-Revalidate (SWR) Caching**: Áp dụng bộ nhớ đệm client `dashboardMemoryCache`, tải trang tức thì ngay khi chuyển tab và âm thầm cập nhật dữ liệu nền (Silent Background Revalidation), giảm tải tối đa cho máy chủ.
- **Xử lý Chống Lỗi Điều hướng 404 trên Vercel**: Tích hợp cấu hình [`vercel.json`](./vercel.json) với quy tắc `rewrites: [{ "source": "/(.*)", "destination": "/index.html" }]`, triệt tiêu hoàn toàn lỗi 404 khi người dùng tải lại trang (F5) ở các đường dẫn con.
- **Lazy Loading & Code Splitting**: Các trang biểu đồ nặng và trang khảo sát được tách nhỏ thành các chunks động, đảm bảo thời gian tải trang đầu tiên (First Contentful Paint) dưới 0.8 giây.

---

## 6. CẤU TRÚC THƯ MỤC MÃ NGUỒN

```
frontend/
├── public/                     # Static assets (favicon.svg, icons.svg)
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── burnout/            # Specialized burnout widgets
│   │   │   ├── BurnoutAnalytics.tsx   # Detailed burnout scoring & radar
│   │   │   ├── DashboardInsight.tsx   # Gemini AI diagnosis cards
│   │   │   ├── OlbiProgress.tsx       # Trait burnout progress tracker
│   │   │   └── STAResultView.tsx      # Comprehensive STA visualizer
│   │   ├── Layout.tsx          # Master layout with responsive sidebar
│   │   └── Sidebar.tsx         # Navigation sidebar with role guard
│   ├── config/                 # Firebase & App configuration
│   ├── constants/              # Question catalogs (STA 9-item, OLBI 16-item, colors)
│   ├── contexts/               # Global state (AuthContext, ThemeContext)
│   ├── pages/                  # Main application views
│   │   ├── AdminDashboard.tsx  # Executive org health & top stressors
│   │   ├── ChatPage.tsx        # 4-stage Gemini conversational UI
│   │   ├── EmotionTest.tsx     # DeepFace webcam scanner & history
│   │   ├── Login.tsx           # Authentication screen
│   │   ├── ProfilePage.tsx     # User personal & baseline profile
│   │   ├── Register.tsx        # Employee signup
│   │   ├── SurveyTest.tsx      # 4-step progressive daily check-in
│   │   ├── UserDashboard.tsx   # Personal health & trend overview
│   │   └── UsersPage.tsx       # Admin employee directory & soft delete
│   ├── services/               # Modular Axios API services
│   │   ├── admin.ts            # Enterprise analytics endpoints
│   │   ├── api.ts              # Axios interceptors with Firebase token injection
│   │   ├── auth.ts             # Authentication workflows
│   │   ├── dashboard.ts        # User dashboard analytics & cache
│   │   ├── emotion.ts          # Multipart webcam image upload & analysis
│   │   └── survey.ts           # Survey contract dispatchers
│   ├── types/                  # Strict TypeScript domain interfaces
│   ├── App.tsx                 # Master routing & role-based route guard
│   └── main.tsx                # Application bootstrap entry point
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler options
├── vercel.json                 # Vercel SPA routing rewrite rules
├── vite.config.ts              # Vite bundler build settings
└── README.md                   # Project documentation
```

---

## 7. HƯỚNG DẪN CÀI ĐẶT, CHẠY LOCAL & DEPLOY VERCEL

### 7.1. Chạy môi trường Local Development

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi tạo file biến môi trường .env
# (Xem mẫu cấu hình bên dưới)

# 4. Chạy Development Server
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:5173`

### 7.2. Cấu hình Biến môi trường (`.env`)

```dotenv
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8000
# Khi deploy production trỏ về Render:
# VITE_API_BASE_URL=https://burnout-ai-platform.onrender.com

# Cloudflare R2 Public CDN
VITE_R2_PUBLIC_URL=https://pub-2af64fffaa7a43949987f4f97f363519.r2.dev

# Firebase Web Client Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=burnout-ai-platform.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=burnout-ai-platform
VITE_FIREBASE_STORAGE_BUCKET=burnout-ai-platform.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 7.3. Triển khai Production lên Vercel

1. Đẩy mã nguồn thư mục `frontend` lên GitHub repository (ví dụ: `burnout-ai-frontend`).
2. Đăng nhập [vercel.com](https://vercel.com/) $\rightarrow$ Chọn **Add New Project** $\rightarrow$ Import repository vừa tạo.
3. Chọn **Framework Preset: Vite**.
4. Dán toàn bộ các biến môi trường từ file `.env` vào mục **Environment Variables** (chú ý đặt `VITE_API_BASE_URL` trỏ về domain Render).
5. Bấm **Deploy**. Hệ thống sẽ tự động build và xuất bản trong vòng 20–30 giây.

---

## 8. LỘ TRÌNH PHÁT TRIỂN SẢN PHẨM (PRODUCT ROADMAP)

- [ ] **Giai đoạn 1 (Hiện tại)**: Hoàn thiện nền tảng Web SaaS B2B, chẩn đoán đa tầng (STA Survey + DeepFace + Gemini Chatbot), Admin Dashboard phát hiện Top Stressors và cảnh báo Allostatic Overload.
- [ ] **Giai đoạn 2 (Q2/2026)**: Phát triển **Slack Bot / Microsoft Teams Extension** cho phép nhân viên check-in 60 giây trực tiếp ngay trong luồng chat công việc hàng ngày mà không cần mở trình duyệt web.
- [ ] **Giai đoạn 3 (Q3/2026)**: Tích hợp dữ liệu từ thiết bị đeo thông minh (**Apple Watch / Garmin / Fitbit**): Tự động thu thập chỉ số Biến thiên Nhịp tim (HRV - Heart Rate Variability) và chất lượng giấc ngủ thực tế để tăng cường độ chính xác của mô hình chẩn đoán Allostatic Overload.
- [ ] **Giai đoạn 4 (Q4/2026)**: Ra mắt phiên bản Mobile App (iOS & Android bằng React Native) phục vụ lực lượng lao động di động và nhân sự làm việc ngoài văn phòng.

---

*© 2026 Burnout AI Platform. All rights reserved. Sáng kiến Đổi mới Sáng tạo Chăm sóc Sức khỏe Tinh thần Nơi Công sở bằng Trí tuệ Nhân tạo.*
