import { Interaction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';
import { ServerStatsService } from '@services/serverstats.service';
import { createErrorContainer } from '@ui/containers/errorContainer';

export default new (class InteractionCreateEvent extends BaseEvent {
  constructor() {
    super({
      name: 'interactionCreate',
    });
  }

  async execute(client: ExtendedClient, interaction: Interaction): Promise<void> {
    try {
      // Handle slash commands
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          await interaction.reply({
            components: [createErrorContainer('Command Not Found', 'This command does not exist.')],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          });
          return;
        }

        // Check if command is enabled
        if (command.options.enabled === false) {
          await interaction.reply({
            components: [createErrorContainer('Command Disabled', 'This command is currently disabled.')],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          });
          return;
        }

        // ── Track command for server stats ─────────────────────────
        if (interaction.guildId) {
          const statsService = client.services.get('ServerStatsService') as ServerStatsService;
          if (statsService) {
            await statsService.trackCommand(interaction.guildId);
          }
        }

        try {
          await command.execute(client, interaction);
        } catch (error) {
          console.error(`Error executing command ${interaction.commandName}:`, error);

          const errorContainer = createErrorContainer(
            'Command Error',
            'An error occurred while executing this command.',
            error instanceof Error ? error.message : 'Unknown error'
          );

          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ 
              components: [errorContainer], 
              flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral 
            });
          } else {
            await interaction.reply({ 
              components: [errorContainer], 
              flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral 
            });
          }
        }
      }

      // Handle autocomplete
      if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);

        if (!command || !command.autocomplete) return;

        try {
          await command.autocomplete(client, interaction);
        } catch (error) {
          console.error(`Error in autocomplete for ${interaction.commandName}:`, error);
        }
      }

      // Handle buttons
      if (interaction.isButton()) {
        const [prefix, ...parts] = interaction.customId.split(':');
        const component = client.components.buttons.get(prefix);

        if (!component) return;

        try {
          await component.execute(client, interaction);
        } catch (error) {
          console.error(`Error executing button ${interaction.customId}:`, error);
        }
      }

      // Handle modals
      if (interaction.isModalSubmit()) {
        const [prefix] = interaction.customId.split(':');
        const component = client.components.modals.get(prefix);

        if (!component) return;

        try {
          await component.execute(client, interaction);
        } catch (error) {
          console.error(`Error executing modal ${interaction.customId}:`, error);
        }
      }

      // Handle select menus
      if (interaction.isStringSelectMenu()) {
        const [prefix] = interaction.customId.split(':');
        const component = client.components.selectMenus.get(prefix);

        if (!component) return;

        try {
          await component.execute(client, interaction);
        } catch (error) {
          console.error(`Error executing select menu ${interaction.customId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in interactionCreate event:', error);
    }
  }
})();
