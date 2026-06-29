'use strict';
const crypto = require('crypto');
const db = require('../database/index');
const config = require('../config');

/**
 * Tạo mã Win-Code HMAC-signed dạng ngắn (6 ký tự) bảo mật cao
 * @param {string} ticketId - ID của vé trúng thưởng
 * @param {number} userId - Telegram ID người trúng
 * @param {number} amountHtg - Số tiền trúng thưởng (HTG)
 */
function generateWinCode(ticketId, userId, amountHtg) {
    const rawData = `${ticketId}:${userId}:${amountHtg}`;
    
    // Tính HMAC SHA-256 chữ ký bảo mật
    const hmac = crypto.createHmac('sha256', config.HMAC_SECRET);
    hmac.update(rawData);
    const fullSignature = hmac.digest('hex');

    // Lấy 6 ký tự đầu làm mã code rút gọn cho người dùng nhập thủ công dễ dàng
    // Nhưng vẫn lưu trữ full signature trong database để đối chiếu
    const displayCode = fullSignature.substring(0, 6).toUpperCase();

    return {
        code: displayCode,
        signature: fullSignature,
        expiresAt: new Date(Date.now() + config.WIN_CODE_TTL_MS) // TTL 48 giờ
    };
}

/**
 * Lưu Win-Code vào database
 */
async function saveWinCode(ticketId, userId, amountHtg) {
    const { code, signature, expiresAt } = generateWinCode(ticketId, userId, amountHtg);

    await db.query(
        `INSERT INTO win_codes (code, ticket_id, winner_user_id, amount_htg, hmac_signature, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (code) DO NOTHING`,
        [code, ticketId, userId, amountHtg, signature, expiresAt]
    );

    return code;
}

/**
 * Kiểm tra trạng thái và xác thực mã Win-Code
 */
async function validateWinCode(code) {
    const res = await db.query(
        `SELECT wc.*, t.status as ticket_status, t.game_type, t.numbers
         FROM win_codes wc
         JOIN tickets t ON wc.ticket_id = t.id
         WHERE wc.code = $1`,
        [code.toUpperCase()]
    );

    if (res.rows.length === 0) {
        return { isValid: false, reason: 'WIN_CODE_NOT_FOUND' };
    }

    const winCode = res.rows[0];

    if (winCode.is_redeemed) {
        return { isValid: false, reason: 'WIN_CODE_ALREADY_REDEEMED' };
    }

    if (new Date() > new Date(winCode.expires_at)) {
        return { isValid: false, reason: 'WIN_CODE_EXPIRED' };
    }

    // Xác thực lại chữ ký HMAC nội bộ để tránh tamper dữ liệu
    const rawData = `${winCode.ticket_id}:${winCode.winner_user_id}:${winCode.amount_htg}`;
    const hmac = crypto.createHmac('sha256', config.HMAC_SECRET);
    hmac.update(rawData);
    const expectedSignature = hmac.digest('hex');

    if (winCode.hmac_signature !== expectedSignature) {
        return { isValid: false, reason: 'INVALID_SIGNATURE' };
    }

    return {
        isValid: true,
        winCode
    };
}

/**
 * Thực hiện đổi mã thưởng Win-Code trực tiếp tại bốt (Redeem)
 * - Đánh dấu mã đã thanh toán
 * - Cộng số dư Natcash cho Agent sở hữu bốt + 0.5% phí dịch vụ chi hộ
 */
async function redeemWinCode(code, agentId) {
    const validation = await validateWinCode(code);
    if (!validation.isValid) {
        throw new Error(validation.reason);
    }

    const { winCode } = validation;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // 1. Đánh dấu mã đã redeem
        await client.query(
            `UPDATE win_codes 
             SET is_redeemed = TRUE,
                 redeemed_by_agent = $1,
                 redeemed_at = NOW()
             WHERE id = $2`,
            [agentId, winCode.id]
        );

        // 2. Tính phí dịch vụ chi hộ 0.5% cho Agent
        const serviceFee = parseFloat(winCode.amount_htg) * config.COMMISSION.CASH_SERVICE_FEE;
        const totalCreditToAgent = parseFloat(winCode.amount_htg) + serviceFee;

        // Ghi nhận hoa hồng chi hộ (tier_level = 1 đối với giao dịch này)
        await client.query(
            `INSERT INTO commissions (ticket_id, agent_id, tier_level, amount_htg, rate_pct, status, released_at)
             VALUES ($1, $2, 1, $3, $4, 'PAID', NOW())`,
            [winCode.ticket_id, agentId, serviceFee, config.COMMISSION.CASH_SERVICE_FEE]
        );

        // Cộng trực tiếp tiền vào tài khoản hoa hồng/rút của Agent dưới dạng một payout dương hoặc ghi có
        // Trong mô hình này, Agent chi tiền mặt cho khách hàng nên Agent sẽ nhận lại tiền mặt đã chi + phí dịch vụ 0.5% qua ví Natcash của họ từ hệ thống.
        // Ghi nhận lịch sử hoàn trả tiền mặt + phí qua Natcash
        await client.query(
            `INSERT INTO commission_payouts (agent_id, total_amount, status, created_at, completed_at)
             VALUES ($1, $2, 'COMPLETED', NOW(), NOW())`,
            [agentId, totalCreditToAgent]
        );

        await client.query('COMMIT');
        
        return {
            amount: parseFloat(winCode.amount_htg),
            serviceFee,
            totalCreditToAgent,
            winnerUserId: winCode.winner_user_id
        };
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Lỗi xử lý đổi mã thưởng tại quầy:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    generateWinCode,
    saveWinCode,
    validateWinCode,
    redeemWinCode
};
