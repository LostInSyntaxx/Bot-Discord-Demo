import { ChatInputCommandInteraction } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { Command } from '@bot-types/Command';
import { env } from '@config/env';

export async function ownerOnlyMiddleware(
  client: ExtendedClient,
  interaction: ChatInputCommandInteraction,
  command: Command
): Promise<boolean> {
  if (!command.options.ownerOnly) {
    return true;
  }

  const ownerId = env.BOT_OWNER_ID;
  
  if (!ownerId) {
    await interaction.reply({
      content: '❌ Bot owner is not configured.',
      ephemeral: true,
    });
    return false;
  }

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: '❌ This command can only be used by the bot owner.',
      ephemeral: true,
    });
    return false;
  }

  return true;
}
