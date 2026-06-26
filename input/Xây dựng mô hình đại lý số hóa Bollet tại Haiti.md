<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Xây dựng mô hình đại lý số hóa Bollet tại Haiti: Cơ chế thưởng tức thì cho cửa hàng nhỏ và quản lý doanh số qua Telegram

Tôi có đủ dữ liệu. Tôi sẽ thiết kế một tài liệu kỹ thuật đặc thù — tập trung vào **cơ chế thưởng tức thì** và **Telegram agent dashboard** — hai yếu tố chưa được phân tích sâu trong báo cáo trước.

***

# 🏪 MÔ HÌNH ĐẠI LÝ SỐ HÓA BORLETTE HAITI

## Instant Reward Engine + Telegram Agent Management System

**Module:** 4.0 — Agent Operations Layer | **Bổ sung cho:** Báo cáo Khả thi v3.0 MLM

***

## 💡 INSIGHT CỐT LÕI: TẠI SAO "TỨC THỜI" LÀ TẤT CẢ

Người Haiti mua Borlette tại bốt đầu ngõ vì **3 lý do tâm lý sâu xa**, không đơn thuần là tiện lợi:

```
1. TIN TƯỞNG CÁ NHÂN     → Họ biết mặt marchann, marchann biết mặt họ
2. TIỀN MẶT TỨC THỜI     → Thắng xong = nhận tiền tại chỗ, không chờ đợi
3. RITUAL XÃ HỘI          → Đứng chờ kết quả cùng hàng xóm, chia vui tập thể
```

Chatbot thắng được nếu và chỉ nếu giữ được **cảm giác "tức thì"** đó trong không gian số. Mọi delay >30 giây đều là điểm rời bỏ (churn point).[^1]

***

## PHẦN 1: CƠ CHẾ THƯỞNG TỨC THÌ — "INSTANT WIN ENGINE"

### 1.1 Kiến Trúc 4 Lớp Thưởng

```
┌─────────────────────────────────────────────────────────────┐
│                  INSTANT WIN ARCHITECTURE                    │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  LAYER 1     │  LAYER 2     │  LAYER 3     │  LAYER 4       │
│  Micro Bonus │  Draw Win    │  Agent Cash  │  Jackpot       │
│  (Ngay lập  │  (5 phút    │  (Tại bốt   │  (Special      │
│   tức)      │   sau draw)  │   <2 phút)   │   event)       │
│             │              │              │                │
│ 50-200 HTG  │ 100-50K HTG  │ 1K-10K HTG  │ 500K+ HTG      │
│ Natcash     │ Natcash auto │ Tiền mặt    │ Manual verify  │
│ credit      │ hoặc agent   │ + Natcash   │ + bank         │
└──────────────┴──────────────┴──────────────┴────────────────┘
```


### 1.2 Layer 1 — Micro Bonus Tức Thì (Gamification Engine)

Đây là layer thưởng **ngay trong lúc tương tác** với bot, tạo dopamine loop giữ user gắn kết — học từ mô hình slot machine psychology:

```
TRIGGER → ACTION → REWARD (tất cả trong < 3 giây)

🎰 SCRATCH CARD MINI (sau mỗi lần mua vé):
─────────────────────────────────────────────
Bot: "🎫 Bilye ou konfime! 
      Gratte pou w wè si w genyen bonbon jodi a!"
      [🎰 Gratte Kati]  ← Button

User click:
      "⚡ 3... 2... 1..."
      [Animation 3 giây]
      
Result (xác suất 📙):
    70%  → 😊 "Pa t mache fwa sa. Eseye Demen!"
    20%  → 🎁 "+50 HTG Bonis nan Natcash ou!"  [credit tức thì]
    8%   → 🎁 "+200 HTG Bonis Espesyal!"        [credit tức thì]
    2%   → 🏆 "+500 HTG GROSÈ BONIS!"           [credit tức thì]

Expected value: ~55 HTG avg bonus per scratch
Cost per ticket sold: 55 HTG × 30% trigger rate = 16.5 HTG/ticket avg
→ Funded từ marketing budget, không phải prize pool 📙
```

