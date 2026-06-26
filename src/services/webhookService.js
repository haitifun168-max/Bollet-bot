const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('../config');
const orderService = require('./orderService');
const userService = require('./userService');
const { deliverOrder } = require('../handlers/paymentConfirm');
const db = require('../database');
const mockNatcashRouter = require('./mockNatcashService');

function startWebhookServer(bot) {
    const app = express();
    app.use(express.json());
    app.set('bot', bot);

    // Serve static files for the dashboard
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // Connect to Natcom Demo DB
    const demoDbPath = path.join(__dirname, '..', '..', 'data', 'natcom_dashboard_demo.db');
    let demoDb;
    try {
        demoDb = new Database(demoDbPath, { readonly: true });
        console.log('✅ Connected to Natcom Demo Database successfully!');
    } catch (e) {
        console.log('⚠️ Could not connect to Natcom Demo DB:', e.message);
    }

    // --- NATCOM DASHBOARD APIS ---
    app.get('/api/natcom/kpis', (req, res) => {
        try {
            if (!demoDb) throw new Error("Demo DB not loaded");
            const ticketCount = demoDb.prepare("SELECT COUNT(*) as count FROM tickets").get().count;
            const salesSum = demoDb.prepare("SELECT SUM(amount_htg) as sum FROM tickets").get().sum || 0;
            const maComms = demoDb.prepare("SELECT SUM(amount_htg) as sum FROM commissions WHERE tier_level = 2").get().sum || 0;
            const saComms = demoDb.prepare("SELECT SUM(amount_htg) as sum FROM commissions WHERE tier_level = 1").get().sum || 0;
            const rewardsSum = demoDb.prepare("SELECT SUM(amount_htg) as sum FROM rewards WHERE status = 'PAID'").get().sum || 0;
            const activeUsers = demoDb.prepare("SELECT COUNT(DISTINCT user_id) as count FROM tickets").get().count;
            res.json({
                totalTickets: ticketCount,
                totalSales: salesSum,
                maComms,
                saComms,
                totalRewards: rewardsSum,
                totalUsers: activeUsers
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/natcom/monthly-trends', (req, res) => {
        try {
            if (!demoDb) throw new Error("Demo DB not loaded");
            const monthlySales = demoDb.prepare(`
                SELECT strftime('%m', created_at) as month, SUM(amount_htg) as sales
                FROM tickets
                GROUP BY month
                ORDER BY month
            `).all();
            const monthlyMAComms = demoDb.prepare(`
                SELECT strftime('%m', created_at) as month, SUM(amount_htg) as comms
                FROM commissions
                WHERE tier_level = 2
                GROUP BY month
                ORDER BY month
            `).all();
            const monthlySAComms = demoDb.prepare(`
                SELECT strftime('%m', created_at) as month, SUM(amount_htg) as comms
                FROM commissions
                WHERE tier_level = 1
                GROUP BY month
                ORDER BY month
            `).all();

            const labels = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026'];
            const sales = [0, 0, 0, 0, 0];
            const maComms = [0, 0, 0, 0, 0];
            const saComms = [0, 0, 0, 0, 0];

            monthlySales.forEach(row => {
                const idx = parseInt(row.month) - 1;
                if (idx >= 0 && idx < 5) sales[idx] = row.sales;
            });
            monthlyMAComms.forEach(row => {
                const idx = parseInt(row.month) - 1;
                if (idx >= 0 && idx < 5) maComms[idx] = row.comms;
            });
            monthlySAComms.forEach(row => {
                const idx = parseInt(row.month) - 1;
                if (idx >= 0 && idx < 5) saComms[idx] = row.comms;
            });

            res.json({ labels, sales, maComms, saComms });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/natcom/regional-breakdown', (req, res) => {
        try {
            if (!demoDb) throw new Error("Demo DB not loaded");
            
            // Doanh số & Giao dịch từng vùng
            const stats = demoDb.prepare(`
                SELECT location_name, SUM(amount_htg) as sales, COUNT(t.id) as transactions
                FROM tickets t
                JOIN agents a ON t.agent_id = a.id
                GROUP BY location_name
            `).all();

            // Số lượng Agent từng vùng
            const agents = demoDb.prepare(`
                SELECT location_name, COUNT(id) as count
                FROM agents
                WHERE parent_sa_id IS NOT NULL
                GROUP BY location_name
            `).all();

            const result = {};
            stats.forEach(s => {
                result[s.location_name] = {
                    sales: s.sales,
                    transactions: s.transactions,
                    agents: 0
                };
            });
            
            agents.forEach(a => {
                if (result[a.location_name]) {
                    result[a.location_name].agents = a.count;
                } else {
                    result[a.location_name] = {
                        sales: 0,
                        transactions: 0,
                        agents: a.count
                    };
                }
            });

            res.json(result);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/natcom/config', (req, res) => {
        try {
            const configPath = path.join(__dirname, '..', '..', 'data', 'system_config.json');
            const raw = fs.readFileSync(configPath, 'utf8');
            res.json(JSON.parse(raw));
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/natcom/config', (req, res) => {
        try {
            const configPath = path.join(__dirname, '..', '..', 'data', 'system_config.json');
            fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2), 'utf8');
            res.json({ success: true, message: 'Configuration saved successfully' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/natcom/agents-list', (req, res) => {
        try {
            if (!demoDb) throw new Error("Demo DB not loaded");
            const search = req.query.search || '';
            const region = req.query.region || '';
            const tier = req.query.tier || '';
            
            let query = `
                SELECT a.id, a.name, a.natcash_phone, a.location_name, a.tier,
                       (SELECT name FROM agents WHERE id = a.parent_sa_id) as parent_name,
                       (SELECT COUNT(*) FROM user_agent_attribution WHERE agent_id = a.id) as client_count,
                       COALESCE((SELECT SUM(t.amount_htg) FROM tickets t WHERE t.agent_id = a.id), 0) as lifetime_volume,
                       COALESCE((SELECT SUM(c.amount_htg) FROM commissions c WHERE c.agent_id = a.id AND c.tier_level = 2), 0) as commission
                FROM agents a
                WHERE a.parent_sa_id IS NOT NULL
            `;
            
            const params = [];
            if (search) {
                query += ` AND (a.name LIKE ? OR a.natcash_phone LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }
            if (region) {
                query += ` AND a.location_name = ?`;
                params.push(region);
            }
            if (tier) {
                query += ` AND a.tier = ?`;
                params.push(tier);
            }
            query += ` ORDER BY lifetime_volume DESC LIMIT 500`;
            
            const stmt = demoDb.prepare(query);
            const agents = stmt.all(...params);
            res.json(agents);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/natcom/game-breakdown', (req, res) => {
        try {
            if (!demoDb) throw new Error("Demo DB not loaded");
            const games = demoDb.prepare(`
                SELECT game_type, SUM(amount_htg) as sales
                FROM tickets
                GROUP BY game_type
            `).all();
            
            const gameNameMap = {
                'BOLET_2': 'Bolet 2 nimewo',
                'MARYAJ': 'Maryaj',
                'LOTTO_3': 'Lotto 3 nimewo'
            };

            res.json({
                labels: games.map(g => gameNameMap[g.game_type] || g.game_type),
                values: games.map(g => g.sales)
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/natcom/rewards-details', (req, res) => {
        try {
            if (!demoDb) throw new Error("Demo DB not loaded");
            const scratch = demoDb.prepare("SELECT SUM(amount_htg) as sum FROM rewards WHERE reward_type = 'SCRATCH_CARD' AND status = 'PAID'").get().sum || 0;
            const streak = demoDb.prepare("SELECT SUM(amount_htg) as sum FROM rewards WHERE reward_type = 'STREAK_BONUS' AND status = 'PAID'").get().sum || 0;
            const lucky = demoDb.prepare("SELECT SUM(amount_htg) as sum FROM rewards WHERE reward_type = 'LUCKY_HOUR' AND status = 'PAID'").get().sum || 0;
            res.json({ scratch, streak, lucky });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/natcom/top-agents', (req, res) => {
        try {
            if (!demoDb) throw new Error("Demo DB not loaded");
            const topAgents = demoDb.prepare(`
                SELECT a.name, a.location_name, a.tier, 
                       SUM(t.amount_htg) as volume,
                       (SELECT SUM(amount_htg) FROM commissions WHERE agent_id = a.id AND tier_level = 2) as commission
                FROM agents a
                JOIN tickets t ON t.agent_id = a.id
                GROUP BY a.id
                ORDER BY volume DESC
                LIMIT 10
            `).all();
            res.json(topAgents);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/natcom/download-report', (req, res) => {
        const zipPath = path.join(__dirname, '..', '..', 'data', 'natcom_demo_csv', 'tickets.csv');
        res.download(zipPath, 'tickets_report_2026.csv');
    });

    // Register Natcash simulation & webhook API
    app.use('/', mockNatcashRouter);

    app.post('/webhook/sepay', async (req, res) => {
        const authHeader = req.headers['authorization'];
        
        // Secure webhook: check key if configured
        if (config.SEPAY_API_KEY) {
            if (authHeader !== `Apikey ${config.SEPAY_API_KEY}`) {
                console.log('⚠️ Unauthorized webhook request (invalid API Key)');
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }

        const tx = req.body;
        if (!tx || !tx.transactionContent) {
            return res.status(400).json({ error: 'Bad Request' });
        }

        const content = tx.transactionContent.trim();
        const amount = Math.abs(parseInt(tx.transferAmount || tx.amountIn || 0));

        console.log(`🏦 Nhận webhook SePay: ${content} | Số tiền: ${amount}`);

        try {
            // 1. Check if payment matches a pending order
            const order = orderService.getByPaymentCode(content);
            if (order) {
                if (order.status === 'pending') {
                    if (amount >= order.total_price) {
                        const result = await deliverOrder(bot, order.id);
                        if (result.success) {
                            console.log(`✅ Webhook auto-delivered order #${order.id}`);
                            return res.json({ success: true, message: `Order #${order.id} delivered` });
                        } else {
                            console.log(`❌ Webhook deliverOrder failed for order #${order.id}: ${result.error}`);
                            // Mark order as paid so admin can manual deliver
                            orderService.markPaid(order.id);
                            
                            // Notify admin about failed auto-delivery due to stock
                            await bot.telegram.sendMessage(config.ADMIN_ID, 
                                `⚠️ <b>LỖI GIAO HÀNG TỰ ĐỘNG</b>\n` +
                                `Đơn hàng <b>#${order.id}</b> đã thanh toán thành công qua Webhook nhưng không thể giao tự động: <i>${result.error}</i>\n` +
                                `Admin vui lòng giao hàng thủ công.`
                            , { parse_mode: 'HTML' });
                            
                            return res.json({ success: false, error: result.error });
                        }
                    } else {
                        console.log(`⚠️ Webhook order amount mismatch: order total is ${order.total_price}, transfer is ${amount}`);
                        return res.status(400).json({ error: 'Amount mismatch' });
                    }
                } else {
                    console.log(`ℹ️ Webhook order #${order.id} already processed (status: ${order.status})`);
                    return res.json({ success: true, message: 'Already processed' });
                }
            }

            // 2. Check if payment matches a pending deposit
            const deposit = db.prepare('SELECT * FROM deposits WHERE payment_code = ?').get(content);
            if (deposit) {
                if (deposit.status === 'pending') {
                    userService.addBalance(deposit.user_id, amount);
                    
                    db.prepare('UPDATE deposits SET status = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?')
                      .run('completed', deposit.id);

                    console.log(`✅ Webhook deposit success: +${amount}đ for user ${deposit.user_id}`);

                    // Notify customer
                    try {
                        const updatedUser = userService.get(deposit.user_id);
                        await bot.telegram.sendMessage(deposit.user_id, 
                            `💰 <b>NẠP SỐ DƯ THÀNH CÔNG!</b>\n\n` +
                            `Số tiền: <b>+${new Intl.NumberFormat('vi-VN').format(amount)}đ</b>\n` +
                            `Số dư hiện tại: <b>${new Intl.NumberFormat('vi-VN').format(updatedUser.balance)}đ</b>\n\n` +
                            `Cảm ơn bạn đã sử dụng dịch vụ!`,
                            { parse_mode: 'HTML' }
                        );
                    } catch (e) {
                        console.error('Failed to notify customer about deposit:', e.message);
                    }

                    // Notify Admin
                    try {
                        await bot.telegram.sendMessage(config.ADMIN_ID, 
                            `🔔 <b>GIAO DỊCH NẠP TIỀN THÀNH CÔNG</b>\n\n` +
                            `👤 Khách: <code>${deposit.user_id}</code>\n` +
                            `💰 Số tiền: <b>+${new Intl.NumberFormat('vi-VN').format(amount)}đ</b>\n` +
                            `🔑 Nội dung: <code>${content}</code>`
                        , { parse_mode: 'HTML' });
                    } catch (e) {
                        console.error('Failed to notify admin about deposit:', e.message);
                    }

                    return res.json({ success: true, message: 'Deposit credited' });
                } else {
                    console.log(`ℹ️ Webhook deposit #${deposit.id} already processed (status: ${deposit.status})`);
                    return res.json({ success: true, message: 'Already processed' });
                }
            }

            console.log(`❓ Webhook: Không tìm thấy đơn hay giao dịch nạp tiền khớp với mã: ${content}`);
            return res.status(404).json({ error: 'Code not found' });

        } catch (err) {
            console.error('❌ Webhook error:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    const port = config.WEBHOOK_PORT || 3000;
    app.listen(port, () => {
        console.log(`🌐 Webhook server đang lắng nghe tại cổng ${port}`);
    });
}

module.exports = { startWebhookServer };
