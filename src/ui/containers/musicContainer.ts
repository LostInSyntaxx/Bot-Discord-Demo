import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} from 'discord.js';
import { Emoji } from '@config/emoji';
import { GuildQueue, MusicService } from '@services/music.service';

/**
 * Extract a YouTube thumbnail URL from a track URI.
 * Returns null if the URI is not a recognisable YouTube link.
 */
function getTrackThumbnail(uri: string | undefined): string | null {
  if (!uri) return null;

  const ytMatch =
    uri.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
    uri.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
    uri.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);

  if (ytMatch) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
  }

  return null;
}



// ─────────────────────────────────────────────────────────────────────────────
// Now Playing
// ─────────────────────────────────────────────────────────────────────────────

export function createNowPlayingContainer(queue: GuildQueue): ContainerBuilder {
  const { current, tracks, volume, loop } = queue;

  if (!current) {
    return new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${Emoji.Error} **SYSTEM ERROR:** Nothing is currently playing in this channel.`)
    );
  }

  const info = current.track.info;
  const dur = MusicService.formatDuration(info.length);
  const loopLabel = loop === 'track' ? 'Track' : loop === 'queue' ? 'Queue' : 'Off';
  const loopIcon = loop === 'track' ? Emoji.MusicReplay : loop === 'queue' ? Emoji.MusicLoop : Emoji.MusicResume;
  const thumbnail = info.artworkUrl ?? getTrackThumbnail(info.uri);

  const container = new ContainerBuilder();

  // 1. Tactical Header
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${Emoji.Music} AUDIO INTERFACE — NOW PLAYING`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // 2. Visual Media
  if (thumbnail) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(thumbnail),
      )
    );
  }

  // 3. Track Identity & Status
  const nextTrack = tracks[0] ?? null;
  const statusLine = `**STATUS:** ${Emoji.Success} TRANSMITTING  •  **VOLUME:** ${volume}%  •  **LOOP:** ${loopLabel}`;

  const infoText =
    `### [${info.title}](${info.uri ?? ''})\n` +
    `> ${Emoji.User} **Artist:** ${info.author}\n` +
    `> ${Emoji.Clock} **Duration:** ${dur}\n\n` +
    `-# ${statusLine}\n` +
    `-# ${Emoji.ArrowRight} **NEXT DATA:** ${nextTrack ? nextTrack.track.info.title : 'End of Transmission'}`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(infoText)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // 4. Footer Metadata
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# ${Emoji.MusicAdd} **Queue Size:** ${tracks.length}  •  ${Emoji.User} **Operator:** ${current.requestedBy}`
    )
  );

  return container;
}

// ─────────────────────────────────────────────────────────────────────────────
// Queue
// ─────────────────────────────────────────────────────────────────────────────

export function createQueueContainer(queue: GuildQueue, page = 1): ContainerBuilder {
  const perPage = 10;
  const start = (page - 1) * perPage;
  const slice = queue.tracks.slice(start, start + perPage);
  const totalPages = Math.max(1, Math.ceil(queue.tracks.length / perPage));

  const container = new ContainerBuilder();

  // Header
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${Emoji.Music} Queue — Page ${page}/${totalPages}`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // Now Playing row
  if (queue.current) {
    const info = queue.current.track.info;
    const npUri = info.uri ?? '';
    const thumbnail = info.artworkUrl ?? getTrackThumbnail(npUri);

    const nowPlayingText =
      `**Now Playing**\n` +
      `### [${info.title}](${npUri})\n` +
      `-# ${Emoji.Clock} ${MusicService.formatDuration(info.length)}  •  ${Emoji.User} ${queue.current.requestedBy}`;

    if (thumbnail) {
      container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(thumbnail),
        )
      );
    }
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(nowPlayingText));

    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
  }

  // Track list
  if (slice.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Queue is empty`)
    );
  } else {
    const list = slice
      .map((e, i) => {
        const eUri = e.track.info.uri ?? '';
        const dur = MusicService.formatDuration(e.track.info.length);
        return (
          `**${start + i + 1}.** [${e.track.info.title}](${eUri})\n` +
          `-# ${Emoji.Clock} ${dur}  •  ${Emoji.User} ${e.requestedBy}`
        );
      })
      .join('\n\n');

    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(list));
  }

  // Footer
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# ${Emoji.MusicAdd} **${queue.tracks.length}** total  •  ${Emoji.MusicVolume} Volume: **${queue.volume}%**  •  ${Emoji.MusicLoop} Loop: **${queue.loop}**`
    )
  );

  return container;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic action / status message
// ─────────────────────────────────────────────────────────────────────────────

