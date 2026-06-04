import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService } from '@services/music.service';
import { createMusicActionContainer } from '@ui/containers/musicContainer';

export default new (class StopCommand extends BaseCommand {
  constructor() {
    super({
      name: 'stop',
      description: 'Stop music and clear the queue',
      category: 'music',
      cooldown: 2,
      guildOnly: true,
    });
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

    await MusicService.deleteQueue(interaction.guildId!);

    await interaction.reply({
      components: [createMusicActionContainer('Stopped music and cleared the queue')],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
