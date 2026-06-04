/**
 * Database Service — uses Bun's built-in SQLite (bun:sqlite)
 * Handles all persistent storage for Welcome, Leveling, and AutoRole systems
 */

import { Database } from 'bun:sqlite';
import { ExtendedClient } from '@bot-types/Client';
import { BaseService } from '@structures/BaseService';

let db: Database;

export function getDatabase(): Database {
  if (!db) {
    db = new Database('bot.db', { create: true });
    db.run('PRAGMA journal_mode = WAL');
    initTables();
  }
  return db;
}

function initTables(): void {
  const database = db;

  // Auto Role
  database.run(`
    CREATE TABLE IF NOT EXISTS auto_roles (
      guild_id TEXT NOT NULL,
      role_id  TEXT NOT NULL,
      PRIMARY KEY (guild_id, role_id)
    )
  `);

  // Welcome System
  database.run(`
    CREATE TABLE IF NOT EXISTS welcome_config (
      guild_id   TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      message    TEXT NOT NULL DEFAULT 'Welcome {user} to {server}!',
      enabled    INTEGER NOT NULL DEFAULT 1
    )
  `);

  // Enhanced Join System
  database.run(`
    CREATE TABLE IF NOT EXISTS join_config (
      guild_id TEXT PRIMARY KEY,
      welcome_channel TEXT,
      welcome_message TEXT DEFAULT 'Welcome {user} to {server}! You are member #{count}.',
      welcome_enabled INTEGER DEFAULT 1,
      dm_welcome TEXT DEFAULT 'Welcome to {server}! Enjoy your stay!',
      dm_enabled INTEGER DEFAULT 0,
      auto_role_id TEXT,
      auto_role_enabled INTEGER DEFAULT 0,
      join_counter INTEGER DEFAULT 0,
      show_member_count INTEGER DEFAULT 1,
      last_updated TEXT NOT NULL
    )
  `);

  // Join log tracking
  database.run(`
    CREATE TABLE IF NOT EXISTS join_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      join_timestamp TEXT NOT NULL,
      account_age TEXT NOT NULL,
      member_count INTEGER NOT NULL
    )
  `);

  database.run(`
    CREATE INDEX IF NOT EXISTS idx_join_logs_guild 
    ON join_logs(guild_id, join_timestamp)
  `);

  // Leveling System
  database.run(`
    CREATE TABLE IF NOT EXISTS levels (
      guild_id TEXT NOT NULL,
      user_id  TEXT NOT NULL,
      xp       INTEGER NOT NULL DEFAULT 0,
      level    INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (guild_id, user_id)
    )
  `);

  // Level-up channel config
  database.run(`
    CREATE TABLE IF NOT EXISTS level_config (
      guild_id   TEXT PRIMARY KEY,
      channel_id TEXT,
      enabled    INTEGER NOT NULL DEFAULT 1
    )
  `);

  // Verification System
  database.run(`
    CREATE TABLE IF NOT EXISTS verify_config (
      guild_id TEXT PRIMARY KEY,
      role_id  TEXT NOT NULL
    )
  `);

  // Moderation History System
  database.run(`
    CREATE TABLE IF NOT EXISTS moderation_history (
      id TEXT PRIMARY KEY,
      target TEXT NOT NULL,
      action TEXT NOT NULL,
      duration TEXT,
      reason TEXT,
      admin TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  // Logging System
  database.run(`
    CREATE TABLE IF NOT EXISTS log_config (
      guild_id   TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      events     TEXT -- JSON string of enabled events
    )
  `);

  // Invite Tracker System
  database.run(`
    CREATE TABLE IF NOT EXISTS invites (
      guild_id TEXT,
      user_id  TEXT,
      regular  INTEGER DEFAULT 0,
      fake     INTEGER DEFAULT 0,
      bonus    INTEGER DEFAULT 0,
      PRIMARY KEY (guild_id, user_id)
    )
  `);

  // Giveaway System
  database.run(`
    CREATE TABLE IF NOT EXISTS giveaways (
      message_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      guild_id   TEXT NOT NULL,
      prize      TEXT NOT NULL,
      winners    INTEGER NOT NULL,
      end_at     INTEGER NOT NULL,
      ended      INTEGER DEFAULT 0,
      host_id    TEXT NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS giveaway_participants (
      message_id TEXT,
      user_id    TEXT,
      PRIMARY KEY (message_id, user_id)
    )
  `);

  // Server Stats System
  database.run(`
    CREATE TABLE IF NOT EXISTS server_stats (
      guild_id TEXT NOT NULL,
      date TEXT NOT NULL,
      member_count INTEGER DEFAULT 0,
      message_count INTEGER DEFAULT 0,
      voice_minutes INTEGER DEFAULT 0,
      command_count INTEGER DEFAULT 0,
      PRIMARY KEY (guild_id, date)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS server_stats_total (
      guild_id TEXT PRIMARY KEY,
      total_messages INTEGER DEFAULT 0,
      total_voice_minutes INTEGER DEFAULT 0,
      total_commands INTEGER DEFAULT 0,
      peak_members INTEGER DEFAULT 0,
      last_updated TEXT NOT NULL
    )
  `);

  // Voice Stats Channel System
  database.run(`
    CREATE TABLE IF NOT EXISTS voice_stats_channels (
      guild_id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      all_members_channel TEXT NOT NULL,
      members_channel TEXT NOT NULL,
      bots_channel TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      last_updated TEXT NOT NULL
    )
  `);

  // Server Members System - Daily member activity tracking
  database.run(`
    CREATE TABLE IF NOT EXISTS server_members_daily (
      guild_id TEXT NOT NULL,
      date TEXT NOT NULL,
      joins INTEGER DEFAULT 0,
      leaves INTEGER DEFAULT 0,
      net_growth INTEGER DEFAULT 0,
      member_count INTEGER DEFAULT 0,
      PRIMARY KEY (guild_id, date)
    )
  `);

  // Server Members System - Total member statistics
  database.run(`
    CREATE TABLE IF NOT EXISTS server_members_total (
      guild_id TEXT PRIMARY KEY,
      total_joins INTEGER DEFAULT 0,
      total_leaves INTEGER DEFAULT 0,
      current_members INTEGER DEFAULT 0,
      peak_members INTEGER DEFAULT 0,
      last_updated TEXT NOT NULL
    )
  `);

  // Server Members System - Member activity tracking (optional detailed logging)
  database.run(`
    CREATE TABLE IF NOT EXISTS member_activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL, -- 'join' or 'leave'
      timestamp TEXT NOT NULL
    )
  `);

  // Create index for faster queries on member activity
  database.run(`
    CREATE INDEX IF NOT EXISTS idx_member_activity_guild 
    ON member_activity_log(guild_id, timestamp)
  `);
}

export class DatabaseService extends BaseService {
  constructor(client: ExtendedClient) {
    super(client);
  }

  async initialize(): Promise<void> {
    getDatabase();
    console.log('✅ Database initialized (bun:sqlite)');
  }

  async shutdown(): Promise<void> {
    getDatabase().close();
    console.log('🔒 Database closed');
  }
}
