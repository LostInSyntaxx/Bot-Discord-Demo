import { ExtendedClient } from '@bot-types/Client';
import { BaseService } from '@structures/BaseService';
import { getDatabase } from './database.service';
import { Collection, Invite } from 'discord.js';

export class InviteService extends BaseService {
  private inviteCache: Collection<string, Collection<string, number>> = new Collection();

  constructor(client: ExtendedClient) {
    super(client);
  }

  async initialize(): Promise<void> {
    // Cache all invites for all guilds the bot is in
    for (const guild of this.client.guilds.cache.values()) {
      try {
        const invites = await guild.invites.fetch();
        const cache = new Collection<string, number>();
        invites.forEach(inv => cache.set(inv.code, inv.uses ?? 0));
        this.inviteCache.set(guild.id, cache);
      } catch (error) {
        // Missing permissions usually
      }
    }
  }

  async refreshGuild(guildId: string): Promise<void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) return;
    try {
      const invites = await guild.invites.fetch();
      const cache = new Collection<string, number>();
      invites.forEach(inv => cache.set(inv.code, inv.uses ?? 0));
      this.inviteCache.set(guildId, cache);
    } catch (error) {}
  }

  getCache(guildId: string) {
    return this.inviteCache.get(guildId);
  }

  updateCache(guildId: string, code: string, uses: number) {
    if (!this.inviteCache.has(guildId)) {
      this.inviteCache.set(guildId, new Collection());
    }
    this.inviteCache.get(guildId)!.set(code, uses);
  }

  static getInvites(guildId: string, userId: string) {
    const db = getDatabase();
    const row = db.query('SELECT * FROM invites WHERE guild_id = ? AND user_id = ?').get(guildId, userId) as any;
    return row || { regular: 0, fake: 0, bonus: 0 };
  }

  static addInvite(guildId: string, userId: string) {
    const db = getDatabase();
    db.run(
      'INSERT INTO invites (guild_id, user_id, regular) VALUES (?, ?, 1) ON CONFLICT(guild_id, user_id) DO UPDATE SET regular = regular + 1',
      [guildId, userId]
    );
  }
}
