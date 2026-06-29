const userService = require('../services/userService');
const agentService = require('../services/agentService');
const messages = require('../utils/messages');

module.exports = (bot) => {
    bot.start(async (ctx) => {
        const user = userService.findOrCreate(ctx.from);
        
        // Kiểm tra start payload để gán Marchann Agent
        const startPayload = ctx.startPayload;
        let attributionText = '';
        
        if (startPayload && startPayload.startsWith('MA')) {
            try {
                const agentId = await agentService.attributeUserToAgent(ctx.from.id, startPayload, 'QR_SCAN');
                attributionText = `\n\n📌 <i>Ou asosye avèk siksè ak Ajan: <b>${startPayload}</b> / You have been successfully linked to Agent: <b>${startPayload}</b></i>`;
            } catch (err) {
                console.error('Lỗi gán attribution khi Start:', err.message);
            }
        }

        ctx.replyWithHTML(messages.welcome(user.full_name) + attributionText);
    });
};

