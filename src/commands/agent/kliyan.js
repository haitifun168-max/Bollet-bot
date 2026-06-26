'use strict';
const agentService = require('../../services/agentService');
const { t } = require('../../utils/i18n');

module.exports = (bot) => {
    bot.command('kliyan', async (ctx) => {
        try {
            const agent = await agentService.getOrCreateAgent(ctx.from.id, null, ctx.from.first_name);
            const customers = await agentService.getAgentCustomers(agent.id);
            const lang = agent.language_code || 'ht';

            if (customers.length === 0) {
                return ctx.replyWithHTML(
                    `${t('customer_list', lang)}\n━━━━━━━━━━━━━━━━━━\n` +
                    `${t('no_customers', lang)}`
                );
            }

            let message = `${t('customer_list', lang)}\n━━━━━━━━━━━━━━━━━━\n`;
            
            const now = new Date();
            let inactiveCount = 0;

            customers.forEach((cust, index) => {
                const lastActive = new Date(cust.last_active);
                const daysInactive = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
                
                let statusIcon = '🟢';
                let alertText = '';
                if (daysInactive > 14) {
                    statusIcon = '🔴';
                    alertText = ` (${t('status_inactive', lang)} ${daysInactive}d)`;
                    inactiveCount++;
                } else if (daysInactive > 7) {
                    statusIcon = '🟡';
                    alertText = ` (${t('status_inactive', lang)} ${daysInactive}d)`;
                }

                message += `${index + 1}. ID: <code>${cust.user_id}</code> | Tickets: <b>${cust.total_tickets}</b>\n` +
                           `   └ Status: ${statusIcon}${alertText}\n`;
            });

            if (inactiveCount > 0 && lang === 'ht') {
                message += `\n${t('inactive_warning', lang)}`;
            } else if (inactiveCount > 0) {
                message += `\n${t('inactive_warning', lang)}`;
            }

            ctx.replyWithHTML(message);

        } catch (err) {
            console.error('Lỗi lệnh /kliyan:', err);
            ctx.reply('❌ Error.');
        }
    });
};

