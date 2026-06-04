import { ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createModerationSuccessContainer, createModerationErrorContainer } from '@ui/containers/moderationContainer';
import { createLoadingContainer } from '@ui/containers/loadingContainer';

export default new (class UnbanCommand extends BaseCommand {
  constructor() {
    super({
      name: 'unban',
      description: 'Unban a member from the server',
      category: 'moderation',
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
    });

    this.data
      .addStringOption((option) =>
        option
          .setName('user_id')
          .setDescription('The ID of the user to unban')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('reason')
          .setDescription('The reason for unbanning')
          .setRequired(false)
      );
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.options.getString('user_id', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.reply({
        components: [createLoadingContainer('Processing unban...')],
        flags: MessageFlags.IsComponentsV2,
      });

      const banList = await interaction.guild?.bans.fetch();
      const bannedUser = banList?.get(userId);

      if (!bannedUser) {
        await interaction.editReply({
          components: [createModerationErrorContainer('Invalid User', 'This user is not banned or does not exist.')],
        });
        return;
      }

      await interaction.guild?.members.unban(userId, reason);

      await interaction.editReply({
        components: [createModerationSuccessContainer('Member Unbanned', bannedUser.user.tag, [
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag },
        ])],
      });
    } catch (error) {
      try {
        await interaction.editReply({
          components: [createModerationErrorContainer('Unban Failed', 'Failed to unban the member. Ensure I have the right permissions and the ID is correct.')],
        });
      } catch {
        await interaction.reply({
          components: [createModerationErrorContainer('Unban Failed', 'Failed to unban the member. Ensure I have the right permissions and the ID is correct.')],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        }).catch(() => null);
      }
    }
  }
})();
