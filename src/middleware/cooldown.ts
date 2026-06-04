import { ChatInputCommandInteraction, Collection } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { Command } from '@bot-types/Command';
import { formatDuration } from '@utils/formatUptime';

export async function cooldownMiddleware(
  client: ExtendedClient,
  interaction: ChatInputCommandInteraction,
  command: Command
): Promise<boolean> {
  const cooldownAmount = (command.options.cooldown || 3) * 1000;
  const userId = interaction.user.id;
  const commandName = command.options.name;

  if (!client.cooldowns.has(commandName)) {
    client.cooldowns.set(commandName, new Collection());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(commandName)!;
  
  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId)! + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = expirationTime - now;
      
      await interaction.reply({
        content: `⏳ Please wait ${formatDuration(timeLeft)} before using \`${commandName}\` again.`,
        ephemeral: true,
      });
      
      return false;
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);

  return true;
}
