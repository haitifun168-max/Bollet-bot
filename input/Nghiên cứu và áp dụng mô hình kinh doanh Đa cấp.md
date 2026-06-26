<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Nghiên cứu và áp dụng mô hình kinh doanh Đa cấp vào bán hàng và trả thưởng. Văn hóa Bollet của Haiti là vẫn mua ở các cửa hàng nhỏ hoặc bốt ở đầu đường, tiện mua và tiện nhận thưởng

Đây là insight cực kỳ quan trọng — mạng lưới **35,000+ bốt Borlette**  là "last-mile distribution infrastructure" tự nhiên nhất. Tôi sẽ thiết kế mô hình MLM 3 tầng kết hợp văn hóa Marchann Borlette + Mobile Money Agent + Chatbot.[^1]

***

# 🏗️ MÔ HÌNH KINH DOANH ĐA CẤP (MLM)

## Natloto Chatbot — Agent Network \& Reward Distribution Engine

**Phiên bản:** 3.0 — MLM Layer | **Dựa trên:** Báo cáo Khả thi v2.0

***

## 💡 INSIGHT NỀN TẢNG: "MARCHANN BORLETTE" LÀ DNA CỦA THỊ TRƯỜNG

Nghiên cứu từ Đại học Tufts xác nhận có hơn **35,000 bốt borlette** trải khắp mọi làng xã Haiti. Người Haiti không mua loto qua app hay website — họ **đi bộ đến bốt quen ở đầu ngõ**, đặt cược bằng tiền mặt với người bán mà họ tin tưởng, và nhận tiền thắng trực tiếp tay. Đây là **ritual xã hội**, không đơn thuần là giao dịch tài chính.[^1]

```
Hành vi hiện tại:
  Người chơi → Đi bộ đến bốt → Đặt tiền mặt → Marchann ghi số → 
  Chờ kết quả → Quay lại bốt → Nhận tiền mặt (nếu thắng)

Mục tiêu chatbot:
  Người chơi → WhatsApp ngay tại chỗ → Debit Natcash tự động →
  Nhận vé số → Kết quả push về điện thoại → Nhận thưởng Natcash
  
Marchann vẫn ở đó — nhưng giờ là AGENT CÔNG NGHỆ, không chỉ là người ghi số
```

**So what?** Chatbot **không thay thế Marchann** — nó **nâng cấp Marchann** lên thành digital agent, giữ nguyên văn hóa tin tưởng cá nhân trong khi mở rộng quy mô theo cấp số nhân.

***

## PHẦN 1: KIẾN TRÚC MÔ HÌNH ĐA CẤP 3 TẦNG

### 1.1 Tổng quan Cấu trúc MLM

```
╔══════════════════════════════════════════════════════════════╗
║                    NATCOM / NATLOTO                          ║
║                    (Platform Owner)                          ║
║         GGR sau thưởng → Doanh thu ròng NATCOM              ║
╚══════════════════╦═══════════════════════════════════════════╝
                   ║ Phân bổ hoa hồng lên mạng lưới
    ╔══════════════╩══════════════════════════╗
    ║         TẦNG 1: SUPER AGENT              ║
    ║  (Natcash Super Agents hiện có — 68 SAs) ║
    ║  Vùng phủ: Tỉnh/Huyện                   ║
    ║  Hoa hồng: % trên toàn bộ volume tầng dưới║
    ╚═══════╦══════════════════════╦═══════════╝
            ║                      ║
    ╔═══════╩══════╗      ╔════════╩═══════════╗
    ║  TẦNG 2:     ║      ║    TẦNG 2:         ║
    ║ MARCHANN     ║      ║   MARCHANN         ║
    ║ AGENT        ║      ║   AGENT            ║
    ║ (Bốt đầu    ║      ║  (Bốt đầu ngõ)    ║
    ║  ngõ số hóa) ║      ║                    ║
    ╚═══╦══════════╝      ╚════════╦═══════════╝
        ║ Giới thiệu               ║
    ╔═══╩══════════════════════════╩═══════════╗
    ║          TẦNG 3: NGƯỜI CHƠI (END USER)   ║
    ║          Mua vé qua WhatsApp Bot          ║
    ╚══════════════════════════════════════════╝
```