```
🔥 STREAK BONUS (Mua liên tiếp):
──────────────────────────────────
Ngày 2 liên tiếp: +50 HTG
Ngày 5 liên tiếp: +200 HTG + badge "Jwè Fèb"
Ngày 10 liên tiếp: +500 HTG + title "Borlettè Pwofesyonèl"
Ngày 30 liên tiếp: +2,000 HTG + ưu tiên trong Tiraj Espesyal

⚡ LUCKY HOUR (Giờ vàng — 2 lần/ngày, 11h và 17h):
─────────────────────────────────────────────────────
"⚡ LUCKY HOUR! Vé mua trong 30 phút tới = Double chance thắng!"
→ Volume tăng đột biến trước draw (giờ 18h) 📙
```


### 1.3 Layer 2 — Draw Win Notification \& Auto-Payout

```javascript
// Sau mỗi draw (18:00 và 21:00 hàng ngày)
async function processDrawResults(drawResult) {
  const winners = await db.findWinners(drawResult);
  
  for (const winner of winners) {
    const prize = calculatePrize(winner.bet, drawResult, winner.gameType);
    
    // INSTANT: < 5 phút sau draw
    if (prize.amount <= 1000) {
      await natcashAPI.creditInstant(winner.phone, prize.amount);
      await bot.sendMessage(winner.chatId, {
        text: `🎉 *OU GENYEN ${prize.amount} HTG!*\n` +
              `Lajan an nan Natcash ou deja ✅\n` +
              `Bilye: #${winner.ticketId}\n` +
              `[🎱 Achte Ankò] [💰 Wè Solde Mwen]`,
        parse_mode: 'Markdown'
      });
    }
    
    // FAST: < 10 phút, agent cash available
    else if (prize.amount <= 10000) {
      const winCode = generateSecureWinCode(winner.id, prize.amount);
      await db.holdPrize(winner.id, prize.amount, winCode);
      await bot.sendMessage(winner.chatId, {
        text: `🏆 *OU GENYEN ${prize.amount} HTG!*\n\n` +
              `Opsyon 1: 💳 Mete nan Natcash [bouton]\n` +
              `Opsyon 2: 🏪 Retire nan nenpòt Ajan\n` +
              `         Kòd ou: *${winCode}*\n` +
              `         (Valab pou 48 è)\n\n` +
              `🗺️ [Jwenn Ajan ki pi Pre w]`
      });
    }
  }
}
```


### 1.4 Layer 3 — Cash Redemption tại Bốt Marchann

Đây là **tính năng giữ văn hóa bốt đầu ngõ** trong kỷ nguyên số:

```
LUỒNG NHẬN THƯỞNG TẠI BỐT (< 2 phút):

[Người thắng đến bốt Marchann gần nhất]
    ↓
Marchann mở bot Telegram → Lệnh /cash
    ↓
Bot hiện form: "Entèr kòd genyen klyan:"
    ↓
Marchann nhập WIN-CODE (6 chữ số từ người thắng)
    ↓
Bot verify:
    ✅ Hợp lệ → "Konfime: [Tên user] | [X] HTG | Chi tiền"
    ❌ Sai → "Kòd la pa bon. Eseye ankò."
    ⏰ Hết hạn → "Kòd sa ekspire. Kliyan pa gen dwa resevwa."
    ↓
Marchann chi tiền mặt
    ↓
Marchann bấm [✅ Konfime Peye]
    ↓
Hệ thống:
    → Debit từ Prize Holding Pool
    → Credit Natcash của Marchann (hoàn tiền ngay lập tức)
    → + 0.5% service fee cho Marchann (ví dụ: 50 HTG thưởng, MA nhận +2.5 HTG)
    → Log giao dịch đầy đủ cho audit
    ↓
