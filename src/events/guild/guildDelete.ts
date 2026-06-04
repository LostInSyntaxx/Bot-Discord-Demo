import { Guild } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';

export default new (class GuildDeleteEvent extends BaseEvent {
  constructor() {
    super({
      name: 'guildDelete',
    });
  }

  async execute(client: ExtendedClient, guild: Guild): Promise<void> {
    console.log(`❌ Left guild: ${guild.name} (${guild.id})`);
  }
})();
