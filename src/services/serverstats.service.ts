/**
 * Server Stats Service - Tracks and manages server statistics
 * Monitors messages, voice activity, commands, and member counts
 */

import { getDatabase } from './database.service';
import { BaseService } from '@structures/BaseService';
import { ExtendedClient } from '@bot-types/Client';

interface DailyStats {
  guild_id: string;
  date: string;
  member_count: number;
  message_count: number;
  voice_minutes: number;
  command_count: number;
}

interface TotalStats {
  guild_id: string;
  total_messages: number;
  total_voice_minutes: number;
  total_commands: number;
  peak_members: number;
  last_updated: string;
}

export class ServerStatsService extends BaseService {
  private voiceStartTimes: Map<string, Map<string, Date>> = new Map();

  constructor(client: ExtendedClient) {
    super(client);
  }

  async initialize(): Promise<void> {
    console.log('✅ Server Stats Service initialized');
  }

  async shutdown(): Promise<void> {
    console.log('🔒 Server Stats Service shutdown');
  }

  /**
   * Track a message sent in a guild
   */
  async trackMessage(guildId: string): Promise<void> {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Update daily stats
    const existing = db.query(
      'SELECT message_count FROM server_stats WHERE guild_id = ? AND date = ?'
    ).get(guildId, today) as { message_count: number } | undefined;

    if (existing) {
      db.run(
        'UPDATE server_stats SET message_count = message_count + 1 WHERE guild_id = ? AND date = ?',
        guildId,
        today
      );
    } else {
      db.run(
        'INSERT INTO server_stats (guild_id, date, message_count) VALUES (?, ?, 1)',
        guildId,
        today
      );
    }

    // Update total stats
    db.run(
      `INSERT INTO server_stats_total (guild_id, total_messages, last_updated) 
       VALUES (?, 1, datetime('now'))
       ON CONFLICT(guild_id) DO UPDATE SET 
         total_messages = total_messages + 1,
         last_updated = datetime('now')`,
      guildId
    );
  }

  /**
   * Track a command execution
   */
  async trackCommand(guildId: string): Promise<void> {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Update daily stats
    const existing = db.query(
      'SELECT command_count FROM server_stats WHERE guild_id = ? AND date = ?'
    ).get(guildId, today) as { command_count: number } | undefined;

    if (existing) {
      db.run(
        'UPDATE server_stats SET command_count = command_count + 1 WHERE guild_id = ? AND date = ?',
        guildId,
        today
      );
    } else {
      db.run(
        'INSERT INTO server_stats (guild_id, date, command_count) VALUES (?, ?, 1)',
        guildId,
        today
      );
    }

    // Update total stats
    db.run(
      `INSERT INTO server_stats_total (guild_id, total_commands, last_updated) 
       VALUES (?, 1, datetime('now'))
       ON CONFLICT(guild_id) DO UPDATE SET 
         total_commands = total_commands + 1,
         last_updated = datetime('now')`,
      guildId
    );
  }

  /**
   * Track voice channel join
   */
  async trackVoiceJoin(guildId: string, userId: string): Promise<void> {
    if (!this.voiceStartTimes.has(guildId)) {
      this.voiceStartTimes.set(guildId, new Map());
    }
    
    const guildTimes = this.voiceStartTimes.get(guildId)!;
    guildTimes.set(userId, new Date());
  }