Bot confirm cả 2 bên:
    → Marchann: "✅ Ranbousman 10,050 HTG nan Natcash ou"
    → User: "✅ [Tên Marchann] te konfime peye ou 10,000 HTG"
```

**Lợi ích kép:** Marchann có thêm nguồn thu từ service fee, tạo **động lực chủ động quảng bá chatbot** vì mỗi win redemption = thêm tiền vào Natcash của họ.

***

## PHẦN 2: TELEGRAM AGENT MANAGEMENT SYSTEM

### 2.1 Tại Sao Telegram cho Agent, WhatsApp cho End User?

| Tiêu chí | WhatsApp (End User) | Telegram (Agent) |
| :-- | :-- | :-- |
| Mục đích | Mua vé đơn giản, mass market | Quản lý kinh doanh, power users |
| Bot capabilities | Basic, text-based | Rich: inline buttons, file, charts |
| Group/Channel | Giới hạn | Unlimited — broadcast tốt hơn |
| Mini App (WebApp) | ❌ | ✅ Full web app trong chat |
| Affiliate API | ❌ | ✅ Native [^2] |
| Data export | ❌ | ✅ CSV, báo cáo tự động |
| Free API | Tốn phí (BSP) | Miễn phí hoàn toàn |

💡 **Kiến trúc tách kênh:** WhatsApp = giao diện người chơi cuối. Telegram = cockpit quản lý của Marchann và Super Agent.

### 2.2 Telegram Agent Bot — Màn Hình Chính (Home Dashboard)

```
╔══════════════════════════════════════════╗
║  🏪 NATLOTO AGENT PANEL                  ║
║  Bonjou, Ti Makè Bòzò! 👋                ║
║  ID: MA-4821 | Tier: 🥇 Gran Mèt         ║
╠══════════════════════════════════════════╣
║  📊 JODI A — 26 Jen 2026                 ║
║  ─────────────────────────────           ║
║  🎫  Bilye vann:      47                 ║
║  💰  Volume:          7,050 HTG          ║
║  💵  Komisyon ou:     564 HTG (8%)       ║
║  👥  Kliyan aktif:    23 moun            ║
║  🏆  Genyen kliyan:   3 moun             ║
║  💳  Cash redemption: 2 (1,800 HTG)     ║
╠══════════════════════════════════════════╣
║  📈 Mwa Sa (Jen):     98,400 HTG         ║
║  🎯 Pou Gran Mèt:     101,600 HTG kite   ║
║  ████████████░░░░░░░░  49% ✅             ║
╠══════════════════════════════════════════╣
║ [💰 Komisyon]  [👥 Kliyan]  [📊 Rapò]   ║
║ [💳 Cash Win]  [🔗 Lyen]    [⚙️ Seten]  ║
╚══════════════════════════════════════════╝
```


### 2.3 Menu Chi tiết Từng Tính Năng

**A. 💰 Quản lý Hoa hồng — `/komisyon`**

```
╔══════════════════════════════════════════╗
║  💰 KOMISYON MWEN                        ║
╠══════════════════════════════════════════╣
║  ✅ Disponib pou retire:  2,841 HTG      ║
║  ⏳ Pandan procesis:         564 HTG     ║
║     (konfime apre tiraj 18h)             ║
║  📦 Mwa sa (total):        8,234 HTG     ║
║  🏦 Retire deja (Jen):     5,393 HTG     ║
╠══════════════════════════════════════════╣
║  Istwa 7 jou dènye:                      ║
║  20/06 ████████ 1,240 HTG               ║
║  21/06 ██████   980 HTG                 ║
║  22/06 ██████████ 1,560 HTG             ║
║  23/06 ████     620 HTG                 ║
║  24/06 ███████  1,100 HTG               ║
║  25/06 ██████   941 HTG                 ║
║  26/06 ████     564 HTG (jodi)          ║
╠══════════════════════════════════════════╣
║  [💸 RETIRE KOUNYE A]                    ║
║  → Transfere 2,841 HTG nan Natcash ou   ║
╚══════════════════════════════════════════╝
```

**B. 👥 Quản lý Khách hàng — `/kliyan`**

```
╔══════════════════════════════════════════╗
║  👥 KLIYAN MWEN (23 aktif / 47 total)   ║
╠══════════════════════════════════════════╣
║  🔥 Pi aktif jodi a:                     ║
║  1. +509 37XX-XXXX  → 5 bilye | 750 HTG ║
║  2. +509 34XX-XXXX  → 4 bilye | 400 HTG ║
║  3. +509 38XX-XXXX  → 3 bilye | 600 HTG ║
╠══════════════════════════════════════════╣
║  😴 Pa achte 7 jou (ris pèdi):          ║
║  • 12 kliyan inaktif                    ║
║  [📣 Voye Rapèl] ← Bot auto-message     ║
╠══════════════════════════════════════════╣
║  🆕 Nouvo kliyan semenn sa:  4 moun     ║
║  📊 Retansyon mwa: 68%                  ║
╚══════════════════════════════════════════╝
```

**C. 💳 Cash Redemption — `/cash`**

```
╔══════════════════════════════════════════╗
║  💳 PEYE GENYEN                          ║
╠══════════════════════════════════════════╣
║  Tape kòd genyen klyan an:               ║
║  ▶ _____________                         ║
╚══════════════════════════════════════════╝

