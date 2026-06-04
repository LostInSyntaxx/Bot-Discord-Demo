import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createServerstatsContainer } from '@ui/containers/serverstatsContainer';
import { ServerStatsService } from '@services/serverstats.service';

export default new (class ServerstatsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'serverstats',
      description: 'Display server statistics and activity',
      category: 'utility',
      cooldown: 10,
      guildOnly: true,
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const guild = interaction.guild!;
    const statsService = client.services.get('ServerStatsService') as ServerStatsService;

    if (!statsService) {
      await interaction.editReply({
        content: '❌ Stats service is not available',
      });
      return;
    }

    // Get current date
    const today = new Date().toISOString().split('T')[0];

    // Get daily stats
    const dailyStats = statsService.getDailyStats(guild.id, today);
    
    // Get weekly and monthly summaries
    const weeklySummary = statsService.getWeeklySummary(guild.id);
    const monthlySummary = statsService.getMonthlySummary(guild.id);
    
    // Get total stats
    const totalStats = statsService.getTotalStats(guild.id);

    // Prepare stats data
    const statsData = {
      daily: {
        messages: dailyStats?.message_count || 0,
        voiceMinutes: dailyStats?.voice_minutes || 0,
        commands: dailyStats?.command_count || 0,
        members: dailyStats?.member_count || guild.memberCount,
      },
      weekly: weeklySummary,
      monthly: monthlySummary,
      total: {
        totalMessages: totalStats?.total_messages || 0,
        totalVoiceMinutes: totalStats?.total_voice_minutes || 0,
        totalCommands: totalStats?.total_commands || 0,
        peakMembers: totalStats?.peak_members || guild.memberCount,
      },
    };

    await interaction.editReply({
      components: [createServerstatsContainer(guild, statsData)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
