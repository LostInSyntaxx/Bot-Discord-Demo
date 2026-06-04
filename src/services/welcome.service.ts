/**
 * Welcome Service
 * Manages welcome message configuration per guild
 */

import { getDatabase } from './database.service';

export interface WelcomeConfig {
  guild_id: string;
  channel_id: string;
  message: string;
  enabled: number;
}

export const WelcomeService = {
  getConfig(guildId: string): WelcomeConfig | null {
    return getDatabase()
      .query<WelcomeConfig, [string]>('SELECT * FROM welcome_config WHERE guild_id = ?')
      .get(guildId);
  },

  setChannel(guildId: string, channelId: string): void {
    getDatabase().run(`
      INSERT INTO welcome_config (guild_id, channel_id, message, enabled)
      VALUES (?, ?, 'Welcome {user} to {server}!', 1)
      ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id
    `, [guildId, channelId]);
  },

  setMessage(guildId: string, message: string): void {
    getDatabase().run(`
      INSERT INTO welcome_config (guild_id, channel_id, message, enabled)
      VALUES (?, '', ?, 1)
      ON CONFLICT(guild_id) DO UPDATE SET message = excluded.message
    `, [guildId, message]);
  },

  setEnabled(guildId: string, enabled: boolean): void {
    getDatabase().run(`
      INSERT INTO welcome_config (guild_id, channel_id, message, enabled)
      VALUES (?, '', 'Welcome {user} to {server}!', ?)
      ON CONFLICT(guild_id) DO UPDATE SET enabled = excluded.enabled
    `, [guildId, enabled ? 1 : 0]);
  },

  formatMessage(template: string, username: string, serverName: string): string {
    return template
      .replace(/{user}/g, username)
      .replace(/{server}/g, serverName);
  },
};
