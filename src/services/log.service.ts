import { ExtendedClient } from '@bot-types/Client';
import { BaseService } from '@structures/BaseService';
import { getDatabase } from './database.service';

export interface LogConfig {
  guild_id: string;
  channel_id: string;
  events: string[];
}

export class LogService extends BaseService {
  constructor(client: ExtendedClient) {
    super(client);
  }

  static getLogChannel(guildId: string): string | null {
    const db = getDatabase();
    const row = db.query('SELECT channel_id FROM log_config WHERE guild_id = ?').get(guildId) as { channel_id: string } | null;
    return row ? row.channel_id : null;
  }

  static setLogChannel(guildId: string, channelId: string): void {
    const db = getDatabase();
    db.run(
      'INSERT OR REPLACE INTO log_config (guild_id, channel_id, events) VALUES (?, ?, ?)',
      [guildId, channelId, JSON.stringify(['all'])]
    );
  }

  static isEventEnabled(guildId: string, eventName: string): boolean {
    const db = getDatabase();
    const row = db.query('SELECT events FROM log_config WHERE guild_id = ?').get(guildId) as { events: string } | null;
    if (!row) return false;
    
    const events = JSON.parse(row.events) as string[];
    return events.includes('all') || events.includes(eventName);
  }
}
