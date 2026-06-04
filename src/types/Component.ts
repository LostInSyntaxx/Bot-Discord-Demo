import {
  ButtonInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
  RoleSelectMenuInteraction,
  ChannelSelectMenuInteraction,
} from 'discord.js';
import { ExtendedClient } from './Client';

export type ComponentInteraction =
  | ButtonInteraction
  | ModalSubmitInteraction
  | StringSelectMenuInteraction
  | UserSelectMenuInteraction
  | RoleSelectMenuInteraction
  | ChannelSelectMenuInteraction;

export interface ComponentOptions {
  customId: string;
  type: 'button' | 'modal' | 'selectMenu';
  permissions?: string[];
  ownerOnly?: boolean;
  timeout?: number;
}

export interface Component {
  options: ComponentOptions;
  execute: (
    client: ExtendedClient,
    interaction: ComponentInteraction
  ) => Promise<void>;
}
