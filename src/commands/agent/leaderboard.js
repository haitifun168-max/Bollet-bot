'use strict';
const agentService = require('../../services/agentService');
const leaderboardService = require('../../services/leaderboardService');
const { t } = require('../../utils/i18n');

module.exports = (bot) => {
    bot.command('leaderboard', async (ctx) => {
        try {
            const agent = await agentService.getOrCreateAgent(ctx.from.id, null, ctx.from.first_name);
            const topAgents = await leaderboardService.getMonthlyLeaderboard(10);
            const myRank = await leaderboardService.getAgentRank(agent.id);
            const lang = agent.language_code || 'ht';

            let message = `🏆 <b>${t('leaderboard_title', lang)}</b>\n`;
            message += `<i>${t('leaderboard_subtitle', lang)}</i>\n`;
            message += `━━━━━━━━━━━━━━━━━━\n\n`;

            if (topAgents.length === 0) {
                message += `<i>${t('no_rank_data', lang)}</i>\n`;
            } else {
                topAgents.forEach((top, index) => {
                    let medal = '🔹';
                    if (index === 0) medal = '🥇';
                    else if (index === 1) medal = '🥈';
                    else if (index === 2) medal = '🥉';

                    const name = top.full_name || `Agent_${top.telegram_id}`;
                    message += `${medal} <b>${index + 1}. ${name}</b> (<code>${top.tier}</code>)\n`;
                    message += `   └ Volume: <b>${parseInt(top.monthly_volume).toLocaleString()} HTG</b>\n`;
                });
            }

            message += `\n━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 <b>${t('my_rank', lang)}:</b> #<b>${myRank.rank}</b>\n`;
            message += `📈 Volume: <b>${myRank.monthlyVolume.toLocaleString()} HTG</b>\n`;

            ctx.replyWithHTML(message);

        } catch (err) {
            console.error('Lỗi lệnh /leaderboard:', err);
            ctx.reply('❌ Error.');
        }
    });
};

