# Integration Guide - Connecting Dashboard with Discord Bot

This guide shows you how to integrate the dashboard with your existing Discord bot.

## 📡 Real-time WebSocket Integration

### Step 1: Import WebSocket Functions

In your main bot file (`src/index.ts`), import the broadcast functions:

```typescript
// Add this import at the top
import { broadcastToAll, broadcastToUser } from '../dashboard/server/index';
```

### Step 2: Emit Events from Bot

Add event listeners to broadcast real-time updates to the dashboard:

```typescript
// Member join event
client.on('guildMemberAdd', (member) => {
  broadcastToAll({
    type: 'member_join',
    data: {
      guild: member.guild.id,
      user: {
        id: member.user.id,
        username: member.user.username,
        avatar: member.user.avatar,
      },
      memberCount: member.guild.memberCount,
      timestamp: new Date().toISOString(),
    },
  });
});

// Member leave event
client.on('guildMemberRemove', (member) => {
  broadcastToAll({
    type: 'member_leave',
    data: {
      guild: member.guild.id,
      user: {
        id: member.user.id,
        username: member.user.username,
        avatar: member.user.avatar,
      },
      memberCount: member.guild.memberCount,
      timestamp: new Date().toISOString(),
    },
  });
});

// Message create event
client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  
  broadcastToAll({
    type: 'new_message',
    data: {
      guild: message.guildId,
      channel: message.channelId,
      user: {
        id: message.author.id,
        username: message.author.username,
        avatar: message.author.avatar,
      },
      content: message.content.substring(0, 100),
      timestamp: new Date().toISOString(),
    },
  });
});

// Voice state update
client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.channelId) {
    broadcastToAll({
      type: 'voice_join',
      data: {
        guild: newState.guild.id,
        channel: newState.channelId,
        user: {
          id: newState.user.id,
          username: newState.user.username,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Moderation action (example with ban)
client.on('guildBanAdd', (ban) => {
  broadcastToAll({
    type: 'moderation_ban',
    data: {
      guild: ban.guild.id,
      user: {
        id: ban.user.id,
        username: ban.user.username,
        avatar: ban.user.avatar,
      },
      timestamp: new Date().toISOString(),
    },
  });
});
```

## 🗄️ Database Sharing

Both the bot and dashboard can share the same SQLite database.

### Access Database from Dashboard API

```typescript
// In dashboard/server/index.ts
import { getDatabase } from '../src/services/database.service';

// Example: Get welcome config for a guild
app.get('/api/welcome/:guildId', (req, res) => {
  const db = getDatabase();
  const config = db.query(
    'SELECT * FROM join_config WHERE guild_id = ?',
    [req.params.guildId]
  ).get();
  
  if (!config) {
    return res.json({
      welcomeChannel: null,
      welcomeMessage: 'Welcome {user} to {server}!',
      welcomeEnabled: false,
      dmWelcome: 'Welcome to {server}!',
      dmEnabled: false,
      autoRoleId: null,
      autoRoleEnabled: false,
    });
  }
  
  res.json({
    welcomeChannel: config.welcome_channel,
    welcomeMessage: config.welcome_message,
    welcomeEnabled: Boolean(config.welcome_enabled),
    dmWelcome: config.dm_welcome,
    dmEnabled: Boolean(config.dm_enabled),
    autoRoleId: config.auto_role_id,
    autoRoleEnabled: Boolean(config.auto_role_enabled),
  });
});

// Update welcome config
app.put('/api/welcome/:guildId', (req, res) => {
  const db = getDatabase();
  const { guildId } = req.params;
  const config = req.body;
  
  db.run(`
    INSERT INTO join_config (guild_id, welcome_channel, welcome_message, welcome_enabled, dm_welcome, dm_enabled, auto_role_id, auto_role_enabled, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(guild_id) DO UPDATE SET
      welcome_channel = excluded.welcome_channel,
      welcome_message = excluded.welcome_message,
      welcome_enabled = excluded.welcome_enabled,
      dm_welcome = excluded.dm_welcome,
      dm_enabled = excluded.dm_enabled,
      auto_role_id = excluded.auto_role_id,
      auto_role_enabled = excluded.auto_role_enabled,
      last_updated = datetime('now')
  `, [
    guildId,
    config.welcomeChannel,
    config.welcomeMessage,
    config.welcomeEnabled ? 1 : 0,
    config.dmWelcome,
    config.dmEnabled ? 1 : 0,
    config.autoRoleId,
    config.autoRoleEnabled ? 1 : 0,
  ]);
  
  res.json({ success: true });
});
```

## 🎵 Music System Integration

### Connect Shoukaku with Dashboard

```typescript
// In dashboard/server/index.ts
import { client } from '../src/index';

app.get('/api/music/:guildId', (req, res) => {
  const { guildId } = req.params;
  
  // Get player from Shoukaku
  const player = client.shoukaku.players.get(guildId);
  
  if (!player) {
    return res.json({
      currentTrack: null,
      queue: [],
      volume: 100,
      isPlaying: false,
    });
  }
  
  const currentTrack = player.track ? {
    title: player.track.info.title,
    author: player.track.info.author,
    duration: player.track.info.length,
    uri: player.track.info.uri,
  } : null;
  
  res.json({
    currentTrack,
    queue: player.queue.map(track => ({
      title: track.info.title,
      author: track.info.author,
      duration: track.info.length,
      uri: track.info.uri,
    })),
    volume: player.volume,
    isPlaying: player.playing,
  });
});

app.post('/api/music/:guildId/:action', async (req, res) => {
  const { guildId, action } = req.params;
  const player = client.shoukaku.players.get(guildId);
  
  if (!player) {
    return res.status(404).json({ error: 'No active player' });
  }
  
  switch (action) {
    case 'play':
      player.setPaused(false);
      break;
    case 'pause':
      player.setPaused(true);
      break;
    case 'skip':
      player.stopTrack();
      break;
    case 'stop':
      player.disconnect();
      break;
    case 'volume':
      player.setVolume(req.body.volume);
      break;
  }
  
  // Broadcast update to dashboard
  broadcastToAll({
    type: 'music_update',
    data: { guild: guildId, action },
  });
  
  res.json({ success: true });
});
```

## 📊 Statistics Integration

### Real-time Bot Stats

```typescript
// In dashboard/server/index.ts
app.get('/api/stats/bot', (req, res) => {
  const uptime = client.uptime ? Math.floor(client.uptime / 1000) : 0;
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  res.json({
    guilds: client.guilds.cache.size,
    users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
    commands: 5234, // Get from your command service
    uptime: `${hours}h ${minutes}m`,
    ping: client.ws.ping,
    memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)} MB`,
    cpu: `${process.cpuUsage().system / 1000000}%`,
  });
});

