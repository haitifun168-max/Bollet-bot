'use strict';
const db = require('../database/index');
const qrcode = require('qrcode');
const tchalaService = require('../services/tchalaService');
const sessionService = require('../services/sessionService');
const betService = require('../services/betService');
const { Markup } = require('telegraf');

module.exports = (bot) => {
    // 1. Màn hình chọn game + Lựa chọn Sổ mơ / Tử vi
    const sendGameSelection = async (ctx) => {
        const session = await sessionService.getSession(ctx.from.id, 'TELEGRAM');
        // Reset trạng thái cược đơn hiện tại nhưng giữ nguyên giỏ hàng
        await sessionService.updateSession(ctx.from.id, { 
            step: 'IDLE',
            game_type: null,
            numbers: null
        }, 'TELEGRAM');

        let cartSummary = '';
        if (session.cart && session.cart.length > 0) {
            cartSummary = `🛒 <b>Panyen ou (Your Cart - ${session.cart.length} tickets):</b>\n`;
            session.cart.forEach((item, index) => {
                cartSummary += `├ ${index + 1}. <b>${item.gameType.replace('_', ' ')}</b>: <code>${item.numbers}</code> (${item.amount} HTG)\n`;
            });
            cartSummary += `━━━━━━━━━━━━━━━━━━\n\n`;
        }

        const message = 
`${cartSummary}🎟️ <b>ACHTE TIKÈ BORLETTE (Play Borlette)</b>
━━━━━━━━━━━━━━━━━━
Chwazi kalite jwèt ou vle jwe a oswa chèche nimewo chans:
<i>(Choose the type of game or find lucky numbers):</i>`;

        const keyboardButtons = [
            [Markup.button.callback('1️⃣ Bolet 2 (Win 50x)', 'play_BOLET_2')],
            [Markup.button.callback('2️⃣ Lotto 3 (Win 500x)', 'play_LOTTO3')],
            [Markup.button.callback('3️⃣ Maryaj (Win 1000x)', 'play_MARYAJ')],
            [Markup.button.callback('📖 Tchala (Dream Book)', 'open_tchala'), Markup.button.callback('⭐ Zodiak (Zodiac Sign)', 'open_zodiac')]
        ];

        if (session.cart && session.cart.length > 0) {
            keyboardButtons.push([Markup.button.callback('💳 Peye Panyen an (Checkout Cart)', 'checkout_cart')]);
        }

        ctx.replyWithHTML(message, Markup.inlineKeyboard(keyboardButtons));
    };

    bot.command('play', sendGameSelection);
    bot.command('product', sendGameSelection);

    // 2. Click chọn game -> Nhắc gửi số + Thêm nút sinh số ngẫu nhiên
    const handleGameClick = (gameType, sampleNum) => async (ctx) => {
        try {
            ctx.answerCbQuery();
            await sessionService.updateSession(ctx.from.id, {
                game_type: gameType,
                step: 'WAITING_FOR_NUMBER',
                numbers: null
            }, 'TELEGRAM');

            const promptText = 
`🔢 <b>Jwèt: ${gameType.replace('_', ' ')}</b>
━━━━━━━━━━━━━━━━━━
Voye nimewo ou chwazi a nan chat la (e.g. <code>${sampleNum}</code>) oswa klike sou bouton anba a pou jwenn yon nimewo o aza:
<i>(Send your chosen number or click the button below for a random number):</i>`;

            ctx.replyWithHTML(promptText, Markup.inlineKeyboard([
                [Markup.button.callback('🎲 Nimewo Chans (Lucky Pick)', 'lucky_pick_number')]
            ]));
        } catch (err) {
            console.error(err);
            ctx.reply('❌ Error starting game selection.');
        }
    };

    bot.action('play_BOLET_2', handleGameClick('BOLET_2', '24'));
    bot.action('play_LOTTO3', handleGameClick('LOTTO3', '123'));
    bot.action('play_MARYAJ', handleGameClick('MARYAJ', '12x34'));

    // 3. Xử lý Sinh số Ngẫu nhiên (Lucky Pick)
    bot.action('lucky_pick_number', async (ctx) => {
        ctx.answerCbQuery();
        const session = await sessionService.getSession(ctx.from.id, 'TELEGRAM');

        if (session.step !== 'WAITING_FOR_NUMBER') {
            return ctx.reply('❌ Sesyon an ekspire. Tanpri kòmanse ankò ak /play.');
        }

        const gameType = session.game_type;
        let numbers = '';

        if (gameType === 'BOLET_2') {
            numbers = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        } else if (gameType === 'LOTTO3') {
            numbers = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        } else if (gameType === 'MARYAJ') {
            const num1 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
            const num2 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
            numbers = `${num1}x${num2}`;
        }

        await sessionService.updateSession(ctx.from.id, {
            numbers: numbers,
            step: 'WAITING_FOR_AMOUNT'
        }, 'TELEGRAM');

        askForAmount(ctx, numbers, gameType);
    });

    // 4. Xử lý chọn Sổ mơ Tchala
    bot.action('open_tchala', async (ctx) => {
        ctx.answerCbQuery();
        await sessionService.updateSession(ctx.from.id, {
            step: 'WAITING_FOR_DREAM'
        }, 'TELEGRAM');

        ctx.replyWithHTML(
            `📖 <b>TCHALA (Haitian Dream Dictionary)</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `Kisa ou te reve jodi a? Voye mo a nan chat la (e.g. <i>chat, dife, dlo, lajan, maryaj</i>):\n` +
            `<i>(What did you dream about? Send the keyword in chat, e.g. cat, fire, water, money):</i>`
        );
    });

    // 5. Xử lý chọn Cung Hoàng Đạo
    bot.action('open_zodiac', (ctx) => {
        ctx.answerCbQuery();
        ctx.replyWithHTML(
            `⭐ <b>ZODIAK (Zodiac Lucky Pick)</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `Chwazi siy zodiak ou a pou jwenn nimewo chans ou:\n` +
            `<i>(Select your zodiac sign to get your lucky numbers):</i>`,
            Markup.inlineKeyboard([
                [Markup.button.callback('🐏 Belye (Aries)', 'zod_belye'), Markup.button.callback('🐂 Toro (Taurus)', 'zod_toro')],
                [Markup.button.callback('👬 Jemo (Gemini)', 'zod_jemo'), Markup.button.callback('🦀 Kansè (Cancer)', 'zod_kansè')],
                [Markup.button.callback('🦁 Lyon (Leo)', 'zod_lyon'), Markup.button.callback('♍ Vyèj (Virgo)', 'zod_vyèj')],
                [Markup.button.callback('⚖️ Balans (Libra)', 'zod_balans'), Markup.button.callback('🦂 Skopyon (Scorpio)', 'zod_skopyon')],
                [Markup.button.callback('🏹 Sajitè (Sagitt.)', 'zod_sajitè'), Markup.button.callback('🐐 Kaprikòn (Capri.)', 'zod_kaprikòn')],
                [Markup.button.callback('🏺 Vèsò (Aquarius)', 'zod_vèsò'), Markup.button.callback('🐟 Pwason (Pisces)', 'zod_pwason')]
            ])
        );
    });

    // Xử lý click chọn Cung Hoàng đạo
    bot.action(/^zod_([\wèòàèìùỳ]+)$/, async (ctx) => {
        ctx.answerCbQuery();
        const signKey = ctx.match[1];
        
        const zodiac = tchalaService.getZodiacNumbers(signKey);
        if (!zodiac) {
            return ctx.reply('❌ Zodiak sa a pa valab. / Invalid zodiac sign.');
        }

        await sessionService.updateSession(ctx.from.id, {
            game_type: 'BOLET_2',
            step: 'WAITING_FOR_DREAM_NUMBER_SELECTION',
            suggested_numbers: zodiac.numbers
        }, 'TELEGRAM');

        const message = 
`⭐ <b>Zodiak: ${zodiac.name}</b>\n` +
`━━━━━━━━━━━━━━━━━━\n` +
`Nimewo chans ou yo pou jodi a se: <b>${zodiac.numbers.join(', ')}</b>\n\n` +
`Klike sou yon nimewo pou mete paryaj ou (Bolet 2):`;

        const buttons = zodiac.numbers.map(num => 
            Markup.button.callback(`🎟️ ${num}`, `bet_suggested_num_${num}`)
        );

        ctx.replyWithHTML(message, Markup.inlineKeyboard([
            buttons,
            [Markup.button.callback('🔥 Achte tout (Buy all)', 'bet_suggested_all')]
        ]));
    });

    // Xử lý click chọn số may mắn gợi ý từ Tchala hoặc Zodiac
    bot.action(/^bet_suggested_num_(\d+)$/, async (ctx) => {
        ctx.answerCbQuery();
        const session = await sessionService.getSession(ctx.from.id, 'TELEGRAM');

        if (session.step !== 'WAITING_FOR_DREAM_NUMBER_SELECTION') {
            return ctx.reply('❌ Sesyon an ekspire. Tanpri kòmanse ankò ak /play.');
        }

        const numbers = ctx.match[1];
        await sessionService.updateSession(ctx.from.id, {
            numbers: numbers,
            suggested_numbers: null,
            step: 'WAITING_FOR_AMOUNT'
        }, 'TELEGRAM');

        askForAmount(ctx, numbers, session.game_type);
    });

    // Xử lý click chọn TẤT CẢ số may mắn gợi ý
    bot.action('bet_suggested_all', async (ctx) => {
        ctx.answerCbQuery();
        const session = await sessionService.getSession(ctx.from.id, 'TELEGRAM');

        if (!session.suggested_numbers) {
            return ctx.reply('❌ Sesyon an ekspire. Tanpri kòmanse ankò ak /play.');
        }

        const suggestedList = typeof session.suggested_numbers === 'string' 
            ? session.suggested_numbers.split(',') 
            : session.suggested_numbers;

        await sessionService.updateSession(ctx.from.id, {
            numbers: suggestedList.join(','),
            suggested_numbers: null,
            step: 'WAITING_FOR_AMOUNT'
        }, 'TELEGRAM');

        askForAmount(ctx, suggestedList.join(', '), session.game_type);
    });

    // Hàm phụ hiển thị lựa chọn tiền cược
    function askForAmount(ctx, numbers, gameType) {
        const message = 
`💵 <b>KANTITE LAJAN POU PARYE (Bet Amount)</b>
━━━━━━━━━━━━━━━━━━
Nimewo chwazi: <b>${numbers}</b> (${gameType.replace('_', ' ')})
 
Chwazi kantite lajan ou vle mete sou tikè sa a:
<i>(Select the amount of money you want to bet):</i>`;

        ctx.replyWithHTML(message, Markup.inlineKeyboard([
            [Markup.button.callback('💵 50 HTG', 'bet_amount_50'), Markup.button.callback('💵 100 HTG', 'bet_amount_100')],
            [Markup.button.callback('💵 200 HTG', 'bet_amount_200'), Markup.button.callback('💵 500 HTG', 'bet_amount_500')]
        ]));
    }

    // 6. Click chọn số tiền cược nhanh -> Đưa vào giỏ hàng
    bot.action(/^bet_amount_(\d+)$/, async (ctx) => {
        ctx.answerCbQuery();
        const session = await sessionService.getSession(ctx.from.id, 'TELEGRAM');

        if (session.step !== 'WAITING_FOR_AMOUNT') {
            return ctx.reply('❌ Sesyon an ekspire. Tanpri kòmanse ankò ak /play.');
        }

        const amount = parseInt(ctx.match[1]);
        
        let numbersList = [];
        if (session.numbers && session.numbers.includes(',')) {
            numbersList = session.numbers.split(',');
        } else if (session.numbers) {
            numbersList = [session.numbers];
        }

        const updatedCart = betService.addToCart(session.cart, numbersList, session.game_type, amount);
        const addedNumbersText = numbersList.join(', ');
        const totalCost = amount * numbersList.length;

        const addedMsg = 
`✅ <b>Tikè te ajoute nan panyen an! (Ticket added to cart!)</b>
🔢 Nimewo: <b>${addedNumbersText}</b>
💵 Lajan: <b>${amount} HTG / tikè</b> (Total: <b>${totalCost.toLocaleString()} HTG</b>)
━━━━━━━━━━━━━━━━━━
Kisa ou vle fè kounye a?
<i>(What do you want to do now?):</i>`;

        await sessionService.updateSession(ctx.from.id, {
            cart: updatedCart,
            step: 'IDLE',
            game_type: null,
            numbers: null
        }, 'TELEGRAM');

        ctx.replyWithHTML(addedMsg, Markup.inlineKeyboard([
            [Markup.button.callback('➕ Achte yon lòt nimewo (Add ticket)', 'add_more_tickets')],
            [Markup.button.callback('💳 Peye kounye a (Checkout now)', 'checkout_cart')]
        ]));
    });

    bot.action('add_more_tickets', async (ctx) => {
        ctx.answerCbQuery();
        await sendGameSelection(ctx);
    });

    // 7. Thanh toán Giỏ hàng (Checkout Cart)
    bot.action('checkout_cart', async (ctx) => {
        ctx.answerCbQuery();
        const session = await sessionService.getSession(ctx.from.id, 'TELEGRAM');
        const cart = session.cart || [];

        if (cart.length === 0) {
            return ctx.reply('❌ Panyen ou vid. Tanpri kòmanse ak /play.');
        }

        try {
            const { paymentRef, totalAmount, ticketsSummary, prefilledSimUrl } = 
                await betService.checkout(ctx.from.id, 'TELEGRAM', cart);

            const qrBuffer = await qrcode.toBuffer(prefilledSimUrl, {
                errorCorrectionLevel: 'M',
                margin: 2,
                color: {
                    dark: '#121a2f',
                    light: '#ffffff'
                }
            });

            const captionText = 
`📝 <b>BÒDWO TIKE PARYAJ (Bet Cart Checkout)</b>
━━━━━━━━━━━━━━━━━━
${ticketsSummary}
💵 <b>TOTAL KÒN: ${totalAmount.toLocaleString()} HTG</b>
🔑 Ref: <code>${paymentRef}</code>
 
📱 <b>PAYMENT METHOD - NATCASH:</b>
1. Scan QR Code to trigger payment.
2. Or click the link below to simulate Natcash payment:
👉 <a href="${prefilledSimUrl}">Pay with Natcash (Simulator)</a>`;

            await ctx.replyWithPhoto(
                { source: qrBuffer },
                {
                    caption: captionText,
                    parse_mode: 'HTML'
                }
            );

            await sessionService.clearSession(ctx.from.id);

        } catch (err) {
            console.error('Lỗi khi thanh toán giỏ hàng:', err);
            ctx.reply('❌ Error checkout cart: ' + err.message);
        }
    });

    // Lệnh riêng cho /tchala đề phòng người chơi gõ thẳng
    bot.command('tchala', async (ctx) => {
        await sessionService.updateSession(ctx.from.id, {
            step: 'WAITING_FOR_DREAM'
        }, 'TELEGRAM');
        ctx.replyWithHTML(
            `📖 <b>TCHALA (Dream Dictionary)</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `Kisa ou te reve? Voye mo a nan chat la (e.g. <i>chat, dife, dlo, lajan, maryaj</i>):`
        );
    });

    // 8. Bắt tin nhắn text của người dùng để xử lý Sổ mơ Tchala & Gõ số cược thủ công
    bot.on('text', async (ctx, next) => {
        const session = await sessionService.getSession(ctx.from.id, 'TELEGRAM');
        
        if (session.step === 'IDLE' || !session.step) {
            return next();
        }

        // Xử lý bước tra sổ mơ
        if (session.step === 'WAITING_FOR_DREAM') {
            const keyword = ctx.message.text.trim();
            const result = await tchalaService.lookupDream(keyword);

            if (!result) {
                return ctx.replyWithHTML(
                    `❌ Pa jwenn nimewo chans pou mo sa a: <b>${keyword}</b>\n` +
                    `Tanpri voye yon lòt mo (e.g. chat, dife, dlo, lajan):`
                );
            }

            // Gợi ý cược các số từ giấc mơ tra được
            await sessionService.updateSession(ctx.from.id, {
                game_type: 'BOLET_2',
                step: 'WAITING_FOR_DREAM_NUMBER_SELECTION',
                suggested_numbers: result.numbers
            }, 'TELEGRAM');

            const message = 
`📖 <b>Tchala: ${result.keyword.toUpperCase()}</b>\n` +
`━━━━━━━━━━━━━━━━━━\n` +
`Nimewo chans ou yo se: <b>${result.numbers.join(', ')}</b>\n\n` +
`Klike sou yon nimewo pou mete paryaj ou (Bolet 2):`;

            const buttons = result.numbers.map(num => 
                Markup.button.callback(`🎟️ ${num}`, `bet_suggested_num_${num}`)
            );

            return ctx.replyWithHTML(message, Markup.inlineKeyboard([
                buttons,
                [Markup.button.callback('🔥 Achte tout (Buy all)', 'bet_suggested_all')]
            ]));
        }

        // Xử lý bước nhập số cược thông thường
        if (session.step === 'WAITING_FOR_NUMBER') {
            const rawInput = ctx.message.text.trim();
            const gameType = session.game_type;

            const validation = betService.validateNumbers(rawInput, gameType);

            if (!validation.isValid || validation.numbers.length === 0) {
                if (gameType === 'BOLET_2') {
                    return ctx.reply(`❌ Nimewo sa yo pa valid (Bolet 2 dwe gen ekzakteman 2 chif, e.g. 24): ${validation.invalidNumbers.join(', ')}. Re-voye:`);
                }
                if (gameType === 'LOTTO3') {
                    return ctx.reply(`❌ Nimewo sa yo pa valid (Lotto 3 dwe gen ekzakteman 3 chif, e.g. 123): ${validation.invalidNumbers.join(', ')}. Re-voye:`);
                }
                if (gameType === 'MARYAJ') {
                    return ctx.reply(`❌ Nimewo sa yo pa valid (Maryaj dwe gen fòma: [2 chif]x[2 chif], e.g. 12x34): ${validation.invalidNumbers.join(', ')}. Re-voye:`);
                }
                return ctx.reply('❌ Nimewo pa valid. Re-voye nimewo a:');
            }

            const parsedNumbers = validation.numbers;
            if (parsedNumbers.length === 1) {
                await sessionService.updateSession(ctx.from.id, {
                    numbers: parsedNumbers[0],
                    step: 'WAITING_FOR_AMOUNT'
                }, 'TELEGRAM');
                askForAmount(ctx, parsedNumbers[0], gameType);
            } else {
                await sessionService.updateSession(ctx.from.id, {
                    numbers: parsedNumbers.join(','),
                    step: 'WAITING_FOR_AMOUNT'
                }, 'TELEGRAM');
                askForAmount(ctx, parsedNumbers.join(', '), gameType);
            }
            return;
        }

        return next();
    });
};
