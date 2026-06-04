import { Collection } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { Command } from '@bot-types/Command';
import { BaseService } from '@structures/BaseService';

export class CommandService extends BaseService {
  private commands: Collection<string, Command>;
  private aliases: Collection<string, string>;
  private categories: Collection<string, string[]>;

  constructor(client: ExtendedClient) {
    super(client);
    this.commands = new Collection();
    this.aliases = new Collection();
    this.categories = new Collection();
  }

  async initialize(): Promise<void> {
    // Commands will be loaded by the command handler
  }

  async shutdown(): Promise<void> {
    this.commands.clear();
    this.aliases.clear();
    this.categories.clear();
  }

  registerCommand(command: Command): void {
    this.commands.set(command.options.name, command);

    // Add to category
    const category = command.options.category;
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category)!.push(command.options.name);
  }

  unregisterCommand(commandName: string): boolean {
    const command = this.commands.get(commandName);
    if (!command) return false;

    // Remove from category
    const category = command.options.category;
    const categoryCommands = this.categories.get(category);
    if (categoryCommands) {
      const index = categoryCommands.indexOf(commandName);
      if (index > -1) {
        categoryCommands.splice(index, 1);
      }
    }

    return this.commands.delete(commandName);
  }

  getCommand(commandName: string): Command | undefined {
    return this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName) || '');
  }

  getCommands(): Collection<string, Command> {
    return this.commands;
  }

  getCommandsByCategory(category: string): Command[] {
    const commandNames = this.categories.get(category) || [];
    return commandNames
      .map((name) => this.commands.get(name))
      .filter((cmd): cmd is Command => cmd !== undefined);
  }

  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  hasCommand(commandName: string): boolean {
    return this.commands.has(commandName);
  }

  getCommandCount(): number {
    return this.commands.size;
  }

  getEnabledCommands(): Command[] {
    return this.commands.filter((cmd) => cmd.options.enabled !== false).map((cmd) => cmd);
  }

  getDisabledCommands(): Command[] {
    return this.commands.filter((cmd) => cmd.options.enabled === false).map((cmd) => cmd);
  }
}
