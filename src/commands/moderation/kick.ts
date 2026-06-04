import { ChatInputCommandInteraction, PermissionFlagsBits, GuildMember, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createModerationSuccessContainer, createModerationErrorContainer } from '@ui/containers/moderationContainer';

export default new (class KickCommand extends BaseCommand {
  constructor() {
    super({
      name: 'kick',
      description: 'Kick a member from the server',
      category: 'moderation',
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.KickMembers],
    });

    this.data
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to kick')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('reason')
          .setDescription('The reason for kicking')
          .setRequired(false)
      );
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getMember('user') as GuildMember;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      await interaction.reply({
        components: [createModerationErrorContainer('Invalid User', 'Could not find that user.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    if (target.id === interaction.user.id) {
      await interaction.reply({
        components: [createModerationErrorContainer('Invalid Action', 'You cannot kick yourself.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    if (target.id === interaction.guild?.ownerId) {
      await interaction.reply({
        components: [createModerationErrorContainer('Invalid Action', 'You cannot kick the server owner.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    const member = interaction.member as GuildMember;
    if (target.roles.highest.position >= member.roles.highest.position) {
      await interaction.reply({
        components: [createModerationErrorContainer('Invalid Action', 'You cannot kick a member with equal or higher role.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    if (!target.kickable) {
      await interaction.reply({
        components: [createModerationErrorContainer('Cannot Kick', 'I do not have permission to kick this user.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await target.kick(reason);

      await interaction.reply({
        components: [createModerationSuccessContainer('Member Kicked', target.user.tag, [
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag },
        ])],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      await interaction.reply({
        components: [createModerationErrorContainer('Kick Failed', 'Failed to kick the member.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }
  }
})();
