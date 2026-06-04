import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { VerifyService } from '@services/verify.service';
import { createVerifyContainer, createVerifySetupContainer } from '@ui/containers/verifyContainer';
import { createErrorContainer } from '@ui/containers/errorContainer';

export default new (class SetupVerifyCommand extends BaseCommand {
  constructor() {
    super({
      name: 'setupverify',
      description: 'Setup the verification system for the server',
      category: 'utility',
      guildOnly: true,
      userPermissions: [PermissionFlagsBits.Administrator],
    });

    this.data = new SlashCommandBuilder()
      .setName('setupverify')
      .setDescription('Setup the verification system for the server')
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addRoleOption(opt =>
        opt.setName('role')
          .setDescription('The role to give when users verify')
          .setRequired(true)
      )
      .addChannelOption(opt =>
        opt.setName('channel')
          .setDescription('The channel to send the verification message to')
          .setRequired(false)
      ) as SlashCommandBuilder;
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('role', true);
    const channel = (interaction.options.getChannel('channel') || interaction.channel) as TextChannel;

    if (!channel.isTextBased()) {
      await interaction.reply({
        components: [createErrorContainer('INVALID CHANNEL', 'The target channel must be a text-based channel.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    // Save to database
    VerifyService.setRole(interaction.guildId!, role.id);

    // Deploy verification interface
    const { container, row } = createVerifyContainer(client.user?.username ?? 'Bot', role.members.size);
    
    try {
      await channel.send({
        components: [container, row],
        flags: MessageFlags.IsComponentsV2,
      });

      // Confirm to admin
      await interaction.reply({
        components: [createVerifySetupContainer(role.id, channel.id)],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('Failed to deploy verification interface:', error);
      await interaction.reply({
        components: [createErrorContainer('DEPLOYMENT FAILED', 'Could not send the verification message. Check my permissions.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }
  }
})();
