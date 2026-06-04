import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { WebSocket, WebSocketServer } from 'ws';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { Database } from 'bun:sqlite';

const app = express();
const PORT = process.env.PORT || 3001;

// Load .env.local manually if not loaded
const envPath = path.join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value && !process.env[key]) {
        process.env[key] = value;
        console.log(`  ✓ Loaded: ${key}`);
      }
    }
  }
}

// Discord Bot Client (will be set when bot starts)
let botClient: any = null;

// Function to set bot client (call this from bot's index.ts)
export function setBotClient(client: any) {
  botClient = client;
  console.log('✅ Bot client connected to API server');
}

// Function to get bot client
export function getBotClient() {
  return botClient;
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Environment variables
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/api/auth/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';

// Log loaded environment (for debugging)
console.log('\n🔧 Environment Variables:');
console.log(`  DISCORD_CLIENT_ID: ${DISCORD_CLIENT_ID ? '✓ Set' : '✗ Not set'}`);
console.log(`  DISCORD_REDIRECT_URI: ${DISCORD_REDIRECT_URI}`);
console.log(`  PORT: ${PORT}\n`);

// Database connection (shared with bot)
let db: any = null;
let dbError = false;

function getDatabase() {
  if (dbError) return null;
  
  if (!db) {
    try {
      // Try to use bun:sqlite if available
      const { Database } = require('bun:sqlite');
      
      // Try multiple possible paths for bot.db
      const possiblePaths = [
        path.join(process.cwd(), '..', 'bot.db'),     // from dashboard dir
        path.join(process.cwd(), 'bot.db'),           // from root
        path.join(__dirname, '../../bot.db'),         // from server dir
      ];
      
      let dbPath = '';
      for (const p of possiblePaths) {
        if (existsSync(p)) {
          dbPath = p;
          break;
        }
      }
      
      if (!dbPath) {
        console.log('⚠️  Database file not found - using bot API instead');
        dbError = true;
        return null;
      }
      
      console.log(`📂 Using database: ${dbPath}`);
      db = new Database(dbPath, { create: false });
    } catch (error: any) {
      console.log('⚠️  Cannot access database directly - using bot API instead');
      dbError = true;
      return null;
    }
  }
  return db;
}

// Discord OAuth2 URLs
const DISCORD_API = 'https://discord.com/api/v10';
const DISCORD_OAUTH2 = `${DISCORD_API}/oauth2/authorize`;

// In-memory storage (replace with database in production)
const activeConnections = new Map<string, WebSocket>();

// Utility: Verify JWT token
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Routes

// Auth - Redirect to Discord OAuth2
app.get('/api/auth/discord', (req, res) => {
  const scope = 'identify guilds';
  
  if (!DISCORD_CLIENT_ID) {
    console.error(' DISCORD_CLIENT_ID is not set in .env.local');
    return res.redirect('http://localhost:3000/login?error=no_client_id');
  }
  
  const url = `${DISCORD_OAUTH2}?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  console.log('🔗 Redirecting to Discord OAuth2...');
  res.redirect(url);
});

// Auth - Callback from Discord
app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    console.error(' OAuth2 callback: No code received');
    return res.redirect('http://localhost:3000/login?error=no_code');
  }

  try {
    console.log('🔄 Exchanging code for token...');
    
    // Exchange code for token
    const tokenResponse = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    } as any);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error(' Discord token exchange failed:', errorData);
      return res.redirect('http://localhost:3000/login?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token received successfully');

    // Get user info
    const userResponse = await fetch(`${DISCORD_API}/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    } as any);

    const user = await userResponse.json();
    console.log(`👤 User authenticated: ${user.username}#${user.discriminator}`);

    // Get user guilds
    const guildsResponse = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    } as any);

    const guilds = await guildsResponse.json();
    console.log(` User has access to ${guilds.length} guilds`);

    // Create JWT
    const jwtToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        discriminator: user.discriminator,
        accessToken: tokenData.access_token,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(' JWT token created, redirecting to dashboard...');
    // Redirect to dashboard with token
    res.redirect(`http://localhost:3000/dashboard?token=${jwtToken}`);
  } catch (error) {
    console.error(' OAuth error:', error);
    res.redirect('http://localhost:3000/login?error=auth_failed');
  }
});

// Get current user
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

  res.json({
    id: decoded.id,
    username: decoded.username,
    avatar: decoded.avatar,
    discriminator: decoded.discriminator,
  });
});

