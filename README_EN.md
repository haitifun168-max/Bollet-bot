<p align="center">
  <img src="https://img.icons8.com/fluency/96/lottery.png" alt="Natloto Agent System" width="96"/>
</p>

<h1 align="center">🎟️ Natloto Agent System (Haiti)</h1>

<p align="center">
  <strong>Digitized Borlette lottery booking bot, 3-tier MLM agent commission model & secure CEO Dashboard</strong><br/>
  <em>Auto-selling and ticket management bot integrated with Natcash mobile money (Haiti)</em>
</p>

<p align="center">
  <a href="README.md">🇻🇳 Tiếng Việt</a> | <b>🇬🇧 English</b>
</p>

<p align="center">
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Setup-Quick_Start-brightgreen?style=for-the-badge" alt="Setup"/></a>
  <img src="https://img.shields.io/badge/Market-Haiti_Borlette-blue?style=for-the-badge" alt="Market"/>
  <img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" alt="License"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Telegraf-4.x-229ED9?style=flat-square&logo=telegram&logoColor=white" alt="Telegraf"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Express-API_Server-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Natcash-Payment-FF6B35?style=flat-square" alt="Natcash"/>
</p>

---

## 📖 Project Overview

**Natloto Agent System** is a comprehensive digitized solution for **Borlette** lottery games (a highly popular, culturally-embedded lottery system in Haiti). The system operates seamlessly via a interactive **Telegram Bot**, leveraging a **3-tier MLM distribution network** (Super Agent, Marchann Agent, Referral User), and is monitored securely by Natcom executives through a premium **CEO Admin Web Dashboard**.

The project features a deep integration with the **Natcash mobile money network** (Natcom Haiti) for payments, supports querying the native Creole **Tchala** dream dictionary with 297 entries, provides batch play betting utilities, and secures lottery cash-outs using advanced HMAC-SHA256 signatures.

---

## ✨ Key Features

| Feature Group | Detailed Description |
|---------------|----------------------|
| 🎟️ **Borlette Betting** | Complete support for Bolet 2 (2 digits), Lotto 3 (3 digits), and Maryaj (2 pairs `XXxYY`). Sleek betting wizard directly inside the Telegram chat interface. |
| 🎲 **Dream-based Picking** | Search words in the native Creole **Tchala** dictionary to discover lucky numbers, generate random combinations (**Lucky Pick**), and get recommendations based on Zodiac signs. |
| ⚡ **Batch Play Checkout** | Players can input multiple numbers at once separated by commas or spaces (e.g., `12, 45, 88`) or hit **"🔥 Achte tout (Buy all)"** under dream searches or zodiac listings to add all numbers to the cart instantly. |
| 💰 **Natcash Integration** | High-contrast QR codes and payment simulator web links are generated on checkout. Successful payments trigger real-time webhooks, award random **Scratch Cards** up to 500 HTG, and track consecutive playing **Streaks**. |
| 🌐 **Multi-language (i18n)** | Real-time language switching on the Marchann interface. Fully supports Haitian Creole (`ht`), French (`fr`), and English (`en`). |
| 📊 **3-Tier MLM Model** | Automated agent categorization based on monthly sales volumes (Debutante, Marchann, Gran Met, Chanpyon). Commission splits: Super Agent (`3%`), Marchann (`8% - 11%`), and Referral User (`2%`). |
| 💵 **Booth Cash-out** | Winners receive secure HMAC-signed **Win-Codes** (48-hour TTL). Marchann Agents verify codes at physical booths using `/cash`, and receive the paid amount credited to their agent balance plus a **0.5% cash service fee**. |
| 🖥️ **CEO Web Dashboard** | Password-protected admin web app featuring real-time KPIs, monthly volume trends, regional map breakdown of Haiti departments, game type metrics, Marchann lists, and direct settings configuration. |

---

## ⚙️ Business Process Flows

### 1. Betting & Natcash WebApp Simulator Flow
```
Player: /play → Select game (Bolet/Lotto/Maryaj) → Choose numbers (Manual/Lucky/Tchala) → Select amount
                                              ↓
Player: Clicks 💳 Peye (Checkout) → Bot creates payment_ref + high-contrast QR & simulator link
                                              ↓
Player: Opens Simulator → Inputs Natcash Phone Number → Clicks Trigger Webhook
                                              ↓
Bot Server: Receives webhook → Marks batch of tickets as PAID → Delivers Scratch Card & updates Streak ✅
```

### 2. 3-Tier MLM Commission Model
```
                  [ Successful Ticket Payout via Natcash (100% Volume) ]
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
  [ Super Agent ]             [ Marchann Agent ]             [ Referral User ]
    Receives 3%                 Receives 8% - 11%             Receives 2% reward
   (Branch Sales)             (Based on monthly tier)         (For introducing F1)
```

