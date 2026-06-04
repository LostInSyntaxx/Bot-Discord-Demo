import { Client, Collection } from 'discord.js';
import { Command } from './Command';
import { Component } from './Component';

export interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
  components: {
    buttons: Collection<string, Component>;
    modals: Collection<string, Component>;
    selectMenus: Collection<string, Component>;
  };
  cooldowns: Collection<string, Collection<string, number>>;
  services: Collection<string, any>;
}
