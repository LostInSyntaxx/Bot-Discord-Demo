import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { JoinService } from '@services/join.service';
import { createJoinConfigContainer, createJoinLogsContainer } from '@ui/containers/joinContainer';
import { Emoji } from '@config/emoji';
import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';

export default new (class JoinCommand extends BaseCommand {
  constructor() {
    super({
      name: 'join',
      description: 'Configure the enhanced join system',
      category: 'utility',
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
    });

    this.data = new SlashCommandBuilder()
      .setName('join')
      .setDescription('Configure the enhanced join system')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .setDMPermission(false)
      // Welcome subcommands
      .addSubcommand(sub =>
        sub.setName('welcome-channel')
          .setDescription('Set the welcome channel for join messages')
          .addChannelOption(opt =>
            opt.setName('channel').setDescription('Channel to send welcome messages').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('welcome-message')
          .setDescription('Set the welcome message template')
          .addStringOption(opt =>
            opt.setName('message').setDescription('Welcome message (use {user}, {server}, {count})').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('welcome-toggle')
          .setDescription('Enable or disable welcome messages')
          .addBooleanOption(opt =>
            opt.setName('enabled').setDescription('Enable or disable').setRequired(true)
          )
      )
      // DM subcommands
      .addSubcommand(sub =>
        sub.setName('dm-message')
          .setDescription('Set the DM welcome message')
          .addStringOption(opt =>
            opt.setName('message').setDescription('DM welcome message template').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('dm-toggle')
          .setDescription('Enable or disable DM welcome messages')
          .addBooleanOption(opt =>
            opt.setName('enabled').setDescription('Enable or disable').setRequired(true)
          )
      )
      // Auto-Role subcommands
      .addSubcommand(sub =>
        sub.setName('autorole')
          .setDescription('Set auto-role for new members')
          .addRoleOption(opt =>
            opt.setName('role').setDescription('Role to assign to new members').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('autorole-toggle')
          .setDescription('Enable or disable auto-role')
          .addBooleanOption(opt =>
            opt.setName('enabled').setDescription('Enable or disable').setRequired(true)
          )
      )
      // Display subcommands
      .addSubcommand(sub =>
        sub.setName('member-count')
          .setDescription('Toggle showing member count in welcome')
          .addBooleanOption(opt =>
            opt.setName('enabled').setDescription('Show member count').setRequired(true)
          )
      )
      // Info subcommands
      .addSubcommand(sub =>
        sub.setName('config').setDescription('View current join configuration')
      )
      .addSubcommand(sub =>
        sub.setName('logs')
          .setDescription('View recent join logs')
          .addIntegerOption(opt =>
            opt.setName('limit').setDescription('Number of logs to show (default: 10)').setRequired(false)
          )
      ) as SlashCommandBuilder;
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    // Config - View current settings
    if (sub === 'config') {
      const config = JoinService.getConfig(guildId);
      await interaction.editReply({
        components: [createJoinConfigContainer(config)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Logs - View recent joins
    if (sub === 'logs') {
      const limit = interaction.options.getInteger('limit') || 10;
      const logs = JoinService.getRecentJoins(guildId, limit);
      
      await interaction.editReply({
        components: [createJoinLogsContainer(logs)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Welcome Channel
    if (sub === 'welcome-channel') {
      const channel = interaction.options.getChannel('channel', true);
      JoinService.setWelcomeChannel(guildId, channel.id);
      
      await interaction.editReply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${Emoji.Success} Welcome channel set to <#${channel.id}>`)
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Welcome Message
    if (sub === 'welcome-message') {
      const message = interaction.options.getString('message', true);
      JoinService.setWelcomeMessage(guildId, message);
      
      await interaction.editReply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${Emoji.Success} Welcome message updated!\n> ${message}`)
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Welcome Toggle
    if (sub === 'welcome-toggle') {
      const enabled = interaction.options.getBoolean('enabled', true);
      JoinService.toggleWelcome(guildId, enabled);
      
      await interaction.editReply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${enabled ? Emoji.Success : Emoji.Error} Welcome messages **${enabled ? 'enabled' : 'disabled'}**`
          )
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // DM Message
    if (sub === 'dm-message') {
      const message = interaction.options.getString('message', true);
      JoinService.setDMWelcome(guildId, message);
      
      await interaction.editReply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${Emoji.Success} DM welcome message updated!\n> ${message}`)
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // DM Toggle
    if (sub === 'dm-toggle') {
      const enabled = interaction.options.getBoolean('enabled', true);
      JoinService.toggleDMWelcome(guildId, enabled);
      
      await interaction.editReply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${enabled ? Emoji.Success : Emoji.Error} DM welcome messages **${enabled ? 'enabled' : 'disabled'}**`
          )
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Auto-Role
    if (sub === 'autorole') {
      const role = interaction.options.getRole('role', true);
      JoinService.setAutoRole(guildId, role.id);
      
      await interaction.editReply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${Emoji.Success} Auto-role set to <@&${role.id}>`)
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Auto-Role Toggle
    if (sub === 'autorole-toggle') {
      const enabled = interaction.options.getBoolean('enabled', true);
      JoinService.toggleAutoRole(guildId, enabled);
      
      await interaction.editReply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${enabled ? Emoji.Success : Emoji.Error} Auto-role **${enabled ? 'enabled' : 'disabled'}**`
          )
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Member Count Toggle
    if (sub === 'member-count') {
      const enabled = interaction.options.getBoolean('enabled', true);
      JoinService.toggleMemberCount(guildId, enabled);
      
      await interaction.editReply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${enabled ? Emoji.Success : Emoji.Error} Member count display **${enabled ? 'enabled' : 'disabled'}**`
          )
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }
  }
})();
