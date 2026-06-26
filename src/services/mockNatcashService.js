'use strict';
const express = require('express');
const router = express.Router();
const db = require('../database/index');
const commissionService = require('./commissionService');
const drawService = require('./drawService');
const scratchService = require('./scratchService');

// --- NATCASH PAYOUT GATEWAY MOCK API ---
router.post('/api/natcash/payout', async (req, res) => {
    const { amount, phone, merchantId } = req.body;
    console.log(`[Natcash Gateway] Processing payout: ${amount} HTG to phone ${phone}`);
    
    // Simulate successful transfer delay
    const txnId = `NC${Math.floor(10000000 + Math.random() * 90000000)}`;
    return res.json({
        status: 'SUCCESS',
        transactionId: txnId,
        amount,
        phone,
        message: 'Transfer completed successfully via Natcash Mock Payout Gateway.'
    });
});

// --- NATCASH WEBHOOK RECEIVER ---
router.post('/webhook/natcash', async (req, res) => {
    const { phone, amount, reference, status } = req.body;
    console.log(`[Natcash Webhook] Received deposit: ${amount} HTG from ${phone} | Ref: ${reference}`);

    try {
        // 1. Tìm các ticket đang chờ thanh toán có payment_ref khớp với reference
        const ticketRes = await db.query(
            `SELECT * FROM tickets WHERE payment_ref = $1 AND status = 'PENDING'`,
            [reference]
        );

        if (ticketRes.rows.length === 0) {
            return res.status(404).json({ error: 'Payment reference not found or already paid' });
        }

        const tickets = ticketRes.rows;
        const firstTicket = tickets[0];
        
        let totalPaidAmount = 0;
        let ticketsDetails = '';
        let lastScratch = { bonusAmount: 0 };

        for (const ticket of tickets) {
            // 2. Cập nhật ticket thành PAID
            await db.query(
                `UPDATE tickets SET status = 'PAID', paid_at = NOW() WHERE id = $1`,
                [ticket.id]
            );

            // 3. Tính toán và lưu hoa hồng MLM 3 tầng
            await commissionService.calculateAndRecordCommissions(
                ticket.id, 
                parseFloat(ticket.amount_htg), 
                ticket.user_id, 
                ticket.agent_id
            );

            // 4. Kích hoạt Scratch Card thưởng phụ cho mỗi vé
            lastScratch = await scratchService.triggerScratch(ticket.user_id, ticket.id);
            
            totalPaidAmount += parseFloat(ticket.amount_htg);
            ticketsDetails += `├ 🎟️ <b>${ticket.game_type.replace('_', ' ')}</b>: <code>${ticket.numbers}</code> (${parseInt(ticket.amount_htg).toLocaleString()} HTG)\n`;
        }

        // 5. Cập nhật Streak (chỉ cần chạy 1 lần cho cụm cược)
        const streak = await scratchService.updateStreak(firstTicket.user_id);

        // 6. Gửi thông báo qua Telegram cho Khách hàng & Đại lý
        const bot = req.app.get('bot');
        if (bot) {
            try {
                // Tin nhắn cho Khách hàng
                let scratchText = '';
                if (lastScratch.bonusAmount > 0) {
                    scratchText = `\n🎉 <b>Kado Kat Grate (Scratch Card Win): +${lastScratch.bonusAmount} HTG!</b>`;
                } else {
                    scratchText = `\n🃏 Kat grate: Pa gen genyen fwa sa a. (Scratch card: No bonus win).`;
                }

                let streakText = '';
                if (streak.currentStreak > 1) {
                    streakText = `\n🔥 <b>Streak: ${streak.currentStreak} jou kontinyèl!</b>`;
                    if (streak.streakAward > 0) {
                        streakText += ` (Streak Award: +${streak.streakAward} HTG)`;
                    }
                }

                const customerMsg = 
`✅ <b>TIKÈ PEYE (Bet Confirmed!)</b>
━━━━━━━━━━━━━━━━━━
${ticketsDetails}
💵 <b>TOTAL KÒN: ${totalPaidAmount.toLocaleString()} HTG</b>
🔑 Ref: <code>${firstTicket.payment_ref}</code>
🟢 Status: <b>PAID (Aktif)</b>
${scratchText}${streakText}

Mèsi paske ou chwazi Ajan Borlette Digital!`;

                await bot.telegram.sendMessage(firstTicket.user_id, customerMsg, { parse_mode: 'HTML' });

                // Tin nhắn cho Đại lý Marchann
                if (firstTicket.agent_id) {
                    const agentRes = await db.query('SELECT telegram_id FROM agents WHERE id = $1', [firstTicket.agent_id]);
                    if (agentRes.rows.length > 0) {
                        const agentTelegramId = agentRes.rows[0].telegram_id;
                        const agentMsg = 
`💰 <b>KOMISYON NOUVO (New Commission!)</b>
━━━━━━━━━━━━━━━━━━
Ou resevwa komisyon sou tikè <code>${firstTicket.payment_ref}</code>
Volim Total: <b>${totalPaidAmount.toLocaleString()} HTG</b>
Kliyan: <code>${firstTicket.user_id}</code>

Mèsi pou travay ou!`;
                        await bot.telegram.sendMessage(agentTelegramId, agentMsg, { parse_mode: 'HTML' });
                    }
                }
            } catch (notifyErr) {
                console.error('Lỗi gửi thông báo Telegram từ Webhook:', notifyErr.message);
            }
        }

        // Trả về kết quả thành công cho Webhook Sender
        return res.json({
            success: true,
            ticketId: firstTicket.id,
            scratch: lastScratch,
            streak
        });

    } catch (err) {
        console.error('Lỗi xử lý webhook Natcash:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// --- NATCASH SIMULATOR INTERFACE (HTML) ---
router.get('/demo/natcash', async (req, res) => {
    const prefilledRef = req.query.ref || '';
    const prefilledAmount = req.query.amount || '';

    try {
        const pendingTickets = await db.query(
            `SELECT t.id, t.user_id, t.amount_htg, t.payment_ref, t.game_type, t.numbers, a.full_name as agent_name
             FROM tickets t
             LEFT JOIN agents a ON t.agent_id = a.id
             WHERE t.status = 'PENDING'
             ORDER BY t.created_at DESC LIMIT 10`
        );

        const ticketRows = pendingTickets.rows.map(t => `
            <tr onclick="selectTicket('${t.payment_ref}', ${t.amount_htg})">
                <td><code>${t.payment_ref}</code></td>
                <td>${t.game_type} (${t.numbers})</td>
                <td><b>${t.amount_htg} HTG</b></td>
                <td>${t.user_id}</td>
                <td>${t.agent_name || 'Direct'}</td>
            </tr>
        `).join('');

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Natcash Mobile Money Simulator</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg-primary: #0a0e17;
                    --card-bg: rgba(18, 26, 47, 0.7);
                    --accent-color: #f7a81b; /* Orange Natcom */
                    --accent-success: #2ecc71;
                    --text-main: #ffffff;
                    --text-muted: #8b9bb4;
                }
                body {
                    font-family: 'Outfit', sans-serif;
                    background: radial-gradient(circle at top, #162447 0%, var(--bg-primary) 100%);
                    color: var(--text-main);
                    min-height: 100vh;
                    margin: 0;
                    padding: 40px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .container {
                    width: 100%;
                    max-width: 900px;
                    backdrop-filter: blur(10px);
                }
                header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin: 0;
                    background: linear-gradient(135deg, #fff 0%, var(--accent-color) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }
                @media (max-width: 768px) {
                    .grid { grid-template-columns: 1fr; }
                }
                .card {
                    background: var(--card-bg);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 30px;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
                h2 {
                    font-size: 1.4rem;
                    margin-top: 0;
                    color: var(--accent-color);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 10px;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                input {
                    width: 100%;
                    padding: 12px;
                    background: rgba(10, 14, 23, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 1rem;
                    box-sizing: border-box;
                    transition: border 0.3s;
                }
                input:focus {
                    outline: none;
                    border-color: var(--accent-color);
                }
                button {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, var(--accent-color) 0%, #d8870c 100%);
                    border: none;
                    border-radius: 8px;
                    color: black;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(247, 168, 27, 0.4);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                th { color: var(--text-muted); font-weight: 600; }
                tr { cursor: pointer; transition: background 0.2s; }
                tr:hover { background: rgba(255, 255, 255, 0.03); }
                .success-toast {
                    display: none;
                    margin-top: 20px;
                    padding: 15px;
                    background: rgba(46, 204, 113, 0.1);
                    border: 1px solid var(--accent-success);
                    border-radius: 8px;
                    color: var(--accent-success);
                    font-weight: 600;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>Natcash Pay Simulator</h1>
                    <p style="color: var(--text-muted);">Demo Webhook Integration for Natcom Partners</p>
                </header>

                <div class="grid">
                    <!-- Form Giả lập -->
                    <div class="card">
                        <h2>💸 Simulate Payment</h2>
                        <div class="form-group">
                            <label>Customer Natcash Phone</label>
                            <input type="text" id="phone" value="50938888888">
                        </div>
                        <div class="form-group">
                            <label>Payment Reference / Code</label>
                            <input type="text" id="reference" placeholder="Enter Ref Code" value="${prefilledRef}">
                        </div>
                        <div class="form-group">
                            <label>Amount (HTG)</label>
                            <input type="number" id="amount" placeholder="0" value="${prefilledAmount}">
                        </div>
                        <button onclick="sendPayment()">Trigger Deposit Webhook</button>
                        
                        <div class="success-toast" id="toast">
                            🎉 Webhook triggered successfully! Ticket paid, MLM commissions calculated, and scratch card generated!
                        </div>
                    </div>

                    <!-- Danh sách Ticket Chờ -->
                    <div class="card">
                        <h2>⏳ Pending Bet Tickets</h2>
                        <p style="font-size: 0.9rem; color: var(--text-muted);">Click a pending ticket to auto-fill the payment form</p>
                        <div style="max-height: 350px; overflow-y: auto;">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ref Code</th>
                                        <th>Game</th>
                                        <th>Amount</th>
                                        <th>User</th>
                                        <th>Agent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ticketRows || '<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No pending tickets.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                function selectTicket(ref, amount) {
                    document.getElementById('reference').value = ref;
                    document.getElementById('amount').value = amount;
                }

                async function sendPayment() {
                    const phone = document.getElementById('phone').value;
                    const amount = document.getElementById('amount').value;
                    const reference = document.getElementById('reference').value;

                    if (!amount || !reference) {
                        alert('Please select a ticket or enter details manually.');
                        return;
                    }

                    try {
                        const res = await fetch('/webhook/natcash', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone, amount, reference, status: 'SUCCESS' })
                        });

                        const data = await res.json();
                        if (res.ok) {
                            const toast = document.getElementById('toast');
                            toast.style.display = 'block';
                            setTimeout(() => { toast.style.display = 'none'; location.reload(); }, 4000);
                        } else {
                            alert('Error: ' + data.error);
                        }
                    } catch (err) {
                        alert('Failed to trigger webhook: ' + err.message);
                    }
                }
            </script>
        </body>
        </html>
        `;
        return res.send(html);

    } catch (err) {
        return res.status(500).send(err.message);
    }
});

module.exports = router;
