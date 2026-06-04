import { ChatInputCommandInteraction, PermissionFlagsBits, GuildMember, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createModerationSuccessContainer, createModerationErrorContainer } from '@ui/containers/moderationContainer';

export default new (class BanCommand extends BaseCommand {
  constructor() {
    super({
      name: 'ban',
      description: 'Ban a member from the server',
      category: 'moderation',
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
    });

    this.data
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to ban')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('reason')
          .setDescription('The reason for banning')
          .setRequired(false)
      )
      .addIntegerOption((option) =>
        option
          .setName('delete_days')
          .setDescription('Number of days of messages to delete (0-7)')
          .setMinValue(0)
          .setMaxValue(7)
          .setRequired(false)
      );
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getMember('user') as GuildMember;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') || 0;

    if (!target) {
      await interaction.reply({
        components: [createModerationErrorContainer('Invalid User', 'Could not find that user.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    if (target.id === interaction.user.id) {
      await interaction.reply({
        components: [createModerationErrorContainer('Invalid Action', 'You cannot ban yourself.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    if (target.id === interaction.guild?.ownerId) {
      await interaction.reply({
        components: [createModerationErrorContainer('Invalid Action', 'You cannot ban the server owner.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    const member = interaction.member as GuildMember;
    if (target.roles.highest.position >= member.roles.highest.position) {
      await interaction.reply({
        components: [createModerationErrorContainer('Invalid Action', 'You cannot ban a member with equal or higher role.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    if (!target.bannable) {
      await interaction.reply({
        components: [createModerationErrorContainer('Cannot Ban', 'I do not have permission to ban this user.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await target.ban({ reason, deleteMessageSeconds: deleteDays * 86400 });

      await interaction.reply({
        components: [createModerationSuccessContainer('Member Banned', target.user.tag, [
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag },
          { name: 'Messages Deleted', value: `${deleteDays} day(s)` },
        ])],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      await interaction.reply({
        components: [createModerationErrorContainer('Ban Failed', 'Failed to ban the member.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }
  }
})();
