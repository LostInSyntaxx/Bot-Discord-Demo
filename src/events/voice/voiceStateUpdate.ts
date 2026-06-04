import { VoiceState, MessageFlags, TextChannel } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';
import { ServerStatsService } from '@services/serverstats.service';

export default new (class VoiceStateUpdateEvent extends BaseEvent {
  constructor() {
    super({ name: 'voiceStateUpdate' });
  }

  async execute(client: ExtendedClient, oldState: VoiceState, newState: VoiceState): Promise<void> {
    const { LogService } = await import('@services/log.service');
    const { createLogContainer } = await import('@ui/containers/logContainer');
    const { Emoji } = await import('@config/emoji');

    const guild = newState.guild || oldState.guild;
    const user = newState.member?.user || oldState.member?.user;

    // ── Track voice activity for server stats ─────────────────────────
    const statsService = client.services.get('ServerStatsService') as ServerStatsService;
    if (statsService && guild && user) {
      // User joined voice channel
      if (!oldState.channelId && newState.channelId) {
        await statsService.trackVoiceJoin(guild.id, user.id);
      }
      // User left voice channel
      else if (oldState.channelId && !newState.channelId) {
        await statsService.trackVoiceLeave(guild.id, user.id);
      }
      // User moved between channels
      else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        // Track leave from old channel
        await statsService.trackVoiceLeave(guild.id, user.id);
        // Track join to new channel
        await statsService.trackVoiceJoin(guild.id, user.id);
      }
    }

    const logChannelId = LogService.getLogChannel(guild.id);
    if (!logChannelId) return;

    const logChannel = guild.channels.cache.get(logChannelId) as TextChannel;
    if (!logChannel) return;

    if (!user) return;

    // Detect action
    let title = '';
    let emoji = '';
    let details = '';
    const metadata: { name: string; value: string }[] = [];

    // 1. Joined a channel
    if (!oldState.channelId && newState.channelId) {
      title = 'VOICE CHANNEL JOINED';
      emoji = Emoji.ArrowUp || '🔊';
      details = `**${user.tag}** joined voice channel <#${newState.channelId}>`;
    }
    // 2. Left a channel
    else if (oldState.channelId && !newState.channelId) {
      title = 'VOICE CHANNEL LEFT';
      emoji = Emoji.ArrowDown || '🔇';
      details = `**${user.tag}** left voice channel <#${oldState.channelId}>`;
    }
    // 3. Moved between channels
    else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      title = 'VOICE CHANNEL MOVED';
      emoji = Emoji.ArrowRight || '↔️';
      details = `**${user.tag}** moved from <#${oldState.channelId}> to <#${newState.channelId}>`;
    }
    else {
      // Other changes like mute/deafen - we can ignore or add later
      return;
    }

    await logChannel.send({
      components: [
        createLogContainer(title, emoji, details, metadata)
      ],
      flags: MessageFlags.IsComponentsV2,
    }).catch(() => null);
  }
})();
