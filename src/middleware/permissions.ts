import { ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { Command } from '@bot-types/Command';

export async function permissionsMiddleware(
  client: ExtendedClient,
  interaction: ChatInputCommandInteraction,
  command: Command
): Promise<boolean> {
  if (!command.options.permissions || command.options.permissions.length === 0) {
    return true;
  }

  if (!interaction.guild || !interaction.member) {
    await interaction.reply({
      content: '❌ This command can only be used in a server.',
      ephemeral: true,
    });
    return false;
  }

  const member = interaction.member;
  const permissions = command.options.permissions as PermissionResolvable[];

  // Check if member has required permissions
  const hasPermissions = permissions.every((perm) => {
    if (typeof member.permissions === 'string') return false;
    return member.permissions.has(perm);
  });

  if (!hasPermissions) {
    const permissionNames = permissions
      .map((perm) => `\`${perm.toString()}\``)
      .join(', ');

    await interaction.reply({
      content: `❌ You need the following permissions to use this command: ${permissionNames}`,
      ephemeral: true,
    });
    return false;
  }

  return true;
}
