/**
 * Auto Role Service
 * Manages roles that are automatically assigned when a member joins
 */

import { getDatabase } from './database.service';

export const AutoRoleService = {
  addRole(guildId: string, roleId: string): void {
    getDatabase().run(
      'INSERT OR IGNORE INTO auto_roles (guild_id, role_id) VALUES (?, ?)',
      [guildId, roleId]
    );
  },

  removeRole(guildId: string, roleId: string): void {
    getDatabase().run(
      'DELETE FROM auto_roles WHERE guild_id = ? AND role_id = ?',
      [guildId, roleId]
    );
  },

  getRoles(guildId: string): string[] {
    const rows = getDatabase().query<{ role_id: string }, [string]>(
      'SELECT role_id FROM auto_roles WHERE guild_id = ?'
    ).all(guildId);
    return rows.map(r => r.role_id);
  },

  clearRoles(guildId: string): void {
    getDatabase().run('DELETE FROM auto_roles WHERE guild_id = ?', [guildId]);
  },
};
