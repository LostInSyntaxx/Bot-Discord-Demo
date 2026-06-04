import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createServerMembersContainer } from '@ui/containers/servermembersContainer';
import { ServerMembersService } from '@services/servermembers.service';

export default new (class ServerMembersCommand extends BaseCommand {
  constructor() {
    super({
      name: 'servermembers',
      description: 'View detailed server member statistics and analytics',
      category: 'utility',
      cooldown: 10,
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply({
        content: '❌ This command can only be used in a server.',
      });
      return;
    }

    const membersService = client.services.get('ServerMembersService') as ServerMembersService;
    if (!membersService) {
      await interaction.editReply({
        content: '❌ Server Members service is not available.',
      });
      return;
    }

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = membersService.getDailyStats(guild.id, today) || {
      joins: 0,
      leaves: 0,
      net_growth: 0,
      member_count: guild.memberCount,
    };

    // Get total stats
    const totalStats = membersService.getTotalStats(guild.id) || {
      total_joins: 0,
      total_leaves: 0,
      current_members: guild.memberCount,
      peak_members: guild.memberCount,
    };

    // Get weekly and monthly summaries
    const weeklySummary = membersService.getWeeklySummary(guild.id);
    const monthlySummary = membersService.getMonthlySummary(guild.id);

    // Get growth and retention rates
    const growthRate = membersService.getGrowthRate(guild.id, 7);
    const retentionRate = membersService.getRetentionRate(guild.id);

    // Prepare stats data for the container
    const statsData = {
      daily: {
        joins: dailyStats.joins,
        leaves: dailyStats.leaves,
        netGrowth: dailyStats.net_growth,
        members: dailyStats.member_count,
      },
      weekly: {
        totalJoins: weeklySummary.totalJoins,
        totalLeaves: weeklySummary.totalLeaves,
        netGrowth: weeklySummary.netGrowth,
        avgDailyMembers: weeklySummary.avgDailyMembers,
      },
      monthly: {
        totalJoins: monthlySummary.totalJoins,
        totalLeaves: monthlySummary.totalLeaves,
        netGrowth: monthlySummary.netGrowth,
        avgDailyMembers: monthlySummary.avgDailyMembers,
      },
      total: {
        totalJoins: totalStats.total_joins,
        totalLeaves: totalStats.total_leaves,
        currentMembers: totalStats.current_members,
        peakMembers: totalStats.peak_members,
      },
      growthRate,
      retentionRate,
    };

    // Create and send the container
    const container = createServerMembersContainer(guild, statsData);

    await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
