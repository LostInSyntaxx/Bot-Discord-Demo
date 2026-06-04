/**
 * Join Service - Enhanced member join management
 * Handles welcome messages, auto-roles, DM welcomes, and join tracking
 */

import { getDatabase } from './database.service';
import { GuildMember, Role, TextChannel } from 'discord.js';

export interface JoinConfig {
  guild_id: string;
  welcome_channel: string | null;
  welcome_message: string;
  welcome_enabled: number;
  dm_welcome: string;
  dm_enabled: number;
  auto_role_id: string | null;
  auto_role_enabled: number;
  join_counter: number;
  show_member_count: number;
  last_updated: string;
}

export const JoinService = {
  /**
   * Get join configuration for a guild
   */
  getConfig(guildId: string): JoinConfig | null {
    const db = getDatabase();
    return db.query(
      'SELECT * FROM join_config WHERE guild_id = ?'
    ).get(guildId) as JoinConfig | null;
  },

  /**
   * Set welcome channel
   */
  setWelcomeChannel(guildId: string, channelId: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO join_config (guild_id, welcome_channel, last_updated)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET 
        welcome_channel = excluded.welcome_channel,
        last_updated = excluded.last_updated
    `, [guildId, channelId, now]);
  },

  /**
   * Set welcome message template
   */
  setWelcomeMessage(guildId: string, message: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO join_config (guild_id, welcome_message, last_updated)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET 
        welcome_message = excluded.welcome_message,
        last_updated = excluded.last_updated
    `, [guildId, message, now]);
  },

  /**
   * Toggle welcome messages
   */
  toggleWelcome(guildId: string, enabled: boolean): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO join_config (guild_id, welcome_enabled, last_updated)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET 
        welcome_enabled = excluded.welcome_enabled,
        last_updated = excluded.last_updated
    `, [guildId, enabled ? 1 : 0, now]);
  },

  /**
   * Set DM welcome message
   */
  setDMWelcome(guildId: string, message: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO join_config (guild_id, dm_welcome, last_updated)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET 
        dm_welcome = excluded.dm_welcome,
        last_updated = excluded.last_updated
    `, [guildId, message, now]);
  },

  /**
   * Toggle DM welcome
   */
  toggleDMWelcome(guildId: string, enabled: boolean): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO join_config (guild_id, dm_enabled, last_updated)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET 
        dm_enabled = excluded.dm_enabled,
        last_updated = excluded.last_updated
    `, [guildId, enabled ? 1 : 0, now]);
  },

  /**
   * Set auto-role for new members
   */
  setAutoRole(guildId: string, roleId: string): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO join_config (guild_id, auto_role_id, auto_role_enabled, last_updated)
      VALUES (?, ?, 1, ?)
      ON CONFLICT(guild_id) DO UPDATE SET 
        auto_role_id = excluded.auto_role_id,
        auto_role_enabled = 1,
        last_updated = excluded.last_updated
    `, [guildId, roleId, now]);
  },

  /**
   * Toggle auto-role
   */
  toggleAutoRole(guildId: string, enabled: boolean): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO join_config (guild_id, auto_role_enabled, last_updated)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET 
        auto_role_enabled = excluded.auto_role_enabled,
        last_updated = excluded.last_updated
    `, [guildId, enabled ? 1 : 0, now]);
  },

  /**
   * Toggle showing member count in welcome
   */
  toggleMemberCount(guildId: string, enabled: boolean): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    db.run(`
      INSERT INTO join_config (guild_id, show_member_count, last_updated)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET 
        show_member_count = excluded.show_member_count,
        last_updated = excluded.last_updated
    `, [guildId, enabled ? 1 : 0, now]);
  },

  /**
   * Format welcome message with placeholders
   */
  formatMessage(template: string, member: GuildMember): string {
    return template
      .replace(/{user}/g, `<@${member.id}>`)
      .replace(/{username}/g, member.user.username)
      .replace(/{tag}/g, member.user.tag)
      .replace(/{server}/g, member.guild.name)
      .replace(/{count}/g, member.guild.memberCount.toString())
      .replace(/{mention}/g, `<@${member.id}>`);
  },

  /**
   * Send welcome message to channel
   */
  async sendWelcomeMessage(member: GuildMember): Promise<void> {
    const config = this.getConfig(member.guild.id);
    if (!config || !config.welcome_enabled || !config.welcome_channel) return;

    const channel = member.guild.channels.cache.get(config.welcome_channel) as TextChannel;
    if (!channel) return;

    const message = this.formatMessage(config.welcome_message, member);
    
    try {
      await channel.send(message);
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  },

  /**
   * Send DM welcome message
   */
  async sendDMWelcome(member: GuildMember): Promise<void> {
    const config = this.getConfig(member.guild.id);
    if (!config || !config.dm_enabled || !config.dm_welcome) return;

    const message = this.formatMessage(config.dm_welcome, member);
    
    try {
      await member.send(message);
    } catch (error) {
      // DMs might be disabled for this user
      console.log(`Could not send DM to ${member.user.tag}`);
    }
  },

  /**
   * Assign auto-role to new member
   */
  async assignAutoRole(member: GuildMember): Promise<void> {
    const config = this.getConfig(member.guild.id);
    if (!config || !config.auto_role_enabled || !config.auto_role_id) return;

    try {
      const role = member.guild.roles.cache.get(config.auto_role_id);
      if (role && member.roles) {
        await member.roles.add(role);
      }
    } catch (error) {
      console.error('Failed to assign auto-role:', error);
    }
  },

  /**
   * Log member join
   */
  logJoin(member: GuildMember): void {
    const db = getDatabase();
    const now = new Date().toISOString();
    const accountAge = Math.floor((Date.now() - member.user.createdTimestamp) / 1000 / 60 / 60 / 24);
    
    db.run(`
      INSERT INTO join_logs (guild_id, user_id, username, join_timestamp, account_age, member_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      member.guild.id,
      member.id,
      member.user.username,
      now,
      `${accountAge} days`,
      member.guild.memberCount
    ]);
  },

  /**
   * Get recent join logs
   */
  getRecentJoins(guildId: string, limit: number = 10): Array<{
    user_id: string;
    username: string;
    join_timestamp: string;
    account_age: string;
    member_count: number;
  }> {
    const db = getDatabase();
    return db.query(`
      SELECT user_id, username, join_timestamp, account_age, member_count
      FROM join_logs
      WHERE guild_id = ?
      ORDER BY join_timestamp DESC
      LIMIT ?
    `).all(guildId, limit) as Array<{
      user_id: string;
      username: string;
      join_timestamp: string;
      account_age: string;
      member_count: number;
    }>;
  },

  /**
   * Get total join count for guild
   */
  getTotalJoins(guildId: string): number {
    const db = getDatabase();
    const result = db.query(
      'SELECT COUNT(*) as count FROM join_logs WHERE guild_id = ?'
    ).get(guildId) as { count: number } | undefined;
    
    return result?.count || 0;
  }
};