[User nhập: 847291]
    ↓
╔══════════════════════════════════════════╗
║  ✅ KÒD VALAB                            ║
╠══════════════════════════════════════════╣
║  👤 Kliyan: Ti Jan (***-7823)            ║
║  🏆 Genyen: 3,500 HTG                   ║
║  🎫 Bilye: Bolet #47 | Draw 25/06 18h   ║
║  ⏰ Ekspire: 27/06 18:00                 ║
╠══════════════════════════════════════════╣
║  Ranbousman: 3,517.50 HTG nan Natcash   ║
║  (3,500 + 0.5% = 17.50 HTG pou ou)     ║
╠══════════════════════════════════════════╣
║  [✅ KONFIME — Ban Ti Jan 3,500 HTG]    ║
║  [❌ Anile]                              ║
╚══════════════════════════════════════════╝
```

**D. 📊 Báo cáo \& Analytics — `/rapò`**

```
╔══════════════════════════════════════════╗
║  📊 RAPÒ KONPLÈ                          ║
╠══════════════════════════════════════════╣
║  [Jodi] [Semenn] [Mwa] [📥 Telechaje]   ║
╠══════════════════════════════════════════╣
║  SEMENN SA (20-26 Jen):                  ║
║                                          ║
║  Volume total:    48,400 HTG             ║
║  Komisyon total:  3,872 HTG              ║
║  Scratch bonus:   +340 HTG (kliyan)     ║
║  Cash redemption: 4 tranzaksyon         ║
║                                          ║
║  🎮 Game breakdown:                      ║
║  Bolet 2 nimewo:  71% | 34,364 HTG      ║
║  Maryaj:          21% | 10,164 HTG      ║
║  Lotto3:           8% |  3,872 HTG      ║
║                                          ║
║  ⏰ Peak hours:   17h-18h (38% volume)  ║
║  📱 Kliyan via QR: 89% | Link: 11%      ║
╠══════════════════════════════════════════╣
║  [📥 CSV] [📈 Grafik] [📤 Pataje SA]   ║
╚══════════════════════════════════════════╝
```


***

## PHẦN 3: KIẾN TRÚC KỸ THUẬT AGENT SYSTEM

### 3.1 Stack Công nghệ Đề xuất

```
TELEGRAM AGENT BOT STACK:

Backend:        Node.js + Fastify (high throughput)
Telegram SDK:   grammY (TypeScript-native, tốt hơn Telegraf)
State Machine:  XState hoặc custom FSM per agent session
Database:       PostgreSQL (agent data, commissions, ledger)
Cache/Queue:    Redis + BullMQ
Real-time:      WebSocket cho Admin super-dashboard
Reporting:      Chart.js render → PNG → gửi qua Telegram
Hosting:        VPS NATCOM datacenter hoặc AWS São Paulo

