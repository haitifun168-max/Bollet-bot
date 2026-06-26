
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import json, os

# ── CHART 1 IMPROVED: Tier Rewards ──
tiers = ['Debutan', 'Machann', 'Gran Mèt', 'Chanpyon']
commissions = [400, 2700, 12500, 38500]
monthly_bonus = [0, 200, 1000, 5000]
total = [c+b for c,b in zip(commissions,monthly_bonus)]

fig1 = go.Figure()
fig1.add_bar(name='Komisyon 8-11%', x=tiers, y=commissions,
             text=[f'{c:,} HTG' for c in commissions],
             textposition='inside', textfont=dict(size=14, color='white'))
fig1.add_bar(name='Bonis Tháng', x=tiers, y=monthly_bonus,
             text=[f'+{b:,}' if b > 0 else '' for b in monthly_bonus],
             textposition='inside', textfont=dict(size=13, color='white'))
fig1.update_layout(
    barmode='stack',
    title={"text": "Thu nhập Agent theo Tier (HTG/tháng)<br><span style='font-size:16px;font-weight:normal;'>Natloto Agent Network | Commission + Bonis Tháng</span>"},
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5),
    font=dict(size=14),
    xaxis=dict(tickfont=dict(size=14)),
    yaxis=dict(tickfont=dict(size=13))
)
fig1.update_xaxes(title_text="Tier Agent")
fig1.update_yaxes(title_text="Tổng thưởng (HTG)")
fig1.update_traces(cliponaxis=False)
fig1.write_image("output/chart1_tier_rewards.png")
with open("output/chart1_tier_rewards.png.meta.json","w") as f:
    json.dump({"caption":"Thu nhập Agent Natloto theo Tier (HTG/tháng)",
               "description":"Stacked bar: Hoa hồng + Bonus tháng từ Debutan đến Chanpyon"}, f)

# ── CHART 2 IMPROVED: Revenue Split – Horizontal Bar ──
labels = ['NATCOM Net Revenue', 'Prize Pool (Người thắng)', 'Marchann Agent L2',
          'Super Agent L1', 'Referral Viral', 'Marketing & Ops']
values = [25, 60, 8, 3, 2, 2]
colors = ['#636EFA','#00CC96','#EF553B','#FECB52','#AB63FA','#19D3F3']

fig2 = go.Figure(go.Bar(
    x=values, y=labels, orientation='h',
    text=[f'{v}%' for v in values],
    textposition='inside',
    textfont=dict(size=15, color='white'),
    marker_color=colors
))
fig2.update_layout(
    title={"text": "Phân bổ 100 HTG Vé Bán Ra — 6 luồng tiền<br><span style='font-size:16px;font-weight:normal;'>Natloto | House Edge 40% → NATCOM Net 25% + Mạng lưới Agent 13%</span>"},
    font=dict(size=14),
    yaxis=dict(tickfont=dict(size=13), autorange='reversed'),
    xaxis=dict(tickfont=dict(size=13), title_text="Phần trăm (%)"),
    showlegend=False
)
fig2.update_traces(cliponaxis=False)
fig2.write_image("output/chart2_revenue_split.png")
with open("output/chart2_revenue_split.png.meta.json","w") as f:
    json.dump({"caption":"Phân bổ 100 HTG vé bán: 6 luồng doanh thu Natloto",
               "description":"Horizontal bar: Prize pool 60%, NATCOM Net 25%, Agent network 13%, Marketing 2%"}, f)

# ── CHART 3 IMPROVED: Instant Reward Probability ──
reward_types = ['Scratch: Không thắng', 'Scratch: +50 HTG', 'Scratch: +200 HTG',
                'Scratch: +500 HTG', 'Streak 7 ngày: +200 HTG', 'Streak 30 ngày: +2000 HTG']
probs = [70, 20, 8, 2, 15, 3]
ev = [0, 10, 16, 10, 30, 60]
bar_colors = ['#636EFA','#00CC96','#00CC96','#00CC96','#EF553B','#EF553B']

fig3 = go.Figure()
fig3.add_bar(name='Xác suất kích hoạt (%)', x=reward_types, y=probs,
             text=[f'{p}%' for p in probs], textposition='outside',
             textfont=dict(size=13), marker_color=bar_colors)
fig3.update_layout(
    title={"text": "Xác suất Kích hoạt Instant Reward Engine<br><span style='font-size:16px;font-weight:normal;'>Natloto Gamification | Scratch Card + Streak Bonus</span>"},
    font=dict(size=13),
    xaxis=dict(tickangle=-30, tickfont=dict(size=12), title_text="Loại thưởng"),
    yaxis=dict(tickfont=dict(size=13), title_text="Xác suất (%)"),
    showlegend=False
)
fig3.update_traces(cliponaxis=False)
fig3.write_image("output/chart3_instant_reward.png")
with open("output/chart3_instant_reward.png.meta.json","w") as f:
    json.dump({"caption":"Xác suất kích hoạt Instant Reward: Scratch Card + Streak",
               "description":"Bar chart: Scratch 3 mức (70/20/8/2%) và Streak 7/30 ngày"}, f)

