'use strict';
const db = require('../database/index');

/**
 * Lấy bảng xếp hạng Top Marchann Agent theo doanh số tháng
 */
async function getMonthlyLeaderboard(limit = 10) {
    const res = await db.query(
        `SELECT telegram_id, full_name, tier, monthly_volume, location_region
         FROM agents
         WHERE is_super_agent = FALSE AND monthly_volume > 0
         ORDER BY monthly_volume DESC
         LIMIT $1`,
        [limit]
    );
    return res.rows;
}

/**
 * Lấy thứ hạng hiện tại của một Agent cụ thể
 */
async function getAgentRank(agentId) {
    const res = await db.query(
        `SELECT rank, monthly_volume FROM (
            SELECT id, monthly_volume,
                   RANK() OVER (ORDER BY monthly_volume DESC) as rank
            FROM agents
            WHERE is_super_agent = FALSE
         ) ranked
         WHERE id = $1`,
        [agentId]
    );

    if (res.rows.length === 0) {
        return { rank: 'N/A', monthlyVolume: 0 };
    }

    return {
        rank: parseInt(res.rows[0].rank),
        monthlyVolume: parseInt(res.rows[0].monthly_volume)
    };
}

module.exports = {
    getMonthlyLeaderboard,
    getAgentRank
};
