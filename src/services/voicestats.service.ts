/**
 * Voice Stats Channel Service - Creates and manages voice channels that display server statistics
 * Shows member counts in voice channel names like: "📊 All Members: 59"
 */

import { getDatabase } from './database.service';
import { BaseService } from '@structures/BaseService';
import { ExtendedClient } from '@bot-types/Client';
import { Guild, ChannelType, PermissionOverwriteManager, PermissionFlagsBits } from 'discord.js';

interface VoiceStatsConfig {
  guild_id: string;
  category_id: string;
  all_members_channel: string;
  members_channel: string;
  bots_channel: string;
  enabled: number;
  last_updated: string;
}

export class VoiceStatsService extends BaseService {
  constructor(client: ExtendedClient) {
    super(client);
  }

  async initialize(): Promise<void> {
    console.log('✅ Voice Stats Channel Service initialized');
  }

  async shutdown(): Promise<void> {
    console.log('🔒 Voice Stats Channel Service shutdown');
  }

  /**
   * Setup voice stats channels for a guild
   */
  async setupVoiceStats(guild: Guild): Promise<{ success: boolean; message: string }> {
    try {
      const db = getDatabase();

      // Check if already setup
      const existing = db.query(
        'SELECT * FROM voice_stats_channels WHERE guild_id = ?'
      ).get(guild.id) as VoiceStatsConfig | undefined;

      if (existing) {
        return { success: false, message: 'Voice stats channels are already set up for this server.' };
      }

      // Create category for stats channels
      const category = await guild.channels.create({
        name: '📊 SERVER STATS',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
            deny: [PermissionFlagsBits.SendMessages],
          },
        ],
      });

      // Create voice channels with 0 as initial count
      const allMembersChannel = await guild.channels.create({
        name: ' All Members: 0',
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages],
          },
        ],
      });

      const membersChannel = await guild.channels.create({
        name: '🔒 Members: 0',
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages],
          },
        ],
      });

      const botsChannel = await guild.channels.create({
        name: '🔒 Bots: 0',
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages],
          },
        ],
      });

      // Save to database
      db.run(
        `INSERT INTO voice_stats_channels (guild_id, category_id, all_members_channel, members_channel, bots_channel, enabled, last_updated)
         VALUES (?, ?, ?, ?, ?, 1, datetime('now'))`,
        guild.id,
        category.id,
        allMembersChannel.id,
        membersChannel.id,
        botsChannel.id
      );

      // Update with actual counts
      await this.updateVoiceStats(guild.id);

      return {
        success: true,
        message: '✅ Voice stats channels created successfully!',
      };
    } catch (error) {
      console.error('Error setting up voice stats:', error);
      return {
        success: false,
        message: '❌ Failed to create voice stats channels. Make sure the bot has proper permissions.',
      };
    }
  }

  /**
   * Update voice channel names with current member counts
   */
  async updateVoiceStats(guildId: string): Promise<void> {
    try {
      const db = getDatabase();
      const config = db.query(
        'SELECT * FROM voice_stats_channels WHERE guild_id = ? AND enabled = 1'
      ).get(guildId) as VoiceStatsConfig | undefined;

      if (!config) return;

      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) return;

      // Fetch all members (ensure cache is populated)
      await guild.members.fetch();

      const allMembers = guild.memberCount;
      const humanMembers = guild.members.cache.filter(m => !m.user.bot).size;
      const botMembers = guild.members.cache.filter(m => m.user.bot).size;

      // Update channel names
      const allMembersChannel = guild.channels.cache.get(config.all_members_channel);
      const membersChannel = guild.channels.cache.get(config.members_channel);
      const botsChannel = guild.channels.cache.get(config.bots_channel);

      if (allMembersChannel && allMembersChannel.isVoiceBased()) {
        await allMembersChannel.setName(`🔒 All Members: ${allMembers}`);
      }

      if (membersChannel && membersChannel.isVoiceBased()) {
        await membersChannel.setName(`🔒 Members: ${humanMembers}`);
      }

      if (botsChannel && botsChannel.isVoiceBased()) {
        await botsChannel.setName(`🔒 Bots: ${botMembers}`);
      }

      // Update last_updated timestamp
      db.run(
        'UPDATE voice_stats_channels SET last_updated = datetime(\'now\') WHERE guild_id = ?',
        guildId
      );
    } catch (error) {
      console.error('Error updating voice stats:', error);
    }
  }

  /**
   * Remove voice stats channels for a guild
   */
  async removeVoiceStats(guildId: string): Promise<{ success: boolean; message: string }> {
    try {
      const db = getDatabase();
      const config = db.query(
        'SELECT * FROM voice_stats_channels WHERE guild_id = ?'
      ).get(guildId) as VoiceStatsConfig | undefined;

      if (!config) {
        return { success: false, message: 'Voice stats channels are not set up for this server.' };
      }

      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) {
        // Clean up database even if guild not found
        db.run('DELETE FROM voice_stats_channels WHERE guild_id = ?', guildId);
        return { success: true, message: 'Voice stats configuration removed from database.' };
      }

      // Delete channels
      const channelsToDelete = [
        config.all_members_channel,
        config.members_channel,
        config.bots_channel,
        config.category_id,
      ];

      for (const channelId of channelsToDelete) {
        const channel = guild.channels.cache.get(channelId);
        if (channel) {
          await channel.delete().catch(() => null);
        }
      }

      // Remove from database
      db.run('DELETE FROM voice_stats_channels WHERE guild_id = ?', guildId);

      return {
        success: true,
        message: '✅ Voice stats channels removed successfully!',
      };
    } catch (error) {
      console.error('Error removing voice stats:', error);
      return {
        success: false,
        message: '❌ Failed to remove voice stats channels.',
      };
    }
  }

  /**
   * Get voice stats configuration for a guild
   */
  getConfig(guildId: string): VoiceStatsConfig | null {
    const db = getDatabase();
    return db.query(
      'SELECT * FROM voice_stats_channels WHERE guild_id = ?'
    ).get(guildId) as VoiceStatsConfig | null;
  }

  /**
   * Toggle voice stats enabled/disabled
   */
  async toggleVoiceStats(guildId: string): Promise<{ success: boolean; message: string }> {
    const db = getDatabase();
    const config = this.getConfig(guildId);

    if (!config) {
      return { success: false, message: 'Voice stats are not set up for this server.' };
    }

    const newEnabled = config.enabled ? 0 : 1;
    db.run(
      'UPDATE voice_stats_channels SET enabled = ?, last_updated = datetime(\'now\') WHERE guild_id = ?',
      newEnabled,
      guildId
    );

    return {
      success: true,
      message: newEnabled ? '✅ Voice stats enabled!' : '⏸️ Voice stats disabled!',
    };
  }
}
