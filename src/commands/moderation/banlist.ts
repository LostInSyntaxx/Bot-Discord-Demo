import { ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createModerationErrorContainer } from '@ui/containers/moderationContainer';
import { createLoadingContainer } from '@ui/containers/loadingContainer';
import { Emoji, Moderation, Utility } from '@config/emoji';

export default new (class BanListCommand extends BaseCommand {
  constructor() {
    super({
      name: 'banlist',
      description: 'List all banned members in the server',
      category: 'moderation',
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.reply({
        components: [createLoadingContainer('Fetching ban list...')],
        flags: MessageFlags.IsComponentsV2,
      });
      
      const bans = await interaction.guild?.bans.fetch();
      
      if (!bans || bans.size === 0) {
        await interaction.editReply({
          components: [createModerationErrorContainer('No Bans', 'There are no banned users in this server.')],
        });
        return;
      }

      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# ${Moderation.BanHammer || '🔨'} Banned Users List\nTotal bans: **${bans.size}**`)
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

      let contentList = '';
      let count = 0;
      
      for (const [userId, banInfo] of bans) {
        count++;
        if (count > 15) {
          contentList += `\n...and ${bans.size - 15} more.`;
          break;
        }
        contentList += `> **${banInfo.user.tag}** (\`${banInfo.user.id}\`)\n> ${Utility.Search || '📝'} Reason: ${banInfo.reason || 'No reason provided'}\n\n`;
      }

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(contentList.trim())
      );

      container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`-# ${Emoji.Info || 'ℹ️'} List requested by ${interaction.user.tag} • ${new Date().toLocaleTimeString()}`)
        );

      await interaction.editReply({
        components: [container],
      });

    } catch (error) {
      try {
        await interaction.editReply({
          components: [createModerationErrorContainer('Error', 'Failed to fetch the ban list.')],
        });
      } catch {
        // Fallback if interaction not replied
        await interaction.reply({
          components: [createModerationErrorContainer('Error', 'Failed to fetch the ban list.')],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        }).catch(() => null);
      }
    }
  }
})();
