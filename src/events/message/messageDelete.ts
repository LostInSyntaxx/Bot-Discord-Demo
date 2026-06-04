import { Message } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';

export default new (class MessageDeleteEvent extends BaseEvent {
  constructor() {
    super({
      name: 'messageDelete',
    });
  }

  async execute(client: ExtendedClient, message: Message): Promise<void> {
    if (message.partial || !message.guild) return;
    
    const { LogService } = await import('@services/log.service');
    const { createLogContainer } = await import('@ui/containers/logContainer');
    const { Emoji } = await import('@config/emoji');
    const { MessageFlags, TextChannel } = await import('discord.js');

    const channelId = LogService.getLogChannel(message.guild.id);
    if (!channelId) return;

    const logChannel = message.guild.channels.cache.get(channelId) as TextChannel;
    if (!logChannel) return;

    await logChannel.send({
      components: [
        createLogContainer(
          'MESSAGE DELETED',
          Emoji.Delete,
          `A message by **${message.author?.tag ?? 'Unknown'}** was deleted in <#${message.channel.id}>.`,
          [
            { name: 'Content', value: message.content || '*No text content (likely media or embed)*' },
            { name: 'Channel', value: `<#${message.channel.id}>` }
          ]
        )
      ],
      flags: MessageFlags.IsComponentsV2,
    }).catch(() => null);
  }
})();
