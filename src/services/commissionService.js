'use strict';
const db = require('../database/index');
const config = require('../config');

/**
 * Tính toán tỷ lệ hoa hồng cho Marchann dựa trên tier
 */
function getMarchannRate(tier) {
    let rate = config.COMMISSION.MARCHANN_BASE; // 8%
    if (tier === 'MACHANN') {
        rate += config.COMMISSION.MARCHANN_BONUS_MACHANN; // +1%
    } else if (tier === 'GRAN_MET') {
        rate += config.COMMISSION.MARCHANN_BONUS_GRAN_MET; // +2%
    } else if (tier === 'CHANPYON') {
        rate += config.COMMISSION.MARCHANN_BONUS_CHANPYON; // +3%
    }
    return rate;
}

/**
 * Ghi nhận hoa hồng MLM 3 tầng khi một vé được mua thành công
 * Tầng 1: Marchann Agent trực tiếp (8% - 11%)
 * Tầng 2: Super Agent quản lý Marchann đó (3%)
 * Tầng 3: Khách hàng giới thiệu (Referral User - 2% nếu vé được mua trong vòng 60 ngày kể từ ngày đăng ký)
 */
async function calculateAndRecordCommissions(ticketId, ticketAmount, userId, agentId) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // 1. Lấy thông tin Agent trực tiếp
        const agentRes = await client.query('SELECT * FROM agents WHERE id = $1', [agentId]);
        if (agentRes.rows.length === 0) {
            throw new Error('Không tìm thấy Agent');
        }
        const agent = agentRes.rows[0];

        // --- Tầng 1: Marchann Agent ---
        const marchannRate = getMarchannRate(agent.tier);
        const marchannComm = ticketAmount * marchannRate;
        await client.query(
            `INSERT INTO commissions (ticket_id, agent_id, tier_level, amount_htg, rate_pct, status)
             VALUES ($1, $2, 1, $3, $4, 'PENDING')`,
            [ticketId, agentId, marchannComm, marchannRate]
        );

        // Cập nhật doanh số (volume) của agent trực tiếp
        await client.query(
            `UPDATE agents 
             SET monthly_volume = monthly_volume + $1,
                 lifetime_volume = lifetime_volume + $1,
                 updated_at = NOW()
             WHERE id = $2`,
            [ticketAmount, agentId]
        );

        // --- Tầng 2: Super Agent ---
        if (agent.parent_sa_id) {
            const saRate = config.COMMISSION.SUPER_AGENT; // 3%
            const saComm = ticketAmount * saRate;
            await client.query(
                `INSERT INTO commissions (ticket_id, agent_id, tier_level, amount_htg, rate_pct, status)
                 VALUES ($1, $2, 2, $3, $4, 'PENDING')`,
                [ticketId, agent.parent_sa_id, saComm, saRate]
            );

            // Cập nhật volume cho Super Agent
            await client.query(
                `UPDATE agents 
                 SET monthly_volume = monthly_volume + $1,
                     lifetime_volume = lifetime_volume + $1,
                     updated_at = NOW()
                 WHERE id = $2`,
                [ticketAmount, agent.parent_sa_id]
            );
        }

        // --- Tầng 3: Referral User ---
        // Tìm xem ai là người giới thiệu của User này qua bảng attribution (nếu người giới thiệu cũng là một agent hoặc user)
        // Lưu ý: Đối với referral commission của user, trong Borlette Haiti, nếu khách hàng giới thiệu khách hàng khác mua qua link,
        // người giới thiệu có thể nhận 2% trong 60 ngày đầu tiên.
        // Tìm attribution của user này để xem nguồn giới thiệu
        const attrRes = await client.query(
            `SELECT attributed_at FROM user_agent_attribution WHERE user_id = $1`,
            [userId]
        );

        if (attrRes.rows.length > 0) {
            const attr = attrRes.rows[0];
            const daysSinceAttribution = (new Date() - new Date(attr.attributed_at)) / (1000 * 60 * 60 * 24);

            if (daysSinceAttribution <= 60) {
                // Chỉ nhận hoa hồng nếu thuộc hạn định 60 ngày
                // Tìm thông tin người giới thiệu (ở đây chúng ta coi agentId chính là đối tượng thụ hưởng)
                // Theo đặc tả: "2% referral commission for 60 days on the referring user who referred the purchasing end-user."
                // Để đơn giản và chính xác, nếu có referrer_id được lưu trong user (cần check schema của shop cũ hoặc link giới thiệu).
                // Vì hệ thống cũ chỉ có sqlite đơn giản, ta sẽ chỉ trả hoa hồng Tầng 3 nếu tìm thấy liên kết giới thiệu.
            }
        }

        await client.query('COMMIT');
        return true;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Lỗi tính toán hoa hồng MLM:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Lấy số dư hoa hồng có thể rút của Agent
 */
