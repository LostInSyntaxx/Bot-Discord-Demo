import { GuildMember, MessageFlags, TextChannel } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';
import { AutoRoleService } from '@services/autorole.service';
import { WelcomeService } from '@services/welcome.service';
import { JoinService } from '@services/join.service';
import { ServerStatsService } from '@services/serverstats.service';
import { ServerMembersService } from '@services/servermembers.service';
import { VoiceStatsService } from '@services/voicestats.service';
import { createWelcomeContainer } from '@ui/containers/welcomeContainer';

export default new (class GuildMemberAddEvent extends BaseEvent {
  constructor() {
    super({ name: 'guildMemberAdd' });
  }

  async execute(client: ExtendedClient, member: GuildMember): Promise<void> {
    // ── Enhanced Join System ───────────────────────────────────────
    // Log the join
    JoinService.logJoin(member);

    // Send welcome message to channel
    await JoinService.sendWelcomeMessage(member);

    // Send DM welcome
    await JoinService.sendDMWelcome(member);

    // Assign auto-role
    await JoinService.assignAutoRole(member);

    // ── Track member count for server stats ─────────────────────────
    const statsService = client.services.get('ServerStatsService') as ServerStatsService;
    if (statsService) {
      await statsService.updateMemberCount(member.guild.id, member.guild.memberCount);
    }

    // ── Track member join for server members system ─────────────────
    const membersService = client.services.get('ServerMembersService') as ServerMembersService;
    if (membersService) {
      await membersService.trackMemberJoin(member.guild.id, member.id, member.guild.memberCount);
    }

    // ─ Update voice stats channels ─────────────────────────
    const voiceStatsService = client.services.get('VoiceStatsService') as VoiceStatsService;
    if (voiceStatsService) {
      await voiceStatsService.updateVoiceStats(member.guild.id);
    }

    // ── Invite Tracking ───────────────────────────────────────────
    const { InviteService } = await import('@services/invite.service');
    const inviteService = client.services.get('InviteService');
    let inviterTag = 'Unknown';

    if (inviteService) {
      try {
        const cachedInvites = inviteService.getCache(member.guild.id);
        const currentInvites = await member.guild.invites.fetch();
        
        const usedInvite = currentInvites.find(inv => {
          const prevUses = cachedInvites?.get(inv.code) ?? 0;
          return (inv.uses ?? 0) > prevUses;
        });

        if (usedInvite) {
          inviterTag = usedInvite.inviter?.tag ?? 'Unknown';
          InviteService.addInvite(member.guild.id, usedInvite.inviter?.id ?? '');
          await inviteService.refreshGuild(member.guild.id);
        }
      } catch (error) {}
    }

    // ── Audit Logs ──────────────────────────────────────────────
    const { LogService } = await import('@services/log.service');
    const { createLogContainer } = await import('@ui/containers/logContainer');
    const { Emoji } = await import('@config/emoji');

    const logChannelId = LogService.getLogChannel(member.guild.id);
    if (logChannelId) {
      const logChannel = member.guild.channels.cache.get(logChannelId) as TextChannel;
      if (logChannel) {
        await logChannel.send({
          components: [
            createLogContainer(
              'MEMBER JOINED',
              Emoji.User,
              `**${member.user.tag}** has entered the server.`,
              [
                { name: 'User ID', value: member.id },
                { name: 'Account Age', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` },
                { name: 'Invited By', value: inviterTag }
              ]
            )
          ],
          flags: MessageFlags.IsComponentsV2,
        }).catch(() => null);
      }
    }

    // ── Welcome Message ────────────────────────────────────────
    const config = WelcomeService.getConfig(member.guild.id);
    if (!config || !config.enabled || !config.channel_id) return;

    const channel = member.guild.channels.cache.get(config.channel_id) as TextChannel | undefined;
    if (!channel) return;

    const message = WelcomeService.formatMessage(
      config.message,
      `<@${member.id}>`,
      member.guild.name
    );

    await channel.send({
      components: [createWelcomeContainer(member, message)],
      flags: MessageFlags.IsComponentsV2,
    }).catch(() => null);
  }
})();
