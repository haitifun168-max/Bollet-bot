'use strict';
const sessionService = require('../services/sessionService');
const betService = require('../services/betService');
const tchalaService = require('../services/tchalaService');
const db = require('../database/index');

// Helper to send payloads to Meta Cloud API using native fetch
async function sendMetaMessage(payload) {
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneId || !token) {
        console.warn('⚠️ WhatsApp credentials (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN) are missing in .env');
        return;
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('❌ Meta API error details:', JSON.stringify(data));
        } else {
            console.log('✅ Message sent to WhatsApp:', data.messages?.[0]?.id);
        }
    } catch (err) {
        console.error('❌ Fetch error sending message to Meta API:', err.message);
    }
}

async function sendText(to, text) {
    return sendMetaMessage({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { body: text }
    });
}

async function sendButtons(to, bodyText, buttons) {
    const formattedButtons = buttons.map(btn => ({
        type: 'reply',
        reply: { id: btn.id, title: btn.title.substring(0, 20) } // Meta reply title max 20 chars
    }));

    return sendMetaMessage({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: { text: bodyText },
            action: { buttons: formattedButtons }
        }
    });
}

async function sendList(to, bodyText, buttonText, sections) {
    return sendMetaMessage({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
            type: 'list',
            body: { text: bodyText },
            action: {
                button: buttonText.substring(0, 20),
                sections: sections
            }
        }
    });
}

// Render main interactive menu list
async function sendMainMenu(to, session) {
    let cartSummaryText = '';
    if (session.cart && session.cart.length > 0) {
        cartSummaryText = `🛒 Panyen ou (Your Cart - ${session.cart.length} tickets):\n`;
        session.cart.forEach((item, index) => {
            cartSummaryText += `├ ${index + 1}. ${item.gameType.replace('_', ' ')}: ${item.numbers} (${item.amount} HTG)\n`;
        });
        cartSummaryText += `━━━━━━━━━━━━━━━━━━\n\n`;
    }

    const bodyText = `${cartSummaryText}🎟️ BIENVENUE TRÈS AN NATLOTO!\n\nChwazi yon opsyon nan lis anba a pou jwe oswa jwenn nimewo chans:`;
    
    const rows = [
        { id: 'menu_play', title: '🎟️ Achte Tikè', description: 'Play Bolet 2, Lotto 3, Maryaj' },
        { id: 'menu_tchala', title: '📖 Tchala (Dream Book)', description: 'Look up lucky numbers by dream' },
        { id: 'menu_zodiac', title: '⭐ Zodiak', description: 'Lucky numbers from zodiac' }
    ];

    if (session.cart && session.cart.length > 0) {
        rows.push({ id: 'menu_checkout', title: '💳 Peye Kounye a', description: 'Checkout and pay cart' });
    }

    const sections = [
        {
            title: 'Opsyon Menu',
            rows: rows
        }
    ];

    await sendList(to, bodyText, 'Chwazi Menu', sections);
}

