import { ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, TextChannel, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { LogService } from '@services/log.service';
import { createSuccessContainer } from '@ui/containers/successContainer';
import { createErrorContainer } from '@ui/containers/errorContainer';
import { Emoji } from '@config/emoji';

export default new (class SetLogsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'setlogs',
      description: 'Configure the tactical audit log channel',
      category: 'moderation',
      guildOnly: true,
      permissions: [PermissionFlagsBits.Administrator],
    });

    this.data
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('The channel where tactical logs will be dispatched')
          .setRequired(true)
      );
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel', true) as TextChannel;

    if (!channel.isTextBased()) {
      await interaction.reply({
        components: [createErrorContainer('INVALID TERMINAL', 'Target channel must be a text-based terminal.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      LogService.setLogChannel(interaction.guildId!, channel.id);

      await interaction.reply({
        components: [createSuccessContainer('LOGS INITIALIZED', `Tactical audit logs are now being dispatched to <#${channel.id}>.`)],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });

      // Send a test log to the channel
      await channel.send({
        components: [
          new (require('@ui/containers/logContainer').createLogContainer)(
            'SYSTEM LINK ESTABLISHED',
            Emoji.Settings,
            'Audit log transmission protocol active. Monitoring server activities...'
          )
        ],
        flags: MessageFlags.IsComponentsV2,
      });

    } catch (error) {
      console.error('Failed to set log channel:', error);
      await interaction.reply({
        components: [createErrorContainer('LINK FAILED', 'Could not establish connection with the target terminal.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }
  }
})();
