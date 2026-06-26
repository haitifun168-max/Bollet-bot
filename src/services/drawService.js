'use strict';
const db = require('../database/index');
const winCodeService = require('./winCodeService');
const config = require('../config');

/**
 * Tính thưởng dựa trên Game Type và số đặt cược
 * - BOLET_2: Trúng 2 số cuối của giải nhất (Tỷ lệ 50x)
 * - MARYAJ: Trúng cả 2 cặp số (Tỷ lệ 1000x)
 * - LOTTO3: Trúng 3 số giải nhất (Tỷ lệ 500x)
 */
function calculatePrize(gameType, betNumbers, winningNumbers, amountHtg) {
    const amount = parseFloat(amountHtg);
    
    // Giả định winningNumbers có dạng: "12-34-56" (giải nhất, giải nhì, giải ba) hoặc tương tự
    // Phân tách giải thưởng
    const parts = winningNumbers.split('-');
    const firstPrize = parts[0] || ''; // Ví dụ: "123" hoặc "12"
    
    if (gameType === 'BOLET_2') {
        // Lấy 2 số cuối giải nhất
        const lastTwoOfFirstPrize = firstPrize.slice(-2);
        if (betNumbers === lastTwoOfFirstPrize) {
            return amount * 50;
        }
    } else if (gameType === 'LOTTO3') {
        // Lấy 3 số giải nhất
        if (betNumbers === firstPrize) {
            return amount * 500;
        }
    } else if (gameType === 'MARYAJ') {
        // Vé cược có dạng: "12x34"
        const betPairs = betNumbers.split('x');
        const winningPairs = parts.map(p => p.slice(-2)); // 2 số cuối của cả 3 giải
        
        // Kiểm tra xem cả 2 cặp cược có nằm trong các giải thưởng không
        const matchCount = betPairs.filter(p => winningPairs.includes(p)).length;
        if (matchCount >= 2) {
            return amount * 1000;
        }
    }
    
    return 0;
}

/**
 * Xử lý kết quả quay số và tìm người chiến thắng
 */
async function processDrawResults(drawId, winningNumbers) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // 1. Lưu kết quả quay số
        await client.query(
            `INSERT INTO draw_results (draw_id, winning_numbers, published_at)
             VALUES ($1, $2, NOW())`,
            [drawId, winningNumbers]
        );

        // Cập nhật trạng thái Draw thành COMPLETED
        await client.query(
            `UPDATE draws SET status = 'COMPLETED' WHERE id = $1`,
            [drawId]
        );

        // 2. Lấy danh sách tất cả các vé thuộc phiên quay thưởng này đang ở trạng thái 'PAID'
        const ticketsRes = await client.query(
            `SELECT * FROM tickets WHERE draw_id = $1 AND status = 'PAID'`,
            [drawId]
        );

        const results = [];

        for (const ticket of ticketsRes.rows) {
            const prize = calculatePrize(ticket.game_type, ticket.numbers, winningNumbers, ticket.amount_htg);
            
            if (prize > 0) {
                // Trúng thưởng!
                await client.query(
                    `UPDATE tickets 
                     SET is_winner = TRUE, prize_amount = $1 
                     WHERE id = $2`,
                    [prize, ticket.id]
                );

                // Kiểm tra ngưỡng nhận thưởng để phân loại trả thưởng
                let payoutMethod = '';
                let winCode = null;

                if (prize < 1000) {
                    // Tự động chuyển khoản qua Natcash (Mockup API)
                    payoutMethod = 'NATCASH_AUTO';
                    // Ở đây sẽ tích hợp API Natcash thực tế, tạm thời coi như đã chuyển khoản thành công
                    await client.query(
                        `INSERT INTO commission_payouts (agent_id, total_amount, status, created_at, completed_at)
                         VALUES (
                            (SELECT agent_id FROM user_agent_attribution WHERE user_id = $1 LIMIT 1), 
                            $2, 'COMPLETED', NOW(), NOW()
                         )`,
                        [ticket.user_id, prize]
                    );
                } else {
                    // Tạo mã Win-Code HMAC-signed để Marchann Agent chi trả tiền mặt
                    payoutMethod = 'BOOTH_CASH';
                    winCode = await winCodeService.saveWinCode(ticket.id, ticket.user_id, prize);
                }

                results.push({
                    ticketId: ticket.id,
                    userId: ticket.user_id,
                    prize,
                    payoutMethod,
                    winCode
                });
            }
        }

        await client.query('COMMIT');
        return results;

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Lỗi xử lý kết quả quay số:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    calculatePrize,
    processDrawResults
};