  /**
   * Track voice channel leave
   */
  async trackVoiceLeave(guildId: string, userId: string): Promise<void> {
    const guildTimes = this.voiceStartTimes.get(guildId);
    if (!guildTimes || !guildTimes.has(userId)) return;

    const startTime = guildTimes.get(userId)!;
    const minutes = (Date.now() - startTime.getTime()) / 60000;

    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Update daily stats
    const existing = db.query(
      'SELECT voice_minutes FROM server_stats WHERE guild_id = ? AND date = ?'
    ).get(guildId, today) as { voice_minutes: number } | undefined;

    if (existing) {
      db.run(
        'UPDATE server_stats SET voice_minutes = voice_minutes + ? WHERE guild_id = ? AND date = ?',
        Math.floor(minutes),
        guildId,
        today
      );
    } else {
      db.run(
        'INSERT INTO server_stats (guild_id, date, voice_minutes) VALUES (?, ?, ?)',
        guildId,
        today,
        Math.floor(minutes)
      );
    }

    // Update total stats
    db.run(
      `INSERT INTO server_stats_total (guild_id, total_voice_minutes, last_updated) 
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(guild_id) DO UPDATE SET 
         total_voice_minutes = total_voice_minutes + ?,
         last_updated = datetime('now')`,
      guildId,
      Math.floor(minutes),
      Math.floor(minutes)
    );

    guildTimes.delete(userId);
  }

  /**
   * Update member count for today
   */
  async updateMemberCount(guildId: string, memberCount: number): Promise<void> {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Update daily stats
    db.run(
      `INSERT INTO server_stats (guild_id, date, member_count) 
       VALUES (?, ?, ?)
       ON CONFLICT(guild_id, date) DO UPDATE SET member_count = ?`,
      guildId,
      today,
      memberCount,
      memberCount
    );

    // Update peak members in total stats
    db.run(
      `INSERT INTO server_stats_total (guild_id, peak_members, last_updated) 
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(guild_id) DO UPDATE SET 
         peak_members = MAX(peak_members, ?),
         last_updated = datetime('now')`,
      guildId,
      memberCount,
      memberCount
    );
  }

  /**
   * Get daily stats for a specific date
   */
  getDailyStats(guildId: string, date: string): DailyStats | null {
    const db = getDatabase();
    return db.query(
      'SELECT * FROM server_stats WHERE guild_id = ? AND date = ?'
    ).get(guildId, date) as DailyStats | null;
  }

  /**
   * Get total stats for a guild
   */
  getTotalStats(guildId: string): TotalStats | null {
    const db = getDatabase();
    return db.query(
      'SELECT * FROM server_stats_total WHERE guild_id = ?'
    ).get(guildId) as TotalStats | null;
  }

  /**
   * Get stats for the last N days
   */
  getRecentStats(guildId: string, days: number = 7): DailyStats[] {
    const db = getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return db.query(
      `SELECT * FROM server_stats 
       WHERE guild_id = ? AND date >= ?
       ORDER BY date DESC`
    ).all(guildId, startDate.toISOString().split('T')[0]) as DailyStats[];
  }

  /**
   * Get weekly summary
   */
  getWeeklySummary(guildId: string): {
    totalMessages: number;
    totalVoiceMinutes: number;
    totalCommands: number;
    avgDailyMembers: number;
  } {
    const stats = this.getRecentStats(guildId, 7);
    
    return {
      totalMessages: stats.reduce((sum, s) => sum + s.message_count, 0),
      totalVoiceMinutes: stats.reduce((sum, s) => sum + s.voice_minutes, 0),
      totalCommands: stats.reduce((sum, s) => sum + s.command_count, 0),
      avgDailyMembers: stats.length > 0 
        ? Math.round(stats.reduce((sum, s) => sum + s.member_count, 0) / stats.length)
        : 0,
    };
  }

  /**
   * Get monthly summary
   */
  getMonthlySummary(guildId: string): {
    totalMessages: number;
    totalVoiceMinutes: number;
    totalCommands: number;
    avgDailyMembers: number;
  } {
    const stats = this.getRecentStats(guildId, 30);
    
    return {
      totalMessages: stats.reduce((sum, s) => sum + s.message_count, 0),
      totalVoiceMinutes: stats.reduce((sum, s) => sum + s.voice_minutes, 0),
      totalCommands: stats.reduce((sum, s) => sum + s.command_count, 0),
      avgDailyMembers: stats.length > 0 
        ? Math.round(stats.reduce((sum, s) => sum + s.member_count, 0) / stats.length)
        : 0,
    };
  }
}
