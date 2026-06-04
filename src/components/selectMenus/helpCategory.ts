import { StringSelectMenuInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseComponent } from '@structures/BaseComponent';
import { createCategoryContainer, createHelpContainer } from '@ui/containers/helpContainer';

export default new (class HelpCategorySelectMenu extends BaseComponent {
  constructor() {
    super({
      customId: 'help',
      type: 'selectMenu',
    });
  }

  async execute(client: ExtendedClient, interaction: StringSelectMenuInteraction): Promise<void> {
    const [, action] = interaction.customId.split(':');
    if (action !== 'category') return;

    const selectedValue = interaction.values[0];
    const categories = [...new Set(client.commands.map(cmd => cmd.options.category))];

    if (selectedValue === 'main') {
      const { container, selectMenu } = createHelpContainer(
        client.user?.username || 'Bot',
        categories,
        client.commands.size
      );

      await interaction.update({
        components: [container, selectMenu],
      });
      return;
    }

    const commands = client.commands.filter(
      (cmd) => cmd.options.category.toLowerCase() === selectedValue
    );

    const categoryContainer = createCategoryContainer(
      selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1),
      Array.from(commands.values())
    );

    const { selectMenu } = createHelpContainer(
      client.user?.username || 'Bot',
      categories,
      client.commands.size
    );

    await interaction.update({
      components: [categoryContainer, selectMenu],
    });
  }
})();