WHY grammY (không phải Telegraf):
    ✅ TypeScript first
    ✅ Plugin ecosystem (conversations, i18n, session)
    ✅ Webhook + polling đều hỗ trợ
    ✅ Middleware pipeline như Express
```


### 3.2 Conversation Flow State Machine cho Agent

```typescript
// Mỗi agent session là một state machine
type AgentState =
  | 'IDLE'              // Menu chính
  | 'CASH_REDEMPTION'   // Đang nhập WIN-CODE
  | 'AWAITING_CONFIRM'  // Chờ xác nhận chi tiền
  | 'WITHDRAW_CONFIRM'  // Rút hoa hồng
  | 'VIEW_REPORT'       // Xem báo cáo

// Ví dụ flow Cash Redemption
const cashFlow = new Conversation(async (conv, ctx) => {
  await ctx.reply("Tape kòd genyen klyan an:");
  const { message } = await conv.wait();
  const code = message.text?.trim().toUpperCase();

  const prize = await validateWinCode(code);

  if (!prize.valid) {
    await ctx.reply("❌ Kòd la pa bon oswa ekspire.");
    return;
  }

  await ctx.reply(formatPrizeConfirmation(prize), {
    reply_markup: confirmKeyboard
  });

  const confirm = await conv.waitForCallbackQuery(['confirm', 'cancel']);

  if (confirm.data === 'confirm') {
    await processCashRedemption(prize, ctx.agent.id);
    await ctx.reply(`✅ Ranbousman ${prize.amount + fee} HTG voye nan Natcash ou!`);
  }
});
```


### 3.3 Hệ thống Broadcast — Super Agent → Marchann

Telegram Channel là công cụ quản lý vùng tốt nhất cho Super Agent:[^2]

```
SA OPERATIONS CENTER (Telegram Channel riêng mỗi SA):

Auto-broadcasts hàng ngày:
─────────────────────────
07:00: "☀️ Bonjou! Jodi a se [Dat]. Tiraj 18h ak 21h.
         Koutim: [draw type]. Prepare kliyan ou yo!"

17:45: "⚡ 15 MINIT ANVAN TIRAJ!
         Dènye chans achte bilye.
         Kliyan ou yo sou WhatsApp: [link bot]"

18:05: "🎰 REZILTA TIRAJ 18H:
         Bolet: [XX-XX]
         Maryaj: [XX-XX-XX]
         Lotto3: [XX-XX-XX]
         Genyen: [N] kliyan nan rezo w!"

Daily 23:00: "📊 BILAN JOU WOU:
              Volume ou: [X] HTG | +[Y]% vs yè
              Top MA nan rezo w: [Tên MA]
              [Detay konplè]"
```


***

## PHẦN 4: GAMIFICATION LAYER — "BÒT LEADERBOARD"

### 4.1 Bảng Xếp Hạng Công khai (Thi đua giữa các Agent)

Học từ thành công của Telegram gaming bots  — tính cạnh tranh tự nhiên giữa Marchann:[^3]

```
📣 LEADERBOARD NATLOTO — JEN 2026
Klasseman Machann — Rejon Pòtoprens

🥇 #1 Bò Bòzò (MA-4821)        148,200 HTG
🥈 #2 Madam Elize (MA-2290)    134,800 HTG
🥉 #3 Ti Makè Jan (MA-0041)    121,400 HTG
4.  Granmoun Lò (MA-1182)      98,700 HTG
5.  Madam Filo (MA-3310)        87,200 HTG
...

Ou nan plas #12 / 340 Machann Rejon an
Volume ou: 48,400 HTG
Pou rive Top 10: +12,000 HTG kite (5 jou)

[🔥 Chwazi Plas 10 la!]
```

**Broadcast tự động:** Cuối tháng, SA broadcast kết quả + trao thưởng tháng qua Telegram group — tạo ceremony, giữ motivation.

### 4.2 Achievement Badges System

```
🏅 BADGE HỆ THỐNG:

