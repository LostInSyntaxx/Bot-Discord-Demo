import { ButtonInteraction, MessageFlags, GuildMember } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseComponent } from '@structures/BaseComponent';
import { VerifyService } from '@services/verify.service';
import { createSuccessContainer } from '@ui/containers/successContainer';
import { createErrorContainer } from '@ui/containers/errorContainer';
import { createVerifyContainer } from '@ui/containers/verifyContainer';
import { Emoji } from '@config/emoji';

export default new (class VerifyButton extends BaseComponent {
  constructor() {
    super({
      customId: 'verify',
      type: 'button',
    });
  }

  async execute(client: ExtendedClient, interaction: ButtonInteraction): Promise<void> {
    const guildId = interaction.guildId!;
    const member = interaction.member as GuildMember;
    
    // Get the configured role
    const roleId = VerifyService.getRole(guildId);

    if (!roleId) {
      await interaction.reply({
        components: [createErrorContainer('SYSTEM OFFLINE', 'The verification system has not been properly initialized.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    const role = interaction.guild!.roles.cache.get(roleId);

    if (!role) {
      await interaction.reply({
        components: [createErrorContainer('DATA CORRUPTION', 'The verification role no longer exists in this terminal.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if user already has the role
    if (member.roles.cache.has(roleId)) {
      await interaction.reply({
        components: [createSuccessContainer('IDENTITY CONFIRMED', 'Your identity has already been verified in this sector.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      // Assign the role
      await member.roles.add(role, 'User completed identity verification protocol.');

      // Refresh the original message with updated count
      const updatedCount = role.members.size;
      const { container, row } = createVerifyContainer(client.user?.username ?? 'Bot', updatedCount);
      
      await interaction.message.edit({
        components: [container, row],
      }).catch(() => null);

      await interaction.reply({
        components: [createSuccessContainer('VERIFICATION SUCCESSFUL', `Access granted. You have been assigned the **${role.name}** role.`)],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    } catch (error: any) {
      console.error('Failed to assign verification role:', error);
      
      // Handle Missing Permissions (Hierarchy or Permissions)
      if (error.code === 50013) {
        await interaction.reply({
          components: [createErrorContainer('ACCESS DENIED', 'I do not have permission to assign this role. Please move my role higher in the hierarchy.')],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          components: [createErrorContainer('SYSTEM ERROR', 'An error occurred while assigning the role. Please check my logs.')],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }
    }
  }
})();