### 1.2 Định nghĩa Chi tiết Từng Tầng

| Tầng | Tên vai trò | Số lượng mục tiêu | Điều kiện tham gia | Kênh hoạt động |
| :-- | :-- | :-- | :-- | :-- |
| **L0** | NATCOM Platform | 1 | N/A — chủ sân chơi | Backend + Policy |
| **L1** | Super Agent (SA) | 68 → 200 📙 | Natcash Super Agent hiện có [^2] | Quản lý vùng, onboard L2 |
| **L2** | Marchann Agent (MA) | 5,000 → 35,000 📙 | Bốt borlette + Natcash basic | Bán vé trực tiếp, hỗ trợ L3 |
| **L3** | End User (EU) | 20,000 → 500,000 📙 | Có WhatsApp + Natcash | Mua vé tự phục vụ |


***

## PHẦN 2: CƠ CHẾ HOA HỒNG \& PHÂN BỔ DOANH THU

### 2.1 House Edge \& Pool Phân Bổ

Borlette 2 số tại Haiti có house edge ~40% 📘 Benchmark (người chơi thắng trung bình 60 HTG cho mỗi 100 HTG cược). Đây là pool để NATCOM vừa chi trả thưởng vừa phân bổ hoa hồng mạng lưới:

```
Mỗi 100 HTG vé bán ra:
┌─────────────────────────────────────────────────────────────┐
│  60 HTG  → Prize Pool (chi trả người thắng)                 │
│  40 HTG  → Gross Revenue (GGR) phân bổ như sau:             │
│  ─────────────────────────────────────────────              │
│   8 HTG  → Marchann Agent L2 (8%)                           │
│   3 HTG  → Super Agent L1 (3%)                              │
│   2 HTG  → Referral bonus người giới thiệu (2%)             │
│   2 HTG  → Marketing & Operations fund (2%)                 │
│  25 HTG  → NATCOM Net Revenue (25%)                         │
└─────────────────────────────────────────────────────────────┘
```


### 2.2 Ma trận Hoa hồng Chi tiết

| Nguồn giao dịch | L2 Marchann | L1 Super Agent | Referral User | NATCOM Net |
| :-- | :-- | :-- | :-- | :-- |
| **Vé mua qua QR của MA** | **8%** | 3% | — | 25%+ |
| **Vé mua tự phục vụ (EU giới thiệu bạn)** | 4% (MA quản lý vùng) | 2% | **2% (cho EU giới thiệu)** | 29%+ |
| **Vé mua hoàn toàn organic (không ref)** | 2% (pool chung) | 1% | — | 33%+ |
| **Vé mua qua kênh diaspora** | — | 1% | 3% (người giới thiệu) | 33%+ |

> 📙 Assumption: Tỷ lệ trên cần cân chỉnh theo unit economics thực tế sau pilot. Mục tiêu: Tổng hoa hồng mạng lưới ≤ 15% GGR.

### 2.3 Cơ Chế Tính Thưởng Theo Volume (Gamification)

Học từ mô hình LootBot (Tier 1-4)  và MLM thực tiễn, áp dụng **Volume-Based Bonus** thay vì flat commission:[^3][^4]

```
MARCHANN AGENT — Bảng Xếp Hạng Tháng:

Volume vé bán/tháng    Tier          Commission     Bonus
─────────────────────────────────────────────────────────
< 10,000 HTG           🥉 Debutan     8%            —
10,000 - 50,000 HTG    🥈 Machann     8% + 1%       200 HTG cash/tháng
50,000 - 200,000 HTG   🥇 Gran Mèt   8% + 2%       1,000 HTG + poster
200,000+ HTG           💎 Chanpyon    8% + 3%       5,000 HTG + uniform + signage

SUPER AGENT — Tính trên tổng volume vùng quản lý:

Volume vùng/tháng      Commission tổng
─────────────────────────────────────
< 500,000 HTG          3%
500,000 - 2M HTG       3.5%
2M - 10M HTG           4%
10M+ HTG               5% + annual incentive trip
```


