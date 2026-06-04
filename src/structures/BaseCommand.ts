import { Command, CommandOptions } from '@bot-types/Command';
import { SlashCommandBuilder } from 'discord.js';

export abstract class BaseCommand implements Command {
  public data: SlashCommandBuilder;
  public options: CommandOptions;

  constructor(options: CommandOptions) {
    this.options = {
      cooldown: 3,
      enabled: true,
      guildOnly: false,
      nsfw: false,
      ownerOnly: false,
      ...options,
    };

    this.data = new SlashCommandBuilder()
      .setName(this.options.name)
      .setDescription(this.options.description)
      .setNSFW(this.options.nsfw ?? false)
      .setDMPermission(!this.options.guildOnly);

    if (this.options.permissions && this.options.permissions.length > 0) {
      // Combine all permissions into a single bigint bitmask
      const permBits = this.options.permissions.reduce<bigint>(
        (acc, p) => acc | BigInt(p as bigint),
        0n
      );
      this.data.setDefaultMemberPermissions(permBits);
    }
  }

  abstract execute(...args: any[]): Promise<void>;
}
