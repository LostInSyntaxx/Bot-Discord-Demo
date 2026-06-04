import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { VoiceStatsService } from '@services/voicestats.service';

export default new (class VoiceStatsSetupCommand extends BaseCommand {
  constructor() {
    super({
      name: 'voicestats-setup',
      description: 'Setup voice channels that display server member statistics',
      category: 'utility',
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageGuild],
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

    const result = await voiceStatsService.setupVoiceStats(guild);

    await interaction.editReply({
      content: result.message,
    });
  }
})();
