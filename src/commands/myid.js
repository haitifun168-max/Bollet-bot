'use strict';

module.exports = (bot) => {
    bot.command('myid', (ctx) => {
        ctx.replyWithHTML(
            `🆔 <b>Telegram ID:</b>\n` +
            `<code>${ctx.from.id}</code>`
        );
    });
};
