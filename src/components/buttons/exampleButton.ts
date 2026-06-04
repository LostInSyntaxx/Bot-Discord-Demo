import { ButtonInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseComponent } from '@structures/BaseComponent';
import { createSuccessContainer } from '@ui/containers/successContainer';

export default new (class ExampleButton extends BaseComponent {
  constructor() {
    super({
      customId: 'example',
      type: 'button',
    });
  }

  async execute(client: ExtendedClient, interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({
      components: [createSuccessContainer('Button Clicked', 'You clicked the example button!')],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }
})();
