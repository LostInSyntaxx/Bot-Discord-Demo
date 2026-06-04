import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
} from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { LevelingService } from '@services/leveling.service';
import { Emoji } from '@config/emoji';

export default new (class LevelConfigCommand extends BaseCommand {
  constructor() {
    super({
      name: 'levelconfig',
      description: 'Configure the leveling system',
      category: 'utility',
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
    });

    this.data = new SlashCommandBuilder()
      .setName('levelconfig')
      .setDescription('Configure the leveling system')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .setDMPermission(false)
      .addSubcommand(sub =>
        sub.setName('setchannel')
          .setDescription('Set level-up announcement channel')
          .addChannelOption(opt =>
            opt.setName('channel').setDescription('Channel for level-up messages').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('toggle')
          .setDescription('Enable or disable leveling')
          .addBooleanOption(opt =>
            opt.setName('enabled').setDescription('Enable or disable').setRequired(true)
          )
      ) as SlashCommandBuilder;
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    if (sub === 'setchannel') {
      const channel = interaction.options.getChannel('channel', true);
      LevelingService.setChannel(guildId, channel.id);
      await interaction.reply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${Emoji.Success} Level-up announcements will be sent to <#${channel.id}>`
          )
        )],
        flags: MessageFlags.IsComponentsV2,
      });
    } else if (sub === 'toggle') {
      const enabled = interaction.options.getBoolean('enabled', true);
      LevelingService.setEnabled(guildId, enabled);
      await interaction.reply({
        components: [new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${enabled ? Emoji.Success : Emoji.Error} Leveling system **${enabled ? 'enabled' : 'disabled'}**`
          )
        )],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }
})();
