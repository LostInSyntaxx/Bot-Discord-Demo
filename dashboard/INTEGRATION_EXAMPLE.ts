/**
 * INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate the dashboard with your Discord bot.
 * You can use these examples in your src/index.ts file.
 */

// ==========================================
// 1. IMPORT WEBSOCKET FUNCTIONS
// ==========================================

// Import broadcast functions from dashboard server
import { broadcastToAll, broadcastToUser } from '../dashboard/server/index';

// ==========================================
// 2. REAL-TIME EVENTS
// ==========================================

// Member Join Event
client.on('guildMemberAdd', (member) => {
  console.log(`✅ ${member.user.tag} joined ${member.guild.name}`);
  
  // Broadcast to dashboard
  broadcastToAll({
    type: 'member_join',
    data: {
      guild: {
        id: member.guild.id,
        name: member.guild.name,
      },
      user: {
        id: member.user.id,
        username: member.user.username,
        avatar: member.user.avatar,
        tag: member.user.tag,
      },
      memberCount: member.guild.memberCount,
      timestamp: new Date().toISOString(),
    },
  });
});

// Member Leave Event
client.on('guildMemberRemove', (member) => {
  console.log(`❌ ${member.user.tag} left ${member.guild.name}`);
  
  broadcastToAll({
    type: 'member_leave',
    data: {
      guild: {
        id: member.guild.id,
        name: member.guild.name,
      },
      user: {
        id: member.user.id,
        username: member.user.username,
        avatar: member.user.avatar,
        tag: member.user.tag,
      },
      memberCount: member.guild.memberCount,
      timestamp: new Date().toISOString(),
    },
  });
});

