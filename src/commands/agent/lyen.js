'use strict';
const agentService = require('../../services/agentService');
const { t } = require('../../utils/i18n');

module.exports = (bot) => {
    bot.command('lyen', async (ctx) => {
        try {
            const agent = await agentService.getOrCreateAgent(ctx.from.id, null, ctx.from.first_name);
            const botInfo = await ctx.telegram.getMe();
            const lang = agent.language_code || 'ht';
            
            const refLink = `https://t.me/${botInfo.username}?start=${agent.referral_code}`;

            const message = 
`${t('referral_link_title', lang)}
━━━━━━━━━━━━━━━━━━
👤 <b>${t('agent_name', lang)}:</b> ${ctx.from.first_name}
🔑 <b>${t('agent_ref_code', lang)}:</b> <code>${agent.referral_code}</code>

${t('referral_desc', lang)}

👇 <b>${t('referral_link_title', lang)}:</b>
<code>${refLink}</code>

${t('referral_tip', lang)}
`;

            ctx.replyWithHTML(message);

        } catch (err) {
            console.error('Lỗi lệnh /lyen:', err);
            ctx.reply('❌ Error.');
        }
    });
};

