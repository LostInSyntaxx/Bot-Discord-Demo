import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, GuildMember, User } from 'discord.js';
import { Emoji } from '@config/emoji';
import { formatTimestamp } from '@utils/formatUptime';

export function createUserinfoContainer(user: User, member: GuildMember) {
  const roles = member.roles.cache
    .filter((role) => role.id !== member.guild.id)
    .sort((a, b) => b.position - a.position)
    .map((role) => role.toString())
    .slice(0, 10);

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.User} User Information\nDetailed information about **${user.tag}**`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**Username**\n${user.tag}`),
      new TextDisplayBuilder()
        .setContent(`**User ID**\n\`${user.id}\``)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Calendar} Account Created**\n${formatTimestamp(user.createdAt, 'R')}`),
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Server} Joined Server**\n${member.joinedAt ? formatTimestamp(member.joinedAt, 'R') : 'Unknown'}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Shield} Roles [${roles.length}]**\n${roles.length > 0 ? roles.join(', ') : 'No roles'}`)
    );

  return container;
}