# ── CHART 4 IMPROVED: Daily Volume by Tier ──
days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
debutan  = [3200, 2800, 4100, 3500, 5200, 6800, 4200]
machann  = [8500, 7200, 9800, 8100, 12400, 15200, 9600]
gran_met = [28000, 24000, 32000, 27000, 41000, 52000, 33000]

fig4 = go.Figure()
fig4.add_scatter(name='Debutan (avg ~4K/ngày)', x=days, y=debutan,
                 mode='lines+markers', line=dict(width=2),
                 marker=dict(size=8))
fig4.add_scatter(name='Machann (avg ~10K/ngày)', x=days, y=machann,
                 mode='lines+markers', line=dict(width=2),
                 marker=dict(size=8))
fig4.add_scatter(name='Gran Mèt (avg ~34K/ngày)', x=days, y=gran_met,
                 mode='lines+markers', line=dict(width=3),
                 marker=dict(size=10))
fig4.update_layout(
    title={"text": "Volume Bán Hàng Ngày theo Tier Agent<br><span style='font-size:16px;font-weight:normal;'>Mô phỏng 1 tuần 📙 | Peak T6-T7 +40% vs ngày thường</span>"},
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5),
    font=dict(size=14),
    xaxis=dict(tickfont=dict(size=14), title_text="Ngày trong tuần"),
    yaxis=dict(tickfont=dict(size=13), title_text="Volume (HTG)")
)
fig4.write_image("output/chart4_daily_volume.png")
with open("output/chart4_daily_volume.png.meta.json","w") as f:
    json.dump({"caption":"Volume bán hàng ngày theo Tier Agent – mô phỏng 1 tuần",
               "description":"Line chart 3 tiers, peak cuối tuần T6-CN tăng 40%"}, f)

# ── CHART 5 IMPROVED: Agent Funnel as Horizontal Bar ──
stages = ['30,000\nNatcash Agents', '12,000\nTiếp cận & Onboard', '8,000\nActive Agent',
          '2,000\nGran Mèt+', '300\nChanpyon']
counts = [30000, 12000, 8000, 2000, 300]
pcts   = [100, 40, 27, 7, 1]
stage_colors = ['#636EFA','#00CC96','#FECB52','#EF553B','#AB63FA']

fig5 = go.Figure(go.Bar(
    y=stages, x=counts, orientation='h',
    text=[f'{c:,} ({p}%)' for c,p in zip(counts,pcts)],
    textposition='inside',
    textfont=dict(size=13, color='white'),
    marker_color=stage_colors
))
fig5.update_layout(
    title={"text": "Agent Activation Funnel — Natloto Network<br><span style='font-size:16px;font-weight:normal;'>Từ 30K Natcash Agents → 300 Chanpyon (target 12 tháng) 📙</span>"},
    font=dict(size=13),
    yaxis=dict(tickfont=dict(size=13), autorange='reversed'),
    xaxis=dict(tickfont=dict(size=13), title_text="Số lượng Agents"),
    showlegend=False
)
fig5.update_traces(cliponaxis=False)
fig5.write_image("output/chart5_agent_funnel.png")
with open("output/chart5_agent_funnel.png.meta.json","w") as f:
    json.dump({"caption":"Agent Funnel: 30K Natcash Agents → 300 Chanpyon (12 tháng)",
               "description":"Horizontal bar funnel: 5 giai đoạn activation với số tuyệt đối và % so với tổng"}, f)

# ── BONUS: Commission Calculation Table as CSV ──
rows = []
for vol in [5000, 10000, 25000, 50000, 100000, 200000, 350000]:
    if vol < 10000:
        tier, rate, bonus = 'Debutan', 0.08, 0
    elif vol < 50000:
        tier, rate, bonus = 'Machann', 0.09, 200
    elif vol < 200000:
        tier, rate, bonus = 'Gran Mèt', 0.10, 1000
    else:
        tier, rate, bonus = 'Chanpyon', 0.11, 5000
    comm = vol * rate
    total = comm + bonus
    usd = total / 140  # ~140 HTG/USD approx
    rows.append({'Volume_HTG': vol, 'Tier': tier, 'Rate': f'{rate*100:.0f}%',
                 'Commission_HTG': int(comm), 'Bonus_HTG': bonus,
                 'Total_HTG': int(total), 'Total_USD_approx': round(usd,1)})

df = pd.DataFrame(rows)
df.to_csv("output/commission_table.csv", index=False)
print(df.to_string(index=False))
print("\n✅ All charts + CSV saved to output/")
