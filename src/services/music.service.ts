/**
 * Music Service — Lavalink via Shoukaku v4
 * Manages player instances per guild
 */

import { Shoukaku, Connectors, Player, Track } from 'shoukaku';
import { Client } from 'discord.js';

export interface QueueEntry {
  track: Track;
  requestedBy: string; // user tag
}

export interface GuildQueue {
  player: Player;
  tracks: QueueEntry[];
  current: QueueEntry | null;
  volume: number;
  loop: 'none' | 'track' | 'queue';
  textChannelId: string;
}

const queues = new Map<string, GuildQueue>();
let shoukaku: Shoukaku | null = null;

export const LAVALINK_NODES = [
  {
    name: 'Main',
    url: 'localhost:2333',
    auth: '123456789',
    secure: false,
  },
];

export function initShoukaku(client: Client): Shoukaku {
  shoukaku = new Shoukaku(new Connectors.DiscordJS(client), LAVALINK_NODES, {
    reconnectTries: 3,
    reconnectInterval: 5000,
    restTimeout: 10000,
  });

  shoukaku.on('error', (name, error) => {
    console.error(`[Lavalink] Node "${name}" error:`, error.message);
  });

  shoukaku.on('ready', (name) => {
    console.log(`✅ [Lavalink] Node "${name}" connected`);
  });

  shoukaku.on('disconnect', (name) => {
    console.warn(`⚠️ [Lavalink] Node "${name}" disconnected`);
  });

  return shoukaku;
}

export function getShoukaku(): Shoukaku {
  if (!shoukaku) throw new Error('Shoukaku not initialized');
  return shoukaku;
}

export const MusicService = {
  getQueue(guildId: string): GuildQueue | null {
    return queues.get(guildId) ?? null;
  },

  createQueue(guildId: string, player: Player, textChannelId: string): GuildQueue {
    const queue: GuildQueue = {
      player,
      tracks: [],
      current: null,
      volume: 100,
      loop: 'none',
      textChannelId,
    };
    queues.set(guildId, queue);
    return queue;
  },

  async deleteQueue(guildId: string): Promise<void> {
    queues.delete(guildId);
    try {
      await getShoukaku().leaveVoiceChannel(guildId);
    } catch {
      // already disconnected
    }
  },

  async search(query: string): Promise<{ tracks: Track[]; playlistName?: string } | null> {
    const node = getShoukaku().getIdealNode();
    if (!node) return null;

    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    const searchQuery = isUrl ? query : `ytsearch:${query}`;

    const result = await node.rest.resolve(searchQuery);
    if (!result || result.loadType === 'empty' || result.loadType === 'error') return null;

    if (result.loadType === 'playlist') {
      return {
        tracks: result.data.tracks,
        playlistName: result.data.info.name,
      };
    }

    if (result.loadType === 'search') {
      return { tracks: result.data };
    }

    if (result.loadType === 'track') {
      return { tracks: [result.data] };
    }

    return null;
  },

  /** Search and return up to 5 results for the user to pick from */
  async searchTracks(query: string): Promise<Track[] | null> {
    const node = getShoukaku().getIdealNode();
    if (!node) return null;

    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    const searchQuery = isUrl ? query : `ytsearch:${query}`;

    const result = await node.rest.resolve(searchQuery);
    if (!result || result.loadType === 'empty' || result.loadType === 'error') return null;

    if (result.loadType === 'track') {
      return [result.data];
    }

    if (result.loadType === 'search') {
      return (result.data as Track[]).slice(0, 5);
    }

    if (result.loadType === 'playlist') {
      return (result.data.tracks as Track[]).slice(0, 5);
    }

    return null;
  },

  async playNext(guildId: string): Promise<boolean> {
    const queue = queues.get(guildId);
    if (!queue) return false;

    if (queue.loop === 'track' && queue.current) {
      await queue.player.playTrack({ track: queue.current.track });
      return true;
    }

    if (queue.loop === 'queue' && queue.current) {
      queue.tracks.push(queue.current);
    }

    const next = queue.tracks.shift();
    if (!next) {
      queue.current = null;
      return false;
    }

    queue.current = next;
    await queue.player.playTrack({ track: next.track });
    return true;
  },

  clearQueue(guildId: string): boolean {
    const queue = queues.get(guildId);
    if (!queue) return false;

    queue.tracks = [];
    return true;
  },

  formatDuration(ms: number): string {
    if (!ms || ms === 0) return 'LIVE';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  },
};
