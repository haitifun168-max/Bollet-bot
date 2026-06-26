'use strict';
const db = require('../database/index');

/**
 * Kích hoạt thẻ cào may mắn (Scratch Card) trúng thưởng phụ ngay lập tức
 * Xác suất:
 * - 70%: NO_WIN (0 HTG)
 * - 20%: BONUS_50 (50 HTG)
 * - 8%: BONUS_200 (200 HTG)
 * - 2%: BONUS_500 (500 HTG)
 */
async function triggerScratch(userId, ticketId) {
    const rand = Math.random() * 100;
    let resultType = 'NO_WIN';
    let bonusAmount = 0;

    if (rand < 2) {
        resultType = 'BONUS_500';
        bonusAmount = 500;
    } else if (rand < 10) {
        resultType = 'BONUS_200';
        bonusAmount = 200;
    } else if (rand < 30) {
        resultType = 'BONUS_50';
        bonusAmount = 50;
    }

    // Ghi nhận vào database
    await db.query(
        `INSERT INTO scratch_bonuses (user_id, ticket_id, result_type, bonus_amount, claimed_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [userId, ticketId, resultType, bonusAmount]
    );

    // Nếu trúng thưởng, tự động cộng số dư cho người dùng (Giả lập cộng ví hoặc chuyển khoản)
    if (bonusAmount > 0) {
        // Thực tế có thể tích hợp với cổng Natcash hoặc cộng tiền vào ví chính của khách hàng
        console.log(`🎉 User ${userId} trúng thẻ cào: ${bonusAmount} HTG!`);
    }

    return {
        resultType,
        bonusAmount
    };
}

/**
 * Cập nhật chuỗi mua hàng liên tiếp (Streak Tracking)
 */
async function updateStreak(userId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const streakRes = await db.query('SELECT * FROM streaks WHERE user_id = $1', [userId]);

    if (streakRes.rows.length === 0) {
        // Tạo mới streak
        await db.query(
            `INSERT INTO streaks (user_id, current_streak, longest_streak, last_purchase, updated_at)
             VALUES ($1, 1, 1, $2, NOW())`,
            [userId, todayStr]
        );
        return { currentStreak: 1, longestStreak: 1, isNewStreak: true };
    }

    const streak = streakRes.rows[0];
    const lastPurchaseStr = streak.last_purchase ? new Date(streak.last_purchase).toISOString().split('T')[0] : '';

    if (lastPurchaseStr === todayStr) {
        // Đã mua hôm nay rồi, giữ nguyên streak
        return { currentStreak: streak.current_streak, longest_streak: streak.longest_streak, isNewStreak: false };
    }

    let newStreak = 1;
    if (lastPurchaseStr === yesterdayStr) {
        // Mua liên tiếp từ hôm qua, tăng streak
        newStreak = streak.current_streak + 1;
    }

    const longestStreak = Math.max(newStreak, streak.longest_streak);

    await db.query(
        `UPDATE streaks 
         SET current_streak = $1, 
             longest_streak = $2, 
             last_purchase = $3, 
             updated_at = NOW()
         WHERE user_id = $4`,
        [newStreak, longestStreak, todayStr, userId]
    );

    // Kích hoạt phần thưởng streak nếu đạt các mốc (ví dụ: mốc 5 ngày, 10 ngày,...)
    let streakAward = 0;
    if (newStreak === 5) streakAward = 100; // Thưởng 100 HTG khi đạt chuỗi 5 ngày
    else if (newStreak === 10) streakAward = 300;

    return {
        currentStreak: newStreak,
        longestStreak,
        isNewStreak: newStreak > streak.current_streak,
        streakAward
    };
}

module.exports = {
    triggerScratch,
    updateStreak
};
