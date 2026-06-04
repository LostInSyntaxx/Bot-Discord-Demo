/**
 * Leveling Service
 * XP gain, level calculation, leaderboard
 */

import { getDatabase } from './database.service';

export interface LevelData {
  guild_id: string;
  user_id: string;
  xp: number;
  level: number;
}

export interface LevelConfig {
  guild_id: string;
  channel_id: string | null;
  enabled: number;
}

// XP required to reach a given level: 100 * level^2
export function xpForLevel(level: number): number {
  return 100 * Math.pow(level, 2);
}

// XP range for current level progress
export function xpForNextLevel(level: number): number {
  return xpForLevel(level + 1);
}

export const LevelingService = {
  getData(guildId: string, userId: string): LevelData {
    const row = getDatabase()
      .query<LevelData, [string, string]>(
        'SELECT * FROM levels WHERE guild_id = ? AND user_id = ?'
      )
      .get(guildId, userId);

    if (!row) {
      getDatabase().run(
        'INSERT OR IGNORE INTO levels (guild_id, user_id, xp, level) VALUES (?, ?, 0, 0)',
        [guildId, userId]
      );
      return { guild_id: guildId, user_id: userId, xp: 0, level: 0 };
    }
    return row;
  },

  // Returns new level if leveled up, null otherwise
  addXp(guildId: string, userId: string, amount: number): number | null {
    const data = this.getData(guildId, userId);
    const newXp = data.xp + amount;
    const newLevel = this.calculateLevel(newXp);
    const leveledUp = newLevel > data.level;

    getDatabase().run(
      'UPDATE levels SET xp = ?, level = ? WHERE guild_id = ? AND user_id = ?',
      [newXp, newLevel, guildId, userId]
    );

    return leveledUp ? newLevel : null;
  },

  calculateLevel(xp: number): number {
    let level = 0;
    while (xp >= xpForNextLevel(level)) {
      level++;
    }
    return level;
  },

  getLeaderboard(guildId: string, limit = 10): LevelData[] {
    return getDatabase()
      .query<LevelData, [string, number]>(
        'SELECT * FROM levels WHERE guild_id = ? ORDER BY xp DESC LIMIT ?'
      )
      .all(guildId, limit);
  },

  getRank(guildId: string, userId: string): number {
    const row = getDatabase()
      .query<{ rank: number }, [string, string, string]>(`
        SELECT COUNT(*) + 1 as rank FROM levels
        WHERE guild_id = ? AND xp > (
          SELECT xp FROM levels WHERE guild_id = ? AND user_id = ?
        )
      `)
      .get(guildId, guildId, userId);
    return row?.rank ?? 1;
  },

  getConfig(guildId: string): LevelConfig | null {
    return getDatabase()
      .query<LevelConfig, [string]>('SELECT * FROM level_config WHERE guild_id = ?')
      .get(guildId);
  },

  setChannel(guildId: string, channelId: string | null): void {
    getDatabase().run(`
      INSERT INTO level_config (guild_id, channel_id, enabled)
      VALUES (?, ?, 1)
      ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id
    `, [guildId, channelId]);
  },

  setEnabled(guildId: string, enabled: boolean): void {
    getDatabase().run(`
      INSERT INTO level_config (guild_id, channel_id, enabled)
      VALUES (?, NULL, ?)
      ON CONFLICT(guild_id) DO UPDATE SET enabled = excluded.enabled
    `, [guildId, enabled ? 1 : 0]);
  },
};
