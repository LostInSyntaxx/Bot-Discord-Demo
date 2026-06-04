import { ButtonInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseComponent } from '@structures/BaseComponent';
import { GiveawayService } from '@services/giveaway.service';
import { createSuccessContainer } from '@ui/containers/successContainer';
import { createErrorContainer } from '@ui/containers/errorContainer';
import { createGiveawayContainer } from '@ui/containers/giveawayContainer';
import { getDatabase } from '@services/database.service';

export default new (class GiveawayEnterButton extends BaseComponent {
  constructor() {
    super({
      customId: 'giveaway',
      type: 'button',
    });
  }

  async execute(client: ExtendedClient, interaction: ButtonInteraction): Promise<void> {
    const action = interaction.customId.split(':')[1];
    if (action !== 'enter') return;

    const messageId = interaction.message.id;
    const userId = interaction.user.id;

    const success = GiveawayService.enterGiveaway(messageId, userId);

    if (!success) {
      await interaction.reply({
        components: [createErrorContainer('ENTRY FAILED', 'You have already entered this giveaway.')],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    // Update the message with new participant count
    const db = getDatabase();
    const gw = db.query('SELECT * FROM giveaways WHERE message_id = ?').get(messageId) as any;
    if (gw) {
      const count = GiveawayService.getParticipantCount(messageId);
      const { container, row } = createGiveawayContainer(gw.prize, gw.end_at, gw.winners, gw.host_id, count, false);
      await interaction.message.edit({ components: [container, row] }).catch(() => null);
    }

    await interaction.reply({
      components: [createSuccessContainer('ENTRY CONFIRMED', 'You have successfully entered the giveaway!')],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }
})();
