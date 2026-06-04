import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService } from '@services/music.service';
import { createMusicActionContainer } from '@ui/containers/musicContainer';

export default new (class ShuffleCommand extends BaseCommand {
  constructor() {
    super({
      name: 'shuffle',
      description: 'Shuffle the queue',
      category: 'utility',
      cooldown: 2,
      guildOnly: true,
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = MusicService.getQueue(interaction.guildId!);
    if (!queue || queue.tracks.length < 2) {
      await interaction.reply({
        components: [createMusicActionContainer('Not enough tracks in queue to shuffle', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Fisher-Yates shuffle
    for (let i = queue.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue.tracks[i], queue.tracks[j]] = [queue.tracks[j], queue.tracks[i]];
    }

    await interaction.reply({
      components: [createMusicActionContainer(`Shuffled **${queue.tracks.length}** tracks`)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
