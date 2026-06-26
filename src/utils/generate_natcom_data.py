import os
import sys
import sqlite3
import csv
import random
import uuid
from datetime import datetime, timedelta

# Force stdout/stderr to use UTF-8 encoding to prevent console Unicode errors
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Cấu hình đường dẫn
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CSV_DIR = os.path.join(DATA_DIR, 'natcom_demo_csv')
DB_PATH = os.path.join(DATA_DIR, 'natcom_dashboard_demo.db')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CSV_DIR, exist_ok=True)

# Khởi tạo SQLite
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Tạo cấu trúc bảng
cursor.executescript("""
DROP TABLE IF EXISTS commission_payouts;
DROP TABLE IF EXISTS rewards;
DROP TABLE IF EXISTS commissions;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS user_agent_attribution;
DROP TABLE IF EXISTS agents;

-- Bảng agents
CREATE TABLE agents (
    id TEXT PRIMARY KEY,
    natcash_phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    parent_sa_id TEXT,
    tier TEXT NOT NULL,
    location_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (parent_sa_id) REFERENCES agents(id)
);

-- Bảng user_agent_attribution
CREATE TABLE user_agent_attribution (
    user_id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    source TEXT NOT NULL,
    attributed_at TEXT NOT NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Bảng tickets
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    game_type TEXT NOT NULL,
    bet_numbers TEXT NOT NULL,
    amount_htg REAL NOT NULL,
    status TEXT NOT NULL,
    prize_amount_htg REAL NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Bảng commissions
CREATE TABLE commissions (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    tier_level INTEGER NOT NULL,
    amount_htg REAL NOT NULL,
    rate_pct REAL NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Bảng rewards
CREATE TABLE rewards (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    reward_type TEXT NOT NULL,
    amount_htg REAL NOT NULL,
    win_code TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Bảng commission_payouts
CREATE TABLE commission_payouts (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    period_month TEXT NOT NULL,
    total_amount REAL NOT NULL,
    natcash_txn_id TEXT NOT NULL,
    paid_at TEXT NOT NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
""")
conn.commit()

print("🏁 Đã tạo xong cấu trúc bảng cơ sở dữ liệu.")

# Định nghĩa các hằng số mô phỏng
REGIONS = ["Port-au-Prince", "Cap-Haïtien", "Gonaïves", "Les Cayes", "Port-de-Paix"]
TIERS = ["DEBUTAN", "MACHANN", "GRAN_MET", "CHANPYON"]
GAME_TYPES = ["BOLET_2", "MARYAJ", "LOTTO_3"]
ATTRIBUTION_SOURCES = ["QR_SCAN", "WHATSAPP_LINK", "DIRECT"]

# Dữ liệu mẫu danh xưng
FIRST_NAMES = ["Ti Jan", "Madam Elize", "Bò Bòzò", "Madam Filo", "Ti Makè", "Jean", "Pierre", "Marie", "Joseph", "Nathalie", "Florence", "Dieudonné", "Mackenson", "Woody", "Clervaux"]
LAST_NAMES = ["Bélizaire", "Célestin", "Duval", "Etienne", "Francois", "Gérard", "Jean-Baptiste", "Lafontant", "Michel", "Pierre-Louis"]

def generate_phone(prefix="31"):
    return f"+509 {prefix}{random.randint(10,99)}-{random.randint(1000,9999)}"

# 1. Sinh Đại lý (Agents)
super_agents = []
marchann_agents = []

# Sinh 5 Super Agents (SA)
for i in range(5):
    sa_id = str(uuid.uuid4())
    sa_name = f"SA {FIRST_NAMES[i % len(FIRST_NAMES)]} {LAST_NAMES[i % len(LAST_NAMES)]}"
    sa_phone = generate_phone("32") # SA dùng đầu số 32
    created_date = datetime(2025, 6, 1) + timedelta(days=random.randint(0, 150))
    super_agents.append({
        "id": sa_id,
        "natcash_phone": sa_phone,
        "name": sa_name,
        "parent_sa_id": None,
        "tier": "CHANPYON", # Super Agent mặc định coi như Chanpyon
        "location_name": REGIONS[i],
        "created_at": created_date.strftime("%Y-%m-%d %H:%M:%S")
    })

