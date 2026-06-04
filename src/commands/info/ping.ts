import { ChatInputCommandInteraction, MessageFlags, ComponentType } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { logger } from '@utils/logger';
import { 
  createPingContainer, 
  createPingLoadingContainer, 
  createPingErrorContainer, 
  createDisabledPingContainer 
} from '@ui/containers/pingContainer';

export default new (class PingCommand extends BaseCommand {
  constructor() {
    super({
      name: 'ping',
      description: 'Check bot latency and connection status',
      category: 'info',
      cooldown: 15,
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const startTime = Date.now();

      await interaction.reply({
        components: [createPingLoadingContainer() as any],
        flags: MessageFlags.IsComponentsV2,
        withResponse: true,
      });

      const endTime = Date.now();
      const messageLatency = endTime - startTime;

      const pingMessage = await interaction.editReply({
        components: [createPingContainer(client, messageLatency) as any],
        flags: MessageFlags.IsComponentsV2,
      });

      this._setupCollector(pingMessage, interaction.user.id, client);
    } catch (error: any) {
      logger.error(
        `[PingCommand] Error in slash command: ${error.message}`,
        error,
      );
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({
            components: [createPingErrorContainer('An error occurred while checking ping.') as any],
          });
        } else {
          await interaction.reply({
            components: [createPingErrorContainer('An error occurred while checking ping.') as any],
            ephemeral: true,
          });
        }
      } catch (e) {}
    }
  }

  private _setupCollector(message: any, userId: string, client: ExtendedClient) {
    const collector = message.createMessageComponentCollector({
      filter: (i: any) => i.user.id === userId,
      time: 300_000,
      componentType: ComponentType.Button,
    });

    collector.on('collect', async (interaction: any) => {
      try {
        if (interaction.customId === 'ping_refresh') {
          const startTime = Date.now();

          await interaction.update({
            components: [createPingLoadingContainer() as any],
            flags: MessageFlags.IsComponentsV2,
          });

          const endTime = Date.now();
          const messageLatency = endTime - startTime;

          await interaction.editReply({
            components: [createPingContainer(client, messageLatency) as any],
            flags: MessageFlags.IsComponentsV2,
          });
        }
      } catch (error: any) {
        logger.error(
          `[PingCommand] Error in collector: ${error.message}`,
          error,
        );
      }
    });

    collector.on('end', async () => {
      try {
        const fetchedMessage = await message.fetch().catch(() => null);
        if (fetchedMessage && fetchedMessage.components && fetchedMessage.components.length > 0) {
          await fetchedMessage.edit({
            components: [createDisabledPingContainer(client) as any],
          });
        }
      } catch (error: any) {
        if (error.code !== 10008) {
          logger.error(
            `[PingCommand] Error updating expired components: ${error.message}`,
            error,
          );
        }
      }
    });
  }
})();
