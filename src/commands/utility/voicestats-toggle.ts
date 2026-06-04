import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { VoiceStatsService } from '@services/voicestats.service';

export default new (class VoiceStatsToggleCommand extends BaseCommand {
  constructor() {
    super({
      name: 'voicestats-toggle',
      description: 'Enable or disable voice stats channel updates',
      category: 'utility',
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guild = interaction.guild!;
    const voiceStatsService = client.services.get('VoiceStatsService') as VoiceStatsService;

    if (!voiceStatsService) {
      await interaction.editReply({
        content: '❌ Voice stats service is not available',
      });
      return;
    }

    const result = await voiceStatsService.toggleVoiceStats(guild.id);

    await interaction.editReply({
      content: result.message,
    });
  }
})();