[🌟 Premye Bilye]      → Bán vé đầu tiên
[🔥 Seri 7 jou]        → 7 ngày liên tiếp có giao dịch
[💎 100 Kliyan]        → Có 100 khách hàng dưới attribution
[🏆 Gran Mèt Mwa]      → Top 10 volume trong tháng
[⚡ Cash King]         → Xử lý >50 redemption trong tháng
[🌍 Rekritè Pwofesyonèl] → Giới thiệu >5 Marchann mới
[📣 Influenceur]       → Link giới thiệu đạt >200 EU

Badges hiển thị trong profile Agent + Certificate PDF có thể in
```


***

## PHẦN 5: KỊCH BẢN HOẠT ĐỘNG CỦA BỐT ĐẦU NGÕ SỐ HÓA — MỘT NGÀY LÀM VIỆC

```
🌅 6:30 SÁNG — TI MAKÈ BÒ MỞ BỐT
──────────────────────────────────
Telegram notification từ SA channel:
"☀️ Bonjou! Tiraj jodi a 18h & 21h. Chans bon jounen!"

Ti Makè dán poster mới (nhận từ NATCOM tuần trước)
Mở Telegram Agent Bot → Check /komisyon → Thấy 1,240 HTG pending

🕘 9:00 SÁNG — KHÁCH ĐẦU TIÊN
──────────────────────────────
Madam Kèlen (60 tuổi, không biết dùng smartphone):
"Ti Makè, achte m bolet #7 ak #23 pou 200 HTG"

Ti Makè mở WhatsApp → Bot → Lệnh "achte 07 23 200"
→ Betslip preview → Debit Natcash của Ti Makè
→ Confirmation: Vé #NL-4821-234 → Ti Makè báo Madam Kèlen

Commission +16 HTG ghi nhận tức thì ✅

🕐 13:00 TRƯA — KHÁCH TỰ MUA
─────────────────────────────
Ti Jak (25 tuổi) quét QR tại bốt → WhatsApp bot → Tự mua
Ti Makè không làm gì → Commission +8 HTG tự động [attribution]

🕕 17:45 CHIỀU — LUCKY HOUR
────────────────────────────
Telegram broadcast: "⚡ 15 phút còn lại! Kliyan ou yo đang chờ!"
Ti Makè forward message vào WhatsApp group xóm 30 người
→ 8 người mua thêm → Volume +1,200 HTG

🕕 18:05 CHIỀU — KẾT QUẢ
──────────────────────────
Broadcast kết quả:
"🎰 Bolet: 23-47 | Maryaj: 07-23-14"

WhatsApp notification đến Madam Kèlen:
"🎉 OU GENYEN 12,000 HTG! Kòd: 847291"
Madam Kèlen chạy đến bốt Ti Makè (như thường lệ)

Ti Makè: /cash → 847291 → Xác nhận → Chi 12,000 HTG tiền mặt
Natcash của Ti Makè: +12,060 HTG (12,000 hoàn + 60 HTG fee 0.5%)

🕘 21:00 TỐI — TỔNG KẾT
─────────────────────────
Ti Makè: /bilan
"Jodi a: 67 bilye | 10,050 HTG | Komisyon: +804 HTG ✅"
/retire → 804 HTG credit vào Natcash ngay lập tức

