<p align="center">
  <img src="https://img.icons8.com/fluency/96/lottery.png" alt="Natloto Agent System" width="96"/>
</p>

<h1 align="center">🎟️ Natloto Agent System (Haiti)</h1>

<p align="center">
  <strong>Hệ thống Số hóa Vé số Borlette & Quản lý Đại lý MLM tích hợp ví điện tử Natcash (Haiti)</strong><br/>
  <em>Digitized Borlette lottery booking bot, 3-tier MLM agent commission model & secure CEO Dashboard</em>
</p>

<p align="center">
  <b>🇻🇳 Tiếng Việt</b> | <a href="README_EN.md">🇬🇧 English</a>
</p>

<p align="center">
  <a href="#-cài-đặt-nhanh"><img src="https://img.shields.io/badge/Cài_đặt-Nhanh_chóng-brightgreen?style=for-the-badge" alt="Setup"/></a>
  <img src="https://img.shields.io/badge/Phân_khúc-Haiti_Borlette-blue?style=for-the-badge" alt="Market"/>
  <img src="https://img.shields.io/badge/Giấy_phép-MIT-orange?style=for-the-badge" alt="License"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Telegraf-4.x-229ED9?style=flat-square&logo=telegram&logoColor=white" alt="Telegraf"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Express-API_Server-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Natcash-Payment-FF6B35?style=flat-square" alt="Natcash"/>
</p>

---

## 📖 Giới thiệu Dự án

**Natloto Agent System** là giải pháp số hóa toàn diện dành cho loại hình xổ số kiến thiết tâm linh **Borlette** (văn hóa đặt cược truyền thống tại Haiti). Hệ thống vận hành tự động qua kênh hội thoại **Telegram Bot**, kết hợp mô hình kinh doanh phân phối mạng lưới đại lý **MLM 3 cấp** (Super Agent, Marchann Agent, Referral User), và được giám sát bảo mật chặt chẽ bởi Ban điều hành Natcom thông qua **CEO Admin Web Dashboard**.

Dự án tích hợp sâu hệ thống thanh toán qua ví điện tử di động **Natcash** (Natcom Haiti), hỗ trợ tra cứu từ điển giấc mơ **Tchala** Creole bản địa, tính năng cược nhanh hàng loạt (Batch Play) cùng cơ chế trả thưởng bảo mật bằng chữ ký số HMAC nâng cao.

---

## ✨ Các Tính năng Nổi bật

| Nhóm tính năng | Mô tả chi tiết |
|----------------|----------------|
| 🎟️ **Đặt cược Borlette** | Hỗ trợ đầy đủ Bolet 2 (2 chữ số), Lotto 3 (3 chữ số), và Maryaj (2 cặp số `XXxYY`). Giao diện cược qua Bot thông minh (Betting Wizard). |
| 🎲 **Chọn số Tâm linh** | Tra cứu từ điển giấc mơ **Tchala** bản địa với 297 từ khóa, chọn số ngẫu nhiên (**Lucky Pick**), và cược nhanh theo Cung hoàng đạo. |
| ⚡ **Đặt cược Hàng loạt** | Cho phép nhập nhiều số thủ công qua dấu phẩy/khoảng trắng (ví dụ `12, 45, 88`) hoặc nhấn nút **"🔥 Achte tout (Buy all)"** để tự động thêm tất cả các số gợi ý từ giấc mơ/zodiac vào giỏ hàng. |
| 💰 **Thanh toán Natcash** | Tích hợp cổng thanh toán di động Natcash với mã QR độ tương phản cao, tặng thưởng phụ qua **Thẻ cào may mắn (Scratch Card)** lên tới 500 HTG và tích điểm chuỗi ngày chơi (**Streak**). |
| 🌐 **Đa ngôn ngữ (i18n)** | Hỗ trợ thay đổi ngôn ngữ thời gian thực trên giao diện Bot: Tiếng Creole Haiti (`ht`), tiếng Pháp (`fr`), và tiếng Anh (`en`). |
| 📊 **Hoa hồng MLM 3 tầng** | Tự động phân cấp đại lý tích lũy theo doanh thu tháng (Debutante, Marchann, Gran Met, Chanpyon). Chia hoa hồng tự động: Super Agent (`3%`), Marchann (`8% - 11%`), và Referral User (`2%`). |
| 💵 **Rút tiền & Trả thưởng** | Trúng thưởng được cấp mã bảo mật chứa chữ ký HMAC (**Win-Code**). Marchann xác thực mã tại quầy bằng `/cash`, hệ thống tự cộng số dư và trả **0.5% phí dịch vụ chi hộ** cho Marchann. |
| 🖥️ **CEO Web Dashboard** | Giao diện quản trị hiện đại, bảo mật bằng mật khẩu, cung cấp biểu đồ doanh thu thời gian thực, bản đồ vùng địa lý Haiti, tỷ trọng game, xếp hạng Marchann và cập nhật cấu hình hệ thống trực tiếp. |

