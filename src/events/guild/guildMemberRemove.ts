import { GuildMember, MessageFlags, TextChannel } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';
import { ServerStatsService } from '@services/serverstats.service';
import { ServerMembersService } from '@services/servermembers.service';
import { VoiceStatsService } from '@services/voicestats.service';

export default new (class GuildMemberRemoveEvent extends BaseEvent {
  constructor() {
    super({ name: 'guildMemberRemove' });
  }

  async execute(client: ExtendedClient, member: GuildMember): Promise<void> {
    // ── Track member count for server stats ─────────────────────────
    const statsService = client.services.get('ServerStatsService') as ServerStatsService;
    if (statsService) {
      await statsService.updateMemberCount(member.guild.id, member.guild.memberCount);
    }

    // ── Track member leave for server members system ─────────────────
    const membersService = client.services.get('ServerMembersService') as ServerMembersService;
    if (membersService) {
      await membersService.trackMemberLeave(member.guild.id, member.id, member.guild.memberCount);
    }

    // ─ Update voice stats channels ─────────────────────────
    const voiceStatsService = client.services.get('VoiceStatsService') as VoiceStatsService;
    if (voiceStatsService) {
      await voiceStatsService.updateVoiceStats(member.guild.id);
    }

    const { LogService } = await import('@services/log.service');
    const { createLogContainer } = await import('@ui/containers/logContainer');
    const { Emoji } = await import('@config/emoji');

    const logChannelId = LogService.getLogChannel(member.guild.id);
    if (!logChannelId) return;

    const logChannel = member.guild.channels.cache.get(logChannelId) as TextChannel;
    if (!logChannel) return;

    // Get roles for the metadata
    const roles = member.roles.cache
      .filter(r => r.name !== '@everyone')
      .map(r => r.name)
      .join(', ') || 'None';

    await logChannel.send({
      components: [
        createLogContainer(
          'MEMBER LEFT',
          Emoji.Cross || '❌',
          `**${member.user.tag}** has left the server.`,
          [
            { name: 'User ID', value: member.id },
            { name: 'Joined At', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>` : 'Unknown' },
            { name: 'Roles held', value: roles }
          ]
        )
      ],
      flags: MessageFlags.IsComponentsV2,
    }).catch(() => null);
  }
})();
