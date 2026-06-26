'use strict';
const agentService = require('../../services/agentService');
const commissionService = require('../../services/commissionService');
const { t } = require('../../utils/i18n');
const { Markup } = require('telegraf');

module.exports = (bot) => {
    bot.command('komisyon', async (ctx) => {
        try {
            const agent = await agentService.getOrCreateAgent(ctx.from.id, null, ctx.from.first_name);
            const balance = await commissionService.getAvailableBalance(agent.id);
            const weeklyHistory = await commissionService.getWeeklyHistory(agent.id);
            const lang = agent.language_code || 'ht';

            // Vẽ biểu đồ ASCII hoa hồng 7 ngày qua
            let chart = `<i>${t('no_rank_data', lang)}</i>`;
            if (weeklyHistory.length > 0) {
                const maxAmount = Math.max(...weeklyHistory.map(h => parseFloat(h.amount)), 1);
                chart = `📊 <b>${t('chart_trend', lang)}:</b>\n<pre>`;
                
                const steps = 5;
                for (let i = steps; i >= 1; i--) {
                    const threshold = (maxAmount / steps) * i;
                    let row = `${String(Math.round(threshold)).padStart(5)} HTG | `;
                    
                    for (const day of weeklyHistory) {
                        if (parseFloat(day.amount) >= threshold) {
                            row += ' █ ';
                        } else {
                            row += '   ';
                        }
                    }
                    chart += row + '\n';
                }
                chart += '      ------+' + '---'.repeat(weeklyHistory.length) + '\n';
                chart += '            | ';
                for (const day of weeklyHistory) {
                    const dateObj = new Date(day.date);
                    const label = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dateObj.getDay()];
                    chart += `${label} `;
                }
                chart += '</pre>';
            }

            const message = 
`${t('commission_report', lang)}
━━━━━━━━━━━━━━━━━━
👤 <b>${t('agent_name', lang)}:</b> ${ctx.from.first_name}
💳 <b>${t('available_balance', lang)}:</b> <pre>${balance.toLocaleString()} HTG</pre>

${chart}
`;

            const keyboard = balance > 0 
                ? Markup.inlineKeyboard([[Markup.button.callback(`💸 ${t('withdraw_natcash', lang)}`, 'payout_natcash')]])
                : null;

            ctx.replyWithHTML(message, keyboard);

        } catch (err) {
            console.error('Lỗi lệnh /komisyon:', err);
            ctx.reply('❌ Error loading commissions.');
        }
    });


    // Xử lý nút rút tiền
    bot.action('payout_natcash', async (ctx) => {
        try {
            const agent = await agentService.getOrCreateAgent(ctx.from.id, null, ctx.from.first_name);
            const balance = await commissionService.getAvailableBalance(agent.id);
            const lang = agent.language_code || 'ht';

            if (balance <= 0) {
                return ctx.answerCbQuery('❌ Balans 0', { show_alert: true });
            }

            const payoutId = await commissionService.requestPayout(agent.id, balance);
            ctx.answerCbQuery('⏳ Connect...', { show_alert: false });
            
            setTimeout(async () => {
                try {
                    const mockNatcashTxnId = `NC${Math.floor(10000000 + Math.random() * 90000000)}`;
                    await commissionService.confirmPayout(payoutId, mockNatcashTxnId);

                    ctx.replyWithHTML(
                        `${t('withdraw_success', lang)}\n` +
                        `━━━━━━━━━━━━━━━━━━\n` +
                        `💰 ${t('withdraw_amount', lang)}: <b>${balance.toLocaleString()} HTG</b>\n` +
                        `📱 Natcash: <b>${agent.natcash_phone || 'Default'}</b>\n` +
                        `🔑 ${t('withdraw_txn', lang)}: <code>${mockNatcashTxnId}</code>`
                    );
                } catch (err) {
                    ctx.reply(`❌ Error: ${err.message}`);
                }
            }, 1500);

        } catch (err) {
            console.error('Lỗi khi rút tiền:', err);
            ctx.reply(`❌ Error: ${err.message}`);
        }
    });
};

