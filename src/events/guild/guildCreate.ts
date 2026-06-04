import { Guild } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';

export default new (class GuildCreateEvent extends BaseEvent {
  constructor() {
    super({
      name: 'guildCreate',
    });
  }

  async execute(client: ExtendedClient, guild: Guild): Promise<void> {
    console.log(`✅ Joined new guild: ${guild.name} (${guild.id})`);
    console.log(`   Members: ${guild.memberCount}`);
    console.log(`   Owner: ${guild.ownerId}`);
  }
})();
