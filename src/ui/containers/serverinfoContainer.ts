import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, Guild } from 'discord.js';
import { Emoji } from '@config/emoji';
import { formatTimestamp } from '@utils/formatUptime';

export function createServerinfoContainer(guild: Guild) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Server} ${guild.name}\n${guild.description || 'Server information and statistics'}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Crown} Owner**\n<@${guild.ownerId}>`),
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Calendar} Created**\n${formatTimestamp(guild.createdAt, 'R')}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**${Emoji.User} Members**\n**${guild.memberCount}** members`),
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Info} Channels**\n**${guild.channels.cache.size}** channels`),
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Shield} Roles**\n**${guild.roles.cache.size}** roles`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Star} Boost Status**\nLevel **${guild.premiumTier}** • **${guild.premiumSubscriptionCount || 0}** boosts`),
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Image} Emojis**\n**${guild.emojis.cache.size}** custom emojis`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Info} Server ID: \`${guild.id}\``)
    );

  return container;
}
