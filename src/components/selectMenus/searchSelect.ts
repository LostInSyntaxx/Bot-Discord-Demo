import {
  StringSelectMenuInteraction,
  MessageFlags,
  GuildMember,
  TextChannel,
} from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseComponent } from '@structures/BaseComponent';
import { MusicService, getShoukaku } from '@services/music.service';
import {
  createNowPlayingContainer,
  createMusicActionContainer,
  createAddedToQueueContainer,
} from '@ui/containers/musicContainer';

export default new (class SearchSelectMenu extends BaseComponent {
  constructor() {
    super({
      customId: 'music',
      type: 'selectMenu',
    });
  }

  async execute(client: ExtendedClient, interaction: StringSelectMenuInteraction): Promise<void> {
    const [, action] = interaction.customId.split(':');
    if (action !== 'search') return;

    // Retrieve the cached search results stored on the message
    const cached = (client as any).searchCache?.get(interaction.message.id) as
      | import('shoukaku').Track[]
      | undefined;

    if (!cached) {
      await interaction.update({
        components: [createMusicActionContainer('Search session expired. Please search again.', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const index = parseInt(interaction.values[0], 10);
    const track = cached[index];

    if (!track) {
      await interaction.update({
        components: [createMusicActionContainer('Invalid selection.', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Clean up cache
    (client as any).searchCache?.delete(interaction.message.id);

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.update({
        components: [createMusicActionContainer('You must be in a voice channel.', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const guildId = interaction.guildId!;
    let queue = MusicService.getQueue(guildId);

    if (!queue) {
      const shoukaku = getShoukaku();
      const node = shoukaku.getIdealNode();
      if (!node) {
        await interaction.update({
          components: [createMusicActionContainer('No Lavalink nodes available.', false)],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      const player = await shoukaku.joinVoiceChannel({
        guildId,
        channelId: voiceChannel.id,
        shardId: interaction.guild!.shardId,
      });

      queue = MusicService.createQueue(guildId, player, interaction.channelId);

      player.on('end', async () => {
        const hasNext = await MusicService.playNext(guildId);
        const q = MusicService.getQueue(guildId);
        if (!hasNext) {
          if (q) {
            const ch = interaction.guild!.channels.cache.get(q.textChannelId) as TextChannel | undefined;
            await ch?.send({
              components: [createMusicActionContainer('Queue finished. Leaving voice channel.')],
              flags: MessageFlags.IsComponentsV2,
            }).catch(() => null);
          }
          await MusicService.deleteQueue(guildId);
        } else if (q?.current) {
          const ch = interaction.guild!.channels.cache.get(q.textChannelId) as TextChannel | undefined;
          await ch?.send({
            components: [createNowPlayingContainer(q)],
            flags: MessageFlags.IsComponentsV2,
          }).catch(() => null);
        }
      });

      player.on('exception', async () => {
        await MusicService.playNext(guildId);
      });
    }

    const entry = { track, requestedBy: interaction.user.tag };

    if (!queue.current) {
      queue.current = entry;
      await queue.player.playTrack({ track });
      await queue.player.setGlobalVolume(queue.volume);

      await interaction.update({
        components: [createNowPlayingContainer(queue)],
        flags: MessageFlags.IsComponentsV2,
      });
    } else {
      queue.tracks.push(entry);
      const t = track.info as { title: string; uri?: string; length: number; author: string; artworkUrl?: string };
      await interaction.update({
        components: [createAddedToQueueContainer(
          t.title,
          t.uri ?? '',
          t.length,
          t.author,
          queue.tracks.length,
          interaction.user.tag,
          t.artworkUrl,
        )],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }
})();
