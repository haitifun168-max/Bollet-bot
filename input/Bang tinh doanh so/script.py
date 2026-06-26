
import plotly.io as pio
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np
import json, os
os.makedirs("output", exist_ok=True)

# ── CHART 1: Revenue & Commission Breakdown by Agent Tier ──
tiers = ['Debutan\n<10K HTG', 'Machann\n10K-50K', 'Gran Mèt\n50K-200K', 'Chanpyon\n200K+']
volume_mid = [5000, 30000, 125000, 350000]
commission_rates = [0.08, 0.09, 0.10, 0.11]
commissions = [v * r for v, r in zip(volume_mid, commission_rates)]
monthly_bonus = [0, 200, 1000, 5000]
total_rewards = [c + b for c, b in zip(commissions, monthly_bonus)]

fig1 = go.Figure()
fig1.add_bar(name='Komisyon (HTG)', x=tiers, y=commissions,
             text=[f'{c:,.0f}' for c in commissions], textposition='inside')
fig1.add_bar(name='Bonis Mwa (HTG)', x=tiers, y=monthly_bonus,
             text=[f'{b:,}' if b > 0 else '' for b in monthly_bonus], textposition='inside')
fig1.update_layout(
    barmode='stack',
    title={"text": "Récompense Totale par Tier Agent Natloto<br><span style='font-size:17px;font-weight:normal;'>Source: Modèle Natloto | Commission + Bonis Mensuel (HTG)</span>"},
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)
fig1.update_xaxes(title_text="Tier Agent")
fig1.update_yaxes(title_text="Récompense (HTG)")
fig1.update_traces(cliponaxis=False)
fig1.write_image("output/chart1_tier_rewards.png")
with open("output/chart1_tier_rewards.png.meta.json", "w") as f:
    json.dump({"caption": "Tổng thưởng theo Tier Agent Natloto (HTG/tháng)",
               "description": "Biểu đồ cột xếp chồng: Hoa hồng + Bonus tháng theo từng tier Debutan → Chanpyon"}, f)

# ── CHART 2: House Edge Distribution – Prize Pool vs Agent Network vs NATCOM ──
labels = ['Prize Pool\n(Người thắng)', 'Marchann L2\n(8%)', 'Super Agent L1\n(3%)',
          'Referral User\n(2%)', 'Mktg & Ops\n(2%)', 'NATCOM Net\n(25%)']
values = [60, 8, 3, 2, 2, 25]
fig2 = go.Figure(go.Pie(labels=labels, values=values, hole=0.35,
                         textinfo='label+percent', textposition='inside'))
fig2.update_layout(
    uniformtext_minsize=12, uniformtext_mode='hide',
    title={"text": "Phân bổ 100 HTG Vé Bán Ra<br><span style='font-size:17px;font-weight:normal;'>Source: Mô hình Natloto | House Edge 40% → 6 luồng phân bổ</span>"},
    legend=dict(orientation='h', yanchor='bottom', y=-0.25, xanchor='center', x=0.5)
)
fig2.write_image("output/chart2_revenue_split.png")
with open("output/chart2_revenue_split.png.meta.json", "w") as f:
    json.dump({"caption": "Phân bổ doanh thu: 100 HTG vé bán → 6 luồng tiền",
               "description": "Donut chart: Prize pool 60%, Marchann 8%, SA 3%, Referral 2%, Marketing 2%, NATCOM Net 25%"}, f)

# ── CHART 3: Instant Reward Engine – Probability & Expected Value ──
categories = ['Scratch\nKhông trúng', 'Scratch\n+50 HTG', 'Scratch\n+200 HTG', 'Scratch\n+500 HTG',
              'Streak\n7 ngày', 'Streak\n30 ngày', 'Lucky Hour\nDouble chance']
probabilities = [70, 20, 8, 2, 100, 100, 100]
expected_value = [0, 10, 16, 10, 50, 200, 0]  # E[value] per trigger
colors_bar = ['#636EFA','#00CC96','#00CC96','#00CC96','#EF553B','#EF553B','#AB63FA']

