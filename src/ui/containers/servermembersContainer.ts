import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, Guild } from 'discord.js';
import { Emoji } from '@config/emoji';

interface MemberStatsData {
  daily: {
    joins: number;
    leaves: number;
    netGrowth: number;
    members: number;
  };
  weekly: {
    totalJoins: number;
    totalLeaves: number;
    netGrowth: number;
    avgDailyMembers: number;
  };
  monthly: {
    totalJoins: number;
    totalLeaves: number;
    netGrowth: number;
    avgDailyMembers: number;
  };
  total: {
    totalJoins: number;
    totalLeaves: number;
    currentMembers: number;
    peakMembers: number;
  };
  growthRate: number;
  retentionRate: number;
}

export function createServerMembersContainer(guild: Guild, stats: MemberStatsData) {
  const formatGrowth = (value: number): string => {
    if (value > 0) return `+${value}`;
    return `${value}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const container = new ContainerBuilder()
    // Header
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Users} Server Members Statistics\n${guild.name} - Member Overview`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Current Status
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.User} Current Status`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Users} **Current Members:** ${stats.total.currentMembers.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Trophy} **Peak Members:** ${stats.total.peakMembers.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Graph} **Growth Rate (7d):** ${formatPercentage(stats.growthRate)}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Heart} **Retention Rate:** ${formatPercentage(stats.retentionRate)}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Today's Activity
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Clock} Today's Activity`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.UserAdd} **Joins:** ${stats.daily.joins.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.UserRemove} **Leaves:** ${stats.daily.leaves.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Graph} **Net Growth:** ${formatGrowth(stats.daily.netGrowth)}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Users} **Member Count:** ${stats.daily.members.toLocaleString()}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Weekly Stats
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Calendar} This Week`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.UserAdd} **Total Joins:** ${stats.weekly.totalJoins.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.UserRemove} **Total Leaves:** ${stats.weekly.totalLeaves.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Graph} **Net Growth:** ${formatGrowth(stats.weekly.netGrowth)}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Users} **Avg Daily Members:** ${stats.weekly.avgDailyMembers.toLocaleString()}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Monthly Stats
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Calendar} This Month`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.UserAdd} **Total Joins:** ${stats.monthly.totalJoins.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.UserRemove} **Total Leaves:** ${stats.monthly.totalLeaves.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Graph} **Net Growth:** ${formatGrowth(stats.monthly.netGrowth)}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Users} **Avg Daily Members:** ${stats.monthly.avgDailyMembers.toLocaleString()}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // All-Time Stats
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Trophy} All-Time Statistics`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.UserAdd} **Total Joins:** ${stats.total.totalJoins.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.UserRemove} **Total Leaves:** ${stats.total.totalLeaves.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Users} **Current Members:** ${stats.total.currentMembers.toLocaleString()}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Footer
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Info} Member stats are updated in real-time`)
    );

  return container;
}
