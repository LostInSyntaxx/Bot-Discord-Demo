import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { AutoRoleService } from '@services/autorole.service';
import {
  createAutoRoleListContainer,
  createAutoRoleSuccessContainer,
} from '@ui/containers/autoroleContainer';

export default new (class AutoRoleCommand extends BaseCommand {
  constructor() {
    super({
      name: 'autorole',
      description: 'Manage auto roles for new members',
      category: 'utility',
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageRoles],
    });

    this.data = new SlashCommandBuilder()
      .setName('autorole')
      .setDescription('Manage auto roles for new members')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .setDMPermission(false)
      .addSubcommand(sub =>
        sub.setName('add')
          .setDescription('Add a role to auto assign')
          .addRoleOption(opt =>
            opt.setName('role').setDescription('Role to auto assign').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('remove')
          .setDescription('Remove a role from auto assign')
          .addRoleOption(opt =>
            opt.setName('role').setDescription('Role to remove').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('list').setDescription('List all auto roles')
      ) as SlashCommandBuilder;
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    if (sub === 'list') {
      const roleIds = AutoRoleService.getRoles(guildId);
      const roles = roleIds
        .map(id => interaction.guild!.roles.cache.get(id))
        .filter(Boolean) as import('discord.js').Role[];

      await interaction.reply({
        components: [createAutoRoleListContainer(roles)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const role = interaction.options.getRole('role', true);

    if (sub === 'add') {
      AutoRoleService.addRole(guildId, role.id);
      await interaction.reply({
        components: [createAutoRoleSuccessContainer('add', role.name)],
        flags: MessageFlags.IsComponentsV2,
      });
    } else if (sub === 'remove') {
      AutoRoleService.removeRole(guildId, role.id);
      await interaction.reply({
        components: [createAutoRoleSuccessContainer('remove', role.name)],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }
})();
