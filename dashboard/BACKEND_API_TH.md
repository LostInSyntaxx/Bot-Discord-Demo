# 📡 Backend API Documentation (ภาษาไทย)

## 🎯 ภาพรวม

Backend API ถูกสร้างไว้แล้วที่ไฟล์ `dashboard/server/index.ts` โดยใช้ **Express.js** และ **WebSocket**

---

## 🔧 สิ่งที่สร้างไว้แล้ว

### ✅ 1. **Database Integration**
- เชื่อมต่อกับ `bot.db` (SQLite) ที่ bot ใช้อยู่
- อ่านและแก้ไขข้อมูล welcome, autorole, logs, stats
- ไม่ต้องสร้าง database ใหม่ - ใช้ของ bot เลย!

### ✅ 2. **Discord OAuth2**
- Login ด้วย Discord
- ดึงข้อมูล user และ guilds
- สร้าง JWT token สำหรับ authentication

### ✅ 3. **REST API Endpoints**

#### 📊 Statistics (สถิติ)
```typescript
GET  /api/stats/bot              // สถิติรวมของ bot
GET  /api/stats/guild/:guildId   // สถิติของ server
```

#### 🎵 Music Control (ควบคุมเพลง)
```typescript
GET   /api/music/:guildId           // สถานะเครื่องเล่น
POST  /api/music/:guildId/play      // เล่นเพลง
POST  /api/music/:guildId/pause     // หยุดชั่วคราว
POST  /api/music/:guildId/skip      // ข้ามเพลง
POST  /api/music/:guildId/stop      // หยุดเล่น
POST  /api/music/:guildId/volume    // ปรับเสียง
POST  /api/music/:guildId/search    // ค้นหาเพลง
```

#### 🛡️ Moderation (การจัดการ)
```typescript
GET  /api/moderation/:guildId      // ดึงการตั้งค่า
PUT  /api/moderation/:guildId      // แก้ไขการตั้งค่า
```

#### 👋 Welcome & Auto Role
```typescript
GET  /api/welcome/:guildId         // ดึงการตั้งค่า welcome
PUT  /api/welcome/:guildId         // แก้ไขการตั้งค่า welcome
GET  /api/autorole/:guildId        // ดึงการตั้งค่า auto role
PUT  /api/autorole/:guildId        // แก้ไขการตั้งค่า auto role
```

#### 📝 Logs (บันทึก)
```typescript
GET  /api/logs/:guildId            // ดึง logs
GET  /api/logs/:guildId/config     // ดึงการตั้งค่า logs
PUT  /api/logs/:guildId            // แก้ไขการตั้งค่า logs
```

### ✅ 4. **WebSocket Server**
- Real-time updates (อัพเดทแบบเรียลไทม์)
- ส่ง events จาก bot ไป dashboard
- ไม่ต้อง refresh หน้าเว็บ

---

## 🔗 การเชื่อมต่อกับ Bot

### วิธีที่ 1: ใช้ Database ร่วมกัน (ง่ายที่สุด)

API จะอ่านจาก `bot.db` โดยอัตโนมัติ:

```typescript
// ใน dashboard/server/index.ts
import { Database } from 'bun:sqlite';

const db = new Database('../bot.db');

// ดึงข้อมูล welcome config
const config = db.query(
  'SELECT * FROM join_config WHERE guild_id = ?',
  [guildId]
).get();

// แก้ไขข้อมูล
db.run(`
  UPDATE join_config 
  SET welcome_message = ? 
  WHERE guild_id = ?
`, [newMessage, guildId]);
```

✅ **ข้อดี:**
- ง่าย ไม่ต้องแก้โค้ด bot
- ข้อมูลตรงกัน 100%
- ไม่ต้องตั้งอะไรเพิ่ม

### วิธีที่ 2: เพิ่ม Real-time Events (แนะนำ)

เพิ่มโค้ดนี้ใน `src/index.ts` ของ bot:

```typescript
// Import WebSocket functions
import { broadcastToAll } from '../dashboard/server/index';

// Member join
client.on('guildMemberAdd', (member) => {
  broadcastToAll({
    type: 'member_join',
    data: {
      guild: member.guild.id,
      user: member.user,
      timestamp: new Date().toISOString(),
    },
  });
});

// Message create
client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  
  broadcastToAll({
    type: 'new_message',
    data: {
      guild: message.guildId,
      user: message.author,
      content: message.content,
      timestamp: new Date().toISOString(),
    },
  });
});

// Music track start
client.shoukaku.on('trackStart', (player, track) => {
  broadcastToAll({
    type: 'music_track_start',
    data: {
      guild: player.guildId,
      track: track.info,
    },
  });
});
```

