'use strict';
const db = require('../database/index');

module.exports = (bot) => {
    bot.command('checkpay', async (ctx) => {
        try {
            // Lấy 5 vé cược gần nhất của user này
            const res = await db.query(
                `SELECT game_type, numbers, amount_htg, payment_ref, status, is_winner, prize_amount, created_at
                 FROM tickets
                 WHERE user_id = $1
                 ORDER BY created_at DESC
                 LIMIT 5`,
                [ctx.from.id]
            );

            if (res.rows.length === 0) {
                return ctx.replyWithHTML(
                    `📋 <b>LIST TIKÈ / RECENT TICKETS</b>\n━━━━━━━━━━━━━━━━━━\n` +
                    `<i>Ou pa gen okenn tikè paryaj ankò. / You don't have any tickets yet.</i>`
                );
            }

            let text = `🔍 <b>TIKÈ GÒN ĐÂY / RECENT TICKETS</b>\n━━━━━━━━━━━━━━━━━━\n\n`;
            
            res.rows.forEach((row, i) => {
                const statusEmoji = row.status === 'PAID' ? '🟢 PAID' : '⏳ PENDING';
                let winStatus = '';
                if (row.status === 'PAID') {
                    winStatus = row.is_winner 
                        ? `\n🏆 <b>Genyen (Win): +${parseInt(row.prize_amount).toLocaleString()} HTG</b>`
                        : `\n❌ Pa genyen (No Win)`;
                }

                text += `${i + 1}. 🎟️ <b>${row.game_type}</b> (<code>${row.numbers}</code>)\n` +
                        `├ 💵 Lajan: <b>${parseInt(row.amount_htg).toLocaleString()} HTG</b>\n` +
                        `├ 🔑 Ref: <code>${row.payment_ref}</code>\n` +
                        `├ Trạng thái: ${statusEmoji}${winStatus}\n` +
                        `└ Lè: ${new Date(row.created_at).toLocaleString()}\n\n`;
            });

            ctx.replyWithHTML(text);
        } catch (err) {
            console.error('Lỗi lệnh /checkpay:', err);
            ctx.reply('❌ Error loading recent tickets.');
        }
    });
};
