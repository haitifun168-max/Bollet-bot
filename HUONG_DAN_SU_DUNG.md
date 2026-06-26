# 📖 HƯỚNG DẪN VẬN HÀNH & SỬ DỤNG HỆ THỐNG NATLOTO (HAITI)
Tài liệu hướng dẫn chi tiết các tính năng của **Hệ thống Số hóa Vé số Borlette & Quản lý Đại lý MLM (Natloto)** dành cho Người chơi (End User), Đại lý (Marchann Agent), và Ban quản trị (CEO/Admin Natcom).

---

## 👤 PHẦN 1: HƯỚNG DẪN DÀNH CHO NGƯỜI CHƠI (END USER)
Khách hàng tham gia đặt cược vé số Borlette thông qua các lệnh chat tiện lợi và giao diện hội thoại tương tác của Telegram Bot.

### 1. Danh sách lệnh chính
*   `/start` — 🔄 Khởi động bot, hiển thị menu chính và tự động ghi nhận đại lý giới thiệu (nếu có).
*   `/play` — 🎟️ Mở giao diện mua vé cược Borlette (hỗ trợ Bolet 2, Lotto 3, Maryaj).
*   `/tchala` — 📖 Tra cứu sổ mơ để tìm số may mắn tương ứng.
*   `/menu` — 👤 Xem thông tin tài khoản cá nhân.
*   `/nap` — 💰 Nạp tiền vào tài khoản thông qua ví điện tử Natcash.
*   `/checkpay` — 🔍 Kiểm tra trạng thái đơn hàng/vé cược gần nhất.
*   `/support` — 🆘 Liên hệ đội ngũ hỗ trợ kỹ thuật.
*   `/myid` — 🆔 Xem Telegram ID của bạn.

### 2. Luồng đặt cược cơ bản (Betting Wizard)
1. Gõ `/play` hoặc nhấn nút **🎟️ Achte Tikè (Buy Tickets)** trên menu chính.
2. Chọn loại hình trò chơi:
   - **Bolet 2**: Chọn 2 chữ số (tỷ lệ trúng thưởng: 50x).
   - **Lotto 3**: Chọn 3 chữ số (tỷ lệ trúng thưởng: 500x).
   - **Maryaj**: Chọn 2 cặp số dạng `XXxYY` (tỷ lệ trúng thưởng: 1000x).
3. Lựa chọn số cược:
   - **Nhập số thủ công**: Gõ số cược trực tiếp vào ô chat (Ví dụ: `24` cho Bolet 2).
   - **🎲 Lucky Pick**: Nhấn nút số ngẫu nhiên để hệ thống tự động sinh số may mắn cho bạn.
4. Lựa chọn số tiền cược nhanh: `50 HTG`, `100 HTG`, `200 HTG` hoặc `500 HTG`.
5. Đơn hàng được đẩy vào giỏ hàng. Bạn có thể nhấn **➕ Achte yon lòt (Add more)** để cược tiếp số khác hoặc nhấn **💳 Peye (Checkout)** để thanh toán.

### 3. Tính năng Đặt cược Hàng loạt (Batch Play) & Chọn số theo Sở thích
Hệ thống hỗ trợ đắc lực việc chọn nhiều số cùng lúc từ thói quen tâm linh của người dân Haiti:
*   **Mua nhanh trọn gói gợi ý (Tchala / Zodiac)**: 
    - Khi bạn tra cứu giấc mơ (Ví dụ gõ `/tchala` → nhập từ khóa `dlo` - nước) hoặc chọn cung hoàng đạo (Ví dụ: *Toro - Kim Ngưu*), hệ thống sẽ trả về danh sách 3-4 số may mắn gợi ý (ví dụ: `22, 62, 05`).
    - Bên dưới danh sách số sẽ có nút **"🔥 Achte tout (Buy all)"**. Bạn chỉ cần nhấn nút này, chọn mệnh giá tiền mong muốn, hệ thống sẽ tự động thêm tất cả các số gợi ý đó vào giỏ hàng.
