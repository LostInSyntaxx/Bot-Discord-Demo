import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, Guild } from 'discord.js';
import { Emoji } from '@config/emoji';
import { ServerStatsService } from '@services/serverstats.service';

interface StatsData {
  daily: {
    messages: number;
    voiceMinutes: number;
    commands: number;
    members: number;
  };
  weekly: {
    totalMessages: number;
    totalVoiceMinutes: number;
    totalCommands: number;
    avgDailyMembers: number;
  };
  monthly: {
    totalMessages: number;
    totalVoiceMinutes: number;
    totalCommands: number;
    avgDailyMembers: number;
  };
  total: {
    totalMessages: number;
    totalVoiceMinutes: number;
    totalCommands: number;
    peakMembers: number;
  };
}

export function createServerstatsContainer(guild: Guild, stats: StatsData) {
  const formatHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const container = new ContainerBuilder()
    // Header
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Stats} Server Statistics\n${guild.name} - Activity Overview`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Today's Stats
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Clock} Today's Activity`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Message} **Messages:** ${stats.daily.messages.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Music} **Voice Time:** ${formatHours(stats.daily.voiceMinutes)}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Terminal} **Commands:** ${stats.daily.commands.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Users} **Members:** ${stats.daily.members.toLocaleString()}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Weekly Stats
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Calendar} This Week`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Message} **Messages:** ${stats.weekly.totalMessages.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Music} **Voice Time:** ${formatHours(stats.weekly.totalVoiceMinutes)}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Terminal} **Commands:** ${stats.weekly.totalCommands.toLocaleString()}`),
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
        .setContent(`${Emoji.Message} **Messages:** ${stats.monthly.totalMessages.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Music} **Voice Time:** ${formatHours(stats.monthly.totalVoiceMinutes)}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Terminal} **Commands:** ${stats.monthly.totalCommands.toLocaleString()}`),
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
        .setContent(`${Emoji.Message} **Total Messages:** ${stats.total.totalMessages.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Music} **Total Voice Time:** ${formatHours(stats.total.totalVoiceMinutes)}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Terminal} **Total Commands:** ${stats.total.totalCommands.toLocaleString()}`),
      new TextDisplayBuilder()
        .setContent(`${Emoji.Users} **Peak Members:** ${stats.total.peakMembers.toLocaleString()}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Footer
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Info} Stats are updated in real-time`)
    );

  return container;
}