✅ **ข้อดี:**
- ข้อมูลอัพเดททันทีแบบ real-time
- Dashboard แสดงข้อมูลสด

---

## 🚀 วิธีรัน

### ขั้นตอนที่ 1: ติดตั้ง Dependencies

```bash
cd dashboard
npm install
```

### ขั้นตอนที่ 2: ตั้งค่า .env.local

```env
# Discord OAuth2
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3001/api/auth/callback

# JWT
JWT_SECRET=su3p3r_s3cr3t_k3y_ch4ng3_th1s!

# Server
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### ขั้นตอนที่ 3: ตั้งค่า Discord OAuth2

1. ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. เลือก application ของคุณ
3. ไปที่ **OAuth2**
4. เพิ่ม Redirect URL: `http://localhost:3001/api/auth/callback`
5. คัดลอก Client ID และ Client Secret ไปใส่ใน `.env.local`

### ขั้นตอนที่ 4: รัน

```bash
# รันทั้ง frontend และ backend
npm run dev:all

# หรือรันแยก
npm run dev      # Frontend (port 3000)
npm run server   # Backend (port 3001)
```

### ขั้นตอนที่ 5: เปิด Dashboard

ไปที่: http://localhost:3000

---

## 📝 ตัวอย่างการใช้งาน

### 1. ดึงข้อมูล Welcome Config

**Frontend เรียก API:**
```typescript
const response = await fetch('http://localhost:3001/api/welcome/GUILD_ID', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const config = await response.json();
console.log(config.welcomeMessage);
```

**API ตอบกลับ:**
```json
{
  "welcomeChannel": "123456789",
  "welcomeMessage": "Welcome {user} to {server}!",
  "welcomeEnabled": true,
  "dmWelcome": "Welcome to our server!",
  "dmEnabled": false,
  "autoRoleId": "987654321",
  "autoRoleEnabled": true
}
```

### 2. แก้ไข Welcome Message

**Frontend ส่งข้อมูล:**
```typescript
await fetch('http://localhost:3001/api/welcome/GUILD_ID', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    welcomeMessage: 'Welcome {user}! You are member #{count}',
    welcomeEnabled: true
  })
});
```

**API แก้ไขใน Database:**
```sql
UPDATE join_config 
SET welcome_message = 'Welcome {user}! You are member #{count}'
WHERE guild_id = 'GUILD_ID'
```

### 3. Real-time Event จาก Bot

**Bot ส่ง event:**
```typescript
broadcastToAll({
  type: 'member_join',
  data: {
    guild: '123456',
    user: { username: 'TestUser' },
    timestamp: '2024-01-01T00:00:00Z'
  }
});
```

**Dashboard รับ event:**
```typescript
wsService.on('member_join', (data) => {
  console.log('New member:', data.user.username);
  // อัพเดท UI ทันที
});
```

---

## 🗄️ Database Tables ที่ใช้

### 1. join_config (Welcome System)
```sql
guild_id           TEXT PRIMARY KEY
welcome_channel    TEXT
welcome_message    TEXT
welcome_enabled    INTEGER
dm_welcome         TEXT
dm_enabled         INTEGER
auto_role_id       TEXT
auto_role_enabled  INTEGER
```

### 2. auto_roles (Auto Role)
```sql
guild_id   TEXT
role_id    TEXT
PRIMARY KEY (guild_id, role_id)
```

### 3. moderation_history (Logs)
```sql
id         TEXT PRIMARY KEY
target     TEXT
action     TEXT
duration   TEXT
reason     TEXT
admin      TEXT
timestamp  TEXT
```

### 4. log_config (Logs Config)
```sql
guild_id    TEXT PRIMARY KEY
channel_id  TEXT
events      TEXT  (JSON)
```

### 5. server_stats_total (Statistics)
```sql
guild_id          TEXT PRIMARY KEY
total_messages    INTEGER
total_voice_minutes INTEGER
total_commands    INTEGER
peak_members      INTEGER
last_updated      TEXT
```

---

## 🔐 Authentication Flow

