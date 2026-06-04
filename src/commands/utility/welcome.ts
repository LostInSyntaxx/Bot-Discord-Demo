import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { WelcomeService } from '@services/welcome.service';
import {
  createWelcomeConfigContainer,
} from '@ui/containers/welcomeContainer';
import { Emoji } from '@config/emoji';
import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';

export default new (class WelcomeCommand extends BaseCommand {
  constructor() {
    super({
      name: 'welcome',
      description: 'Configure the welcome system',
      category: 'utility',
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
    });

    this.data = new SlashCommandBuilder()
      .setName('welcome')
      .setDescription('Configure the welcome system')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .setDMPermission(false)
      .addSubcommand(sub =>
        sub.setName('setchannel')
          .setDescription('Set the welcome channel')
          .addChannelOption(opt =>
            opt.setName('channel').setDescription('Channel to send welcome messages').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('setmessage')
          .setDescription('Set the welcome message (use {user} and {server})')
          .addStringOption(opt =>
            opt.setName('message').setDescription('Welcome message template').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('toggle')
          .setDescription('Enable or disable the welcome system')
          .addBooleanOption(opt =>
            opt.setName('enabled').setDescription('Enable or disable').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('config').setDescription('View current welcome config')
      ) as SlashCommandBuilder;
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    if (sub === 'config') {
      const config = WelcomeService.getConfig(guildId);
      await interaction.reply({
        components: [createWelcomeConfigContainer(
          config?.channel_id ?? null,
          config?.message ?? 'Welcome {user} to {server}!',
          config?.enabled === 1
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    if (sub === 'setchannel') {
      const channel = interaction.options.getChannel('channel', true);
      WelcomeService.setChannel(guildId, channel.id);
      await interaction.reply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${Emoji.Success} Welcome channel set to <#${channel.id}>`)
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    if (sub === 'setmessage') {
      const message = interaction.options.getString('message', true);
      WelcomeService.setMessage(guildId, message);
      await interaction.reply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${Emoji.Success} Welcome message updated:\n> ${message}`)
        )],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    if (sub === 'toggle') {
      const enabled = interaction.options.getBoolean('enabled', true);
      WelcomeService.setEnabled(guildId, enabled);
      await interaction.reply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${enabled ? Emoji.Success : Emoji.Error} Welcome system **${enabled ? 'enabled' : 'disabled'}**`
          )
        )],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }
})();
