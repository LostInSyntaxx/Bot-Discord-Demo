import { ModalSubmitInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseComponent } from '@structures/BaseComponent';
import { createSuccessContainer } from '@ui/containers/successContainer';

export default new (class ExampleModal extends BaseComponent {
  constructor() {
    super({
      customId: 'example',
      type: 'modal',
    });
  }

  async execute(client: ExtendedClient, interaction: ModalSubmitInteraction): Promise<void> {
    const input = interaction.fields.getTextInputValue('input');

    await interaction.reply({
      components: [
        createSuccessContainer(
          'Modal Submitted',
          'Your modal has been submitted successfully!',
          [{ name: 'Input', value: input }]
        ),
      ],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }
})();
