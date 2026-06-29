'use strict';
const db = require('../database/index');

const betService = {
    /**
     * Parse and validate ticket numbers based on game type
     * @param {string} rawInput 
     * @param {string} gameType - 'BOLET_2' | 'LOTTO3' | 'MARYAJ'
     * @returns {object} { isValid, numbers, invalidNumbers }
     */
    validateNumbers(rawInput, gameType) {
        const parsedNumbers = rawInput
            .split(/[\s,;]+/)
            .map(num => num.trim().toLowerCase())
            .filter(num => num.length > 0);

        if (parsedNumbers.length === 0) {
            return { isValid: false, numbers: [], invalidNumbers: [] };
        }

        const invalidNumbers = [];
        const validNumbers = [];

        for (const num of parsedNumbers) {
            let isValidNum = false;
            if (gameType === 'BOLET_2') {
                isValidNum = /^\d{2}$/.test(num);
            } else if (gameType === 'LOTTO3') {
                isValidNum = /^\d{3}$/.test(num);
            } else if (gameType === 'MARYAJ') {
                isValidNum = /^\d{2}x\d{2}$/.test(num);
            }

            if (isValidNum) {
                validNumbers.push(num);
            } else {
                invalidNumbers.push(num);
            }
        }

        return {
            isValid: invalidNumbers.length === 0,
            numbers: validNumbers,
            invalidNumbers: invalidNumbers
        };
    },

    /**
     * Add numbers to cart array
     * @param {Array} cart - Existing cart
     * @param {string|Array} numbers - Number or array of numbers
     * @param {string} gameType - Game type
     * @param {number} amount - Bet amount per number
     * @returns {Array} Updated cart
     */
    addToCart(cart, numbers, gameType, amount) {
        const updatedCart = [...(cart || [])];
        const numList = Array.isArray(numbers) ? numbers : [numbers];

        for (const num of numList) {
            updatedCart.push({
                gameType,
                numbers: num,
                amount: parseInt(amount)
            });
        }
        return updatedCart;
    },

    /**
     * Checkout cart, create tickets in DB
     * @param {string|number} userId
     * @param {string} platform
     * @param {Array} cart
     * @returns {object} { paymentRef, totalAmount, ticketsSummary, prefilledSimUrl }
     */
    async checkout(userId, platform, cart) {
        if (!cart || cart.length === 0) {
            throw new Error('Panyen ou vid (Cart is empty).');
        }

        // 1. Get agent attribution
        let agentId = null;
        const attrRes = await db.query(
            `SELECT agent_id FROM user_agent_attribution WHERE user_id = $1 LIMIT 1`,
            [userId]
        );
        
        if (attrRes.rows.length > 0) {
            agentId = attrRes.rows[0].agent_id;
        } else {
            const defaultAgentRes = await db.query('SELECT id FROM agents LIMIT 1');
            if (defaultAgentRes.rows.length > 0) {
                agentId = defaultAgentRes.rows[0].id;
            }
        }

        // 2. Get or create current draw
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

        // 3. Insert tickets
        const paymentRef = `PAY${Math.floor(100000 + Math.random() * 900000)}`;
        let totalAmount = 0;
        let ticketsSummary = '';

        for (const item of cart) {
            await db.query(
                `INSERT INTO tickets (user_id, agent_id, draw_id, game_type, numbers, amount_htg, payment_ref, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')`,
                [userId, agentId, drawId, item.gameType, item.numbers, item.amount, paymentRef]
            );
            totalAmount += item.amount;
            ticketsSummary += `├ 🎟️ <b>${item.gameType.replace('_', ' ')}</b>: <code>${item.numbers}</code> (${item.amount} HTG)\n`;
        }

        const simUrl = `http://localhost:3000/demo/natcash`;
        const prefilledSimUrl = `${simUrl}?ref=${paymentRef}&amount=${totalAmount}`;

        return {
            paymentRef,
            totalAmount,
            ticketsSummary,
            prefilledSimUrl
        };
    }
};

module.exports = betService;
