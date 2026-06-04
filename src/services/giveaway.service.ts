import { ExtendedClient } from '@bot-types/Client';
import { BaseService } from '@structures/BaseService';
import { getDatabase } from './database.service';
import { TextChannel, MessageFlags } from 'discord.js';
import { createGiveawayContainer } from '@ui/containers/giveawayContainer';
import { createSuccessContainer } from '@ui/containers/successContainer';

export class GiveawayService extends BaseService {
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(client: ExtendedClient) {
    super(client);
  }

  async initialize(): Promise<void> {
    this.checkInterval = setInterval(() => this.checkGiveaways(), 30000);
  }

  async shutdown(): Promise<void> {
    if (this.checkInterval) clearInterval(this.checkInterval);
  }

  static async createGiveaway(guildId: string, channelId: string, prize: string, winners: number, durationMs: number, hostId: string, client: ExtendedClient) {
    const db = getDatabase();
    const endAt = Date.now() + durationMs;
    const channel = client.channels.cache.get(channelId) as TextChannel;
    
    const { container, row } = createGiveawayContainer(prize, endAt, winners, hostId);
    
    const message = await channel.send({
      components: [container, row],
      flags: MessageFlags.IsComponentsV2,
    });

    db.run(
      'INSERT INTO giveaways (message_id, channel_id, guild_id, prize, winners, end_at, host_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [message.id, channelId, guildId, prize, winners, endAt, hostId]
    );

    return message.id;
  }

  static enterGiveaway(messageId: string, userId: string): boolean {
    const db = getDatabase();
    try {
      db.run('INSERT INTO giveaway_participants (message_id, user_id) VALUES (?, ?)', [messageId, userId]);
      return true;
    } catch (e) {
      return false; // Already entered
    }
  }

  static getParticipantCount(messageId: string): number {
    const db = getDatabase();
    const row = db.query('SELECT COUNT(*) as count FROM giveaway_participants WHERE message_id = ?').get(messageId) as { count: number };
    return row.count;
  }

  async checkGiveaways() {
    const db = getDatabase();
    const now = Date.now();
    const ended = db.query('SELECT * FROM giveaways WHERE end_at <= ? AND ended = 0').all(now) as any[];

    for (const gw of ended) {
      await this.endGiveaway(gw);
    }
  }

  async endGiveaway(gw: any) {
    const db = getDatabase();
    const participants = db.query('SELECT user_id FROM giveaway_participants WHERE message_id = ?').all(gw.message_id) as { user_id: string }[];
    
    const winners: string[] = [];
    if (participants.length > 0) {
      const pool = participants.map(p => p.user_id);
      for (let i = 0; i < Math.min(gw.winners, pool.length); i++) {
        const index = Math.floor(Math.random() * pool.length);
        winners.push(pool.splice(index, 1)[0]);
      }
    }

    const channel = this.client.channels.cache.get(gw.channel_id) as TextChannel;
    if (channel) {
      const { container, row } = createGiveawayContainer(gw.prize, gw.end_at, gw.winners, gw.host_id, participants.length, true);
      
      try {
        const msg = await channel.messages.fetch(gw.message_id);
        await msg.edit({ components: [container, row] });
        
        if (winners.length > 0) {
          await channel.send({
            components: [
              createSuccessContainer(
                'GIVEAWAY WINNERS',
                `Congratulations to the winners of **${gw.prize}**!\n\n${winners.map(w => `<@${w}>`).join(', ')}`
              )
            ],
            flags: MessageFlags.IsComponentsV2,
          });
        } else {
          await channel.send('No participants joined the giveaway.');
        }
      } catch (e) {}
    }

    db.run('UPDATE giveaways SET ended = 1 WHERE message_id = ?', [gw.message_id]);
  }
}
