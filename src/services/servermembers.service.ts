/**
 * Server Members Service - Tracks and manages server member statistics
 * Monitors member joins, leaves, growth trends, and activity patterns
 */

import { getDatabase } from './database.service';
import { BaseService } from '@structures/BaseService';
import { ExtendedClient } from '@bot-types/Client';

interface DailyMemberStats {
  guild_id: string;
  date: string;
  joins: number;
  leaves: number;
  net_growth: number;
  member_count: number;
}

interface TotalMemberStats {
  guild_id: string;
  total_joins: number;
  total_leaves: number;
  current_members: number;
  peak_members: number;
  last_updated: string;
}

export class ServerMembersService extends BaseService {
  constructor(client: ExtendedClient) {
    super(client);
  }

  async initialize(): Promise<void> {
    console.log('✅ Server Members Service initialized');
  }

  async shutdown(): Promise<void> {
    console.log('🔒 Server Members Service shutdown');
  }

  /**
   * Track a member joining the server
   */
  async trackMemberJoin(guildId: string, userId: string, memberCount: number): Promise<void> {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Update daily stats
    const existing = db.query(
      'SELECT joins, member_count FROM server_members_daily WHERE guild_id = ? AND date = ?'
    ).get(guildId, today) as { joins: number; member_count: number } | undefined;

    if (existing) {
      const netGrowth = memberCount - existing.member_count;
      db.run(
        'UPDATE server_members_daily SET joins = joins + 1, net_growth = ?, member_count = ? WHERE guild_id = ? AND date = ?',
        netGrowth,
        memberCount,
        guildId,
        today
      );
    } else {
      db.run(
        'INSERT INTO server_members_daily (guild_id, date, joins, net_growth, member_count) VALUES (?, ?, 1, ?, ?)',
        guildId,
        today,
        memberCount - (existing?.member_count || 0),
        memberCount
      );
    }

    // Update total stats
    db.run(
      `INSERT INTO server_members_total (guild_id, total_joins, current_members, peak_members, last_updated) 
       VALUES (?, 1, ?, ?, datetime('now'))
       ON CONFLICT(guild_id) DO UPDATE SET 
         total_joins = total_joins + 1,
         current_members = ?,
         peak_members = MAX(peak_members, ?),
         last_updated = datetime('now')`,
      guildId,
      memberCount,
      memberCount,
      memberCount,
      memberCount
    );

    // Log activity (optional - for detailed analytics)
    db.run(
      'INSERT INTO member_activity_log (guild_id, user_id, action, timestamp) VALUES (?, ?, ?, ?)',
      guildId,
      userId,
      'join',
      now
    );
  }

  /**
   * Track a member leaving the server
   */
  async trackMemberLeave(guildId: string, userId: string, memberCount: number): Promise<void> {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Update daily stats
    const existing = db.query(
      'SELECT leaves, member_count FROM server_members_daily WHERE guild_id = ? AND date = ?'
    ).get(guildId, today) as { leaves: number; member_count: number } | undefined;

    if (existing) {
      const netGrowth = memberCount - existing.member_count;
      db.run(
        'UPDATE server_members_daily SET leaves = leaves + 1, net_growth = ?, member_count = ? WHERE guild_id = ? AND date = ?',
        netGrowth,
        memberCount,
        guildId,
        today
      );
    } else {
      db.run(
        'INSERT INTO server_members_daily (guild_id, date, leaves, net_growth, member_count) VALUES (?, ?, 1, ?, ?)',
        guildId,
        today,
        memberCount - (existing?.member_count || 0),
        memberCount
      );
    }

    // Update total stats
    db.run(
      `INSERT INTO server_members_total (guild_id, total_leaves, current_members, last_updated) 
       VALUES (?, 1, ?, datetime('now'))
       ON CONFLICT(guild_id) DO UPDATE SET 
         total_leaves = total_leaves + 1,
         current_members = ?,
         last_updated = datetime('now')`,
      guildId,
      memberCount,
      memberCount
    );

    // Log activity (optional - for detailed analytics)
    db.run(
      'INSERT INTO member_activity_log (guild_id, user_id, action, timestamp) VALUES (?, ?, ?, ?)',
      guildId,
      userId,
      'leave',
      now
    );
  }