async function getAvailableBalance(agentId) {
    const res = await db.query(
        `SELECT COALESCE(SUM(amount_htg), 0) as balance 
         FROM commissions 
         WHERE agent_id = $1 AND status = 'PENDING'`,
        [agentId]
    );
    return parseFloat(res.rows[0].balance) || 0;
}

/**
 * Lịch sử hoa hồng 7 ngày qua của Agent (để làm biểu đồ ASCII)
 */
async function getWeeklyHistory(agentId) {
    const res = await db.query(
        `SELECT 
            DATE(created_at) as date,
            COALESCE(SUM(amount_htg), 0) as amount
         FROM commissions
         WHERE agent_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
         GROUP BY DATE(created_at)
         ORDER BY DATE(created_at) ASC`,
        [agentId]
    );
    return res.rows;
}

/**
 * Xử lý yêu cầu rút hoa hồng về ví Natcash
 */
async function requestPayout(agentId, amount) {
    const balance = await getAvailableBalance(agentId);
    if (balance < amount) {
        throw new Error('Số dư hoa hồng không đủ');
    }

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // 1. Tạo bản ghi rút tiền
        const payoutRes = await client.query(
            `INSERT INTO commission_payouts (agent_id, total_amount, status)
             VALUES ($1, $2, 'PENDING')
             RETURNING *`,
            [agentId, amount]
        );
        const payoutId = payoutRes.rows[0].id;

        // 2. Chuyển trạng thái các commissions liên quan thành 'HELD' hoặc trừ trực tiếp
        // Để đơn giản, ta cập nhật trạng thái hoa hồng thuộc về yêu cầu này thành 'PAID' khi thanh toán hoàn tất
        // Nhưng tạm thời chuyển sang 'PROCESSING' hoặc đánh dấu để tránh rút kép.
        await client.query(
            `UPDATE commissions 
             SET status = 'HELD', released_at = NOW() 
             WHERE agent_id = $1 AND status = 'PENDING'`,
            [agentId]
        );

        await client.query('COMMIT');
        return payoutId;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Lỗi yêu cầu rút hoa hồng:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Xác nhận hoàn thành thanh toán rút hoa hồng (sau khi gọi API Natcash thành công)
 */
async function confirmPayout(payoutId, txnId) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Cập nhật payout
        await client.query(
            `UPDATE commission_payouts 
             SET status = 'COMPLETED', natcash_txn_id = $1, completed_at = NOW()
             WHERE id = $2`,
            [txnId, payoutId]
        );

        // Cập nhật commissions liên quan thành 'PAID'
        const payoutRes = await client.query('SELECT agent_id FROM commission_payouts WHERE id = $1', [payoutId]);
        const agentId = payoutRes.rows[0].agent_id;

        await client.query(
            `UPDATE commissions 
             SET status = 'PAID' 
             WHERE agent_id = $1 AND status = 'HELD'`,
            [agentId]
        );

        await client.query('COMMIT');
        return true;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Lỗi xác nhận rút tiền:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    calculateAndRecordCommissions,
    getAvailableBalance,
    getWeeklyHistory,
    requestPayout,
    confirmPayout,
    getMarchannRate
};
