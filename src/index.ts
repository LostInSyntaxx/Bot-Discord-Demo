import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { env } from '@config/env';
import { loadCommands } from '@handlers/commandHandler';
import { loadEvents } from '@handlers/eventHandler';
import { loadComponents } from '@handlers/componentHandler';
import { getDatabase } from '@services/database.service';
import { initShoukaku } from '@services/music.service';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
  ],
}) as ExtendedClient;

// Initialize collections
client.commands = new Collection();
client.components = {
  buttons: new Collection(),
  modals: new Collection(),
  selectMenus: new Collection(),
};
client.cooldowns = new Collection();
client.services = new Collection();

// Initialize bot
async function initialize() {
  try {
    console.log('🚀 Starting Discord Bot...\n');

    // Initialize database
    getDatabase();

    // Load handlers
    await loadCommands(client);
    await loadEvents(client);
    await loadComponents(client);

    // Init Lavalink (Shoukaku) — must be after client is created, before login
    initShoukaku(client);

    // Initialize Services
    const { InviteService } = await import('@services/invite.service');
    const { GiveawayService } = await import('@services/giveaway.service');
    const { ServerStatsService } = await import('@services/serverstats.service');
    const { ServerMembersService } = await import('@services/servermembers.service');
    const { VoiceStatsService } = await import('@services/voicestats.service');
    
    const inviteService = new InviteService(client);
    const giveawayService = new GiveawayService(client);
    const serverStatsService = new ServerStatsService(client);
    const serverMembersService = new ServerMembersService(client);
    const voiceStatsService = new VoiceStatsService(client);
    
    await inviteService.initialize();
    await giveawayService.initialize();
    await serverStatsService.initialize();
    await serverMembersService.initialize();
    await voiceStatsService.initialize();
    
    client.services.set('InviteService', inviteService);
    client.services.set('GiveawayService', giveawayService);
    client.services.set('ServerStatsService', serverStatsService);
    client.services.set('ServerMembersService', serverMembersService);
    client.services.set('VoiceStatsService', voiceStatsService);

    // Login to Discord
    await client.login(env.DISCORD_TOKEN);
  } catch (error) {
    console.error('❌ Failed to initialize bot:', error);
    process.exit(1);
  }
}

// Handle process events
process.on('unhandledRejection', (error: Error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Start the bot
initialize();

export { client };
