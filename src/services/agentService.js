'use strict';
const db = require('../database/index');

/**
 * Lấy thông tin hoặc tạo mới một Agent (Marchann) khi onboard
 */
async function getOrCreateAgent(telegramId, parentSaId = null, fullName = null, natcashPhone = null) {
    // 1. Kiểm tra xem đã tồn tại chưa
    const checkRes = await db.query(
        'SELECT * FROM agents WHERE telegram_id = $1',
        [telegramId]
    );

    if (checkRes.rows.length > 0) {
        return checkRes.rows[0];
    }

    // 2. Tạo referral_code duy nhất (ví dụ: AGENT_12345 hoặc dạng ngắn gọn)
    const referralCode = `MA${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Insert agent mới
    const insertRes = await db.query(
        `INSERT INTO agents (telegram_id, parent_sa_id, full_name, natcash_phone, referral_code, activated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [telegramId, parentSaId, fullName || `Agent_${telegramId}`, natcashPhone, referralCode]
    );

    return insertRes.rows[0];
}

/**
 * Lấy thống kê KPIs hàng ngày của một Agent
 */
async function getAgentStats(agentId) {
    const today = new Date().toISOString().split('T')[0];

    const statsRes = await db.query(
        `SELECT 
            COALESCE(SUM(amount_htg), 0) as today_volume,
            COUNT(id) as today_tickets,
            COALESCE(SUM(CASE WHEN is_winner = TRUE THEN prize_amount ELSE 0 END), 0) as today_prizes
         FROM tickets 
         WHERE agent_id = $1 AND DATE(created_at) = $2 AND status = 'PAID'`,
        [agentId, today]
    );

    const customersRes = await db.query(
        'SELECT COUNT(user_id) as total_customers FROM user_agent_attribution WHERE agent_id = $1',
        [agentId]
    );

    const agentRes = await db.query(
        'SELECT tier, monthly_volume, lifetime_volume FROM agents WHERE id = $1',
        [agentId]
    );

    const agent = agentRes.rows[0] || {};
    const stats = statsRes.rows[0] || {};
    const cust = customersRes.rows[0] || {};

    return {
        tier: agent.tier || 'DEBUTAN',
        monthlyVolume: parseInt(agent.monthly_volume) || 0,
        lifetimeVolume: parseInt(agent.lifetime_volume) || 0,
        todayVolume: parseInt(stats.today_volume) || 0,
        todayTickets: parseInt(stats.today_tickets) || 0,
        todayPrizes: parseInt(stats.today_prizes) || 0,
        totalCustomers: parseInt(cust.total_customers) || 0
    };
}

/**
 * Gán lifetime attribution: 1 User thuộc về 1 Agent vĩnh viễn
 */
async function attributeUserToAgent(userId, agentReferralCode, source = 'QR_SCAN') {
    // Tìm agent theo referral_code
    const agentRes = await db.query('SELECT id FROM agents WHERE referral_code = $1', [agentReferralCode]);
    if (agentRes.rows.length === 0) {
        throw new Error('Mã đại lý không hợp lệ');
    }
    const agentId = agentRes.rows[0].id;

    // Ghi nhận attribution
    await db.query(
        `INSERT INTO user_agent_attribution (user_id, agent_id, source)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, agentId, source]
    );

    return agentId;
}

/**
 * Lấy danh sách khách hàng thuộc quyền quản lý của Agent
 */
async function getAgentCustomers(agentId) {
    const res = await db.query(
        `SELECT u.user_id, u.attributed_at, u.last_active,
                (SELECT COUNT(*) FROM tickets t WHERE t.user_id = u.user_id AND t.status = 'PAID') as total_tickets
         FROM user_agent_attribution u
         WHERE u.agent_id = $1
         ORDER BY u.last_active DESC`,
        [agentId]
    );
    return res.rows;
}

module.exports = {
    getOrCreateAgent,
    getAgentStats,
    attributeUserToAgent,
    getAgentCustomers
};
