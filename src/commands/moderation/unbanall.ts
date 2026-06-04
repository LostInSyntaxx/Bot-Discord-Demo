import { ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createModerationSuccessContainer, createModerationErrorContainer } from '@ui/containers/moderationContainer';
import { createLoadingContainer } from '@ui/containers/loadingContainer';

export default new (class UnbanAllCommand extends BaseCommand {
  constructor() {
    super({
      name: 'unbanall',
      description: 'Unban all banned members from the server',
      category: 'moderation',
      cooldown: 60,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.Administrator],
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.reply({
        components: [createLoadingContainer('Processing unban all...')],
        flags: MessageFlags.IsComponentsV2,
      });
      
      const bans = await interaction.guild?.bans.fetch();
      
      if (!bans || bans.size === 0) {
        await interaction.editReply({
          components: [createModerationErrorContainer('No Bans Found', 'There are no banned users in this server.')],
        });
        return;
      }

      let count = 0;
      for (const [userId, _] of bans) {
        try {
          await interaction.guild?.members.unban(userId, `Unbanall command executed by ${interaction.user.tag}`);
          count++;
        } catch (e) {
          // Continue if a specific unban fails
        }
      }

      await interaction.editReply({
        components: [createModerationSuccessContainer('All Members Unbanned', `${count} users`, [
          { name: 'Total Unbanned', value: count.toString() },
          { name: 'Moderator', value: interaction.user.tag },
        ])],
      });
    } catch (error) {
      try {
         await interaction.editReply({
          components: [createModerationErrorContainer('UnbanAll Failed', 'Failed to unban all members.')],
        });
      } catch {
        await interaction.reply({
          components: [createModerationErrorContainer('UnbanAll Failed', 'Failed to unban all members.')],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        }).catch(() => null);
      }
    }
  }
})();
