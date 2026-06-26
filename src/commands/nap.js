'use strict';

module.exports = (bot) => {
    // Kreyòl / Français / English explanation
    bot.command('nap', (ctx) => {
        const message = 
`💰 <b>DEPO PA NATCASH (Natcash Deposit Info)</b>
━━━━━━━━━━━━━━━━━━
Sistèm Borlette sa a pa mande pou w depoze lajan davans nan yon bous!
<i>Ce système Borlette ne nécessite pas de dépôt préalable sur un solde !</i>
<i>This Borlette system does not require pre-depositing to a balance!</i>

👉 Ou ka peye dirèkteman lè w ap achte tikè avèk kòmand <b>/play</b>.
👉 <i>Vous payez directement lors de l'achat de tickets avec la commande <b>/play</b>.</i>
👉 <i>You pay directly when purchasing tickets via the <b>/play</b> command.</i>

🔗 Voye mesaj tankou: <code>BOLET 24 100</code> pou w kòmanse!`;

        ctx.replyWithHTML(message);
    });
};