1. User กด "Login with Discord"
2. Redirect ไป Discord OAuth2
3. User อนุญาต
4. Discord ส่งกลับมาพร้อม `code`
5. Backend แลก `code` เป็น `access_token`
6. Backend สร้าง `JWT token`
7. Redirect ไป dashboard พร้อม token
8. Frontend เก็บ token และใช้เรียก API

---

## 📊 WebSocket Events

### Events ที่ Bot ส่งได้:

```typescript
// สมาชิกเข้าร่วม
'member_join'

// สมาชิกออก
'member_leave'

// มีข้อความใหม่
'new_message'

// เข้า voice channel
'voice_join'

// ออกจาก voice channel
'voice_leave'

// เริ่มเล่นเพลง
'music_track_start'

// เพลงจบ
'music_track_end'

// Queue หมด
'music_queue_end'

// ใช้คำสั่ง
'command_used'

// ถูกแบน
'moderation_ban'

// ถูกปลดแบน
'moderation_unban'
```

---

## ⚙️ การตั้งค่าเพิ่มเติม

### เพิ่ม Moderation Config Table

ถ้าต้องการเก็บการตั้งค่า moderation:

```sql
CREATE TABLE IF NOT EXISTS moderation_config (
  guild_id TEXT PRIMARY KEY,
  anti_spam INTEGER DEFAULT 0,
  anti_links INTEGER DEFAULT 0,
  anti_bad_words INTEGER DEFAULT 0,
  max_messages INTEGER DEFAULT 5,
  time_window INTEGER DEFAULT 5,
  punishment TEXT DEFAULT 'warn'
);
```

### เพิ่ม Statistics Tracking

ใน `src/index.ts`:

```typescript
// นับข้อความ
client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  
  const db = getDatabase();
  db.run(`
    INSERT INTO server_stats (guild_id, date, message_count)
    VALUES (?, date('now'), 1)
    ON CONFLICT(guild_id, date) DO UPDATE SET
      message_count = message_count + 1
  `, [message.guildId]);
});
```

---

## 🐛 การแก้ไขปัญหา

### ❌ ปัญหา: Database file not found
**วิธีแก้:** ตรวจสอบว่า bot รันอยู่แล้ว (สร้าง bot.db ไว้)

### ❌ ปัญหา: CORS error
**วิธีแก้:** ตั้งค่า `CORS_ORIGIN=http://localhost:3000` ใน `.env.local`

### ❌ ปัญหา: OAuth2 redirect mismatch
**วิธีแก้:** ตรวจสอบว่า redirect URL ใน Discord Developer Portal ตรงกับ `DISCORD_REDIRECT_URI`

### ❌ ปัญหา: WebSocket ไม่เชื่อมต่อ
**วิธีแก้:** ตรวจสอบว่า `NEXT_PUBLIC_WS_URL` ถูกต้อง และ server รันอยู่แล้ว

### ❌ ปัญหา: API returns 401 Unauthorized
**วิธีแก้:** ตรวจสอบว่า JWT token ถูกส่งใน header `Authorization: Bearer TOKEN`

---

## 📚 ไฟล์ที่เกี่ยวข้อง

- [server/index.ts](file:///D:/Bot-Discord-Demo/dashboard/server/index.ts) - Backend API ทั้งหมด
- [INTEGRATION.md](file:///D:/Bot-Discord-Demo/dashboard/INTEGRATION.md) - คู่มือการเชื่อมต่อ
- [INTEGRATION_EXAMPLE.ts](file:///D:/Bot-Discord-Demo/dashboard/INTEGRATION_EXAMPLE.ts) - ตัวอย่างโค้ด
- [QUICKSTART.md](file:///D:/Bot-Discord-Demo/dashboard/QUICKSTART.md) - คู่มือเริ่มต้น

---

## ✅ สรุป

### สิ่งที่สร้างไว้แล้ว:
✅ Express.js API Server  
✅ Discord OAuth2 Authentication  
✅ WebSocket Server  
✅ Database Integration (bot.db)  
✅ REST API Endpoints ทั้งหมด  
✅ Real-time Events Support  

### สิ่งที่ต้องทำเพิ่ม:
1. ติดตั้ง dependencies: `npm install`
2. ตั้งค่า `.env.local`
3. ตั้งค่า Discord OAuth2
4. รัน server: `npm run dev:all`
5. (แนะนำ) เพิ่ม WebSocket events ใน bot

### พร้อมใช้งานไหม?
✅ **พร้อมแล้ว!** แค่รันและเริ่มใช้งานได้เลย!

---

มีคำถามเพิ่มเติมไหม? 🚀
