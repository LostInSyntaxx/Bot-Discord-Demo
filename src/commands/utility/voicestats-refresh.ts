import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { VoiceStatsService } from '@services/voicestats.service';

export default new (class VoiceStatsRefreshCommand extends BaseCommand {
  constructor() {
    super({
      name: 'voicestats-refresh',
      description: 'Manually refresh the voice stats channels with current member counts',
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

    const config = voiceStatsService.getConfig(guild.id);
    if (!config) {
      await interaction.editReply({
        content: '❌ Voice stats channels are not set up. Use `/voicestats-setup` first.',
      });
      return;
    }

    await voiceStatsService.updateVoiceStats(guild.id);

    await interaction.editReply({
      content: '✅ Voice stats channels refreshed!',
    });
  }
})();
