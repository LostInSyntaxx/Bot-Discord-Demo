import { ChatInputCommandInteraction } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { Command } from '@bot-types/Command';
import { env } from '@config/env';

export async function maintenanceMiddleware(
  client: ExtendedClient,
  interaction: ChatInputCommandInteraction,
  command: Command
): Promise<boolean> {
  if (!env.ENABLE_MAINTENANCE_MODE) {
    return true;
  }

  // Allow owner to use commands during maintenance
  if (env.BOT_OWNER_ID && interaction.user.id === env.BOT_OWNER_ID) {
    return true;
  }

  await interaction.reply({
    content: '🔧 The bot is currently under maintenance. Please try again later.',
    ephemeral: true,
  });

  return false;
}
