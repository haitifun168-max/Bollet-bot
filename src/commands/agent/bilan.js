'use strict';
const agentService = require('../../services/agentService');
const { query } = require('../../database/index');
const { t } = require('../../utils/i18n');
const { Markup } = require('telegraf');

module.exports = (bot) => {
    bot.command('bilan', async (ctx) => {
        try {
            const agent = await agentService.getOrCreateAgent(ctx.from.id, null, ctx.from.first_name);
            const stats = await agentService.getAgentStats(agent.id);
            const lang = agent.language_code || 'ht';

            // Tiến trình nâng tier tiếp theo
            let nextTierText = '';
            if (stats.tier === 'DEBUTAN') {
                nextTierText = `🎯 ${t('progress_to', lang)} MACHANN: ${stats.monthlyVolume}/10,000 HTG`;
            } else if (stats.tier === 'MACHANN') {
                nextTierText = `🎯 ${t('progress_to', lang)} GRAN_MET: ${stats.monthlyVolume}/50,000 HTG`;
            } else if (stats.tier === 'GRAN_MET') {
                nextTierText = `🎯 ${t('progress_to', lang)} CHANPYON: ${stats.monthlyVolume}/200,000 HTG`;
            } else {
                nextTierText = `🏆 ${t('max_tier_reached', lang)}`;
            }

            const message = 
`${t('agent_dashboard', lang)}
━━━━━━━━━━━━━━━━━━
👤 <b>${t('agent_name', lang)}:</b> ${ctx.from.first_name}
🏷️ <b>${t('agent_tier', lang)}:</b> <code>${stats.tier}</code>
🔗 <b>${t('agent_ref_code', lang)}:</b> <code>${agent.referral_code}</code>

📈 <b>${t('stats_month', lang)}:</b>
├ ${t('volume_month', lang)}: <b>${stats.monthlyVolume.toLocaleString()} HTG</b>
└ ${t('volume_lifetime', lang)}: <b>${stats.lifetimeVolume.toLocaleString()} HTG</b>

📱 <b>${t('stats_today', lang)}:</b>
├ ${t('volume_today', lang)}: <b>${stats.todayVolume.toLocaleString()} HTG</b>
├ ${t('tickets_sold', lang)}: <b>${stats.todayTickets}</b>
└ ${t('prizes_paid', lang)}: <b>${stats.todayPrizes.toLocaleString()} HTG</b>

👥 <b>${t('network', lang)}:</b>
└ ${t('attributed_customers', lang)}: <b>${stats.totalCustomers}</b>

━━━━━━━━━━━━━━━━━━
${nextTierText}
`;

            ctx.replyWithHTML(message, Markup.inlineKeyboard([
                [Markup.button.callback('💰', 'view_commission'), Markup.button.callback('💸', 'view_cash')],
                [Markup.button.callback('👥', 'view_kliyan'), Markup.button.callback('🌐 Lang', 'change_lang')]
            ]));

        } catch (err) {
            console.error('Lỗi lệnh /bilan:', err);
            ctx.reply('❌ Error loading dashboard.');
        }
    });

    // Menu đổi ngôn ngữ
    bot.action('change_lang', (ctx) => {
        ctx.answerCbQuery();
        ctx.reply('Chwazi lang ou / Choisissez votre langue / Choose your language:', Markup.inlineKeyboard([
            [Markup.button.callback('🇭🇹 Kreyòl', 'set_lang_ht')],
            [Markup.button.callback('🇫🇷 Français', 'set_lang_fr')],
            [Markup.button.callback('🇺🇸 English', 'set_lang_en')]
        ]));
    });

    // Callback xử lý đổi ngôn ngữ
    const handleSetLang = (langCode, langName) => async (ctx) => {
        try {
            ctx.answerCbQuery();
            await query('UPDATE agents SET language_code = $1 WHERE telegram_id = $2', [langCode, ctx.from.id]);
            ctx.reply(`✅ Lang: ${langName}.\nTape /bilan ankò pou wè rezilta a.\n(Type /bilan again to see the results.)`);
        } catch (err) {
            console.error('Lỗi đổi ngôn ngữ:', err);
            ctx.reply('❌ Error changing language.');
        }
    };


    bot.action('set_lang_ht', handleSetLang('ht', 'Kreyòl Ayisyen'));
    bot.action('set_lang_fr', handleSetLang('fr', 'Français'));
    bot.action('set_lang_en', handleSetLang('en', 'English'));

    // Các button callback cũ
    bot.action('view_commission', async (ctx) => { ctx.answerCbQuery(); ctx.reply('👉 /komisyon'); });
    bot.action('view_cash', async (ctx) => { ctx.answerCbQuery(); ctx.reply('👉 /cash'); });
    bot.action('view_kliyan', async (ctx) => { ctx.answerCbQuery(); ctx.reply('👉 /kliyan'); });
};