# Sinh 100 Marchann Agents (MA)
for i in range(100):
    ma_id = str(uuid.uuid4())
    ma_name = f"{FIRST_NAMES[random.randint(0, len(FIRST_NAMES)-1)]} {LAST_NAMES[random.randint(0, len(LAST_NAMES)-1)]}"
    ma_phone = generate_phone(random.choice(["31", "40", "41"]))
    parent_sa = random.choice(super_agents)
    created_date = datetime(2025, 9, 1) + timedelta(days=random.randint(0, 90))
    marchann_agents.append({
        "id": ma_id,
        "natcash_phone": ma_phone,
        "name": ma_name,
        "parent_sa_id": parent_sa["id"],
        "tier": "DEBUTAN", # Bắt đầu từ Debutan
        "location_name": parent_sa["location_name"],
        "created_at": created_date.strftime("%Y-%m-%d %H:%M:%S")
    })

# Lưu agents vào database
for sa in super_agents:
    cursor.execute("INSERT INTO agents VALUES (?, ?, ?, ?, ?, ?, ?)", 
                   (sa["id"], sa["natcash_phone"], sa["name"], sa["parent_sa_id"], sa["tier"], sa["location_name"], sa["created_at"]))

for ma in marchann_agents:
    cursor.execute("INSERT INTO agents VALUES (?, ?, ?, ?, ?, ?, ?)", 
                   (ma["id"], ma["natcash_phone"], ma["name"], ma["parent_sa_id"], ma["tier"], ma["location_name"], ma["created_at"]))

conn.commit()
print(f"👥 Đã tạo {len(super_agents)} Super Agents và {len(marchann_agents)} Marchann Agents.")

# 2. Sinh Người chơi (Users) & attribution
users = []
user_attributions = []

for i in range(1500):
    user_id = str(uuid.uuid4())
    ma = random.choice(marchann_agents)
    source = random.choice(ATTRIBUTION_SOURCES)
    # Xác suất nguồn phân phối: QR_SCAN (75%), WHATSAPP_LINK (20%), DIRECT (5%)
    rand = random.random()
    if rand < 0.75:
        source = "QR_SCAN"
    elif rand < 0.95:
        source = "WHATSAPP_LINK"
    else:
        source = "DIRECT"
        
    created_date = datetime(2025, 11, 1) + timedelta(days=random.randint(0, 120))
    users.append(user_id)
    user_attributions.append({
        "user_id": user_id,
        "agent_id": ma["id"],
        "source": source,
        "attributed_at": created_date.strftime("%Y-%m-%d %H:%M:%S")
    })

for attr in user_attributions:
    cursor.execute("INSERT INTO user_agent_attribution VALUES (?, ?, ?, ?)", 
                   (attr["user_id"], attr["agent_id"], attr["source"], attr["attributed_at"]))
conn.commit()
print(f"👥 Đã tạo {len(users)} Users và liên kết attribution thành công.")

# 3. Sinh dữ liệu giao dịch vé số, hoa hồng và thưởng tức thì (Jan 1, 2026 -> May 31, 2026)
start_date = datetime(2026, 1, 1)
end_date = datetime(2026, 5, 31)

# Lịch sử doanh thu tích lũy của từng agent theo tháng để tính tier cho tháng sau
agent_monthly_volumes = {ma["id"]: {} for ma in marchann_agents}
for sa in super_agents:
    agent_monthly_volumes[sa["id"]] = {}

current_date = start_date
tickets_data = []
commissions_data = []
rewards_data = []

# Tốc độ tăng trưởng số lượng vé qua từng tháng
monthly_ticket_base = {
    1: (150, 220), # Jan
    2: (220, 320), # Feb
    3: (320, 480), # Mar
    4: (480, 700), # Apr
    5: (700, 1000) # May
}

def get_tier_rate(tier):
    if tier == "DEBUTAN": return 0.08
    if tier == "MACHANN": return 0.09
    if tier == "GRAN_MET": return 0.10
    if tier == "CHANPYON": return 0.11
    return 0.08

print("⏳ Đang sinh dữ liệu giao dịch hàng ngày (5 tháng)...")