// Get guild-specific stats
app.get('/api/stats/guild/:guildId', async (req, res) => {
  const { guildId } = req.params;
  const db = getDatabase();
  
  // Get stats from database
  const stats = db.query(
    'SELECT * FROM server_stats_total WHERE guild_id = ?',
    [guildId]
  ).get();
  
  const guild = client.guilds.cache.get(guildId);
  
  res.json({
    guilds: client.guilds.cache.size,
    users: guild?.memberCount || 0,
    commands: stats?.total_commands || 0,
    uptime: '24h 15m',
    ping: client.ws.ping,
    memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)} MB`,
    cpu: '12%',
  });
});
```

## 🔐 Share Authentication

### Use Bot's Owner ID for Admin Access

```typescript
// In dashboard/server/index.ts
import { env } from '../src/config/env';

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Check if user is bot owner
  const isOwner = decoded.id === env.BOT_OWNER_ID;

  res.json({
    id: decoded.id,
    username: decoded.username,
    avatar: decoded.avatar,
    discriminator: decoded.discriminator,
    isOwner,
  });
});
```

## 🚀 Running Both Together

### Option 1: Separate Processes (Recommended for Development)

Terminal 1 - Run Bot:
```bash
cd D:\Bot-Discord-Demo
npm run dev
```

Terminal 2 - Run Dashboard:
```bash
cd D:\Bot-Discord-Demo\dashboard
npm run dev:all
```

### Option 2: Integrated Startup

Create a script to run both:

```typescript
// In D:\Bot-Discord-Demo\start-all.ts
import { spawn } from 'child_process';

// Start bot
const bot = spawn('bun', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
});

// Start dashboard
const dashboard = spawn('npm', ['run', 'dev:all'], {
  cwd: `${__dirname}/dashboard`,
  stdio: 'inherit',
});

// Handle cleanup
process.on('SIGINT', () => {
  bot.kill();
  dashboard.kill();
  process.exit(0);
});
```

## 📝 Environment Variables

Update your `.env` files:

### Main Bot (.env)
```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
BOT_OWNER_ID=your_user_id
# ... other bot env vars
```

### Dashboard (.env.local)
```env
DISCORD_CLIENT_ID=same_as_client_id_above
DISCORD_CLIENT_SECRET=from_discord_developer_portal
DISCORD_REDIRECT_URI=http://localhost:3001/api/auth/callback
JWT_SECRET=your_random_secret
# ... other dashboard env vars
```

## 🎯 Complete Example

See the full integration in action:

1. **Bot emits event:**
```typescript
client.on('guildMemberAdd', (member) => {
  broadcastToAll({
    type: 'member_join',
    data: { guild: member.guild.id, user: member.user },
  });
});
```

2. **Dashboard receives event:**
```typescript
// In dashboard/src/lib/websocket.ts
wsService.on('member_join', (data) => {
  console.log('New member joined:', data);
  // Update UI in real-time
});
```

3. **API updates database:**
```typescript
// In dashboard/server/index.ts
app.post('/api/welcome/:guildId', (req, res) => {
  const db = getDatabase();
  db.run('UPDATE join_config SET welcome_enabled = ? WHERE guild_id = ?',
    [req.body.enabled, req.params.guildId]);
  res.json({ success: true });
});
```

## ✅ Testing Integration

1. Start both bot and dashboard
2. Login to dashboard with Discord OAuth2
3. Join a server with the bot
4. Check if real-time events appear in dashboard
5. Test API endpoints from dashboard
6. Verify database changes persist

## 🐛 Common Issues

**Issue:** WebSocket connection refused
- **Solution:** Make sure both servers are running and ports are correct

**Issue:** Database locked
- **Solution:** Ensure only one process writes to SQLite at a time

**Issue:** Events not broadcasting
- **Solution:** Check that `broadcastToAll` is imported correctly

**Issue:** API returns 401
- **Solution:** Verify JWT token is being sent in Authorization header

---

For more help, check the main README or open an issue!