export function createMusicActionContainer(message: string, success = true): ContainerBuilder {
  return new ContainerBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${success ? Emoji.Success : Emoji.Error} ${message}`)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Added to queue (with thumbnail)
// ─────────────────────────────────────────────────────────────────────────────

export function createAddedToQueueContainer(
  title: string,
  uri: string,
  length: number,
  author: string,
  position: number,
  requestedBy: string,
  artworkUrl?: string
): ContainerBuilder {
  const thumbnail = artworkUrl ?? getTrackThumbnail(uri);
  const dur = MusicService.formatDuration(length);

  const container = new ContainerBuilder();

  // 1. Tactical Header
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${Emoji.MusicAdd} QUEUE UPDATE — TRACK INITIALIZED`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // 2. Visual Media
  if (thumbnail) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(thumbnail),
      )
    );
  }

  // 3. Track Info
  const infoText =
    `### [${title}](${uri})\n` +
    `> ${Emoji.User} **Artist:** ${author}\n` +
    `> ${Emoji.Clock} **Duration:** ${dur}\n\n` +
    `-# **QUEUE STATUS:** Position **#${position}** in sequence\n` +
    `-# ${Emoji.User} **Authorized by:** ${requestedBy}`;

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(infoText));

  return container;
}

// ─────────────────────────────────────────────────────────────────────────────
// Playlist Loaded / Added to Queue
// ─────────────────────────────────────────────────────────────────────────────

export function createPlaylistContainer(
  playlistName: string,
  trackCount: number,
  requestedBy: string,
  firstTrackArtworkUrl?: string,
  firstTrackUri?: string,
  addedToQueue = false,
  tracks: any[] = []
): ContainerBuilder {
  const thumbnail = firstTrackArtworkUrl ?? getTrackThumbnail(firstTrackUri);
  const totalDuration = tracks.reduce((acc, t) => acc + (t.info.length || 0), 0);
  const formattedTotal = MusicService.formatDuration(totalDuration);

  const container = new ContainerBuilder();

  // 1. Tactical Header
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# ${Emoji.Music} ${addedToQueue ? 'PLAYLIST QUEUED' : 'PLAYLIST INITIALIZED'}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // 2. Visual Media
  if (thumbnail) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(thumbnail),
      )
    );
  }

  // 3. Playlist Identity
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`### ${playlistName}`)
  );

  // 4. Track Preview (First 5 tracks)
  if (tracks.length > 0) {
    const previewCount = 5;
    const preview = tracks
      .slice(0, previewCount)
      .map((t, i) => {
        const dur = MusicService.formatDuration(t.info.length);
        return `> **${i + 1}.** [${t.info.title}](${t.info.uri || ''}) \n> -# ${Emoji.User} ${t.info.author}  •  ${Emoji.Clock} ${dur}`;
      })
      .join('\n\n');

    const remaining = tracks.length - previewCount;
    const previewText =
      preview + (remaining > 0 ? `\n\n-# ...and **${remaining}** more frequencies detected in the stream.` : '');

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(previewText)
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // 5. Tactical Metadata Footer
  const statusLine =
    `**COUNT:** ${trackCount} Tracks  •  **TOTAL LENGTH:** ${formattedTotal}`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# ${statusLine}\n` +
      `-# ${Emoji.User} **Authorized by:** ${requestedBy}`
    )
  );

  return container;
}

// ─────────────────────────────────────────────────────────────────────────────
// Search Results
// ─────────────────────────────────────────────────────────────────────────────

import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} from 'discord.js';

export interface SearchTrackInfo {
  title: string;
  author: string;
  length: number;
  uri?: string;
  artworkUrl?: string;
  identifier: string;
}

export function createSearchContainer(
  query: string,
  tracks: SearchTrackInfo[]
): { container: ContainerBuilder; row: ActionRowBuilder<StringSelectMenuBuilder> } {
  const container = new ContainerBuilder();

  // Header
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${Emoji.Search} SEARCH CORE — DISCOVERY RESULTS`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // Tactical Query Info
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`> **TARGET:** \`${query}\`\n> **TOTAL MATCHES:** \`${tracks.length}\` results found.`)
  );

  // Visual Context
  const firstThumb = tracks[0]?.artworkUrl ?? getTrackThumbnail(tracks[0]?.uri);
  if (firstThumb) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(firstThumb),
      )
    );
  }

  // Track Results List
  const list = tracks
    .map((t, i) => {
      const dur = MusicService.formatDuration(t.length);
      return `### ${['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][i]} [${t.title}](${t.uri ?? ''})\n-# ${Emoji.User} **Author:** ${t.author}  •  ${Emoji.Clock} **Length:** ${dur}`;
    })
    .join('\n\n');

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(list)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // Selection Hint
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${Emoji.Info} *Please select a frequency to initiate streaming.*`)
  );

  // Select menu
  const options = tracks.map((t, i) =>
    new StringSelectMenuOptionBuilder()
      .setLabel(`${i + 1}. ${t.title}`.slice(0, 100))
      .setDescription(`${t.author} — ${MusicService.formatDuration(t.length)}`.slice(0, 100))
      .setValue(i.toString())
      .setEmoji({ name: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][i] })
  );

  const menu = new StringSelectMenuBuilder()
    .setCustomId('music:search')
    .setPlaceholder('⚡ CHOOSE A TRACK TO DEPLOY')
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

  return { container, row };
}