---

## ⚙️ Sơ đồ Quy trình Nghiệp vụ (Flows)

### 1. Quy trình mua vé cược & Giả lập Natcash WebApp
```
Khách: /play → Chọn game (Bolet/Lotto/Maryaj) → Chọn số (Thủ công / Lucky / Tchala) → Chọn số tiền
                                              ↓
Khách: Nhấn 💳 Peye (Checkout) → Bot tạo payment_ref & High-contrast QR + Link simulator
                                              ↓
Khách: Mở Link Simulator → Điền số điện thoại Natcash → Bấm Trigger Webhook
                                              ↓
Bot Server: Nhận webhook → Xác nhận PAID hàng loạt vé → Gửi thẻ cào Scratch Card & Tích Streak ✅
```

### 2. Mô hình phân phối hoa hồng MLM 3 tầng
```
                 [ Vé cược thành công qua Natcash (100% Doanh thu) ]
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
  [ Super Agent ]             [ Marchann Agent ]             [ Referral User ]
      Nhận 3%                     Nhận 8% - 11%                  Nhận 2% hoa hồng
   (Doanh số nhánh)             (Theo cấp bậc doanh số)            (Khi giới thiệu F1)
```

### 3. Quy trình Trả thưởng tại Quầy (Booth Redemption)
```
Khách trúng giải → Nhận tin nhắn từ Bot kèm Win-Code bảo mật (HMAC SHA-256, TTL 48h)
                                      ↓
Khách mang mã đến quầy của đại lý Marchann Agent
                                      ↓
Marchann gõ lệnh: /cash [Win-Code]
                                      ↓
Bot kiểm tra chữ ký HMAC trên CSDL PostgreSQL → Xác nhận hợp lệ → Hiển thị số tiền trả
                                      ↓
Marchann chi tiền mặt cho Khách → Hệ thống cộng tiền mặt vào số dư ví của Marchann + 0.5% phí dịch vụ ✅
```

---

## 📁 Cấu trúc Thư mục Dự án

```
Bollet-bot/
├── .env.example              # Mẫu cấu hình môi trường
├── package.json              # Danh sách thư viện và script khởi chạy
├── LICENSE                   # Giấy phép MIT
├── HUONG_DAN_SU_DUNG.md      # Hướng dẫn chi tiết cho Người chơi, Đại lý & Admin (Tiếng Việt)
├── scratch/                  # Thư mục chứa các script hỗ trợ/thử nghiệm
│   ├── import_tchala.js      # Script cào và nạp từ khóa giấc mơ vào CSDL
│   └── test_tchala_queries.js# Script kiểm tra truy vấn CSDL sổ mơ đa ngôn ngữ
└── src/
    ├── bot.js                # 🚀 Entry point - Khởi chạy Telegram Bot
    ├── config.js             # ⚙️ Cấu hình nạp biến môi trường và cài đặt mặc định
    ├── database.js           # Khởi tạo kết nối PostgreSQL (Supabase)
    ├── commands/             # 📋 Các lệnh điều khiển Telegram Bot
    │   ├── start.js          # Lệnh chào mừng, ghi nhận referral link
    │   ├── play.js           # Giao diện đặt cược thông minh (Betting Wizard)
    │   ├── checkpay.js       # Tra cứu trạng thái đơn cược gần nhất
    │   ├── menu.js           # Xem thông tin tài khoản
    │   ├── myid.js           # Lấy Telegram ID của người dùng
    │   ├── nap.js            # Lệnh hướng dẫn nạp tiền
    │   ├── support.js        # Thông tin liên hệ hỗ trợ
    │   └── agent/            # Lệnh dành riêng cho Đại lý Marchann
    │       ├── bilan.js      # Mini dashboard doanh số, thống kê bán hàng (Lang swap)
    │       ├── komisyon.js   # Xem biểu đồ thu nhập 7 ngày, gửi yêu cầu rút tiền
    │       ├── cash.js       # Xác thực Win-Code HMAC để đổi thưởng tại quầy
    │       ├── kliyan.js     # Danh sách khách hàng thuộc nhánh quản lý
    │       ├── lyen.js       # Tạo link giới thiệu & mã QR giới thiệu độc quyền
    │       └── leaderboard.js# Bảng xếp hạng doanh thu tháng của các đại lý
    ├── database/             # Cấu trúc CSDL
    │   ├── index.js          # Kết nối pool PostgreSQL
    │   ├── migrate.js        # Script khởi tạo cấu trúc bảng trên PostgreSQL
    │   └── schema.sql        # Định nghĩa các bảng, trigger tự cập nhật tier đại lý
    ├── handlers/             # Trình xử lý callback query & hội thoại cược
    │   ├── adminActions.js   # Xử lý các thao tác của quản trị viên
    │   ├── paymentConfirm.js # Xử lý xác nhận thanh toán thủ công
    │   └── quantitySelect.js # Quản lý chọn mệnh giá cược và giỏ hàng vé số
    ├── public/               # Tài nguyên giao diện CEO Dashboard và Simulator
    │   ├── index.html        # Giao diện quản trị CEO Dashboard của Natcom
    │   ├── haiti_map.png     # Bản đồ phân bố địa lý các đại lý tại Haiti
    │   └── haiti_map.svg     # Vector bản đồ
    ├── services/             # Lớp nghiệp vụ hệ thống (Business Logic Services)
    │   ├── agentService.js   # Thống kê KPIs, đăng ký đại lý, định vị vùng miền
    │   ├── commissionService.js # Tính toán hoa hồng 3 tầng, lịch sử rút tiền
    │   ├── drawService.js    # Quản lý lịch quay số, đối soát vé trúng, phân phối thưởng
    │   ├── leaderboardService.js # Xử lý bảng xếp hạng doanh thu
    │   ├── mockNatcashService.js # Bộ giả lập thanh toán WebApp & API Webhook Natcash
    │   ├── scratchService.js # Quay thưởng Scratch Card, cập nhật streak chơi game
    │   ├── tchalaService.js  # Tra cứu từ điển giấc mơ và Cung hoàng đạo
    │   ├── userService.js    # Quản lý người dùng cuối
    │   └── winCodeService.js # Sinh và kiểm tra Win-Code ký mã HMAC
    └── utils/                # Tiện ích bổ trợ
        ├── keyboard.js       # Khởi tạo bàn phím Telegram linh hoạt
        ├── i18n.js           # Bộ từ điển đa ngôn ngữ (ht, fr, en) cho đại lý
        └── messages.js       # Các mẫu tin nhắn phản hồi của Bot
```

