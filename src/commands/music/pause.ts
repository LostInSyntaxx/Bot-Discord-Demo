import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService } from '@services/music.service';
import { createMusicActionContainer } from '@ui/containers/musicContainer';

export default new (class PauseCommand extends BaseCommand {
  constructor() {
    super({
      name: 'pause',
      description: 'Pause or resume the current song',
      category: 'music',
      cooldown: 2,
      guildOnly: true,
    });
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

    const isPaused = queue.player.paused;
    await queue.player.setPaused(!isPaused);

    await interaction.reply({
      components: [createMusicActionContainer(isPaused ? '▶️ Resumed' : '⏸️ Paused')],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
