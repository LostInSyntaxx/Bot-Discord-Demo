/**
 * Verification Service
 * Manages server verification configuration
 */

import { getDatabase } from './database.service';

export const VerifyService = {
  setRole(guildId: string, roleId: string): void {
    getDatabase().run(
      'INSERT OR REPLACE INTO verify_config (guild_id, role_id) VALUES (?, ?)',
      [guildId, roleId]
    );
  },

  getRole(guildId: string): string | null {
    const row = getDatabase().query<{ role_id: string }, [string]>(
      'SELECT role_id FROM verify_config WHERE guild_id = ?'
    ).get(guildId);
    return row ? row.role_id : null;
  },

  clearRole(guildId: string): void {
    getDatabase().run('DELETE FROM verify_config WHERE guild_id = ?', [guildId]);
  },
};