while current_date <= end_date:
    month = current_date.month
    year = current_date.year
    day_of_week = current_date.weekday() # 0 = Monday, ..., 6 = Sunday
    
    # Cập nhật hạng (Tier) đại lý vào ngày đầu tháng dựa trên doanh thu tháng trước
    if current_date.day == 1:
        prev_month = month - 1 if month > 1 else 12
        prev_year = year if month > 1 else year - 1
        prev_period = f"{prev_year}-{prev_month:02d}"
        
        # Chỉ chạy từ tháng 2 trở đi
        if not (month == 1 and year == 2026):
            for ma in marchann_agents:
                vol = agent_monthly_volumes[ma["id"]].get(prev_period, 0)
                # Tính hạng mới
                if vol < 10000:
                    new_tier = "DEBUTAN"
                elif vol < 50000:
                    new_tier = "MACHANN"
                elif vol < 200000:
                    new_tier = "GRAN_MET"
                else:
                    new_tier = "CHANPYON"
                
                ma["tier"] = new_tier
                cursor.execute("UPDATE agents SET tier = ? WHERE id = ?", (new_tier, ma["id"]))
            conn.commit()

    # Số lượng vé mua trong ngày hôm nay
    min_t, max_t = monthly_ticket_base[month]
    num_tickets = random.randint(min_t, max_t)
    
    # Tăng 40% nếu là Thứ Sáu hoặc Thứ Bảy (weekend peak)
    if day_of_week in [4, 5]: # Friday, Saturday
        num_tickets = int(num_tickets * 1.4)
        
    for _ in range(num_tickets):
        ticket_id = str(uuid.uuid4())
        user_id = random.choice(users)
        
        # Lấy MA và SA tương ứng
        # (Tìm MA trong list)
        attr = next(x for x in user_attributions if x["user_id"] == user_id)
        ma = next(x for x in marchann_agents if x["id"] == attr["agent_id"])
        sa = next(x for x in super_agents if x["id"] == ma["parent_sa_id"])
        
        # Trực quan hóa game type
        rand_game = random.random()
        if rand_game < 0.70:
            game_type = "BOLET_2"
            bet_numbers = f"{random.randint(0, 99):02d}"
            amount_htg = random.randint(2, 20) * 25 # 50 - 500 HTG
        elif rand_game < 0.90:
            game_type = "MARYAJ"
            bet_numbers = f"{random.randint(0, 99):02d} x {random.randint(0, 99):02d}"
            amount_htg = random.randint(5, 40) * 25 # 125 - 1000 HTG
        else:
            game_type = "LOTTO_3"
            bet_numbers = f"{random.randint(0, 999):03d}"
            amount_htg = random.randint(10, 60) * 25 # 250 - 1500 HTG
            
        # Thời gian mua vé
        # Tập trung vào khung giờ Lucky Hour (11:00-11:30, 17:00-17:30) và trước giờ quay (17:30-18:00)
        rand_time = random.random()
        if rand_time < 0.25: # Khung giờ vàng trưa
            hour = 11
            minute = random.randint(0, 29)
        elif rand_time < 0.65: # Khung giờ vàng tối + cận giờ quay 18h
            hour = 17
            minute = random.randint(0, 59)
        elif rand_time < 0.85: # Khung giờ cận quay 21h
            hour = 20
            minute = random.randint(0, 59)
        else: # Các giờ khác trong ngày
            hour = random.choice([7, 8, 9, 10, 12, 13, 14, 15, 16, 18, 19])
            minute = random.randint(0, 59)
            
        ticket_time = datetime(current_date.year, current_date.month, current_date.day, hour, minute, random.randint(0,59))
        
        # Quyết định kết quả vé (5% thắng)
        is_win = random.random() < 0.05
        status = "WIN" if is_win else "LOSE"
        prize_amount = 0
        if is_win:
            if game_type == "BOLET_2":
                prize_amount = amount_htg * 50
            elif game_type == "MARYAJ":
                prize_amount = amount_htg * 1000
            else:
                prize_amount = amount_htg * 500
                
        # Lưu vé
        tickets_data.append((
            ticket_id, user_id, ma["id"], game_type, bet_numbers, amount_htg, status, prize_amount, ticket_time.strftime("%Y-%m-%d %H:%M:%S")
        ))
        
        # Tính lũy doanh số tháng cho MA và SA
        period_key = f"{year}-{month:02d}"
        agent_monthly_volumes[ma["id"]][period_key] = agent_monthly_volumes[ma["id"]].get(period_key, 0) + amount_htg
        agent_monthly_volumes[sa["id"]][period_key] = agent_monthly_volumes[sa["id"]].get(period_key, 0) + amount_htg
        
        # 3.1. Tính Hoa Hồng Commissions
        # L2: Marchann Agent (8% - 11% tuỳ tier)
        ma_rate = get_tier_rate(ma["tier"])
        ma_comm = amount_htg * ma_rate
        commissions_data.append((
            str(uuid.uuid4()), ticket_id, ma["id"], 2, ma_comm, ma_rate, "PAID", ticket_time.strftime("%Y-%m-%d %H:%M:%S")
        ))
        
        # L1: Super Agent (3% cố định cho SA)
        sa_rate = 0.03
        sa_comm = amount_htg * sa_rate
        commissions_data.append((
            str(uuid.uuid4()), ticket_id, sa["id"], 1, sa_comm, sa_rate, "PAID", ticket_time.strftime("%Y-%m-%d %H:%M:%S")
        ))
        
        # L3: Referral User (2% nếu có, tỉ lệ 15% user được referral)
        if random.random() < 0.15:
            ref_comm = amount_htg * 0.02
            # Ghi nhận hoa hồng giới thiệu
            commissions_data.append((
                str(uuid.uuid4()), ticket_id, ma["id"], 3, ref_comm, 0.02, "PAID", ticket_time.strftime("%Y-%m-%d %H:%M:%S")
            ))
            
        # 3.2. Tính Instant Rewards (Thưởng tức thì)
        # Tỉ lệ trúng thưởng: 30% vé mua được kích hoạt Scratch Card
        if random.random() < 0.30:
            reward_rand = random.random()
            reward_type = "SCRATCH_CARD"
            reward_amount = 0
            
            if reward_rand < 0.70:
                # 70% không trúng gì
                pass
            elif reward_rand < 0.90:
                reward_amount = 50.0
            elif reward_rand < 0.98:
                reward_amount = 200.0
            else:
                reward_amount = 500.0
                
            if reward_amount > 0:
                win_code = f"{random.randint(100000, 999999)}"
                # Trạng thái phần thưởng: 85% PAID (đại lý đã chi tiền mặt), 10% PENDING (đợi rút), 5% EXPIRED (quá hạn 48h)
                status_rand = random.random()
                if status_rand < 0.85:
                    reward_status = "PAID"
                elif status_rand < 0.95:
                    reward_status = "PENDING"
                else:
                    reward_status = "EXPIRED"
                    
                rewards_data.append((
                    str(uuid.uuid4()), ticket_id, user_id, ma["id"], reward_type, reward_amount, win_code, reward_status, ticket_time.strftime("%Y-%m-%d %H:%M:%S")
                ))
                
        # Thỉnh thoảng trúng Streak Bonus (2% cơ hội nhận thưởng mua liên tục)
        if random.random() < 0.02:
            streak_amount = random.choice([200.0, 2000.0])
            win_code = f"{random.randint(100000, 999999)}"
            rewards_data.append((
                str(uuid.uuid4()), ticket_id, user_id, ma["id"], "STREAK_BONUS", streak_amount, win_code, "PAID", ticket_time.strftime("%Y-%m-%d %H:%M:%S")
            ))
            
        # Lucky Hour Bonus (Thưởng thêm giờ vàng 5% cơ hội trong khung giờ vàng)
        if hour in [11, 17] and random.random() < 0.05:
            win_code = f"{random.randint(100000, 999999)}"
            rewards_data.append((
                str(uuid.uuid4()), ticket_id, user_id, ma["id"], "LUCKY_HOUR", 50.0, win_code, "PAID", ticket_time.strftime("%Y-%m-%d %H:%M:%S")
            ))

    current_date += timedelta(days=1)

