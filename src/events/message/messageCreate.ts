import { Message, MessageFlags, TextChannel } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';
import { LevelingService } from '@services/leveling.service';
import { ServerStatsService } from '@services/serverstats.service';
import { createLevelUpContainer } from '@ui/containers/levelContainer';

// Cooldown map to prevent XP spam (userId -> timestamp)
const xpCooldowns = new Map<string, number>();
const XP_COOLDOWN_MS = 60_000; // 1 minute
const XP_MIN = 15;
const XP_MAX = 25;

export default new (class MessageCreateEvent extends BaseEvent {
  constructor() {
    super({ name: 'messageCreate' });
  }

  async execute(client: ExtendedClient, message: Message): Promise<void> {
    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    // ── Track message for server stats ─────────────────────────
    const statsService = client.services.get('ServerStatsService') as ServerStatsService;
    if (statsService) {
      await statsService.trackMessage(guildId);
    }

    // ── Leveling XP ───────────────────────────────────────────
    const config = LevelingService.getConfig(guildId);
    if (!config || config.enabled) {
      const cooldownKey = `${guildId}:${userId}`;
      const now = Date.now();
      const lastXp = xpCooldowns.get(cooldownKey) ?? 0;

      if (now - lastXp >= XP_COOLDOWN_MS) {
        xpCooldowns.set(cooldownKey, now);
        const xpGain = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
        const newLevel = LevelingService.addXp(guildId, userId, xpGain);

        if (newLevel !== null) {
          // Send level-up message
          const channelId = config?.channel_id ?? message.channel.id;
          const channel = message.guild.channels.cache.get(channelId) as TextChannel | undefined
            ?? message.channel as TextChannel;

          await channel.send({
            components: [createLevelUpContainer(message.author, newLevel)],
            flags: MessageFlags.IsComponentsV2,
          }).catch(() => null);
        }
      }
    }
  }
})();