***

## PHẦN 3: VÒNG LẶP VIRAL — "MARCHANN DIGITAL" ENGINE

### 3.1 Thiết kế Viral Loop Tích hợp Văn hóa Borlette

Khác với viral loop thuần kỹ thuật, mô hình này khai thác **3 hành vi xã hội có sẵn của người Haiti**:

```
HÀNH VI 1: "Mua giúp" (Proxy Buying)
─────────────────────────────────────
Marchann thường mua vé hộ cho khách lớn tuổi không biết dùng điện thoại
→ Chatbot tính năng: [Achte pou yon moun] — nhập số điện thoại người nhận
→ Marchann giữ nguyên vai trò trung gian tin cậy
→ Commission vẫn về Marchann dù người chơi tự mua sau này

HÀNH VI 2: "Tchala — Mua theo số giải mộng" 
─────────────────────────────────────────────
Người Haiti tin chọn số theo giấc mơ (Tchala) [web:46]
→ Bot tính năng: "Bò konsa w reve?" → AI gợi ý số theo Tchala
→ Share kết quả lên WhatsApp Group → Viral organic
→ Mỗi share có embedded referral link của Marchann

HÀNH VI 3: "Wè pou wè" (Cùng xem kết quả)
────────────────────────────────────────────
Người dân tụ tập tại bốt lúc 18h chờ xem kết quả
→ Bot push kết quả đẹp về Marchann trước 5 phút
→ Marchann broadcast trong WhatsApp group xóm
→ "Vini wè rezilta yo!" → Traffic về bốt + chatbot
```


### 3.2 Cơ chế Referral Kỹ thuật số

```
Mỗi Marchann Agent nhận:
┌──────────────────────────────────────────────────┐
│ 1. QR Code cá nhân (in tại bốt)                  │
│ 2. Link WhatsApp: t.me/NatLotoBot?start=MA_ID     │
│ 3. WhatsApp Business button: "Jwe Natloto la a"   │
│ 4. Poster A3 (in màu NATCOM phát miễn phí)        │
└──────────────────────────────────────────────────┘

Khi User quét QR/click link:
    → Bot ghi nhận: user_id ← referrer = MA_ID
    → Vĩnh viễn (lifetime attribution): mọi vé user này mua
      → Commission về MA đó, dù user mua bất kỳ lúc nào

Attribution Rules:
    - First-touch attribution: Agent đầu tiên giới thiệu user → ownership
    - Nếu user đổi agent sau 90 ngày inactive: agent mới được nhận
    - Dispute resolution: timestamp + IP log
```


### 3.3 "Bốt Số" → Điểm Phát/Nhận Thưởng Vật Lý

Đây là điểm then chốt giải quyết **pain point lớn nhất**: người dân quen **nhận tiền mặt** khi thắng, không phải credit ví điện tử.

```
LUỒNG NHẬN THƯỞNG HỖN HỢP:

Thắng < 1,000 HTG:
    → Auto credit Natcash (không cần ra bốt)
    → Thông báo: "🎉 500 HTG nan Natcash ou deja!"

Thắng 1,000 - 10,000 HTG:
    → Chọn: [💳 Natcash] hoặc [🏪 Retire nan Ajan]
    → Nếu chọn agent: Tạo mã PIN 6 số → Đến bốt Marchann bất kỳ
    → Marchann nhập mã → Xác thực → Chi tiền mặt
    → Marchann được hoàn tiền từ Natcash ngay lập tức + 0.5% service fee

Thắng > 10,000 HTG:
    → Bắt buộc đến Natcash Super Agent hoặc chi nhánh NATCOM
    → Xuất trình CMND + mã xác nhận từ bot
    → KYC verification → Chi tiền mặt hoặc chuyển khoản
```


***

## PHẦN 4: ONBOARDING MARCHANN AGENT — "SỐ HÓA BỐT ĐẦU NGÕ"

### 4.1 Quy trình Tuyển dụng \& Kích hoạt Agent

