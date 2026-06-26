'use strict';
const db = require('../database/index');
const qrcode = require('qrcode');
const tchalaService = require('../services/tchalaService');
const { Markup } = require('telegraf');

module.exports = (bot) => {
    // 1. Màn hình chọn game + Lựa chọn Sổ mơ / Tử vi
    const sendGameSelection = async (ctx) => {
        ctx.session = ctx.session || {};
        ctx.session.cart = ctx.session.cart || [];
        ctx.session.bet = null; // Reset trạng thái cược đơn hiện tại

        let cartSummary = '';
        if (ctx.session.cart.length > 0) {
            cartSummary = `🛒 <b>Panyen ou (Your Cart - ${ctx.session.cart.length} tickets):</b>\n`;
            ctx.session.cart.forEach((item, index) => {
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
            [Markup.button.callback('📖 Sổ mơ Tchala (Dream Book)', 'open_tchala'), Markup.button.callback('⭐ Zodiak (Zodiac Sign)', 'open_zodiac')]
        ];

        if (ctx.session.cart.length > 0) {
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
            ctx.session = ctx.session || {};
            
            ctx.session.bet = {
                gameType,
                step: 'WAITING_FOR_NUMBER'
            };

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
        ctx.session = ctx.session || {};

        if (!ctx.session.bet || ctx.session.bet.step !== 'WAITING_FOR_NUMBER') {
            return ctx.reply('❌ Sesyon an ekspire. Tanpri kòmanse ankò ak /play.');
        }

        const gameType = ctx.session.bet.gameType;
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

        ctx.session.bet.numbers = numbers;
        ctx.session.bet.step = 'WAITING_FOR_AMOUNT';

        askForAmount(ctx, numbers, gameType);
    });

    // 4. Xử lý chọn Sổ mơ Tchala
    bot.action('open_tchala', (ctx) => {
        ctx.answerCbQuery();
        ctx.session = ctx.session || {};
        ctx.session.bet = {
            step: 'WAITING_FOR_DREAM'
        };

        ctx.replyWithHTML(
            `📖 <b>SỔ MƠ TCHALA (Haitian Dream Dictionary)</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `Kisa ou te reve jodi a? Voye mo a nan chat la (e.g. <i>chat, dife, dlo, lajan, maryaj</i>):\n` +
            `<i>(What did you dream about? Send the keyword in chat, e.g. cat, fire, water, money):</i>`
        );
    });

    // 5. Xử lý chọn Cung Hoàng Đạo
    bot.action('open_zodiac', (ctx) => {
        ctx.answerCbQuery();
        ctx.replyWithHTML(
            `⭐ <b>CUNG HOÀNG ĐẠO (Zodiac Lucky Pick)</b>\n` +
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
        ctx.session = ctx.session || {};
        const signKey = ctx.match[1];
        
        const zodiac = tchalaService.getZodiacNumbers(signKey);
        if (!zodiac) {
            return ctx.reply('❌ Cung hoàng đạo không hợp lệ.');
        }

        ctx.session.bet = {
            gameType: 'BOLET_2',
            step: 'WAITING_FOR_DREAM_NUMBER_SELECTION',
            suggestedNumbers: zodiac.numbers
        };

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
    bot.action(/^bet_suggested_num_(\d+)$/, (ctx) => {
        ctx.answerCbQuery();
        ctx.session = ctx.session || {};

        if (!ctx.session.bet) {
            return ctx.reply('❌ Sesyon an ekspire. Tanpri kòmanse ankò ak /play.');
        }

        const numbers = ctx.match[1];
        ctx.session.bet.numbers = numbers;
        ctx.session.bet.numbersBatch = null;
        ctx.session.bet.step = 'WAITING_FOR_AMOUNT';

        askForAmount(ctx, numbers, ctx.session.bet.gameType);
    });

    // Xử lý click chọn TẤT CẢ số may mắn gợi ý
    bot.action('bet_suggested_all', (ctx) => {
        ctx.answerCbQuery();
        ctx.session = ctx.session || {};

        if (!ctx.session.bet || !ctx.session.bet.suggestedNumbers) {
            return ctx.reply('❌ Sesyon an ekspire. Tanpri kòmanse ankò ak /play.');
        }

        const numbersBatch = ctx.session.bet.suggestedNumbers;
        ctx.session.bet.numbers = null;
        ctx.session.bet.numbersBatch = numbersBatch;
        ctx.session.bet.step = 'WAITING_FOR_AMOUNT';

        askForAmount(ctx, numbersBatch.join(', '), ctx.session.bet.gameType);
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
        ctx.session = ctx.session || {};

        if (!ctx.session.bet || ctx.session.bet.step !== 'WAITING_FOR_AMOUNT') {
            return ctx.reply('❌ Sesyon an ekspire. Tanpri kòmanse ankò ak /play.');
        }

        const amount = parseInt(ctx.match[1]);
        ctx.session.bet.amount = amount;
        
        ctx.session.cart = ctx.session.cart || [];
        
        let addedNumbersText = '';
        let totalCost = 0;
        
        if (ctx.session.bet.numbersBatch && ctx.session.bet.numbersBatch.length > 0) {
            for (const num of ctx.session.bet.numbersBatch) {
                ctx.session.cart.push({
                    gameType: ctx.session.bet.gameType,
                    numbers: num,
                    amount: amount
                });
            }
            addedNumbersText = ctx.session.bet.numbersBatch.join(', ');
            totalCost = amount * ctx.session.bet.numbersBatch.length;
        } else {
            ctx.session.cart.push({
                gameType: ctx.session.bet.gameType,
                numbers: ctx.session.bet.numbers,
                amount: amount
            });
            addedNumbersText = ctx.session.bet.numbers;
            totalCost = amount;
        }

        const addedMsg = 
`✅ <b>Tikè te ajoute nan panyen an! (Ticket added to cart!)</b>
🔢 Nimewo: <b>${addedNumbersText}</b>
💵 Lajan: <b>${amount} HTG / tikè</b> (Total: <b>${totalCost.toLocaleString()} HTG</b>)
━━━━━━━━━━━━━━━━━━
Kisa ou vle fè kounye a?
<i>(What do you want to do now?):</i>`;

        ctx.session.bet = null;

        ctx.replyWithHTML(addedMsg, Markup.inlineKeyboard([
            [Markup.button.callback('➕ Achte yon lòt nimewo (Add ticket)', 'add_more_tickets')],
            [Markup.button.callback('💳 Peye kounye a (Checkout now)', 'checkout_cart')]
        ]));
    });

    bot.action('add_more_tickets', (ctx) => {
        ctx.answerCbQuery();
        sendGameSelection(ctx);
    });

    // 7. Thanh toán Giỏ hàng (Checkout Cart)
    bot.action('checkout_cart', async (ctx) => {
        ctx.answerCbQuery();
        ctx.session = ctx.session || {};
        const cart = ctx.session.cart || [];

        if (cart.length === 0) {
            return ctx.reply('❌ Panyen ou vid. Tanpri kòmanse ak /play.');
        }

        try {
            const attrRes = await db.query(
                `SELECT agent_id FROM user_agent_attribution WHERE user_id = $1 LIMIT 1`,
                [ctx.from.id]
            );
            
            let agentId = null;
            if (attrRes.rows.length > 0) {
                agentId = attrRes.rows[0].agent_id;
            } else {
                const defaultAgentRes = await db.query('SELECT id FROM agents LIMIT 1');
                if (defaultAgentRes.rows.length > 0) {
                    agentId = defaultAgentRes.rows[0].id;
                }
            }

            let drawRes = await db.query(
                `SELECT id FROM draws WHERE draw_date = CURRENT_DATE AND status = 'OPEN' LIMIT 1`
            );
            let drawId;
            if (drawRes.rows.length === 0) {
                const newDraw = await db.query(
                    `INSERT INTO draws (draw_date, draw_time, game_type, status)
                     VALUES (CURRENT_DATE, '18:00:00', $1, 'OPEN')
                     RETURNING id`,
                    [cart[0].gameType]
                );
                drawId = newDraw.rows[0].id;
            } else {
                drawId = drawRes.rows[0].id;
            }

            const paymentRef = `PAY${Math.floor(100000 + Math.random() * 900000)}`;
            let totalAmount = 0;
            let ticketsSummary = '';

            for (const item of cart) {
                await db.query(
                    `INSERT INTO tickets (user_id, agent_id, draw_id, game_type, numbers, amount_htg, payment_ref, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')`,
                    [ctx.from.id, agentId, drawId, item.gameType, item.numbers, item.amount, paymentRef]
                );
                totalAmount += item.amount;
                ticketsSummary += `├ 🎟️ <b>${item.gameType.replace('_', ' ')}</b>: <code>${item.numbers}</code> (${item.amount} HTG)\n`;
            }

            const simUrl = `http://localhost:3000/demo/natcash`;
            const prefilledSimUrl = `${simUrl}?ref=${paymentRef}&amount=${totalAmount}`;

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

            ctx.session.cart = [];

        } catch (err) {
            console.error('Lỗi khi thanh toán giỏ hàng:', err);
            ctx.reply('❌ Error checkout cart.');
        }
    });

    // Lệnh riêng cho /tchala đề phòng người chơi gõ thẳng
    bot.command('tchala', (ctx) => {
        ctx.session = ctx.session || {};
        ctx.session.bet = { step: 'WAITING_FOR_DREAM' };
        ctx.replyWithHTML(
            `📖 <b>SỔ MƠ TCHALA (Dream Dictionary)</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `Kisa ou te reve? Voye mo a nan chat la (e.g. <i>chat, dife, dlo, lajan, maryaj</i>):`
        );
    });

    // 8. Bắt tin nhắn text của người dùng để xử lý Sổ mơ Tchala & Gõ số cược thủ công
    bot.on('text', async (ctx, next) => {
        ctx.session = ctx.session || {};
        
        if (!ctx.session.bet) {
            return next();
        }

        // Xử lý bước tra sổ mơ
        if (ctx.session.bet.step === 'WAITING_FOR_DREAM') {
            const keyword = ctx.message.text.trim();
            const result = await tchalaService.lookupDream(keyword);

            if (!result) {
                return ctx.replyWithHTML(
                    `❌ Pa jwenn nimewo chans pou mo sa a: <b>${keyword}</b>\n` +
                    `Tanpri voye yon lòt mo (e.g. chat, dife, dlo, lajan):`
                );
            }

            // Gợi ý cược các số từ giấc mơ tra được
            ctx.session.bet = {
                gameType: 'BOLET_2',
                step: 'WAITING_FOR_DREAM_NUMBER_SELECTION',
                suggestedNumbers: result.numbers
            };

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
        if (ctx.session.bet.step === 'WAITING_FOR_NUMBER') {
            const rawInput = ctx.message.text.trim();
            const gameType = ctx.session.bet.gameType;

            // Split raw input by spaces, commas, or semicolons
            const parsedNumbers = rawInput
                .split(/[\s,;]+/)
                .map(num => num.trim())
                .filter(num => num.length > 0);

            if (parsedNumbers.length === 0) {
                return ctx.reply('❌ Nimewo pa valid. Re-voye nimewo a:');
            }

            // Validate each number
            const invalidNumbers = [];
            for (const num of parsedNumbers) {
                if (gameType === 'BOLET_2' && !/^\d{2}$/.test(num)) {
                    invalidNumbers.push(num);
                } else if (gameType === 'LOTTO3' && !/^\d{3}$/.test(num)) {
                    invalidNumbers.push(num);
                } else if (gameType === 'MARYAJ' && !/^\d{2}x\d{2}$/i.test(num)) {
                    invalidNumbers.push(num);
                }
            }

            if (invalidNumbers.length > 0) {
                if (gameType === 'BOLET_2') {
                    return ctx.reply(`❌ Nimewo sa yo pa valid (Bolet 2 dwe gen ekzakteman 2 chif, e.g. 24): ${invalidNumbers.join(', ')}. Re-voye:`);
                }
                if (gameType === 'LOTTO3') {
                    return ctx.reply(`❌ Nimewo sa yo pa valid (Lotto 3 dwe gen ekzakteman 3 chif, e.g. 123): ${invalidNumbers.join(', ')}. Re-voye:`);
                }
                if (gameType === 'MARYAJ') {
                    return ctx.reply(`❌ Nimewo sa yo pa valid (Maryaj dwe gen fòma: [2 chif]x[2 chif], e.g. 12x34): ${invalidNumbers.join(', ')}. Re-voye:`);
                }
            }

            if (parsedNumbers.length === 1) {
                ctx.session.bet.numbers = parsedNumbers[0];
                ctx.session.bet.numbersBatch = null;
                ctx.session.bet.step = 'WAITING_FOR_AMOUNT';
                askForAmount(ctx, parsedNumbers[0], gameType);
            } else {
                ctx.session.bet.numbers = null;
                ctx.session.bet.numbersBatch = parsedNumbers;
                ctx.session.bet.step = 'WAITING_FOR_AMOUNT';
                askForAmount(ctx, parsedNumbers.join(', '), gameType);
            }
            return;
        }

        return next();
    });
};
