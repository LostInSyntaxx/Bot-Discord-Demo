import { ChatInputCommandInteraction, PermissionFlagsBits, GuildMember, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createModerationSuccessContainer, createModerationErrorContainer } from '@ui/containers/moderationContainer';

export default new (class TimeoutCommand extends BaseCommand {
  constructor() {
    super({
      name: 'timeout',
      description: 'Timeout a member',
      category: 'moderation',
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
    });

    this.data
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to timeout')
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName('duration')
          .setDescription('Duration in minutes')
          .setMinValue(1)
          .setMaxValue(40320) // 28 days
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('reason')
          .setDescription('The reason for timeout')
          .setRequired(false)
      );
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getMember('user') as GuildMember;
    const duration = interaction.options.getInteger('duration', true);
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
        components: [createModerationErrorContainer('Invalid Action', 'You cannot timeout yourself.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    const member = interaction.member as GuildMember;
    if (target.roles.highest.position >= member.roles.highest.position) {
      await interaction.reply({
        components: [createModerationErrorContainer('Invalid Action', 'You cannot timeout a member with equal or higher role.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    if (!target.moderatable) {
      await interaction.reply({
        components: [createModerationErrorContainer('Cannot Timeout', 'I do not have permission to timeout this user.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await target.timeout(duration * 60 * 1000, reason);

      await interaction.reply({
        components: [createModerationSuccessContainer('Member Timed Out', target.user.tag, [
          { name: 'Duration', value: `${duration} minute(s)` },
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag },
        ])],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      await interaction.reply({
        components: [createModerationErrorContainer('Timeout Failed', 'Failed to timeout the member.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }
  }
})();