// Get user guilds
app.get('/api/guilds', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    // Fetch guilds from Discord API
    const response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${decoded.accessToken}`,
      },
    } as any);

    const guilds = await response.json();
    res.json(guilds);
  } catch (error) {
    console.error('Failed to fetch guilds:', error);
    res.status(500).json({ error: 'Failed to fetch guilds' });
  }
});

// Get bot stats - REAL DATA FROM BOT
app.get('/api/stats/bot', (req, res) => {
  if (!botClient) {
    return res.json({
      guilds: 0,
      users: 0,
      commands: 0,
      uptime: 'Bot not connected',
      ping: 0,
      memory: '0 MB',
      cpu: '0%',
    });
  }

  try {
    const uptime = botClient.uptime ? Math.floor(botClient.uptime / 1000) : 0;
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const memory = process.memoryUsage();
    const totalUsers = botClient.guilds.cache.reduce(
      (acc: number, guild: any) => acc + guild.memberCount,
      0
    );

    res.json({
      guilds: botClient.guilds.cache.size,
      users: totalUsers,
      commands: botClient.commands?.size || 0,
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      ping: botClient.ws.ping,
      memory: `${(memory.heapUsed / 1024 / 1024).toFixed(1)} MB`,
      cpu: 'N/A',
    });
  } catch (error) {
    console.error('Failed to get bot stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get guild stats - REAL DATA FROM BOT & DATABASE
app.get('/api/stats/guild/:guildId', (req, res) => {
  const { guildId } = req.params;
  
  try {
    // Get real guild data from bot
    const guild = botClient?.guilds.cache.get(guildId);
    
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }
    
    // Try to get stats from database if available
    const database = getDatabase();
    let stats = null;
    
    if (database) {
      try {
        stats = database.query(
          'SELECT * FROM server_stats_total WHERE guild_id = ?',
          [guildId]
        ).get();
      } catch (error) {
        console.log('Could not read from database, using bot data only');
      }
    }

    res.json({
      guilds: botClient?.guilds.cache.size || 0,
      users: guild.memberCount || 0,
      commands: stats?.total_commands || 0,
      messages: stats?.total_messages || 0,
      uptime: botClient?.uptime ? `${Math.floor(botClient.uptime / 3600000)}h` : '0h',
      ping: botClient?.ws.ping || 0,
      memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
      cpu: 'N/A',
    });
  } catch (error) {
    console.error('Failed to get guild stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Music endpoints - REAL DATA FROM SHOUKAKU
app.get('/api/music/:guildId', (req, res) => {
  const { guildId } = req.params;
  
  if (!botClient || !botClient.shoukaku) {
    return res.json({
      currentTrack: null,
      queue: [],
      volume: 100,
      isPlaying: false,
    });
  }

  try {
    const player = botClient.shoukaku.players.get(guildId);
    
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
      queue: player.queue.map((track: any) => ({
        title: track.info.title,
        author: track.info.author,
        duration: track.info.length,
        uri: track.info.uri,
      })),
      volume: player.volume || 100,
      isPlaying: player.playing || false,
    });
  } catch (error) {
    console.error('Failed to get music status:', error);
    res.status(500).json({ error: 'Failed to get music status' });
  }
});

app.post('/api/music/:guildId/:action', async (req, res) => {
  const { guildId, action } = req.params;
  const data = req.body;

  if (!botClient || !botClient.shoukaku) {
    return res.status(503).json({ error: 'Music system not available' });
  }

  try {
    const player = botClient.shoukaku.players.get(guildId);
    
    if (!player && action !== 'search') {
      return res.status(404).json({ error: 'No active player' });
    }

    switch (action) {
      case 'play':
        player?.setPaused(false);
        break;
      case 'pause':
        player?.setPaused(true);
        break;
      case 'skip':
        player?.stopTrack();
        break;
      case 'stop':
        player?.disconnect();
        break;
      case 'volume':
        if (data.volume !== undefined) {
          player?.setVolume(data.volume);
        }
        break;
      case 'search':
        // Search is handled by the bot command
        console.log(`Search query: ${data.query}`);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Broadcast update to dashboard
    broadcastToAll({
      type: 'music_update',
      data: { guild: guildId, action },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Music action failed:', error);
    res.status(500).json({ error: 'Failed to perform action' });
  }
});

// Moderation endpoints
app.get('/api/moderation/:guildId', (req, res) => {
  try {
    const database = getDatabase();
    // You can add a moderation_config table to store these settings
    // For now, returning default config
    res.json({
      antiSpam: true,
      antiLinks: false,
      antiBadWords: true,
      maxMessages: 5,
      timeWindow: 5,
      punishment: 'warn',
      modRoles: [],
      ignoredChannels: [],
    });
  } catch (error) {
    console.error('Failed to get moderation config:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
});

app.put('/api/moderation/:guildId', (req, res) => {
  const { guildId } = req.params;
  const config = req.body;

  try {
    // Save to database
    const database = getDatabase();
    // You can add a moderation_config table
    console.log(`Update moderation config for guild ${guildId}:`, config);

    res.json({ success: true, config });
  } catch (error) {
    console.error('Failed to update moderation config:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// Welcome endpoints
app.get('/api/welcome/:guildId', (req, res) => {
  try {
    const database = getDatabase();
    
    const config = database.query(
      'SELECT * FROM join_config WHERE guild_id = ?',
      [req.params.guildId]
    ).get();

    if (!config) {
      return res.json({
        welcomeChannel: null,
        welcomeMessage: 'Welcome {user} to {server}! You are member #{count}.',
        welcomeEnabled: false,
        dmWelcome: 'Welcome to {server}! Enjoy your stay!',
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
  } catch (error) {
    console.error('Failed to get welcome config:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
});

app.put('/api/welcome/:guildId', (req, res) => {
  const { guildId } = req.params;
  const config = req.body;

  try {
    const database = getDatabase();
    
    database.run(`
      INSERT INTO join_config (
        guild_id, welcome_channel, welcome_message, welcome_enabled,
        dm_welcome, dm_enabled, auto_role_id, auto_role_enabled,
        join_counter, show_member_count, last_updated
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, datetime('now'))
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

    console.log(`Updated welcome config for guild ${guildId}`);
    res.json({ success: true, config });
  } catch (error) {
    console.error('Failed to update welcome config:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// Auto Role endpoints
app.get('/api/autorole/:guildId', (req, res) => {
  try {
    const database = getDatabase();
    
    const config = database.query(
      'SELECT * FROM auto_roles WHERE guild_id = ?',
      [req.params.guildId]
    ).all();

    res.json({
      enabled: config.length > 0,
      roles: config.map((r: any) => r.role_id),
    });
  } catch (error) {
    console.error('Failed to get autorole config:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
});

app.put('/api/autorole/:guildId', (req, res) => {
  const { guildId } = req.params;
  const config = req.body;

  try {
    const database = getDatabase();
    
    // Clear existing roles
    database.run('DELETE FROM auto_roles WHERE guild_id = ?', [guildId]);
    
    // Insert new roles
    if (config.roles && Array.isArray(config.roles)) {
      const stmt = database.prepare(
        'INSERT INTO auto_roles (guild_id, role_id) VALUES (?, ?)'
      );
      for (const roleId of config.roles) {
        stmt.run(guildId, roleId);
      }
    }

    console.log(`Updated autorole config for guild ${guildId}`);
    res.json({ success: true, config });
  } catch (error) {
    console.error('Failed to update autorole config:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// Logs endpoints
app.get('/api/logs/:guildId', (req, res) => {
  try {
    const database = getDatabase();
    const limit = parseInt(req.query.limit as string) || 50;
    
    const logs = database.query(
      'SELECT * FROM moderation_history WHERE target = ? ORDER BY timestamp DESC LIMIT ?',
      [req.params.guildId, limit]
    ).all();

    res.json(logs.map((log: any) => ({
      id: log.id,
      action: log.action,
      target: log.target,
      moderator: log.admin,
      reason: log.reason,
      timestamp: log.timestamp,
      type: log.action.toLowerCase(),
    })));
  } catch (error) {
    console.error('Failed to get logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

app.get('/api/logs/:guildId/config', (req, res) => {
  try {
    const database = getDatabase();
    
    const config = database.query(
      'SELECT * FROM log_config WHERE guild_id = ?',
      [req.params.guildId]
    ).get();

    if (!config) {
      return res.json({
        enabled: false,
        logChannel: null,
        logEvents: [],
      });
    }

    res.json({
      enabled: true,
      logChannel: config.channel_id,
      logEvents: JSON.parse(config.events || '[]'),
    });
  } catch (error) {
    console.error('Failed to get logs config:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
});

app.put('/api/logs/:guildId', (req, res) => {
  const { guildId } = req.params;
  const config = req.body;

  try {
    const database = getDatabase();
    
    database.run(`
      INSERT INTO log_config (guild_id, channel_id, events)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        channel_id = excluded.channel_id,
        events = excluded.events
    `, [
      guildId,
      config.logChannel,
      JSON.stringify(config.logEvents || []),
    ]);

    console.log(`Updated logs config for guild ${guildId}`);
    res.json({ success: true, config });
  } catch (error) {
    console.error('Failed to update logs config:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// WebSocket Server for real-time updates
const server = app.listen(PORT, () => {
  console.log(`✅ API Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'auth') {
        const decoded = verifyToken(data.token);
        if (decoded) {
          activeConnections.set(decoded.id, ws);
          ws.send(JSON.stringify({ type: 'authenticated' }));
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    activeConnections.forEach((client, userId) => {
      if (client === ws) {
        activeConnections.delete(userId);
      }
    });
  });
});

// Broadcast function for real-time updates
export function broadcastToUser(userId: string, data: any) {
  const ws = activeConnections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export function broadcastToAll(data: any) {
  activeConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

export default app;