```
BƯỚC 1: TIẾP CẬN (Tuần 1-4)
─────────────────────────────
Super Agent đến từng bốt borlette trong vùng
Pitch 3 câu: "NATCOM baji ou yon telefòn pou vann Natloto.
               Ou touche X% sou chak bilye.
               Kliyan ou yo ka achte san kash, ou toujou resevwa pa w."

BƯỚC 2: ĐĂNG KÝ (5 phút)
──────────────────────────
WhatsApp SA gửi link onboard: https://agent.natloto.ht
→ Nhập số Natcash → Tên bốt → Địa chỉ GPS (tự động qua phone)
→ Chụp ảnh bốt (verification)
→ Ký kỹ thuật số ToS Agent
→ Nhận MA_ID ngay lập tức

BƯỚC 3: KÍCH HOẠT (Ngay hôm đó)
──────────────────────────────────
Bot gửi:
✅ QR Code A4 (lưu và in)
✅ Link WhatsApp cá nhân
✅ Bộ hướng dẫn 5 trang bằng Kreyòl (hình ảnh nhiều, chữ ít)
✅ 500 HTG bonus khi đạt 10 vé đầu tiên trong tuần 1

BƯỚC 4: VẬT PHẨM THỰC ĐỊA (3-5 ngày sau)
───────────────────────────────────────────
NATCOM phân phối qua Super Agent:
□ Poster A3 màu (tên bốt + QR cá nhân)
□ Sticker dán tủ kính
□ Tấm bảng "Natcash & Natloto" (nếu đạt tier Gran Mèt)
```


### 4.2 Công cụ Quản lý Dành cho Marchann Agent

```
AGENT DASHBOARD (qua WhatsApp bot — không cần app riêng):

Lệnh "/bilan" → Báo cáo hôm nay:
┌────────────────────────────────────┐
│ 📊 BILAN JOUNEN — 26/06/2026       │
│ Bilye vann: 47 bilye               │
│ Volume: 4,700 HTG                  │
│ Komisyon ou: 376 HTG (8%)          │
│ Kliyan aktif: 23 moun              │
│ Tier: 🥈 Machann (→ 45,300 HTG   │
│         pou rive Gran Mèt)         │
│ [💰 Retire Komisyon] [📈 Rapò]    │
└────────────────────────────────────┘

Lệnh "/kliyan" → Danh sách user đang thuộc attribution
Lệnh "/retire" → Rút hoa hồng về Natcash ngay lập tức
Lệnh "/share" → Lấy link giới thiệu mới nhất
```


***

## PHẦN 5: CẤU TRÚC DỮ LIỆU \& KIẾN TRÚC KỸ THUẬT MLM

### 5.1 Database Schema MLM

```sql
-- Agent Network
CREATE TABLE agents (
  id            UUID PRIMARY KEY,
  natcash_phone VARCHAR(15) UNIQUE NOT NULL,
  parent_sa_id  UUID REFERENCES agents(id),  -- Super Agent quản lý
  tier          ENUM('DEBUTAN','MACHANN','GRAN_MET','CHANPYON'),
  monthly_volume BIGINT DEFAULT 0,           -- HTG, reset mỗi tháng
  lifetime_volume BIGINT DEFAULT 0,
  location_gps  POINT,
  created_at    TIMESTAMP
);

-- User Attribution (lifetime)
CREATE TABLE user_agent_attribution (
  user_id       UUID REFERENCES users(id),
  agent_id      UUID REFERENCES agents(id),
  attributed_at TIMESTAMP,
  source        ENUM('QR_SCAN','WHATSAPP_LINK','DIRECT','DIASPORA'),
  PRIMARY KEY (user_id)   -- 1 user → 1 agent, lifetime
);

-- Commission Ledger
CREATE TABLE commissions (
  id            UUID PRIMARY KEY,
  ticket_id     UUID REFERENCES tickets(id),
  agent_id      UUID REFERENCES agents(id),
  tier_level    INT,           -- 1=SA, 2=MA, 3=Referral User
  amount_htg    DECIMAL(10,2),
  rate_pct      DECIMAL(5,3),  -- 0.08 = 8%
  status        ENUM('PENDING','PAID','HELD'),
  created_at    TIMESTAMP
);

-- Commission Payouts (batch hoặc on-demand)
CREATE TABLE commission_payouts (
  id            UUID PRIMARY KEY,
  agent_id      UUID REFERENCES agents(id),
  period_start  DATE,
  period_end    DATE,
  total_amount  DECIMAL(12,2),
  natcash_txn_id VARCHAR(50),  -- transaction ID Natcash khi trả
  paid_at       TIMESTAMP
);
```