  /**
   * Get daily member stats for a specific date
   */
  getDailyStats(guildId: string, date: string): DailyMemberStats | null {
    const db = getDatabase();
    return db.query(
      'SELECT * FROM server_members_daily WHERE guild_id = ? AND date = ?'
    ).get(guildId, date) as DailyMemberStats | null;
  }

  /**
   * Get total member stats for a guild
   */
  getTotalStats(guildId: string): TotalMemberStats | null {
    const db = getDatabase();
    return db.query(
      'SELECT * FROM server_members_total WHERE guild_id = ?'
    ).get(guildId) as TotalMemberStats | null;
  }

  /**
   * Get member stats for the last N days
   */
  getRecentStats(guildId: string, days: number = 7): DailyMemberStats[] {
    const db = getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return db.query(
      `SELECT * FROM server_members_daily 
       WHERE guild_id = ? AND date >= ?
       ORDER BY date DESC`
    ).all(guildId, startDate.toISOString().split('T')[0]) as DailyMemberStats[];
  }

  /**
   * Get weekly member summary
   */
  getWeeklySummary(guildId: string): {
    totalJoins: number;
    totalLeaves: number;
    netGrowth: number;
    avgDailyMembers: number;
  } {
    const stats = this.getRecentStats(guildId, 7);
    
    return {
      totalJoins: stats.reduce((sum, s) => sum + s.joins, 0),
      totalLeaves: stats.reduce((sum, s) => sum + s.leaves, 0),
      netGrowth: stats.reduce((sum, s) => sum + s.net_growth, 0),
      avgDailyMembers: stats.length > 0 
        ? Math.round(stats.reduce((sum, s) => sum + s.member_count, 0) / stats.length)
        : 0,
    };
  }

  /**
   * Get monthly member summary
   */
  getMonthlySummary(guildId: string): {
    totalJoins: number;
    totalLeaves: number;
    netGrowth: number;
    avgDailyMembers: number;
  } {
    const stats = this.getRecentStats(guildId, 30);
    
    return {
      totalJoins: stats.reduce((sum, s) => sum + s.joins, 0),
      totalLeaves: stats.reduce((sum, s) => sum + s.leaves, 0),
      netGrowth: stats.reduce((sum, s) => sum + s.net_growth, 0),
      avgDailyMembers: stats.length > 0 
        ? Math.round(stats.reduce((sum, s) => sum + s.member_count, 0) / stats.length)
        : 0,
    };
  }

  /**
   * Get member growth rate (percentage change)
   */
  getGrowthRate(guildId: string, days: number = 7): number {
    const stats = this.getRecentStats(guildId, days);
    
    if (stats.length < 2) return 0;
    
    const oldest = stats[stats.length - 1];
    const newest = stats[0];
    
    if (oldest.member_count === 0) return 0;
    
    return ((newest.member_count - oldest.member_count) / oldest.member_count) * 100;
  }

  /**
   * Get retention rate (members who stayed / total joins)
   */
  getRetentionRate(guildId: string): number {
    const totalStats = this.getTotalStats(guildId);
    
    if (!totalStats || totalStats.total_joins === 0) return 0;
    
    const retained = totalStats.total_joins - totalStats.total_leaves;
    return (retained / totalStats.total_joins) * 100;
  }

  /**
   * Get recent member activity log
   */
  getRecentActivity(guildId: string, limit: number = 20): Array<{
    user_id: string;
    action: string;
    timestamp: string;
  }> {
    const db = getDatabase();
    return db.query(
      `SELECT user_id, action, timestamp FROM member_activity_log 
       WHERE guild_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`
    ).all(guildId, limit) as Array<{
      user_id: string;
      action: string;
      timestamp: string;
    }>;
  }
}