*   **Nhập nhiều số thủ công**:
    - Trong bước chọn số, thay vì nhập 1 số, bạn có thể nhập danh sách các số ngăn cách bởi dấu cách hoặc dấu phẩy (Ví dụ: `24, 78, 99` đối với Bolet 2). 
    - Hệ thống sẽ tự động phân tích cú pháp, kiểm tra tính hợp lệ và thêm hàng loạt số đó vào giỏ hàng cùng mệnh giá cược.

### 4. Thanh toán & Giả lập WebApp Natcash
1. Khi nhấn **"💳 Peye (Checkout)"**, bot sẽ tạo một mã thanh toán duy nhất (`payment_ref`) kèm **Mã QR độ tương phản cao** và đường link giả lập thanh toán Natcom Natcash.
2. Quét mã QR hoặc nhấn vào liên kết **"Pay with Natcash (Simulator)"** để mở cổng giả lập Natcash WebApp.
3. Nhập số điện thoại Natcash của bạn và nhấn **"Trigger Webhook (Xác nhận nạp tiền)"**. 
4. Hệ thống sẽ ngay lập tức gửi Webhook xử lý:
   - Vé cược chuyển sang trạng thái hoạt động (`PAID`).
   - Bot gửi tin nhắn xác nhận kèm theo **Thẻ cào may mắn (Scratch Card)** thưởng ngẫu nhiên lên tới `500 HTG`.
   - Cập nhật số ngày chơi liên tiếp (**Streak**).

---

## 💰 PHẦN 2: HƯỚNG DẪN DÀNH CHO ĐẠI LÝ (MARCHANN AGENT)
Marchann Agent là mắt xích cốt lõi trong hệ thống phân phối MLM, kiếm hoa hồng tự động từ người chơi do mình giới thiệu.

### 1. Panel lệnh đại lý (Hỗ trợ 3 ngôn ngữ: Creole, French, English)
Đại lý sử dụng các lệnh dưới đây để quản lý hoạt động kinh doanh trực tiếp trên Telegram:
*   `/bilan` — 📊 **Bảng điều khiển kinh doanh (CEO Dashboard Mini)**: Xem nhanh doanh thu hôm nay, tổng số vé bán được, hoa hồng tạm tính và nút đổi ngôn ngữ thời gian thực (**🌐 Lang**).
*   `/komisyon` — 💰 **Quản lý hoa hồng & Rút tiền**: Xem biểu đồ doanh thu 7 ngày gần nhất, số dư hoa hồng tích lũy và thực hiện yêu cầu rút tiền tự động về số điện thoại Natcash.
*   `/cash` — 💵 **Chi trả thưởng tại quầy (Redemption)**: 
    - Khi người chơi trúng giải, họ sẽ nhận được một mã trúng thưởng chứa chữ ký bảo mật HMAC (**Win-Code**). 
    - Người chơi mang mã này đến quầy của đại lý Marchann.
    - Đại lý gõ lệnh `/cash [Win-Code]` để bot kiểm tra chữ ký HMAC trên CSDL Supabase. Nếu hợp lệ, bot hiển thị số tiền thưởng cần chi trả.
    - Đại lý chi tiền mặt cho khách hàng. Hệ thống tự động chuyển đổi số tiền thưởng đó cộng vào số dư hoa hồng của đại lý, kèm theo **0.5% phí dịch vụ chi hộ** được thưởng thêm.
*   `/kliyan` — 👥 **Danh sách khách hàng giới thiệu**: Xem danh sách và số lượng người chơi dưới hệ thống của mình, kèm cảnh báo nếu có khách hàng không phát sinh cược quá 7 ngày.
*   `/lyen` — 🔗 **Tạo mã QR & Link giới thiệu**: Bot tạo mã QR và link giới thiệu độc quyền. Khi khách hàng quét mã này để bắt đầu chơi, họ sẽ bị ràng buộc trọn đời (Lifetime Attribution) vào đại lý đó.
*   `/leaderboard` — 🏆 **Bảng xếp hạng**: Xem danh sách 10 đại lý có doanh số cao nhất trong tháng để đua top nhận thưởng từ Natcom.

