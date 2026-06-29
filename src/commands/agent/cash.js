'use strict';
const agentService = require('../../services/agentService');
const winCodeService = require('../../services/winCodeService');
const { t } = require('../../utils/i18n');
const { Markup } = require('telegraf');

const cashState = {};

module.exports = (bot) => {
    bot.command('cash', async (ctx) => {
        const args = ctx.message.text.split(' ').slice(1);
        const code = args[0];

        try {
            const agent = await agentService.getOrCreateAgent(ctx.from.id, null, ctx.from.first_name);
            const lang = agent.language_code || 'ht';

            if (!code) {
                return ctx.replyWithHTML(
                    `${t('cash_redemption', lang)}\n\n` +
                    `${t('cash_instruction', lang)}`
                );
            }

            const cleanCode = code.trim().toUpperCase();
            const validation = await winCodeService.validateWinCode(cleanCode);

            if (!validation.isValid) {
                let localizedReason = validation.reason;
                if (validation.reason === 'WIN_CODE_NOT_FOUND') localizedReason = t('code_not_exist', lang);
                else if (validation.reason === 'WIN_CODE_ALREADY_REDEEMED') localizedReason = t('code_redeemed', lang);
                else if (validation.reason === 'WIN_CODE_EXPIRED') localizedReason = t('code_expired', lang);
                else if (validation.reason === 'INVALID_SIGNATURE') localizedReason = t('validation_error', lang);

                return ctx.replyWithHTML(`❌ <b>${t('validation_error', lang)}</b> ${localizedReason}`);
            }

            const winCode = validation.winCode;

            cashState[ctx.from.id] = {
                code: cleanCode,
                agentId: agent.id,
                amount: parseFloat(winCode.amount_htg)
            };

            ctx.replyWithHTML(
                `${t('code_verified_success', lang)}\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `👤 ${t('winner_id', lang)}: <code>${winCode.winner_user_id}</code>\n` +
                `🔢 ${t('ticket_numbers', lang)}: <b>${winCode.numbers}</b> (${winCode.game_type})\n` +
                `💵 ${t('cash_to_pay', lang)}: <b>${parseFloat(winCode.amount_htg).toLocaleString()} HTG</b>\n` +
                `⏱️ ${t('expires_at', lang)}: ${new Date(winCode.expires_at).toLocaleString()}\n\n` +
                `${t('cash_guide', lang)}`,
                Markup.inlineKeyboard([
                    [Markup.button.callback(`✅ ${t('confirm_cash_paid', lang)}`, 'confirm_cash_payment')],
                    [Markup.button.callback(`❌ ${t('cancel_txn', lang)}`, 'cancel_cash_payment')]
                ])
            );

        } catch (err) {
            console.error('Lỗi lệnh /cash:', err);
            ctx.reply('❌ Error.');
        }
    });

    bot.action('confirm_cash_payment', async (ctx) => {
        const state = cashState[ctx.from.id];
        if (!state) {
            return ctx.reply('❌ No transaction.');
        }

        try {
            const agent = await agentService.getOrCreateAgent(ctx.from.id, null, ctx.from.first_name);
            const lang = agent.language_code || 'ht';
            ctx.answerCbQuery('Processing...');

            const result = await winCodeService.redeemWinCode(state.code, state.agentId);

            ctx.replyWithHTML(
                `${t('redemption_success', lang)}\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `💵 ${t('cash_disbursed', lang)}: <b>${result.amount.toLocaleString()} HTG</b>\n` +
                `➕ ${t('service_fee', lang)}: <b>${result.serviceFee.toLocaleString()} HTG</b>\n` +
                `💳 ${t('total_credited', lang)}: <b>${result.totalCreditToAgent.toLocaleString()} HTG</b>`
            );

            delete cashState[ctx.from.id];
        } catch (err) {
            ctx.reply(`❌ Error: ${err.message}`);
        }
    });

    bot.action('cancel_cash_payment', async (ctx) => {
        delete cashState[ctx.from.id];
        ctx.answerCbQuery('Cancelled');
        ctx.reply('❌ Cancelled.');
    });
};

