import { Collection } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseService } from '@structures/BaseService';

interface CooldownData {
  expiresAt: number;
  uses: number;
}

export class CooldownService extends BaseService {
  private cooldowns: Collection<string, Collection<string, CooldownData>>;
  private cleanupInterval: Timer | null = null;

  constructor(client: ExtendedClient) {
    super(client);
    this.cooldowns = new Collection();
  }

  async initialize(): Promise<void> {
    // Clean up expired cooldowns every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cooldowns.clear();
  }

  private getKey(commandName: string, userId: string): string {
    return `${commandName}:${userId}`;
  }

  setCooldown(commandName: string, userId: string, duration: number): void {
    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Collection());
    }

    const commandCooldowns = this.cooldowns.get(commandName)!;
    const expiresAt = Date.now() + duration * 1000;

    commandCooldowns.set(userId, {
      expiresAt,
      uses: 1,
    });
  }

  getCooldown(commandName: string, userId: string): number {
    const commandCooldowns = this.cooldowns.get(commandName);
    if (!commandCooldowns) return 0;

    const cooldownData = commandCooldowns.get(userId);
    if (!cooldownData) return 0;

    const remaining = cooldownData.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  hasCooldown(commandName: string, userId: string): boolean {
    return this.getCooldown(commandName, userId) > 0;
  }

  removeCooldown(commandName: string, userId: string): void {
    const commandCooldowns = this.cooldowns.get(commandName);
    if (commandCooldowns) {
      commandCooldowns.delete(userId);
    }
  }

  resetCooldowns(commandName?: string): void {
    if (commandName) {
      this.cooldowns.delete(commandName);
    } else {
      this.cooldowns.clear();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [commandName, commandCooldowns] of this.cooldowns) {
      for (const [userId, cooldownData] of commandCooldowns) {
        if (cooldownData.expiresAt <= now) {
          commandCooldowns.delete(userId);
          cleaned++;
        }
      }

      if (commandCooldowns.size === 0) {
        this.cooldowns.delete(commandName);
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired cooldowns`);
    }
  }

  getStats(): {
    totalCommands: number;
    totalCooldowns: number;
    commandBreakdown: Record<string, number>;
  } {
    let totalCooldowns = 0;
    const commandBreakdown: Record<string, number> = {};

    for (const [commandName, commandCooldowns] of this.cooldowns) {
      const count = commandCooldowns.size;
      totalCooldowns += count;
      commandBreakdown[commandName] = count;
    }

    return {
      totalCommands: this.cooldowns.size,
      totalCooldowns,
      commandBreakdown,
    };
  }
}