---

## ⚡ Cài đặt & Cấu hình

### Yêu cầu Hệ thống
- [Node.js](https://nodejs.org/) v18 trở lên
- Một tài khoản cơ sở dữ liệu PostgreSQL (Khuyên dùng **Supabase** để tối ưu hóa trigger và function PL/pgSQL).
- Telegram Bot Token được cấp từ [@BotFather](https://t.me/BotFather).

### 1️⃣ Tải mã nguồn & Cài đặt thư viện
```bash
git clone https://github.com/your-repo/telegram-borlette-bot.git
cd telegram-borlette-bot
npm install
```

### 2️⃣ Thiết lập biến môi trường
Sao chép tệp cấu hình mẫu:
```bash
cp .env.example .env
```
Mở `.env` và cấu hình các thông số:
```env
# Mã token bot Telegram từ @BotFather
BOT_TOKEN=8812560741:AAHb7Ek_RgLiW2-hpyyJuBkpXWmMhQ491Xk

# Telegram ID của quản trị viên cao cấp
ADMIN_ID=1076785545

# Cấu hình Shop mặc định
SHOP_NAME=Natloto Agent
SUPPORT_CONTACT=@support_natloto

# Kết nối CSDL PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres.user:password@aws-host:6543/postgres

# Khóa bí mật dùng để tạo chữ ký HMAC bảo vệ Win-Code trúng thưởng
HMAC_SECRET=haiti-borlette-secure-payout-hmac-key

# API ví điện tử Natcash (Production hoặc Sandbox)
NATCASH_API_URL=https://api.natcash.ht/v1
NATCASH_API_KEY=your_natcash_api_key_production
NATCASH_MERCHANT_ID=your_merchant_id_production

# Mật khẩu để đăng nhập vào CEO Admin Dashboard
DASHBOARD_PASSWORD=ceo_natcom_secure_password
```

### 3️⃣ Chạy Migration khởi tạo CSDL
Khởi tạo cấu trúc bảng, khóa ngoại, chỉ mục index và trigger tính toán cấp bậc đại lý tự động trên PostgreSQL:
```bash
node src/database/migrate.js
```

### 4️⃣ Nhập dữ liệu sổ mơ Tchala chuyên sâu
Đồng bộ 297 từ khóa giấc mơ giải mã vào bảng CSDL để người chơi tra cứu:
```bash
node scratch/import_tchala.js
```

### 5️⃣ Khởi chạy ứng dụng
Chạy bot ở chế độ Development (tự động khởi động lại khi có thay đổi code):
```bash
npm run dev
```
Chạy bot ở chế độ Production:
```bash
npm start
```

---

## 🖥️ Giả lập Natcash & CEO Web Dashboard

Khi máy chủ khởi động thành công, một Express server sẽ lắng nghe trên cổng `3000` phục vụ cả Web App và API:

1. **Natcash Pay Simulator (Bộ giả lập)**: 
   - Địa chỉ: `http://localhost:3000/demo/natcash`
   - Giao diện kính mờ (Glassmorphism) thân thiện giúp mô phỏng điện thoại người dùng cược. Bạn chỉ cần chọn vé đang chờ (`PENDING`), nhập số điện thoại và ấn **"Trigger Webhook"** để giả lập thanh toán nạp tiền ngay lập tức mà không cần kết nối API thật.
2. **CEO Admin Dashboard (Bảng điều khiển quản trị)**:
   - Địa chỉ: `http://localhost:3000/`
   - Đăng nhập bằng mật khẩu đặt trong biến `DASHBOARD_PASSWORD`.
   - Giúp ban điều hành giám sát KPIs, biểu đồ tăng trưởng doanh thu hàng tháng, cơ cấu trò chơi cược, bản đồ địa lý hoạt động của đại lý tại Haiti và thay đổi cấu hình hoa hồng MLM lưu vào `system_config.json`.

---

## 📋 Danh sách Lệnh Telegram Bot

### 👤 1. Lệnh dành cho Người chơi (End User)
*   `/start` — 🔄 Khởi động bot, nhận diện đại lý giới thiệu từ link và đăng ký tài khoản.
*   `/play` — 🎟️ Mở giao diện mua vé cược Bolet 2, Lotto 3, Maryaj (Hỗ trợ Lucky Pick, cược hàng loạt).
*   `/tchala` — 📖 Tra cứu sổ mơ số may mắn bằng tiếng Creole/Pháp/Anh.
*   `/menu` — 👤 Xem thông tin cá nhân, số dư ví, chuỗi ngày cược (Streak) hiện tại.
*   `/nap` — 💰 Nhận hướng dẫn nạp tiền qua ví di động Natcash.
*   `/checkpay` — 🔍 Xem thông tin chi tiết trạng thái đơn cược gần nhất.
*   `/support` — 🆘 Liên hệ đội ngũ hỗ trợ kỹ thuật của Natloto.
*   `/myid` — 🆔 Hiển thị Telegram ID của bạn.

### 💰 2. Lệnh dành cho Đại lý (Marchann Agent)
*   `/bilan` — 📊 Dashboard doanh số đại lý: Tổng vé bán ra, tổng tiền, hoa hồng ước tính. Hỗ trợ nút thay đổi ngôn ngữ nhanh **🌐 Lang**.
*   `/komisyon` — 💰 Quản lý hoa hồng và gửi yêu cầu rút tiền về số ví Natcash cá nhân.
*   `/cash [Win-Code]` — 💵 Trả thưởng tại quầy: Quét mã Win-code HMAC trúng thưởng của khách, hệ thống tự động cộng tiền hoàn vé và thưởng phí chi hộ 0.5% cho đại lý.
*   `/kliyan` — 👥 Quản lý danh sách khách hàng dưới nhánh kèm cảnh báo nếu khách không đặt cược trên 7 ngày.
*   `/lyen` — 🔗 Tạo mã QR cự ly gần & liên kết giới thiệu độc quyền để mời người chơi tham gia hệ thống MLM.
*   `/leaderboard` — 🏆 Bảng xếp hạng doanh số: Thống kê top 10 đại lý xuất sắc nhất trong mạng lưới Natloto.

---

## 🛠️ Lưu ý Triển khai & Khắc phục lỗi

### 🛑 Lỗi tranh chấp cổng (`Error: listen EADDRINUSE: address already in use :::3000`)
Khi khởi động bot và web server, Express có thể bị crash do cổng `3000` đang bị chiếm dụng bởi tiến trình chạy ngầm trước đó.
- **Cách xử lý trên Windows**:
  1. Tìm ID tiến trình (PID) đang dùng cổng 3000:
     ```powershell
     netstat -ano | findstr :3000
     ```
  2. Kết thúc tiến trình đó (Ví dụ PID tìm thấy là `1234`):
     ```powershell
     taskkill /F /PID 1234
     ```
  3. Khởi chạy lại bot: `npm start`.

---

## 📄 Bản quyền & Đóng góp
Dự án được phân phối dưới giấy phép **MIT**. Mọi đóng góp, cải tiến mã nguồn thông qua Pull Requests đều được chào đón nhằm nâng cao trải nghiệm sản phẩm.

---
<p align="center">
  Nếu dự án này hữu ích, hãy tặng cho chúng tôi một dấu ⭐ <b>star</b> trên kho lưu trữ nhé!<br/>
  💬 Liên hệ hỗ trợ kỹ thuật: <a href="https://t.me/cuongph1">@cuongph1</a>
</p>
