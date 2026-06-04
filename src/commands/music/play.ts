import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  GuildMember,
  TextChannel,
} from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService, getShoukaku } from '@services/music.service';
import {
  createNowPlayingContainer,
  createMusicActionContainer,
  createAddedToQueueContainer,
  createPlaylistContainer,
  createSearchContainer,
} from '@ui/containers/musicContainer';
import { createLoadingContainer } from '@ui/containers/loadingContainer';

export default new (class PlayCommand extends BaseCommand {
  constructor() {
    super({
      name: 'play',
      description: 'Play a song or playlist from YouTube/SoundCloud',
      category: 'music',
      cooldown: 3,
      guildOnly: true,
    });

    this.data = new SlashCommandBuilder()
      .setName('play')
      .setDescription('Play a song or playlist from YouTube/SoundCloud')
      .setDMPermission(false)
      .addStringOption(opt =>
        opt.setName('query')
          .setDescription('Song name or URL')
          .setRequired(true)
      ) as SlashCommandBuilder;
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({
        components: [createMusicActionContainer('❌ You must be in a voice channel to use this command!', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Check if bot has permission to join the voice channel
    const botMember = interaction.guild!.members.me!;
    const permissions = voiceChannel.permissionsFor(botMember);
    
    if (!permissions?.has('Connect')) {
      await interaction.reply({
        components: [createMusicActionContainer('❌ I don\'t have permission to join your voice channel!', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    if (!permissions?.has('Speak')) {
      await interaction.reply({
        components: [createMusicActionContainer('❌ I don\'t have permission to speak in your voice channel!', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Reply with loading first — this sets IsComponentsV2 so editReply works with containers
    await interaction.reply({
      components: [createLoadingContainer('🔍 Searching for your song...')],
      flags: MessageFlags.IsComponentsV2,
    });

    const query = interaction.options.getString('query', true);
    const isUrl = query.startsWith('http://') || query.startsWith('https://');

    // ── URL → resolve directly, no search UI ────────────────────────────────
    if (!isUrl) {
      let searchResults;
      try {
        searchResults = await MusicService.searchTracks(query);
      } catch {
        await interaction.editReply({
          components: [createMusicActionContainer('Lavalink server is not connected. Please start it first.', false)],
        });
        return;
      }

      if (!searchResults || searchResults.length === 0) {
        await interaction.editReply({
          components: [createMusicActionContainer(`No results found for: **${query}**`, false)],
        });
        return;
      }

      const { container, row } = createSearchContainer(
        query,
        searchResults.map(t => ({
          title: t.info.title,
          author: t.info.author,
          length: t.info.length,
          uri: t.info.uri,
          artworkUrl: t.info.artworkUrl,
          identifier: t.info.identifier,
        }))
      );

      const msg = await interaction.editReply({
        components: [container, row],
        flags: MessageFlags.IsComponentsV2,
      });

      // Cache tracks keyed by message ID for the select menu handler
      if (!(client as any).searchCache) (client as any).searchCache = new Map();
      (client as any).searchCache.set(msg.id, searchResults);

      // Auto-expire cache after 2 minutes
      setTimeout(() => (client as any).searchCache?.delete(msg.id), 120_000);
      return;
    }

    // ── URL → resolve and play / queue directly ──────────────────────────────
    let result;
    try {
      result = await MusicService.search(query);
    } catch {
      await interaction.editReply({
        components: [createMusicActionContainer('Lavalink server is not connected. Please start it first.', false)],
      });
      return;
    }

    if (!result || result.tracks.length === 0) {
      await interaction.editReply({
        components: [createMusicActionContainer(`No results found for: **${query}**`, false)],
      });
      return;
    }

    const guildId = interaction.guildId!;
    let queue = MusicService.getQueue(guildId);

    // Create player if not exists
    if (!queue) {
      const shoukaku = getShoukaku();
      const node = shoukaku.getIdealNode();
      if (!node) {
        await interaction.editReply({
          components: [createMusicActionContainer('No Lavalink nodes available', false)],
        });
        return;
      }

      const player = await shoukaku.joinVoiceChannel({
        guildId,
        channelId: voiceChannel.id,
        shardId: interaction.guild!.shardId,
      });

      queue = MusicService.createQueue(guildId, player, interaction.channelId);

      // Handle track end → play next or leave
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
          // Post now playing for the new track
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

    // Add tracks to queue
    const entries = result.tracks.map(t => ({
      track: t,
      requestedBy: interaction.user.tag,
    }));

    const isPlaylist = !!result.playlistName;

    if (!queue.current) {
      // Play immediately
      queue.current = entries[0];
      queue.tracks.push(...entries.slice(1));
      await queue.player.playTrack({ track: entries[0].track });
      await queue.player.setGlobalVolume(queue.volume);

      if (isPlaylist) {
        const firstInfo = entries[0].track.info as { artworkUrl?: string; uri?: string };
        await interaction.editReply({
          components: [createPlaylistContainer(
            result.playlistName!,
            result.tracks.length,
            interaction.user.tag,
            firstInfo.artworkUrl,
            firstInfo.uri,
            false,
            result.tracks,
          )],
        });
      } else {
        await interaction.editReply({
          components: [createNowPlayingContainer(queue)],
        });
      }
    } else {
      // Add to queue
      queue.tracks.push(...entries);

      if (isPlaylist) {
        const firstInfo = entries[0].track.info as { artworkUrl?: string; uri?: string };
        await interaction.editReply({
          components: [createPlaylistContainer(
            result.playlistName!,
            result.tracks.length,
            interaction.user.tag,
            firstInfo.artworkUrl,
            firstInfo.uri,
            true,
            result.tracks,
          )],
        });
      } else {
        const t = entries[0].track.info as {
          title: string; uri?: string; length: number; author: string; artworkUrl?: string;
        };
        await interaction.editReply({
          components: [createAddedToQueueContainer(
            t.title,
            t.uri ?? '',
            t.length,
            t.author,
            queue.tracks.length,
            interaction.user.tag,
            t.artworkUrl,
          )],
        });
      }
    }
  }
})();
