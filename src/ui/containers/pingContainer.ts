import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Emoji } from '@config/emoji';
import { ExtendedClient } from '@bot-types/Client';

export function createPingLoadingContainer() {
  const container = new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${Emoji.Info} **Checking Latency**`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`Calculating ping...`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );

  return container;
}

export function createPingErrorContainer(message: string) {
  const container = new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${Emoji.Cross} **Error**`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(message)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );

  return container;
}

function formatUptime(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function createPingContainer(client: ExtendedClient, messageLatency: number) {
  const container = new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${Emoji.CheckPing} **Pong!**`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );

  const wsLatency = Math.round(client.ws.ping);
  const uptime = formatUptime(client.uptime ?? 0);


  const content =
    `**Latency Information:**\n` +
    `├─  ${Emoji.CheckMB} **WebSocket Ping:** ${wsLatency}ms\n` +
    `├─  ${Emoji.CheckMB} **Message Latency:** ${messageLatency}ms\n` +
    `└─  ${Emoji.CheckMB} **Total Response:** ${wsLatency + messageLatency}ms\n\n` +
    `**Bot Statistics:**\n` +
    `├─ ${Emoji.CheckMP} **Uptime:** ${uptime}\n` +
    `├─ ${Emoji.CheckMP} **Guilds:** ${client.guilds.cache.size}\n` +
    `├─ ${Emoji.CheckMP} **Users:** ${client.users.cache.size}`

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(content)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );

  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('ping_refresh')
      .setLabel('Refresh')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(Emoji.Refresh)
  );

  container.addActionRowComponents(buttonRow);

  return container;
}

export function createDisabledPingContainer(client: ExtendedClient) {
  const container = new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${Emoji.CheckPingGreen} **Pong!**`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );

  const wsLatency = Math.round(client.ws.ping);
  const uptime = formatUptime(client.uptime ?? 0);

  const content =
    `**Latency Information:**\n` +
    `├─ **WebSocket Ping:** ${wsLatency}ms\n` +
    `├─ **Message Latency:** Expired\n` +
    `└─ **Total Response:** ${wsLatency}ms\n\n` +
    `**Bot Statistics:**\n` +
    `├─ **Uptime:** ${uptime}\n` +
    `├─ **Guilds:** ${client.guilds.cache.size}\n` +
    `└─ **Users:** ${client.users.cache.size}\n\n` +
    `*This command has expired. Run the command again to refresh.*`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(content)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );

  return container;
}
