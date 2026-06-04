import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionResolvable,
  AutocompleteInteraction,
} from 'discord.js';
import { ExtendedClient } from './Client';

export interface CommandOptions {
  name: string;
  description: string;
  category: 'info' | 'moderation' | 'utility' | 'developer' | 'music';
  cooldown?: number;
  permissions?: PermissionResolvable[];
  ownerOnly?: boolean;
  guildOnly?: boolean;
  nsfw?: boolean;
  enabled?: boolean;
}

export interface Command {
  data: SlashCommandBuilder;
  options: CommandOptions;
  execute: (
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
  autocomplete?: (
    client: ExtendedClient,
    interaction: AutocompleteInteraction
  ) => Promise<void>;
}