### 5.2 Commission Calculation Engine

```javascript
// Khi tạo ticket thành công
async function calculateAndRecordCommissions(ticket) {
  const { userId, amountHTG, ticketId } = ticket;
  
  // Lấy agent attribution của user
  const attribution = await db.getUserAttribution(userId);
  const marchann = await db.getAgent(attribution.agentId);
  const superAgent = await db.getAgent(marchann.parentSaId);
  
  const commissions = [];
  
  // L2: Marchann Agent
  if (marchann) {
    const rate = getTierRate(marchann.tier); // 8-11% tuỳ tier
    commissions.push({
      agentId: marchann.id, tierLevel: 2,
      amount: amountHTG * rate, rate
    });
  }
  
  // L1: Super Agent (tính trên volume của Marchann trong vùng)
  if (superAgent) {
    const saRate = getSATierRate(superAgent.monthlyVolume); // 3-5%
    commissions.push({
      agentId: superAgent.id, tierLevel: 1,
      amount: amountHTG * saRate, rate: saRate
    });
  }
  
  // Referral User (nếu có, từ viral loop)
  const referrer = await db.getUserReferrer(userId);
  if (referrer && referrer.isWithin60Days) {
    commissions.push({
      userId: referrer.id, tierLevel: 3,
      amount: amountHTG * 0.02, rate: 0.02  // 2%
    });
  }
  
  // Batch insert + update agent volumes
  await db.insertCommissions(commissions);
  await db.updateAgentVolume(marchann.id, amountHTG);
  await db.updateAgentVolume(superAgent.id, amountHTG);
}
```


***

## PHẦN 6: GO-TO-MARKET MLM — 12 TUẦN RA MẮTL

### 6.1 Lộ Trình Kích Hoạt Mạng Lưới

```
THÁNG 1: "GRAND LANCEMENT" (Kích hoạt 68 Super Agents)
──────────────────────────────────────────────────────
Tuần 1: Hội thảo SA tại Port-au-Prince + Cap-Haïtien
         → Demo chatbot live
         → Phát bộ công cụ onboard Marchann
         → Mục tiêu: 68 SA cam kết onboard ≥ 20 MA mỗi người
         
Tuần 2-4: SA xuống thực địa kích hoạt Marchann
         → Target: 1,360 Marchann Agents (68 × 20)
         → Mỗi MA onboard: SA nhận 500 HTG bonus
         → Phân bổ vật phẩm: poster, sticker, hướng dẫn Kreyòl

THÁNG 2: "PREMYE KLIYAN" (10,000 users đầu tiên)
─────────────────────────────────────────────────
Tuần 5-6: Mỗi MA kích hoạt ≥ 10 end users (= 13,600 users)
          → Gamification: MA nào đạt 10 EU đầu tiên nhận 1,000 HTG
          → Free bet 100 HTG cho mỗi EU mới qua link MA

Tuần 7-8: Chiến dịch "Tiraj Espesyal" — Draw đặc biệt
          → Jackpot 500,000 HTG dành riêng cho kênh chatbot
          → PR trên Radio Métropole, Radio Caraïbes
          → Mục tiêu: 25,000 active users

THÁNG 3: "KWASANS" (Scale lên 35,000 MA)
──────────────────────────────────────────
Tuần 9-10: Mở rộng Artibonite, Nord, Sud, Nippes
           → NATCOM đã có hạ tầng viễn thông toàn quốc [web:24]
           
Tuần 11-12: Diaspora activation
            → Haitian-Americans tại Miami, NYC, Boston
            → "Achte bilye pou fanmi ou Ayiti" campaign
            → Partner với NATCOM diaspora remittance [web:27]
```