fig3 = go.Figure()
fig3.add_bar(name='Xác suất (%)', x=categories, y=probabilities,
             marker_color=colors_bar,
             text=[f'{p}%' for p in probabilities], textposition='outside')
fig3.update_layout(
    title={"text": "Instant Reward Engine – Xác suất & Giá trị Kỳ vọng<br><span style='font-size:17px;font-weight:normal;'>Source: Mô hình Gamification Natloto | Scratch + Streak + Lucky Hour</span>"},
    showlegend=False
)
fig3.update_xaxes(title_text="Loại Thưởng")
fig3.update_yaxes(title_text="Xác suất (%)")
fig3.update_traces(cliponaxis=False)
fig3.write_image("output/chart3_instant_reward.png")
with open("output/chart3_instant_reward.png.meta.json", "w") as f:
    json.dump({"caption": "Instant Reward Engine: Xác suất từng loại thưởng tức thì",
               "description": "Bar chart: Scratch card 3 mức + Streak bonus + Lucky Hour - xác suất kích hoạt"}, f)

# ── CHART 4: Agent Daily Volume Simulation – 7 ngày ──
days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
debutan   = [3200, 2800, 4100, 3500, 5200, 6800, 4200]
machann   = [8500, 7200, 9800, 8100, 12400, 15200, 9600]
gran_met  = [28000, 24000, 32000, 27000, 41000, 52000, 33000]

fig4 = go.Figure()
fig4.add_scatter(name='Debutan (avg 4K HTG/ngày)', x=days, y=debutan, mode='lines+markers',
                 fill='tozeroy', fillcolor='rgba(99,110,250,0.08)')
fig4.add_scatter(name='Machann (avg 10K HTG/ngày)', x=days, y=machann, mode='lines+markers')
fig4.add_scatter(name='Gran Mèt (avg 34K HTG/ngày)', x=days, y=gran_met, mode='lines+markers')
fig4.update_layout(
    title={"text": "Volume Bán Hàng Ngày theo Tier Agent (1 tuần)<br><span style='font-size:17px;font-weight:normal;'>Source: Mô hình Natloto 📙 | Peak T6-T7 (+40% vs ngày thường)</span>"},
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)
fig4.update_xaxes(title_text="Ngày trong tuần")
fig4.update_yaxes(title_text="Volume (HTG)")
fig4.write_image("output/chart4_daily_volume.png")
with open("output/chart4_daily_volume.png.meta.json", "w") as f:
    json.dump({"caption": "Volume bán hàng ngày theo Tier Agent (mô phỏng 1 tuần)",
               "description": "Line chart: 3 tiers Debutan/Machann/Gran Mèt, peak cuối tuần T6-CN"}, f)

# ── CHART 5: Telegram Dashboard KPIs – Agent Funnel ──
funnel_stages = ['Natcash Agents\n(30,000)', 'Tiếp cận\n& Onboard', 'Active\nAgent', 'Gran Mèt+\nTier', 'Chanpyon\nTier']
funnel_values = [30000, 12000, 8000, 2000, 300]
funnel_pct    = [100, 40, 27, 7, 1]

fig5 = go.Figure(go.Funnel(
    y=funnel_stages,
    x=funnel_values,
    textinfo='value+percent initial',
    textposition='inside',
))
fig5.update_layout(
    title={"text": "Agent Activation Funnel – Natloto Network<br><span style='font-size:17px;font-weight:normal;'>Source: Mô hình 📙 | 30K Natcash agents → 300 Chanpyon target</span>"},
)
fig5.write_image("output/chart5_agent_funnel.png")
with open("output/chart5_agent_funnel.png.meta.json", "w") as f:
    json.dump({"caption": "Agent Activation Funnel: 30K Natcash Agents → Chanpyon tier",
               "description": "Funnel chart: Toàn bộ agents → Onboard → Active → Gran Mèt → Chanpyon"}, f)

print("✅ 5 charts generated successfully")