### 3. Over-the-Counter Cash Payout (Booth Redemption)
```
Winner → Receives notification with secure Win-Code (HMAC-SHA256, TTL 48h)
                                      ↓
Winner visits physical booth of a Marchann Agent
                                      ↓
Marchann runs command: /cash [Win-Code]
                                      ↓
Bot checks HMAC signature in PostgreSQL → Validates details → Displays cash payout amount
                                      ↓
Marchann pays winner cash → System credits payout amount + 0.5% service fee to Marchann's wallet balance ✅
```

---

## 📁 Project Directory Structure

```
Bollet-bot/
├── .env.example              # Environment variables template
├── package.json              # Node.js project scripts and dependencies
├── LICENSE                   # MIT License
├── HUONG_DAN_SU_DUNG.md      # Detailed Vietnamese operations & user manual
├── scratch/                  # Scratch directory for setup & utility scripts
│   ├── import_tchala.js      # Parses and imports 297 dream terms into DB
│   └── test_tchala_queries.js# Verification script for multilingual dream lookups
└── src/
    ├── bot.js                # 🚀 Entry point - Starts Telegram Bot & Web Server
    ├── config.js             # ⚙️ Configuration loader from .env
    ├── database.js           # PostgreSQL connection driver (Supabase)
    ├── commands/             # 📋 Telegram Bot commands directory
    │   ├── start.js          # Bot initialization, referral attribution handler
    │   ├── play.js           # Interactive betting wizard (Supports batch play)
    │   ├── checkpay.js       # Checks transaction status for last order
    │   ├── menu.js           # Displays account, wallet & streak status
    │   ├── myid.js           # Retrieves user's Telegram ID
    │   ├── nap.js            # Top-up information instructions
    │   ├── support.js        # Support channel reference details
    │   └── agent/            # Exclusive commands for Marchann Agents
    │       ├── bilan.js      # Mini sales dashboard (Supports real-time Lang swap)
    │       ├── komisyon.js   # Commissions overview, 7-day charts, payout requests
    │       ├── cash.js       # Validates HMAC Win-Codes for booth cashouts
    │       ├── kliyan.js     # Lists referred customers & idle warnings
    │       ├── lyen.js       # Generates personalized QR codes and referral links
    │       └── leaderboard.js# Monthly top 10 agent ranking scoreboard
    ├── database/             # Database schema & execution
    │   ├── index.js          # PostgreSQL client connection pool
    │   ├── migrate.js        # Script to run schema.sql migrations
    │   └── schema.sql        # Tables definition, constraints & auto-tier triggers
    ├── handlers/             # Bot callback handlers & dialog controllers
    │   ├── adminActions.js   # Handles operations initiated by admin users
    │   ├── paymentConfirm.js # Handles manual verification overrides
    │   └── quantitySelect.js # Cart logic and bet amount selectors
    ├── public/               # Static assets for Web Simulator & Admin Web App
    │   ├── index.html        # Front-end for CEO Admin Dashboard
    │   ├── haiti_map.png     # Haiti department map visual representation
    │   └── haiti_map.svg     # SVG map file
    ├── services/             # Core business logic handlers (Service Layer)
    │   ├── agentService.js   # Regional metrics, tier checks, and registration
    │   ├── commissionService.js # Calculates commission rates and records ledger entries
    │   ├── drawService.js    # Draw scheduling, winning verification, and prize awards
    │   ├── leaderboardService.js # Aggregates top-performing agent metrics
    │   ├── mockNatcashService.js # Simulates Natcash webhooks, triggers deposits & payouts
    │   ├── scratchService.js # Scratch bonuses and user play streak calculations
    │   ├── tchalaService.js  # Multilingual search across the Tchala database table
    │   ├── userService.js    # User accounts database operations
    │   └── winCodeService.js # Win-Code generation and HMAC validator
    └── utils/                # Utility helpers
        ├── keyboard.js       # Standardized layout builder for Telegram keyboards
        ├── i18n.js           # Multi-language dictionary files (ht, fr, en)
        └── messages.js       # Localized system notification and text templates
```

---

## ⚡ Quick Start

