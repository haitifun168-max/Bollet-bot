'use strict';
const db = require('../database/index');
const messages = require('../utils/messages');

module.exports = (bot) => {
    bot.command('menu', async (ctx) => {
        try {
            // Đếm số vé đã mua của user này
            const ticketsRes = await db.query(
                `SELECT COUNT(*) as total FROM tickets WHERE user_id = $1 AND status = 'PAID'`,
                [ctx.from.id]
            );
            const count = parseInt(ticketsRes.rows[0].total) || 0;

            ctx.replyWithHTML(messages.accountInfo(ctx.from, count));
        } catch (err) {
            console.error('Lỗi lệnh /menu:', err);
            ctx.reply('❌ Error loading account menu.');
        }
    });
};