### 6.2 Incentive Structure — Tháng Đầu Ra Mắt

```
🎁 CHƯƠNG TRÌNH KHAI TRƯƠNG (Tháng 1 & 2 only):

FOR SUPER AGENTS:
    + 500 HTG / mỗi Marchann mới onboard thành công
    + Double commission tháng đầu (6% thay vì 3%)
    + Top 5 SA volume → Thưởng điện thoại Android 📙

FOR MARCHANN AGENTS:
    + 100 HTG bonus khi kích hoạt tài khoản
    + 50 HTG bonus mỗi 10 EU mới
    + Free kit in ấn (poster + sticker) — NATCOM đài thọ
    + Tier Gran Mèt ngay tháng đầu nếu đạt 30,000 HTG volume

FOR END USERS:
    + 100 HTG free bet khi đăng ký lần đầu
    + 50 HTG khi giới thiệu 1 người chơi mới
    + Tham gia "Tiraj Espesyal" jackpot chatbot-only
```


***

## MA TRẬN RỦI RO MLM

| Rủi ro | P | I | Điểm | Biện pháp |
| :-- | :-- | :-- | :-- | :-- |
| Agent rút tiền thưởng trước khi xác thực vé | 🔴 4 | 🟡 3 | **12** | Hold commission 24h sau draw, không trả trước kết quả |
| Super Agent thông đồng tạo fake users | 🟡 3 | 🔴 5 | **15** | GPS verification, transaction velocity check, audit SA định kỳ |
| Marchann thu tiền mặt không qua Natcash | 🟡 3 | 🟡 4 | **12** | Quy định ToS + không commission nếu giao dịch ngoài hệ thống |
| Pyramid collapse (top SA dominate) | 🟡 3 | 🟡 3 | **9** | Cap commission SA tại 5%, phân vùng địa lý bắt buộc |
| Người dùng < 18 tuổi được MA onboard | 🟡 3 | 🟡 4 | **12** | MA chịu trách nhiệm pháp lý nếu onboard user vi phạm (trong ToS) |
| SA cạnh tranh nhau giành MA | 🟢 2 | 🟡 3 | **6** | Phân vùng địa lý (SA không overlap territory) |


***

## ✅ CHECKLIST MLM TRIỂN KHAI THỰC CHIẾN

### 🔴 Nền tảng Kỹ thuật (Trước launch 4 tuần)

- [ ] Build commission calculation engine + ledger DB
- [ ] Agent onboarding bot flow (WhatsApp)
- [ ] QR code generator per agent (UUID-based)
- [ ] `/bilan` dashboard command cho Agent
- [ ] `/retire` — rút hoa hồng về Natcash (Merchant API)
- [ ] Lifetime user-agent attribution logic
- [ ] Commission hold/release sau 24h post-draw


### 🟡 Mạng Lưới Agent (Tuần 1-4)

- [ ] Hội thảo 68 Super Agents hiện có[^2]
- [ ] Phát bộ công cụ: hướng dẫn Kreyòl + QR + vật phẩm in ấn
- [ ] Đặt mục tiêu: 1,360 Marchann Agents trong tháng 1
- [ ] Phân vùng địa lý SA (tránh overlap conflict)
- [ ] Agent ToS bằng Kreyòl + Français (ký kỹ thuật số)


### 🟢 Viral \& Community (Tuần 5-12)

- [ ] Chiến dịch free bet 100 HTG cho EU mới
- [ ] Tiraj Espesyal jackpot chatbot-only (PR event)
- [ ] Referral user commission tracking (2% trong 60 ngày)
- [ ] Mở rộng Artibonite, Nord, Sud (qua SA mới)
- [ ] Diaspora campaign kết hợp NATCOM International[^5]


### 📈 Monitoring \& Optimization (Liên tục)

