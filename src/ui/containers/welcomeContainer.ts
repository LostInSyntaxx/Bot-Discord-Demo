import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  GuildMember,
} from 'discord.js';
import { Emoji } from '@config/emoji';

export function createWelcomeContainer(member: GuildMember, message: string): ContainerBuilder {
  const joinedAt = member.joinedAt
    ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`
    : 'just now';

  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Success} Welcome to ${member.guild.name}!`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(message)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `${Emoji.User} **Member:** ${member.user.tag}\n` +
          `${Emoji.Clock} **Joined:** ${joinedAt}\n` +
          `${Emoji.User} **Member #${member.guild.memberCount}**`
        )
    );
}

export function createWelcomeConfigContainer(
  channelId: string | null,
  message: string,
  enabled: boolean
): ContainerBuilder {
  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Settings} Welcome System Config`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `**Status:** ${enabled ? `${Emoji.Success} Enabled` : `${Emoji.Error} Disabled`}\n` +
          `**Channel:** ${channelId ? `<#${channelId}>` : 'Not set'}\n` +
          `**Message:** ${message}`
        )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `**Variables:**\n` +
          `\`{user}\` — mentions the new member\n` +
          `\`{server}\` — server name`
        )
    );
}
