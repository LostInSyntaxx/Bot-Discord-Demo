import { ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags, TextChannel } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { GiveawayService } from '@services/giveaway.service';
import { createSuccessContainer } from '@ui/containers/successContainer';
import { createErrorContainer } from '@ui/containers/errorContainer';
import ms from 'ms';

export default new (class GiveawayCommand extends BaseCommand {
  constructor() {
    super({
      name: 'giveaway',
      description: 'Tactical giveaway management system',
      category: 'utility',
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
    });

    this.data
      .addSubcommand((sub) =>
        sub
          .setName('create')
          .setDescription('Initialize a new tactical giveaway')
          .addStringOption(opt => opt.setName('prize').setDescription('What are you giving away?').setRequired(true))
          .addStringOption(opt => opt.setName('duration').setDescription('Duration (e.g. 1h, 1d, 30m)').setRequired(true))
          .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setMinValue(1).setMaxValue(10).setRequired(true))
          .addChannelOption(opt => opt.setName('channel').setDescription('Target channel (defaults to current)').setRequired(false))
      );
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      const prize = interaction.options.getString('prize', true);
      const durationStr = interaction.options.getString('duration', true);
      const winners = interaction.options.getInteger('winners', true);
      const channel = (interaction.options.getChannel('channel') || interaction.channel) as TextChannel;

      const durationMs = ms(durationStr);
      if (!durationMs || durationMs < 60000) {
        await interaction.reply({
          components: [createErrorContainer('INVALID DURATION', 'Duration must be at least 1 minute (e.g., 1m, 1h, 1d).')],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
        return;
      }

      try {
        await GiveawayService.createGiveaway(
          interaction.guildId!,
          channel.id,
          prize,
          winners,
          durationMs,
          interaction.user.id,
          client
        );

        await interaction.reply({
          components: [createSuccessContainer('GIVEAWAY INITIALIZED', `The giveaway for **${prize}** has been deployed to <#${channel.id}>.`)],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      } catch (error) {
        console.error('Giveaway creation failed:', error);
        await interaction.reply({
          components: [createErrorContainer('DEPLOYMENT FAILED', 'Could not initialize the giveaway protocol.')],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }
    }
  }
})();