// Message Create Event
client.on('messageCreate', (message) => {
  // Ignore bot messages
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

// Voice State Update
client.on('voiceStateUpdate', (oldState, newState) => {
  // User joined voice channel
  if (!oldState.channelId && newState.channelId) {
    broadcastToAll({
      type: 'voice_join',
      data: {
        guild: newState.guild.id,
        channel: newState.channelId,
        channelName: newState.channel?.name,
        user: {
          id: newState.user.id,
          username: newState.user.username,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }
  
  // User left voice channel
  if (oldState.channelId && !newState.channelId) {
    broadcastToAll({
      type: 'voice_leave',
      data: {
        guild: oldState.guild.id,
        channel: oldState.channelId,
        user: {
          id: oldState.user.id,
          username: oldState.user.username,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Ban Event
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

// Unban Event
client.on('guildBanRemove', (ban) => {
  broadcastToAll({
    type: 'moderation_unban',
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

// ==========================================
// 3. MUSIC EVENTS (SHOUKAKU)
// ==========================================

// When bot connects to Lavalink
client.shoukaku.on('ready', (name) => {
  console.log(`Lavalink ${name} ready!`);
  
  broadcastToAll({
    type: 'lavalink_ready',
    data: {
      name,
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
      track: {
        title: track.info.title,
        author: track.info.author,
        uri: track.info.uri,
        duration: track.info.length,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

// Music track end
client.shoukaku.on('trackEnd', (player, track) => {
  broadcastToAll({
    type: 'music_track_end',
    data: {
      guild: player.guildId,
      track: {
        title: track.info.title,
        author: track.info.author,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

// Music queue ended
client.shoukaku.on('queueEnd', (player) => {
  broadcastToAll({
    type: 'music_queue_end',
    data: {
      guild: player.guildId,
      timestamp: new Date().toISOString(),
    },
  });
});

// ==========================================
// 4. COMMAND TRACKING
// ==========================================

// Track command usage (add this in your interaction handler)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const commandName = interaction.commandName;
  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  
  console.log(`Command /${commandName} used by ${interaction.user.tag}`);
  
  // Broadcast to dashboard
  broadcastToAll({
    type: 'command_used',
    data: {
      guild: guildId,
      user: {
        id: userId,
        username: interaction.user.username,
      },
      command: commandName,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Update database command count
  const { getDatabase } = await import('@services/database.service');
  const db = getDatabase();
  
  db.run(`
    INSERT INTO server_stats (guild_id, date, command_count)
    VALUES (?, date('now'), 1)
    ON CONFLICT(guild_id, date) DO UPDATE SET
      command_count = command_count + 1
  `, [guildId]);
  
  db.run(`
    INSERT INTO server_stats_total (guild_id, total_commands, last_updated)
    VALUES (?, 1, datetime('now'))
    ON CONFLICT(guild_id) DO UPDATE SET
      total_commands = total_commands + 1,
      last_updated = datetime('now')
  `, [guildId]);
});

// ==========================================
// 5. MESSAGE TRACKING
// ==========================================

client.on('messageCreate', (message) => {
  if (message.author.bot || !message.guildId) return;
  
  const { getDatabase } = require('@services/database.service');
  const db = getDatabase();
  
  // Update daily message count
  db.run(`
    INSERT INTO server_stats (guild_id, date, message_count)
    VALUES (?, date('now'), 1)
    ON CONFLICT(guild_id, date) DO UPDATE SET
      message_count = message_count + 1
  `, [message.guildId]);
  
  // Update total message count
  db.run(`
    INSERT INTO server_stats_total (guild_id, total_messages, last_updated)
    VALUES (?, 1, datetime('now'))
    ON CONFLICT(guild_id) DO UPDATE SET
      total_messages = total_messages + 1,
      last_updated = datetime('now')
  `, [message.guildId]);
});

// ==========================================
// 6. BOT STATUS ENDPOINT
// ==========================================

// Add this to your dashboard/server/index.ts
/*
app.get('/api/stats/bot', (req, res) => {
  const uptime = client.uptime ? Math.floor(client.uptime / 1000) : 0;
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor((uptime % 3600) % 60);
  
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();
  
  res.json({
    guilds: client.guilds.cache.size,
    users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
    commands: 0, // Get from your command service
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    ping: client.ws.ping,
    memory: `${(memory.heapUsed / 1024 / 1024).toFixed(0)} MB`,
    cpu: `${(cpu.system / 1000000).toFixed(1)}%`,
  });
});
*/

// ==========================================
// 7. RUNNING BOTH BOT AND DASHBOARD
// ==========================================

/*
Option 1: Run separately (Recommended for development)

Terminal 1 - Run Bot:
cd D:\Bot-Discord-Demo
bun run dev

Terminal 2 - Run Dashboard:
cd D:\Bot-Discord-Demo\dashboard
npm run dev:all


Option 2: Create a combined start script

Create file: start-all.ts
*/

import { spawn } from 'child_process';

function startAll() {
  console.log('🚀 Starting Bot and Dashboard...\n');
  
  // Start Discord Bot
  const bot = spawn('bun', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  });
  
  bot.on('error', (err) => {
    console.error('❌ Bot failed to start:', err);
  });
  
  // Start Dashboard
  const dashboard = spawn('npm', ['run', 'dev:all'], {
    cwd: `${__dirname}/dashboard`,
    stdio: 'inherit',
    shell: true,
  });
  
  dashboard.on('error', (err) => {
    console.error('❌ Dashboard failed to start:', err);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    bot.kill();
    dashboard.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down...');
    bot.kill();
    dashboard.kill();
    process.exit(0);
  });
}

// Uncomment to run both:
// startAll();

// ==========================================
// 8. DASHBOARD API INTEGRATION EXAMPLES
// ==========================================

/*
Example: Get welcome config from database

import { getDatabase } from '@services/database.service';

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
    });
  }
  
  res.json({
    welcomeChannel: config.welcome_channel,
    welcomeMessage: config.welcome_message,
    welcomeEnabled: Boolean(config.welcome_enabled),
  });
});


Example: Update welcome config

app.put('/api/welcome/:guildId', (req, res) => {
  const db = getDatabase();
  const { guildId } = req.params;
  const config = req.body;
  
  db.run(`
    INSERT INTO join_config (guild_id, welcome_channel, welcome_message, welcome_enabled)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET
      welcome_channel = excluded.welcome_channel,
      welcome_message = excluded.welcome_message,
      welcome_enabled = excluded.welcome_enabled
  `, [
    guildId,
    config.welcomeChannel,
    config.welcomeMessage,
    config.welcomeEnabled ? 1 : 0,
  ]);
  
  res.json({ success: true });
});
*/

// ==========================================
// 9. ENVIRONMENT VARIABLES
// ==========================================

/*
Main Bot (.env):
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
BOT_OWNER_ID=your_user_id

Dashboard (.env.local):
DISCORD_CLIENT_ID=same_as_client_id
DISCORD_CLIENT_SECRET=from_discord_developer_portal
DISCORD_REDIRECT_URI=http://localhost:3001/api/auth/callback
JWT_SECRET=your_random_secret_minimum_32_chars
PORT=3001
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
*/

// ==========================================
// 10. TESTING THE INTEGRATION
// ==========================================

/*
1. Start both bot and dashboard
2. Login to dashboard at http://localhost:3000
3. Select a server from the dropdown
4. Test real-time events:
   - Have someone join the server
   - Send a message
   - Play music
   - Use a command
5. Check if events appear in dashboard in real-time
6. Test API endpoints:
   - Update welcome message
   - Check if changes persist
   - Verify database is updated
*/

console.log('✅ Integration examples loaded!');
console.log('📖 Check INTEGRATION.md for full documentation');
