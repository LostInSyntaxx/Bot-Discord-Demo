import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService } from '@services/music.service';
import { createQueueContainer, createMusicActionContainer } from '@ui/containers/musicContainer';

export default new (class QueueCommand extends BaseCommand {
  constructor() {
    super({
      name: 'queue',
      description: 'Show the music queue',
      category: 'utility',
      cooldown: 3,
      guildOnly: true,
    });

    this.data = new SlashCommandBuilder()
      .setName('queue')
      .setDescription('Show the music queue')
      .setDMPermission(false)
      .addIntegerOption(opt =>
        opt.setName('page')
          .setDescription('Page number')
          .setMinValue(1)
      ) as SlashCommandBuilder;
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = MusicService.getQueue(interaction.guildId!);
    if (!queue) {
      await interaction.reply({
        components: [createMusicActionContainer('Nothing is playing', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const page = interaction.options.getInteger('page') ?? 1;

    await interaction.reply({
      components: [createQueueContainer(queue, page)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