- [ ] Dashboard real-time: GMV per SA, per MA, per vùng
- [ ] Fraud detection: velocity + GPS anomaly alerts
- [ ] Tier recalculation tự động vào ngày 1 hàng tháng
- [ ] Commission payout batch job (hàng ngày 23:00 HTZ)
- [ ] Monthly SA performance review + retraining

***

> **📌 Nguyên tắc cốt lõi:** Mô hình này không phải là pyramid scheme — đây là **Distribution Franchise** hợp pháp tương tự MTN MoMo Ghana, nơi agents nhận commission dựa trên **giao dịch thực** (vé bán được), không phải trên việc tuyển dụng agent mới. Marchann không trả phí gia nhập. Mọi commission có nguồn gốc từ house edge hợp pháp của Natloto.[^6]
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20][^21][^22][^23][^24][^25][^26][^27][^28][^29][^30][^31][^32][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://fic.tufts.edu/publication-item/savings-and-chance/

[^2]: https://www.digitaljournal.com/pr/news/binary-news-network/natcash-natcom-champion-haiti-s-1576151612.html

[^3]: https://docs.lootbot.xyz/lootbot/telegram-bot/about-telegram-bot/referral-program/benefit-for-partners

[^4]: https://unisapressjournals.co.za/index.php/SABR/article/view/12783

[^5]: https://www.newsworthy.ai/curated/natcom-expands-international-services-to-support-haitian-diaspor/202514149

[^6]: https://mfidie.com/how-much-commission-do-mtn-mobile-money-merchants-make/

[^7]: https://www.law.georgetown.edu/gender-journal/wp-content/uploads/sites/20/2023/04/GT-GJGL230006.pdf

[^8]: https://solx.bot

[^9]: https://publisher.unimas.my/ojs/index.php/IJBS/article/download/509/449

[^10]: https://affdays.com/post_articles/18986

[^11]: https://pmc.ncbi.nlm.nih.gov/articles/PMC8291665/

[^12]: https://habr.com/ru/articles/810635/

[^13]: https://doi.fil.bg.ac.rs/pdf/eb_book/2021/union_pf_ccr/union_pf_ccr-2021-ch3.pdf

[^14]: https://core.telegram.org/constructor/starRefProgram

[^15]: https://www.pyramidscheme.law/wp-content/uploads/2024/05/Beek-2019-Social-Anthrop-MLM-Capitalism-Kenya.pdf

[^16]: https://core.telegram.org/api/bots/referrals

[^17]: https://medium.com/@0xkryptokeisarii/how-to-earn-passive-income-with-crypto-telegram-trading-bot-referral-programs-63cebc45502c

[^18]: https://winwinbot.ru/solutions/referral

[^19]: https://flawlessmlm.com/en/gaming-mlm

[^20]: https://zafenou.com/bolet-haiti/

[^21]: https://www.gsma.com/mobilefordevelopment/programme/mobile-money/getting-the-agent-commission-model-right/

[^22]: https://timothyschwartzhaiti.com/the-haitian-market-system/

[^23]: https://img1.wsimg.com/blobby/go/f7748e26-2d27-4aa6-89fb-b263de90f421/downloads/mtn_momo_agent_commission.pdf

[^24]: https://kessbenonline.com/2023/11/30/momo-agents-to-limit-cashout-to-gh¢1000-per-transaction-over-unfair-commission-by-mtn/

[^25]: https://gamblingmaps.org/map/regulations/haiti

[^26]: https://yen.com.gh/business-economy/money/252716-mobile-money-agents-increased-commission-transactions-2000-above/

[^27]: https://fic.tufts.edu/wp-content/uploads/Savings-and-Chance.pdf

[^28]: https://www.gdn.int/microfinance-haiti

[^29]: https://ghstudents.com/become-an-mtn-mobile-money-agent/

[^30]: https://www.africa-press.net/ghana/all-news/momo-agents-to-limit-cash-out-transactions-to-gh₵1-000

[^31]: https://www.tiktok.com/discover/mtn-mobile-money-agent-commission-calculation-in-ghana

[^32]: https://davidfauquemberg.com/home/fauquemb/david/bbdg_site/userfiles/file/48761660498.pdf