# Ghi dữ liệu vào database
print("💾 Đang ghi dữ liệu vào SQLite...")
cursor.executemany("INSERT INTO tickets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", tickets_data)
cursor.executemany("INSERT INTO commissions VALUES (?, ?, ?, ?, ?, ?, ?, ?)", commissions_data)
cursor.executemany("INSERT INTO rewards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", rewards_data)
conn.commit()

print("🏁 Đã tạo xong vé số, hoa hồng và thưởng tức thì.")

# 4. Sinh Bảng Commission Payouts (Thanh toán hàng tháng)
# Tính hoa hồng và bonus tháng cho từng Agent, rồi lưu vào payouts
print("💰 Đang xử lý thanh toán hoa hồng hàng tháng (Payouts)...")
payouts_data = []

for month in range(1, 6):
    period_str = f"2026-{month:02d}"
    
    # Lấy các giao dịch hoa hồng trong tháng đó của từng Agent
    # (Tìm tất cả commission thuộc tháng)
    cursor.execute("""
        SELECT agent_id, SUM(amount_htg) 
        FROM commissions 
        WHERE strftime('%Y-%m', created_at) = ? 
        GROUP BY agent_id
    """, (period_str,))
    
    monthly_comms = cursor.fetchall()
    
    for agent_id, comm_sum in monthly_comms:
        # Xác định bonus tháng dựa vào tier tích lũy của agent
        # Lấy thông tin đại lý
        cursor.execute("SELECT name, tier FROM agents WHERE id = ?", (agent_id,))
        agent_info = cursor.fetchone()
        if not agent_info:
            continue
        agent_name, tier = agent_info
        
        bonus = 0.0
        if tier == "MACHANN":
            bonus = 200.0
        elif tier == "GRAN_MET":
            bonus = 1000.0
        elif tier == "CHANPYON":
            bonus = 5000.0
            
        total_payout = comm_sum + bonus
        txn_id = f"TXN-NAT-{random.randint(100000000, 999999999)}"
        
        # Thời điểm chi trả vào ngày mùng 1 của tháng tiếp theo
        next_month = month + 1 if month < 12 else 1
        next_year = 2026 if month < 12 else 2027
        paid_at = datetime(next_year, next_month, 1, 8, random.randint(0,59), random.randint(0,59))
        
        payouts_data.append((
            str(uuid.uuid4()), agent_id, period_str, total_payout, txn_id, paid_at.strftime("%Y-%m-%d %H:%M:%S")
        ))