### System Requirements
- [Node.js](https://nodejs.org/) v18 or higher
- A PostgreSQL database instance (We recommend **Supabase** for trigger function support).
- A Telegram Bot Token from [@BotFather](https://t.me/BotFather).

### 1️⃣ Clone & Install Dependencies
```bash
git clone https://github.com/your-repo/telegram-borlette-bot.git
cd telegram-borlette-bot
npm install
```

### 2️⃣ Configure Environment Variables
Copy the template configuration file:
```bash
cp .env.example .env
```
Open `.env` and fill in your settings:
```env
# Telegram Bot token from @BotFather
BOT_TOKEN=8812560741:AAHb7Ek_RgLiW2-hpyyJuBkpXWmMhQ491Xk

# Your Telegram user ID (Super Administrator)
ADMIN_ID=1076785545

# Brand configuration
SHOP_NAME=Natloto Agent
SUPPORT_CONTACT=@support_natloto

# PostgreSQL Connection String (Supabase)
DATABASE_URL=postgresql://postgres.user:password@aws-host:6543/postgres

# Key used to generate secure HMAC-SHA256 signatures for Win-Codes
HMAC_SECRET=haiti-borlette-secure-payout-hmac-key

# Natcash API details (Sandbox or Live Integration credentials)
NATCASH_API_URL=https://api.natcash.ht/v1
NATCASH_API_KEY=your_natcash_api_key_production
NATCASH_MERCHANT_ID=your_merchant_id_production

# Password to log in to the CEO Admin Dashboard
DASHBOARD_PASSWORD=ceo_natcom_secure_password
```

### 3️⃣ Run Database Migrations
Deploy the database structure, indexes, and triggers to Supabase PostgreSQL:
```bash
node src/database/migrate.js
```

### 4️⃣ Import Multilingual Tchala Dream Book
Sync the 297 dream terms and their lucky number mapping definitions into the PostgreSQL table:
```bash
node scratch/import_tchala.js
```

### 5️⃣ Run the Application
Start the bot in Development mode (auto-restarts on code edits):
```bash
npm run dev
```
Start the bot in Production mode:
```bash
npm start
```

---

## 🖥️ Natcash Simulator & CEO Web Dashboard

Once started, the Express server will listen on port `3000`, exposing the following web pages and APIs:

1. **Natcash Pay Simulator**: 
   - Address: `http://localhost:3000/demo/natcash`
   - A glassmorphism mobile simulator page that loads all `PENDING` checkout tickets. Users can enter their mock Natcash number and click **"Trigger Webhook"** to simulate payment events instantly, verifying commission credits and scratch card wins.
2. **CEO Admin Dashboard**:
   - Address: `http://localhost:3000/`
   - Log in using your `DASHBOARD_PASSWORD` value.
   - Allows executives to monitor KPIs, monthly revenue growth charts, Haiti department distribution maps, game statistics, agent tier lists, and update configuration options directly written to `system_config.json`.

---

## 📋 Telegram Bot Commands

### 👤 1. End User Commands
*   `/start` — 🔄 Initializes the bot, records referral attributes, and registers accounts.
*   `/play` — 🎟️ Launches the interactive Bolet 2, Lotto 3, and Maryaj betting wizard.
*   `/tchala` — 📖 Look up lucky numbers using Creole, French, or English dream words.
*   `/menu` — 👤 View your profile statistics, current streak, and wallet balances.
*   `/nap` — 💰 Get step-by-step instructions on depositing funds via Natcash.
*   `/checkpay` — 🔍 Query the transaction processing status of your latest betting request.
*   `/support` — 🆘 Retrieve customer service contacts for Natloto.
*   `/myid` — 🆔 Print your Telegram account ID.

### 💰 2. Marchann Agent Commands
*   `/bilan` — 📊 Mini executive dashboard for Marchanns showing sales metrics. Includes a **🌐 Lang** switch button.
*   `/komisyon` — 💰 Manage commission balances, review income charts, and request withdrawals.
*   `/cash [Win-Code]` — 💵 Booth Cashout: Check winning ticket codes using secure HMAC validation and receive service commissions.
*   `/kliyan` — 👥 View your MLM tree customers list with activity warnings (idle > 7 days).
*   `/lyen` — 🔗 Generate custom invitation QR codes and referral links.
*   `/leaderboard` — 🏆 Standings board displaying the top 10 performing agents in the network.

---

## 🛠️ Deployment Notes & Troubleshooting

### 🛑 Address Already in Use (`Error: listen EADDRINUSE: address already in use :::3000`)
If the server crashes because port `3000` is locked by a stale process:
- **Solution on Windows**:
  1. Find the Process ID (PID) binding port 3000:
     ```powershell
     netstat -ano | findstr :3000
     ```
  2. Kill the process (Replace `1234` with the PID returned in step 1):
     ```powershell
     taskkill /F /PID 1234
     ```
  3. Restart the bot server: `npm start`.

---

## 📄 License & Contributing
This repository is released under the **MIT** License. We welcome contributions and suggestions to improve Natloto's user experience through issues or pull requests.

---
<p align="center">
  If you find this project helpful, please give us a ⭐ <b>star</b> on GitHub!<br/>
  💬 Technical Support: <a href="https://t.me/cuongph1">@cuongph1</a>
</p>
