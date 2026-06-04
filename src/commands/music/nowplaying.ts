import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService } from '@services/music.service';
import { createNowPlayingContainer, createMusicActionContainer } from '@ui/containers/musicContainer';

export default new (class NowPlayingCommand extends BaseCommand {
  constructor() {
    super({
      name: 'nowplaying',
      description: 'Show the currently playing song',
      category: 'music',
      cooldown: 3,
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

    await interaction.reply({
      components: [createNowPlayingContainer(queue)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
