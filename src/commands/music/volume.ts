import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService } from '@services/music.service';
import { createMusicActionContainer } from '@ui/containers/musicContainer';

export default new (class VolumeCommand extends BaseCommand {
  constructor() {
    super({
      name: 'volume',
      description: 'Set the playback volume (1-100)',
      category: 'music',
      cooldown: 2,
      guildOnly: true,
    });

    this.data = new SlashCommandBuilder()
      .setName('volume')
      .setDescription('Set the playback volume (1-100)')
      .setDMPermission(false)
      .addIntegerOption(opt =>
        opt.setName('level')
          .setDescription('Volume level (1-100)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(100)
      ) as SlashCommandBuilder;
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = MusicService.getQueue(interaction.guildId!);
    if (!queue?.current) {
      await interaction.reply({
        components: [createMusicActionContainer('Nothing is playing', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const level = interaction.options.getInteger('level', true);
    queue.volume = level;
    await queue.player.setGlobalVolume(level);

    await interaction.reply({
      components: [createMusicActionContainer(`Volume set to **${level}%**`)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
