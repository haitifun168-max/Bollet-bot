const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Paths
const BASE_DIR = path.dirname(path.dirname(__dirname));
const DATA_DIR = path.join(BASE_DIR, 'data');
const CSV_DIR = path.join(DATA_DIR, 'natcom_demo_csv');
const DB_PATH = path.join(DATA_DIR, 'natcom_dashboard_demo.db');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(CSV_DIR)) {
    fs.mkdirSync(CSV_DIR, { recursive: true });
}

// Initialize SQLite
const db = new Database(DB_PATH);

// Helper for random integers [min, max]
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper for random choice
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Format date as YYYY-MM-DD HH:mm:ss
function formatDate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
           `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

// Generate phone number
function generatePhone(prefix = "31") {
    return `+509 ${prefix}${randomInt(10, 99)}-${randomInt(1000, 9999)}`;
}

// Drop existing tables and recreate structure
db.exec(`
    DROP TABLE IF EXISTS commission_payouts;
    DROP TABLE IF EXISTS rewards;
    DROP TABLE IF EXISTS commissions;
    DROP TABLE IF EXISTS tickets;
    DROP TABLE IF EXISTS user_agent_attribution;
    DROP TABLE IF EXISTS agents;

    -- Bảng agents
    CREATE TABLE agents (
        id TEXT PRIMARY KEY,
        natcash_phone TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        parent_sa_id TEXT,
        tier TEXT NOT NULL,
        location_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (parent_sa_id) REFERENCES agents(id)
    );

    -- Bảng user_agent_attribution
    CREATE TABLE user_agent_attribution (
        user_id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        source TEXT NOT NULL,
        attributed_at TEXT NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    -- Bảng tickets
    CREATE TABLE tickets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        game_type TEXT NOT NULL,
        bet_numbers TEXT NOT NULL,
        amount_htg REAL NOT NULL,
        status TEXT NOT NULL,
        prize_amount_htg REAL NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    -- Bảng commissions
    CREATE TABLE commissions (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        tier_level INTEGER NOT NULL,
        amount_htg REAL NOT NULL,
        rate_pct REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id),
        FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    -- Bảng rewards
    CREATE TABLE rewards (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        reward_type TEXT NOT NULL,
        amount_htg REAL NOT NULL,
        win_code TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id),
        FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    -- Bảng commission_payouts
    CREATE TABLE commission_payouts (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        period_month TEXT NOT NULL,
        total_amount REAL NOT NULL,
        natcash_txn_id TEXT NOT NULL,
        paid_at TEXT NOT NULL,
        FOREIGN KEY (agent_id) REFERENCES agents(id)
    );
`);

console.log("🏁 Đã tạo xong cấu trúc bảng cơ sở dữ liệu.");

// Constants
const REGIONS = ["Port-au-Prince", "Cap-Haïtien", "Gonaïves", "Les Cayes", "Port-de-Paix"];
const FIRST_NAMES = ["Ti Jan", "Madam Elize", "Bò Bòzò", "Madam Filo", "Ti Makè", "Jean", "Pierre", "Marie", "Joseph", "Nathalie", "Florence", "Dieudonné", "Mackenson", "Woody", "Clervaux"];
const LAST_NAMES = ["Bélizaire", "Célestin", "Duval", "Etienne", "Francois", "Gérard", "Jean-Baptiste", "Lafontant", "Michel", "Pierre-Louis"];

// 1. Generate Agents
const superAgents = [];
const marchannAgents = [];

// Generate 5 Super Agents
for (let i = 0; i < 5; i++) {
    const sa_id = crypto.randomUUID();
    const sa_name = `SA ${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`;
    const sa_phone = generatePhone("32");
    
    // Date from June 1, 2025 + random 0-150 days
    const createdDate = new Date(Date.UTC(2025, 5, 1, 12, 0, 0));
    createdDate.setUTCDate(createdDate.getUTCDate() + randomInt(0, 150));
    
    superAgents.push({
        id: sa_id,
        natcash_phone: sa_phone,
        name: sa_name,
        parent_sa_id: null,
        tier: "CHANPYON",
        location_name: REGIONS[i],
        created_at: formatDate(createdDate)
    });
}

// Generate 100 Marchann Agents
for (let i = 0; i < 100; i++) {
    const ma_id = crypto.randomUUID();
    const ma_name = `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`;
    const ma_phone = generatePhone(randomChoice(["31", "40", "41"]));
    const parentSa = randomChoice(superAgents);
    
    // Date from Sept 1, 2025 + random 0-90 days
    const createdDate = new Date(Date.UTC(2025, 8, 1, 12, 0, 0));
    createdDate.setUTCDate(createdDate.getUTCDate() + randomInt(0, 90));
    
    marchannAgents.push({
        id: ma_id,
        natcash_phone: ma_phone,
        name: ma_name,
        parent_sa_id: parentSa.id,
        tier: "DEBUTAN",
        location_name: parentSa.location_name,
        created_at: formatDate(createdDate)
    });
}

// Insert agents into database
const insertAgent = db.prepare("INSERT INTO agents VALUES (?, ?, ?, ?, ?, ?, ?)");
const insertAgentsTx = db.transaction((saList, maList) => {
    for (const sa of saList) {
        insertAgent.run(sa.id, sa.natcash_phone, sa.name, sa.parent_sa_id, sa.tier, sa.location_name, sa.created_at);
    }
    for (const ma of maList) {
        insertAgent.run(ma.id, ma.natcash_phone, ma.name, ma.parent_sa_id, ma.tier, ma.location_name, ma.created_at);
    }
});
insertAgentsTx(superAgents, marchannAgents);
console.log(`👥 Đã tạo ${superAgents.length} Super Agents và ${marchannAgents.length} Marchann Agents.`);

// 2. Generate Users & Attribution
const users = [];
const userAttributions = [];

for (let i = 0; i < 1500; i++) {
    const user_id = crypto.randomUUID();
    const ma = randomChoice(marchannAgents);
    
    const rand = Math.random();
    let source = "DIRECT";
    if (rand < 0.75) {
        source = "QR_SCAN";
    } else if (rand < 0.95) {
        source = "WHATSAPP_LINK";
    }
    
    // Date from Nov 1, 2025 + random 0-120 days
    const createdDate = new Date(Date.UTC(2025, 10, 1, 12, 0, 0));
    createdDate.setUTCDate(createdDate.getUTCDate() + randomInt(0, 120));
    
    users.push(user_id);
    userAttributions.push({
        user_id,
        agent_id: ma.id,
        source,
        attributed_at: formatDate(createdDate)
    });
}

const insertAttr = db.prepare("INSERT INTO user_agent_attribution VALUES (?, ?, ?, ?)");
const insertAttrsTx = db.transaction((attrList) => {
    for (const attr of attrList) {
        insertAttr.run(attr.user_id, attr.agent_id, attr.source, attr.attributed_at);
    }
});
insertAttrsTx(userAttributions);
console.log(`👥 Đã tạo ${users.length} Users và liên kết attribution thành công.`);

// 3. Generate daily tickets, commissions, and instant rewards (Jan 1, 2026 -> May 31, 2026)
const startDate = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
const endDate = new Date(Date.UTC(2026, 4, 31, 0, 0, 0));

const agentMonthlyVolumes = {};
for (const ma of marchannAgents) {
    agentMonthlyVolumes[ma.id] = {};
}
for (const sa of superAgents) {
    agentMonthlyVolumes[sa.id] = {};
}

const ticketsData = [];
const commissionsData = [];
const rewardsData = [];

const monthlyTicketBase = {
    1: [150, 220],
    2: [220, 320],
    3: [320, 480],
    4: [480, 700],
    5: [700, 1000]
};

function getTierRate(tier) {
    if (tier === "DEBUTAN") return 0.08;
    if (tier === "MACHANN") return 0.09;
    if (tier === "GRAN_MET") return 0.10;
    if (tier === "CHANPYON") return 0.11;
    return 0.08;
}

const updateAgentTier = db.prepare("UPDATE agents SET tier = ? WHERE id = ?");
const updateAgentTiersTx = db.transaction((updates) => {
    for (const u of updates) {
        updateAgentTier.run(u.tier, u.id);
    }
});

console.log("⏳ Đang sinh dữ liệu giao dịch hàng ngày (5 tháng)...");

let currentDate = new Date(startDate);
while (currentDate <= endDate) {
    const month = currentDate.getUTCMonth() + 1; // 1-indexed
    const year = currentDate.getUTCFullYear();
    const dayOfWeek = currentDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const periodKey = `${year}-${String(month).padStart(2, '0')}`;
    
    // Update Agent Tiers on 1st of month based on previous month's volume
    if (currentDate.getUTCDate() === 1) {
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear = year - 1;
        }
        const prevPeriod = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
        
        if (!(month === 1 && year === 2026)) {
            const updates = [];
            for (const ma of marchannAgents) {
                const vol = agentMonthlyVolumes[ma.id][prevPeriod] || 0;
                let newTier = "DEBUTAN";
                if (vol >= 200000) {
                    newTier = "CHANPYON";
                } else if (vol >= 50000) {
                    newTier = "GRAN_MET";
                } else if (vol >= 10000) {
                    newTier = "MACHANN";
                }
                ma.tier = newTier;
                updates.push({ id: ma.id, tier: newTier });
            }
            updateAgentTiersTx(updates);
        }
    }
    
    const bounds = monthlyTicketBase[month] || [150, 220];
    let numTickets = randomInt(bounds[0], bounds[1]);
    
    // Friday (5) or Saturday (6) peak
    if (dayOfWeek === 5 || dayOfWeek === 6) {
        numTickets = Math.floor(numTickets * 1.4);
    }
    
    for (let t = 0; t < numTickets; t++) {
        const ticket_id = crypto.randomUUID();
        const user_id = randomChoice(users);
        
        const attr = userAttributions.find(x => x.user_id === user_id);
        const ma = marchannAgents.find(x => x.id === attr.agent_id);
        const sa = superAgents.find(x => x.id === ma.parent_sa_id);
        
        const randGame = Math.random();
        let game_type = "BOLET_2";
        let bet_numbers = "00";
        let amount_htg = 50;
        
        if (randGame < 0.70) {
            game_type = "BOLET_2";
            bet_numbers = String(randomInt(0, 99)).padStart(2, '0');
            amount_htg = randomInt(2, 20) * 25;
        } else if (randGame < 0.90) {
            game_type = "MARYAJ";
            bet_numbers = `${String(randomInt(0, 99)).padStart(2, '0')} x ${String(randomInt(0, 99)).padStart(2, '0')}`;
            amount_htg = randomInt(5, 40) * 25;
        } else {
            game_type = "LOTTO_3";
            bet_numbers = String(randomInt(0, 999)).padStart(3, '0');
            amount_htg = randomInt(10, 60) * 25;
        }
        
        const randTime = Math.random();
        let hour = 12;
        let minute = 0;
        if (randTime < 0.25) {
            hour = 11;
            minute = randomInt(0, 29);
        } else if (randTime < 0.65) {
            hour = 17;
            minute = randomInt(0, 59);
        } else if (randTime < 0.85) {
            hour = 20;
            minute = randomInt(0, 59);
        } else {
            hour = randomChoice([7, 8, 9, 10, 12, 13, 14, 15, 16, 18, 19]);
            minute = randomInt(0, 59);
        }
        
        const ticketTime = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), hour, minute, randomInt(0, 59)));
        const ticketTimeStr = formatDate(ticketTime);
        
        const isWin = Math.random() < 0.05;
        const status = isWin ? "WIN" : "LOSE";
        let prizeAmount = 0;
        if (isWin) {
            if (game_type === "BOLET_2") {
                prizeAmount = amount_htg * 50;
            } else if (game_type === "MARYAJ") {
                prizeAmount = amount_htg * 1000;
            } else {
                prizeAmount = amount_htg * 500;
            }
        }
        
        ticketsData.push([
            ticket_id, user_id, ma.id, game_type, bet_numbers, amount_htg, status, prizeAmount, ticketTimeStr
        ]);
        
        agentMonthlyVolumes[ma.id][periodKey] = (agentMonthlyVolumes[ma.id][periodKey] || 0) + amount_htg;
        agentMonthlyVolumes[sa.id][periodKey] = (agentMonthlyVolumes[sa.id][periodKey] || 0) + amount_htg;
        
        // 3.1 Commissions
        const maRate = getTierRate(ma.tier);
        const maComm = amount_htg * maRate;
        commissionsData.push([
            crypto.randomUUID(), ticket_id, ma.id, 2, maComm, maRate, "PAID", ticketTimeStr
        ]);
        
        const saRate = 0.03;
        const saComm = amount_htg * saRate;
        commissionsData.push([
            crypto.randomUUID(), ticket_id, sa.id, 1, saComm, saRate, "PAID", ticketTimeStr
        ]);
        
        if (Math.random() < 0.15) {
            const refComm = amount_htg * 0.02;
            commissionsData.push([
                crypto.randomUUID(), ticket_id, ma.id, 3, refComm, 0.02, "PAID", ticketTimeStr
            ]);
        }
        
        // 3.2 Instant Rewards (30% chance)
        if (Math.random() < 0.30) {
            const rewardRand = Math.random();
            let rewardAmount = 0;
            
            if (rewardRand >= 0.70 && rewardRand < 0.90) {
                rewardAmount = 50.0;
            } else if (rewardRand >= 0.90 && rewardRand < 0.98) {
                rewardAmount = 200.0;
            } else if (rewardRand >= 0.98) {
                rewardAmount = 500.0;
            }
            
            if (rewardAmount > 0) {
                const winCode = String(randomInt(100000, 999999));
                const statusRand = Math.random();
                let rewardStatus = "PAID";
                if (statusRand >= 0.85 && statusRand < 0.95) {
                    rewardStatus = "PENDING";
                } else if (statusRand >= 0.95) {
                    rewardStatus = "EXPIRED";
                }
                
                rewardsData.push([
                    crypto.randomUUID(), ticket_id, user_id, ma.id, "SCRATCH_CARD", rewardAmount, winCode, rewardStatus, ticketTimeStr
                ]);
            }
        }
        
        // Streak Bonus (2% chance)
        if (Math.random() < 0.02) {
            const streakAmount = randomChoice([200.0, 2000.0]);
            const winCode = String(randomInt(100000, 999999));
            rewardsData.push([
                crypto.randomUUID(), ticket_id, user_id, ma.id, "STREAK_BONUS", streakAmount, winCode, "PAID", ticketTimeStr
            ]);
        }
        
        // Lucky Hour Bonus (5% chance in hours 11, 17)
        if ((hour === 11 || hour === 17) && Math.random() < 0.05) {
            const winCode = String(randomInt(100000, 999999));
            rewardsData.push([
                crypto.randomUUID(), ticket_id, user_id, ma.id, "LUCKY_HOUR", 50.0, winCode, "PAID", ticketTimeStr
            ]);
        }
    }
    
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
}

// Write transactions to DB
console.log("💾 Đang ghi dữ liệu vào SQLite...");
const insertTicket = db.prepare("INSERT INTO tickets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertCommission = db.prepare("INSERT INTO commissions VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
const insertReward = db.prepare("INSERT INTO rewards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

const insertAllDataTx = db.transaction((tkList, cmList, rwList) => {
    for (const tk of tkList) insertTicket.run(...tk);
    for (const cm of cmList) insertCommission.run(...cm);
    for (const rw of rwList) insertReward.run(...rw);
});
insertAllDataTx(ticketsData, commissionsData, rewardsData);

console.log("🏁 Đã tạo xong vé số, hoa hồng và thưởng tức thì.");

// 4. Generate Commission Payouts (Monthly)
console.log("💰 Đang xử lý thanh toán hoa hồng hàng tháng (Payouts)...");
const payoutsData = [];

for (let month = 1; month <= 5; month++) {
    const periodStr = `2026-${String(month).padStart(2, '0')}`;
    
    const monthlyComms = db.prepare(`
        SELECT agent_id, SUM(amount_htg) as comm_sum
        FROM commissions 
        WHERE strftime('%Y-%m', created_at) = ? 
        GROUP BY agent_id
    `).all(periodStr);
    
    for (const row of monthlyComms) {
        const agent = db.prepare("SELECT name, tier FROM agents WHERE id = ?").get(row.agent_id);
        if (!agent) continue;
        
        let bonus = 0.0;
        if (agent.tier === "MACHANN") {
            bonus = 200.0;
        } else if (agent.tier === "GRAN_MET") {
            bonus = 1000.0;
        } else if (agent.tier === "CHANPYON") {
            bonus = 5000.0;
        }
        
        const totalPayout = row.comm_sum + bonus;
        const txnId = `TXN-NAT-${randomInt(100000000, 999999999)}`;
        
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? 2027 : 2026;
        const paidAt = new Date(Date.UTC(nextYear, nextMonth - 1, 1, 8, randomInt(0, 59), randomInt(0, 59)));
        
        payoutsData.push([
            crypto.randomUUID(), row.agent_id, periodStr, totalPayout, txnId, formatDate(paidAt)
        ]);
    }
}

const insertPayout = db.prepare("INSERT INTO commission_payouts VALUES (?, ?, ?, ?, ?, ?)");
const insertPayoutsTx = db.transaction((payoutList) => {
    for (const po of payoutList) insertPayout.run(...po);
});
insertPayoutsTx(payoutsData);
console.log("🏁 Đã tạo xong thanh toán hoa hồng định kỳ.");

// 5. Export tables to CSV
const tables = ['agents', 'user_agent_attribution', 'tickets', 'commissions', 'rewards', 'commission_payouts'];
console.log("📤 Đang xuất dữ liệu ra file CSV...");

function writeCsv(filePath, headers, rows) {
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
            if (cell === null || cell === undefined) return '';
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        }).join(','))
    ].join('\r\n');
    fs.writeFileSync(filePath, csvContent, 'utf-8');
}

for (const table of tables) {
    const csvFilePath = path.join(CSV_DIR, `${table}.csv`);
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    
    if (rows.length === 0) {
        writeCsv(csvFilePath, [], []);
        continue;
    }
    
    const headers = Object.keys(rows[0]);
    const values = rows.map(r => Object.values(r));
    writeCsv(csvFilePath, headers, values);
}
console.log(`✅ Đã xuất tất cả ${tables.length} bảng dữ liệu ra thư mục ${CSV_DIR}`);

// 6. Summary report
const totalTickets = db.prepare("SELECT COUNT(*) as c FROM tickets").get().c;
const totalSales = db.prepare("SELECT SUM(amount_htg) as s FROM tickets").get().s || 0;
const maComms = db.prepare("SELECT SUM(amount_htg) as s FROM commissions WHERE tier_level = 2").get().s || 0;
const saComms = db.prepare("SELECT SUM(amount_htg) as s FROM commissions WHERE tier_level = 1").get().s || 0;
const totalRewards = db.prepare("SELECT SUM(amount_htg) as s FROM rewards").get().s || 0;

db.close();

const formatNum = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatInt = (n) => n.toLocaleString('en-US');

console.log("\n" + "=".repeat(50));
console.log("📊 BÁO CÁO TỔNG KẾT DỮ LIỆU DEMO NATCOM (01/2026 - 05/2026)");
console.log("=".repeat(50));
console.log(`🎫 Tổng số vé bán ra:              ${formatInt(totalTickets)} vé`);
console.log(`💰 Tổng doanh thu bán vé (HTG):    ${formatNum(totalSales)} HTG (~$${formatNum(totalSales/140)} USD)`);
console.log(`💵 Hoa hồng Marchann L2 (HTG):    ${formatNum(maComms)} HTG`);
console.log(`🏢 Hoa hồng Super Agent L1 (HTG):  ${formatNum(saComms)} HTG`);
console.log(`🎁 Tổng tiền thưởng tức thì (HTG):  ${formatNum(totalRewards)} HTG`);
console.log("=".repeat(50));
console.log("👉 Cơ sở dữ liệu SQLite demo lưu tại: data/natcom_dashboard_demo.db");
console.log("👉 Các file CSV lưu tại thư mục:      data/natcom_demo_csv/");
console.log("=".repeat(50));