💤 Kết quả ngày làm việc của Ti Makè:
Commission: 804 HTG (~$5.7 USD)
Cash redemption fee: 60 HTG
TỔNG: 864 HTG (~$6.1 USD) cho 1 ngày 📙
```


***

## MA TRẬN RỦI RO — INSTANT REWARD ENGINE

| Rủi ro | P | I | Biện pháp tức thì |
| :-- | :-- | :-- | :-- |
| Agent nhập WIN-CODE giả | 🟡 3 | 🔴 4 | HMAC-signed code, 1 code = 1 lần dùng, rate limit 5 lần/giờ |
| Agent chi tiền rồi không bấm Confirm | 🟡 3 | 🟡 3 | Timeout 10 phút → auto-confirm + SMS alert |
| Natcash delay hoàn tiền Agent | 🟢 2 | 🔴 4 | Pre-funded escrow pool trong Natcash Merchant account |
| Agent offline khi user đến nhận thưởng | 🟡 3 | 🟡 3 | Nearest-agent finder, user chọn bất kỳ agent nào |
| Leaderboard farming (fake transactions) | 🟡 3 | 🟡 3 | Velocity detection + transaction pattern ML Phase 2 |
| Scratch card drained marketing budget | 🟢 2 | 🟡 3 | Daily cap per user (3 scratch/day), budget ceiling alert |


***

## ✅ CHECKLIST TRIỂN KHAI — AGENT SYSTEM

### 🔴 Build Core (Tuần 1-3)

- [ ] Telegram Bot đăng ký + webhook setup (grammY)
- [ ] Agent onboarding flow (đăng ký → nhận MA_ID → QR)
- [ ] `/bilan` daily dashboard command
- [ ] `/komisyon` + `/retire` → Natcash API payout
- [ ] `/cash` WIN-CODE validation + redemption flow
- [ ] WIN-CODE generator: HMAC-signed, 6 ký tự, TTL 48h
- [ ] Escrow pool Natcash pre-funded cho prize redemption
- [ ] SA Telegram Channel + auto-broadcast 3 lần/ngày


### 🟡 Gamification (Tuần 4-6)

- [ ] Scratch card mini-game engine (probability table)
- [ ] Streak tracking + bonus credit
- [ ] Monthly leaderboard tính toán + broadcast
- [ ] Badge system (6 badges phase 1)
- [ ] `/rapò` với chart PNG export (Chart.js → Telegram)
- [ ] Lucky Hour scheduler (2 lần/ngày)


### 🟢 Analytics \& Scale (Tuần 7-12)

- [ ] `/kliyan` với retention alert (inactive 7 ngày)
- [ ] SA operations center đầy đủ
- [ ] Agent performance dashboard (web, cho NATCOM management)
- [ ] A/B test: Scratch card vs Streak — đo churn reduction
- [ ] Geo-map agent coverage (tìm vùng trắng agent để tuyển dụng)
- [ ] Auto-retargeting: bot tự nhắc user inactive qua WhatsApp

***

> **📌 Nguyên tắc thiết kế:** Toàn bộ hệ thống được xây trên một triết lý duy nhất — **Marchann vẫn là trung tâm của mọi giao dịch**, chatbot chỉ là công cụ mở rộng bán kính và tốc độ. Tiền thưởng được nhận bằng tiền mặt tại bốt quen thuộc như cũ, nhưng an toàn hơn, minh bạch hơn, và có thể kiểm toán. Đây là sự khác biệt giữa "disrupting culture" và "digitizing culture" — NATCOM chọn cái sau.
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://fic.tufts.edu/publication-item/savings-and-chance/

[^2]: https://core.telegram.org/api/bots/referrals

[^3]: https://affdays.com/post_articles/18986

[^4]: https://apps.shopify.com/telepulse

[^5]: https://lottocore.com

[^6]: https://telloa.com

[^7]: https://github.com/indmdev/indmshopbot

[^8]: https://www.youtube.com/watch?v=GTH_IIijePA

[^9]: https://www.youtube.com/watch?v=A9RToH6hlXY

[^10]: https://storely.uz/en

[^11]: https://www.youtube.com/watch?v=on1kEMxbkgU

[^12]: https://joinposter.com/en/applications/revenue-dash-tracker-bot

[^13]: https://shopibot.app/en/

[^14]: https://smartup24.com/en/products/telegram-bot-for-order-management-amp-sales-control

[^15]: https://tcommerce.app

[^16]: https://play.google.com/store/apps/details?id=com.mindpower.souqbot

[^17]: https://github.com/yenyoong99/telebot_manager

[^18]: https://botami.pro

