import { ChatInputCommandInteraction, MessageFlags, GuildMember } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService } from '@services/music.service';
import { createMusicActionContainer } from '@ui/containers/musicContainer';

export default new (class ClearCommand extends BaseCommand {
  constructor() {
    super({
      name: 'clear',
      description: 'ล้างรายการเพลงทั้งหมดในคิว',
      category: 'music',
      cooldown: 5,
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.member as GuildMember;
    const guildId = interaction.guildId!;

    // Check voice channel
    if (!member.voice.channel) {
      await interaction.reply({
        components: [createMusicActionContainer('You must be in a voice channel to clear the queue.', false)],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    const queue = MusicService.getQueue(guildId);
    if (!queue || queue.tracks.length === 0) {
      await interaction.reply({
        components: [createMusicActionContainer('There are no tracks in the queue to clear.', false)],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if user is in the same voice channel
    if (member.voice.channelId !== queue.player.voiceChannelId) {
      await interaction.reply({
        components: [createMusicActionContainer('You must be in the same voice channel as the bot.', false)],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    const trackCount = queue.tracks.length;
    MusicService.clearQueue(guildId);

    await interaction.reply({
      components: [createMusicActionContainer(`Successfully cleared **${trackCount}** track(s) from the queue.`)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