// Main message router/handler for WhatsApp messages
async function handleIncomingMessage(message) {
    const from = message.from; // User JID phone number (e.g. 509xxxxxxxx)
    const userId = parseInt(from); // Convert to BIGINT compatible format
    
    if (isNaN(userId)) {
        console.error('❌ Cannot parse WhatsApp number into BIGINT:', from);
        return;
    }

    // Resolve text input or button payload
    let textInput = '';
    let interactiveId = '';

    if (message.type === 'text') {
        textInput = message.text.body.trim();
    } else if (message.type === 'interactive') {
        const interactive = message.interactive;
        if (interactive.type === 'button_reply') {
            interactiveId = interactive.button_reply.id;
            textInput = interactive.button_reply.title;
        } else if (interactive.type === 'list_reply') {
            interactiveId = interactive.list_reply.id;
            textInput = interactive.list_reply.title;
        }
    }

    // Load user session
    const session = await sessionService.getSession(userId, 'WHATSAPP');
    const lowerInput = textInput.toLowerCase();

    // 1. Global / Reset Commands
    if (lowerInput === 'menu' || lowerInput === 'start' || lowerInput === '/start' || lowerInput === 'bonjou' || interactiveId === 'menu_main') {
        await sessionService.updateSession(userId, { step: 'IDLE', game_type: null, numbers: null }, 'WHATSAPP');
        const freshSession = await sessionService.getSession(userId, 'WHATSAPP');
        await sendMainMenu(from, freshSession);
        return;
    }

    if (lowerInput === 'play' || lowerInput === '/play' || interactiveId === 'menu_play' || interactiveId === 'cart_add') {
        await sessionService.updateSession(userId, { step: 'IDLE', game_type: null, numbers: null }, 'WHATSAPP');
        await sendButtons(from, 'Chwazi kalite jwèt ou vle jwe a:\n(Choose game type:)', [
            { id: 'play_BOLET_2', title: 'Bolet 2 (50x)' },
            { id: 'play_LOTTO3', title: 'Lotto 3 (500x)' },
            { id: 'play_MARYAJ', title: 'Maryaj (1000x)' }
        ]);
        return;
    }

    if (lowerInput === 'tchala' || lowerInput === '/tchala' || interactiveId === 'menu_tchala') {
        await sessionService.updateSession(userId, { step: 'WAITING_FOR_DREAM' }, 'WHATSAPP');
        await sendText(from, '📖 *TCHALA (Dream Book)*\n━━━━━━━━━━━━━━━━━━\nKisa ou te reve jodi a? Voye mo a nan chat la (e.g. chat, dife, dlo, lajan, maryaj):');
        return;
    }

    if (interactiveId === 'menu_zodiac') {
        await sendList(from, '⭐ *ZODIAK (Zodiac Lucky Pick)*\n━━━━━━━━━━━━━━━━━━\nChwazi siy zodiak ou a pou jwenn nimewo chans:', 'Chwazi Zodiak', [
            {
                title: 'Zodiac Signs',
                rows: [
                    { id: 'zod_belye', title: '🐏 Belye (Aries)' },
                    { id: 'zod_toro', title: '🐂 Toro (Taurus)' },
                    { id: 'zod_jemo', title: '👬 Jemo (Gemini)' },
                    { id: 'zod_kansè', title: '🦀 Kansè (Cancer)' },
                    { id: 'zod_lyon', title: '🦁 Lyon (Leo)' },
                    { id: 'zod_vyèj', title: '♍ Vyèj (Virgo)' },
                    { id: 'zod_balans', title: '⚖️ Balans (Libra)' },
                    { id: 'zod_skopyon', title: '🦂 Skopyon (Scorpio)' }
                ]
            }
        ]);
        return;
    }

    // 2. Interactive Selection Handlers
    // 2.1 Game Selection Clicked
    if (interactiveId.startsWith('play_')) {
        const gameType = interactiveId.substring(5); // BOLET_2, LOTTO3, MARYAJ
        await sessionService.updateSession(userId, {
            game_type: gameType,
            step: 'WAITING_FOR_NUMBER',
            numbers: null
        }, 'WHATSAPP');

        const sample = gameType === 'BOLET_2' ? '24' : (gameType === 'LOTTO3' ? '123' : '12x34');
        await sendText(from, `🔢 *Jwèt: ${gameType.replace('_', ' ')}*\n━━━━━━━━━━━━━━━━━━\nVoye nimewo ou chwazi a nan chat la (e.g. *${sample}*):`);
        return;
    }

    // 2.2 Zodiac Sign Selected
    if (interactiveId.startsWith('zod_')) {
        const signKey = interactiveId.substring(4);
        const zodiac = tchalaService.getZodiacNumbers(signKey);
        if (!zodiac) {
            await sendText(from, '❌ Zodiak sa a pa valab.');
            return;
        }

        await sessionService.updateSession(userId, {
            game_type: 'BOLET_2',
            step: 'WAITING_FOR_DREAM_NUMBER_SELECTION',
            suggested_numbers: zodiac.numbers
        }, 'WHATSAPP');

        const buttons = zodiac.numbers.map(num => ({
            id: `suggested_num_${num}`,
            title: `🎟️ ${num}`
        }));
        buttons.push({ id: 'suggested_all', title: '🔥 Achte tout' });

        await sendButtons(
            from, 
            `⭐ *Zodiak: ${zodiac.name}*\n━━━━━━━━━━━━━━━━━━\nNimewo chans ou yo se: *${zodiac.numbers.join(', ')}*\n\nChwazi opsyon anba a pou mete Bolet 2:`,
            buttons
        );
        return;
    }

    // 2.3 Suggested Numbers Selected (from Dream/Zodiac)
    if (interactiveId.startsWith('suggested_num_')) {
        const num = interactiveId.substring(14);
        await sessionService.updateSession(userId, {
            numbers: num,
            step: 'WAITING_FOR_AMOUNT'
        }, 'WHATSAPP');

        await sendButtons(from, `💵 *Chwazi kantite lajan pou nimewo ${num}* (${session.game_type}):`, [
            { id: 'amount_50', title: '💵 50 HTG' },
            { id: 'amount_100', title: '💵 100 HTG' },
            { id: 'amount_200', title: '💵 200 HTG' }
        ]);
        return;
    }

    if (interactiveId === 'suggested_all') {
        if (!session.suggested_numbers) {
            await sendText(from, '❌ Sesyon an ekspire. Tanpri kòmanse ankò.');
            return;
        }
        const list = typeof session.suggested_numbers === 'string' ? session.suggested_numbers.split(',') : session.suggested_numbers;
        await sessionService.updateSession(userId, {
            numbers: list.join(','),
            step: 'WAITING_FOR_AMOUNT'
        }, 'WHATSAPP');

        await sendButtons(from, `💵 *Chwazi lajan pou tout nimewo: ${list.join(', ')}* (Bolet 2):`, [
            { id: 'amount_50', title: '💵 50 HTG' },
            { id: 'amount_100', title: '💵 100 HTG' },
            { id: 'amount_200', title: '💵 200 HTG' }
        ]);
        return;
    }

    // 2.4 Bet Amount Selected
    if (interactiveId.startsWith('amount_')) {
        if (session.step !== 'WAITING_FOR_AMOUNT') {
            await sendText(from, '❌ Sesyon an ekspire. Voye *play* pou rekòmanse.');
            return;
        }
        const amount = parseInt(interactiveId.substring(7));
        
        let numbersList = [];
        if (session.numbers && session.numbers.includes(',')) {
            numbersList = session.numbers.split(',');
        } else if (session.numbers) {
            numbersList = [session.numbers];
        }

        const updatedCart = betService.addToCart(session.cart, numbersList, session.game_type, amount);
        const addedNumbersText = numbersList.join(', ');
        const totalCost = amount * numbersList.length;

        await sessionService.updateSession(userId, {
            cart: updatedCart,
            step: 'IDLE',
            game_type: null,
            numbers: null
        }, 'WHATSAPP');

        const messageText = `✅ *Tikè te ajoute nan panyen an!*\n🔢 Nimewo: *${addedNumbersText}*\n💵 Lajan: *${amount} HTG / tikè* (Total: *${totalCost.toLocaleString()} HTG*)\n━━━━━━━━━━━━━━━━━━\nKisa ou vle fè kounye a?`;
        
        await sendButtons(from, messageText, [
            { id: 'cart_add', title: '➕ Achte ankò' },
            { id: 'menu_checkout', title: '💳 Peye Kounye a' }
        ]);
        return;
    }

    // 2.5 Checkout
    if (interactiveId === 'menu_checkout' || interactiveId === 'cart_checkout') {
        const cart = session.cart || [];
        if (cart.length === 0) {
            await sendText(from, '❌ Panyen ou vid. Tanpri voye *play* pou achte tikè.');
            return;
        }

        try {
            const { paymentRef, totalAmount, ticketsSummary, prefilledSimUrl } = 
                await betService.checkout(userId, 'WHATSAPP', cart);

            const checkOutMsg = 
`📝 *BÒDWO TIKE PARYAJ (Bet Checkout)*
━━━━━━━━━━━━━━━━━━
${ticketsSummary.replace(/<[^>]*>/g, '')}
💵 *TOTAL LAJAN: ${totalAmount.toLocaleString()} HTG*
🔑 Ref: *${paymentRef}*

📱 *PAYMENT METHOD - NATCASH:*
Klike sou lyen anba a pou thanh toán giả lập Natcash:
👉 ${prefilledSimUrl}`;

            await sendText(from, checkOutMsg);
            await sessionService.clearSession(userId);
        } catch (err) {
            console.error('Error in WhatsApp checkout:', err);
            await sendText(from, '❌ Erè lè w ap trete panyen an.');
        }
        return;
    }

    // 3. User Text Inputs Handling based on Session Step
    // 3.1 WAITING_FOR_NUMBER
    if (session.step === 'WAITING_FOR_NUMBER') {
        const gameType = session.game_type;
        const validation = betService.validateNumbers(textInput, gameType);

        if (!validation.isValid || validation.numbers.length === 0) {
            let errorText = '❌ Nimewo pa valid. Re-voye nimewo a:';
            if (gameType === 'BOLET_2') {
                errorText = `❌ Nimewo sa yo pa valid (Bolet 2 dwe gen ekzakteman 2 chif, e.g. 24): ${validation.invalidNumbers.join(', ')}. Re-voye:`;
            } else if (gameType === 'LOTTO3') {
                errorText = `❌ Nimewo sa yo pa valid (Lotto 3 dwe gen ekzakteman 3 chif, e.g. 123): ${validation.invalidNumbers.join(', ')}. Re-voye:`;
            } else if (gameType === 'MARYAJ') {
                errorText = `❌ Nimewo sa yo pa valid (Maryaj dwe gen fòma 12x34): ${validation.invalidNumbers.join(', ')}. Re-voye:`;
            }
            await sendText(from, errorText);
            return;
        }

        const parsedNumbers = validation.numbers;
        if (parsedNumbers.length === 1) {
            await sessionService.updateSession(userId, {
                numbers: parsedNumbers[0],
                step: 'WAITING_FOR_AMOUNT'
            }, 'WHATSAPP');
            
            await sendButtons(from, `💵 *Chwazi lajan pou nimewo ${parsedNumbers[0]}* (${gameType}):`, [
                { id: 'amount_50', title: '💵 50 HTG' },
                { id: 'amount_100', title: '💵 100 HTG' },
                { id: 'amount_200', title: '💵 200 HTG' }
            ]);
        } else {
            await sessionService.updateSession(userId, {
                numbers: parsedNumbers.join(','),
                step: 'WAITING_FOR_AMOUNT'
            }, 'WHATSAPP');

            await sendButtons(from, `💵 *Chwazi lajan pou nimewo yo: ${parsedNumbers.join(', ')}* (${gameType}):`, [
                { id: 'amount_50', title: '💵 50 HTG' },
                { id: 'amount_100', title: '💵 100 HTG' },
                { id: 'amount_200', title: '💵 200 HTG' }
            ]);
        }
        return;
    }

    // 3.2 WAITING_FOR_DREAM
    if (session.step === 'WAITING_FOR_DREAM') {
        const result = await tchalaService.lookupDream(textInput);
        if (!result) {
            await sendText(from, `❌ Pa jwenn nimewo chans pou mo: *${textInput}*\nTanpri voye yon lòt mo (e.g. chat, dife, dlo):`);
            return;
        }

        await sessionService.updateSession(userId, {
            game_type: 'BOLET_2',
            step: 'WAITING_FOR_DREAM_NUMBER_SELECTION',
            suggested_numbers: result.numbers
        }, 'WHATSAPP');

        const buttons = result.numbers.map(num => ({
            id: `suggested_num_${num}`,
            title: `🎟️ ${num}`
        }));
        buttons.push({ id: 'suggested_all', title: '🔥 Achte tout' });

        await sendButtons(
            from,
            `📖 *Tchala: ${result.keyword.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━\nNimewo chans yo se: *${result.numbers.join(', ')}*\n\nChwazi opsyon anba a pou achte Bolet 2:`,
            buttons
        );
        return;
    }

    // Default Fallback
    await sendText(from, '🤖 Bonjou! Voye *play* pou kòmanse achte tikè oswa *menu* pou louvri menu an.');
}

module.exports = {
    handleIncomingMessage,
    sendText,
    sendButtons,
    sendList
};
