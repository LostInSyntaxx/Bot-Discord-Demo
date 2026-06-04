import { ActivityType } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';

export default new (class ReadyEvent extends BaseEvent {
  constructor() {
    super({
      name: 'clientReady',
      once: true,
    });
  }

  async execute(client: ExtendedClient): Promise<void> {
    // Fetch application emojis so they can be used across all servers
    const appEmojis = await client.application?.emojis.fetch();
    console.log(`📦 Application Emojis loaded: ${appEmojis?.size ?? 0}`);
    appEmojis?.forEach(e => console.log(`  - ${e.name}: ${e.id} → ${e.toString()}`));

    console.log('\n╔════════════════════════════════════════╗');
    console.log(`║  ✅ Bot is ready!                      ║`);
    console.log(`║  👤 Logged in as: ${client.user?.tag?.padEnd(18)} ║`);
    console.log(`║  🏰 Servers: ${client.guilds.cache.size.toString().padEnd(26)} ║`);
    console.log(`║  👥 Users: ${client.users.cache.size.toString().padEnd(28)} ║`);
    console.log(`║  📝 Commands: ${client.commands.size.toString().padEnd(25)} ║`);
    console.log(`║  🔌 Dashboard API: ${'Connected'.padEnd(20)} ║`);
    console.log('╚════════════════════════════════════════╝\n');

    // Connect to Dashboard API
    try {
      const { setBotClient, broadcastToAll } = await import('../../../dashboard/server/index');
      setBotClient(client);
      console.log('✅ Dashboard API connected - Real-time data enabled');
      
      // Broadcast bot ready event to dashboard
      broadcastToAll({
        type: 'bot_ready',
        data: {
          user: client.user?.tag,
          guilds: client.guilds.cache.size,
          users: client.users.cache.size,
          commands: client.commands.size,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.log('⚠️  Dashboard API not available (run dashboard separately)');
    }

    // Set bot activity
    client.user?.setPresence({
      activities: [
        {
          name: '/help | Discord.js v14',
          type: ActivityType.Playing,
        },
      ],
      status: 'online',
    });

    // Rotate activities every 30 seconds
    const activities = [
      { name: '/help | Discord.js v14', type: ActivityType.Playing },
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
      { name: `${client.users.cache.size} users`, type: ActivityType.Listening },
    ];

    let currentActivity = 0;
    setInterval(() => {
      currentActivity = (currentActivity + 1) % activities.length;
      client.user?.setActivity(activities[currentActivity]);
    }, 30000);

    // ── Voice Stats Periodic Refresh ─────────────────────────
    const { VoiceStatsService } = await import('@services/voicestats.service');
    const voiceStatsService = client.services.get('VoiceStatsService') as VoiceStatsService;
    
    if (voiceStatsService) {
      // Refresh voice stats every 5 minutes
      setInterval(async () => {
        try {
          const guilds = client.guilds.cache;
          for (const guild of guilds.values()) {
            await voiceStatsService.updateVoiceStats(guild.id);
          }
        } catch (error) {
          console.error('Error refreshing voice stats:', error);
        }
      }, 5 * 60 * 1000); // 5 minutes
      
      console.log('✅ Voice stats auto-refresh enabled (every 5 minutes)');
    }
  }
})();
