import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';
import { Emoji } from '@config/emoji';
import { JoinConfig } from '@services/join.service';

export function createJoinConfigContainer(config: JoinConfig | null): ContainerBuilder {
  if (!config) {
    return new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`# ${Emoji.Settings} Join System Config\n\n**Status:** Not configured yet\nUse \`/join\` to set up the join system!`)
      );
  }

  const status = config.welcome_enabled ? `${Emoji.Success} Enabled` : `${Emoji.Error} Disabled`;
  const dmStatus = config.dm_enabled ? `${Emoji.Success} Enabled` : `${Emoji.Error} Disabled`;
  const roleStatus = config.auto_role_enabled ? `${Emoji.Success} Enabled` : `${Emoji.Error} Disabled`;
  const memberCountStatus = config.show_member_count ? `${Emoji.Success} Show` : `${Emoji.Error} Hide`;

  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Settings} Join System Configuration`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Welcome Settings
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.User} Welcome Settings`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `**Status:** ${status}\n` +
          `**Channel:** ${config.welcome_channel ? `<#${config.welcome_channel}>` : 'Not set'}\n` +
          `**Message:**\n> ${config.welcome_message}`
        )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // DM Settings
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Message} DM Welcome Settings`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `**Status:** ${dmStatus}\n` +
          `**Message:**\n> ${config.dm_welcome}`
        )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Auto-Role Settings
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Shield} Auto-Role Settings`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `**Status:** ${roleStatus}\n` +
          `**Role:** ${config.auto_role_id ? `<@&${config.auto_role_id}>` : 'Not set'}`
        )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Display Settings
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Info} Display Settings`)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `**Show Member Count:** ${memberCountStatus}\n` +
          `**Total Joins Logged:** Available via \`/join logs\``
        )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    
    // Variables
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `## ${Emoji.Code} Available Variables\n` +
          `\`{user}\` or \`{mention}\` — Mention the new member\n` +
          `\`{username}\` — Username without mention\n` +
          `\`{tag}\` — Full username with discriminator\n` +
          `\`{server}\` — Server name\n` +
          `\`{count}\` — Current member count`
        )
    );
}

export function createJoinLogsContainer(logs: Array<{
  username: string;
  join_timestamp: string;
  account_age: string;
  member_count: number;
}>): ContainerBuilder {
  if (logs.length === 0) {
    return new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`# ${Emoji.Clock} Recent Joins\n\nNo recent joins found!`)
      );
  }

  let logsContent = `# ${Emoji.Clock} Recent Joins (Last ${logs.length})\n\n`;
  
  logs.forEach((log, index) => {
    const timestamp = new Date(log.join_timestamp).toLocaleString();
    logsContent += `**${index + 1}.** ${log.username}\n`;
    logsContent += `   • Joined: ${timestamp}\n`;
    logsContent += `   • Account Age: ${log.account_age}\n`;
    logsContent += `   • Member #: ${log.member_count}\n\n`;
  });

  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(logsContent)
    );
}
