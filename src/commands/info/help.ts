import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createHelpContainer } from '@ui/containers/helpContainer';
import { Constants } from '@config/constants';

export default new (class HelpCommand extends BaseCommand {
  constructor() {
    super({
      name: 'help',
      description: 'Display help information and available commands',
      category: 'info',
      cooldown: 5,
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const categories = [...new Set(client.commands.map(cmd => cmd.options.category))];
    const totalCommands = client.commands.size;

    const { container, selectMenu } = createHelpContainer(client.user?.username || 'Bot', categories, totalCommands);

    await interaction.reply({
      components: [container, selectMenu],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