cursor.executemany("INSERT INTO commission_payouts VALUES (?, ?, ?, ?, ?, ?)", payouts_data)
conn.commit()
print("🏁 Đã tạo xong thanh toán hoa hồng định kỳ.")

# 5. Xuất các bảng ra File CSV để demo
tables = ['agents', 'user_agent_attribution', 'tickets', 'commissions', 'rewards', 'commission_payouts']
print("📤 Đang xuất dữ liệu ra file CSV...")

for table in tables:
    csv_file_path = os.path.join(CSV_DIR, f"{table}.csv")
    cursor.execute(f"SELECT * FROM {table}")
    rows = cursor.fetchall()
    headers = [description[0] for description in cursor.description]
    
    with open(csv_file_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
        
print(f"✅ Đã xuất tất cả {len(tables)} bảng dữ liệu ra thư mục {CSV_DIR}")

# 6. Đóng kết nối và hiển thị báo cáo tổng kết ngắn
cursor.execute("SELECT COUNT(*) FROM tickets")
total_tickets = cursor.fetchone()[0]

cursor.execute("SELECT SUM(amount_htg) FROM tickets")
total_sales = cursor.fetchone()[0]

cursor.execute("SELECT SUM(amount_htg) FROM commissions WHERE tier_level = 2")
ma_comms = cursor.fetchone()[0]

cursor.execute("SELECT SUM(amount_htg) FROM commissions WHERE tier_level = 1")
sa_comms = cursor.fetchone()[0]

cursor.execute("SELECT SUM(amount_htg) FROM rewards")
total_rewards_htg = cursor.fetchone()[0]

conn.close()

print("\n" + "="*50)
print("📊 BÁO CÁO TỔNG KẾT DỮ LIỆU DEMO NATCOM (01/2026 - 05/2026)")
print("="*50)
print(f"🎫 Tổng số vé bán ra:              {total_tickets:,} vé")
print(f"💰 Tổng doanh thu bán vé (HTG):    {total_sales:,.2f} HTG (~${total_sales/140:,.2f} USD)")
print(f"💵 Hoa hồng Marchann L2 (HTG):    {ma_comms:,.2f} HTG")
print(f"🏢 Hoa hồng Super Agent L1 (HTG):  {sa_comms:,.2f} HTG")
print(f"🎁 Tổng tiền thưởng tức thì (HTG):  {total_rewards_htg:,.2f} HTG")
print("="*50)
print("👉 Cơ sở dữ liệu SQLite demo lưu tại: data/natcom_dashboard_demo.db")
print("👉 Các file CSV lưu tại thư mục:      data/natcom_demo_csv/")
print("="*50)
