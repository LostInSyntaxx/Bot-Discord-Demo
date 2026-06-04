import { ClientEvents } from 'discord.js';
import { ExtendedClient } from './Client';

export interface EventOptions {
  name: keyof ClientEvents;
  once?: boolean;
  enabled?: boolean;
}

export interface Event {
  options: EventOptions;
  execute: (client: ExtendedClient, ...args: any[]) => Promise<void>;
}