### 2. Mô hình hoa hồng MLM 3 tầng
Hệ thống tự động chia hoa hồng khi phát sinh giao dịch đặt cược thành công:
*   **Tầng 1 (Super Agent)**: Nhận `3%` từ tất cả doanh số của các Marchann trực thuộc.
*   **Tầng 2 (Marchann Agent)**: Nhận từ `8%` đến `11%` (tùy thuộc vào doanh số tích lũy tháng và cấp bậc đại lý: *Debutante, Marchann, Gran Met, Chanpyon*).
*   **Tầng 3 (Referral User - Người chơi giới thiệu)**: Nhận `2%` trực tiếp khi giới thiệu người chơi khác tham gia đặt cược.

---

## 🖥️ PHẦN 3: HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN (CEO / ADMIN NATCOM)
Ban quản trị theo dõi toàn bộ hiệu năng hệ thống thông qua giao diện Web CEO Dashboard hiện đại và được phân quyền bảo mật.

### 1. Truy cập CEO Dashboard
*   **Đường dẫn**: `http://localhost:3000/` (khi chạy ở môi trường local) hoặc tên miền máy chủ của dự án.
*   **Mật khẩu bảo mật**: Nhập mật khẩu quản trị được thiết lập trong biến môi trường `DASHBOARD_PASSWORD` để đăng nhập.
*   **Tính năng chính trên Dashboard**:
    - **KPIs Overview**: Tổng số vé bán ra, tổng doanh thu (HTG), tỷ lệ hoa hồng chia cho Marchann, Super Agent, số tiền chi thưởng (Rewards) và tổng số người chơi active.
    - **Monthly Trends**: Biểu đồ cột xu hướng doanh thu và hoa hồng qua các tháng.
    - **Regional Breakdown**: Biểu đồ doanh thu, số lượng giao dịch và số lượng đại lý Marchann phân bố theo từng khu vực tỉnh thành của Haiti.
    - **Game Breakdown**: Biểu đồ tỷ lệ cơ cấu doanh thu giữa Bolet 2, Lotto 3 và Maryaj.
    - **Agent List**: Tra cứu danh sách toàn bộ đại lý Marchann trong hệ thống, lọc theo vùng miền, xếp thứ hạng doanh thu từ cao đến thấp và chi tiết lịch sử hoa hồng.
    - **System Config**: Cho phép admin chỉnh sửa trực tiếp các tham số hệ thống (hạn mức cược, tỷ lệ hoa hồng MLM, thời gian khóa đài quay thưởng) và lưu trực tiếp vào tệp `system_config.json`.

---

## 🚀 QUY TRÌNH DEPLOY HỆ THỐNG LÊN PRODUCTION

Để đưa hệ thống lên môi trường chạy thực tế, đội ngũ kỹ thuật thực hiện các bước sau:

### Bước 1: Thiết lập biến môi trường trong file `.env`
Tạo tệp `.env` trên server và điền đầy đủ các thông số thực tế:
```env
BOT_TOKEN=your_telegram_bot_token_production
ADMIN_ID=your_telegram_admin_id
DATABASE_URL=postgresql://user:password@supabase-host:5432/postgres
HMAC_SECRET=your_secure_hmac_sign_key_for_wincodes
DASHBOARD_PASSWORD=your_secure_dashboard_login_password
NATCASH_API_URL=https://api.natcash.natcom.com.ht/v1/payment  # API Natcash thực tế
```

### Bước 2: Chạy Migration CSDL
Khởi tạo cấu trúc bảng, trigger tính toán cấp bậc đại lý và các hàm tích lũy doanh số trên Supabase PostgreSQL:
```bash
node src/database/migrate.js
```

### Bước 3: Đồng bộ dữ liệu sổ mơ Tchala chuyên sâu
Nhập dữ liệu 297 từ khóa giấc mơ giải mã vào bảng CSDL:
```bash
node scratch/import_tchala.js
```

### Bước 4: Khởi chạy Máy chủ Bot & Webhook
Sử dụng PM2 để chạy ngầm và tự động giám sát dịch vụ:
```bash
pm2 start src/bot.js --name "natloto-bot-production"
```
Kiểm tra log hệ thống để đảm bảo cổng `3000` được lắng nghe thành công cho các kết nối webhook.
