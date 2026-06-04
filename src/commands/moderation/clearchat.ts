import { ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, TextChannel } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createClearChatContainer, createModerationErrorContainer } from '@ui/containers/moderationContainer';
import { createLoadingContainer } from '@ui/containers/loadingContainer';

export default new (class ClearChatCommand extends BaseCommand {
  constructor() {
    super({
      name: 'clearchat',
      description: 'Bulk delete messages in the current channel',
      category: 'moderation',
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
    });

    this.data
      .addIntegerOption((option) =>
        option
          .setName('amount')
          .setDescription('Number of messages to delete (1-100)')
          .setMinValue(1)
          .setMaxValue(100)
          .setRequired(true)
      );
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getInteger('amount', true);
    const channel = interaction.channel as TextChannel;

    // Show loading state
    await interaction.reply({
      components: [createLoadingContainer('Initiating channel purge protocol...')],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });

    try {
      // Perform bulk delete (only messages < 14 days old)
      const deleted = await channel.bulkDelete(amount, true);
      
      await interaction.editReply({
        components: [createClearChatContainer(deleted.size, interaction.user.tag, 15)],
      });

      // Auto-delete the success message after 15 seconds to keep the chat clean
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (error) {
          // Ignore if message already deleted or interaction expired
        }
      }, 15000);

    } catch (error) {
      console.error('Failed to clear chat:', error);
      await interaction.editReply({
        components: [createModerationErrorContainer('PURGE FAILED', 'Failed to delete messages. Ensure I have the Manage Messages permission.')],
      });
    }
  }
})();
