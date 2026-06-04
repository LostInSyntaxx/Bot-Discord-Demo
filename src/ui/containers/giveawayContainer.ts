import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Emoji } from '@config/emoji';

/**
 * Creates a tactical giveaway interface.
 */
export function createGiveawayContainer(
  prize: string,
  endAt: number,
  winnerCount: number,
  hostId: string,
  participantCount: number = 0,
  ended: boolean = false
): { container: ContainerBuilder; row: ActionRowBuilder<ButtonBuilder> } {
  const container = new ContainerBuilder();

  // 1. Header
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${Emoji.Premium} GIVEAWAY EVENT`)
  );

  // 2. Prize
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${prize}`)
  );

  // 3. Details
  const timeStr = ended ? 'Ended' : `Ends: <t:${Math.floor(endAt / 1000)}:R>`;
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `> ${Emoji.User} **Winners:** ${winnerCount}\n` +
      `> ${Emoji.Nitro} **Entries:** ${participantCount}\n` +
      `> ${Emoji.Info} **Status:** ${timeStr}`
    )
  );

  // 4. Footer
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  ).addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# Hosted by <@${hostId}> • ${Emoji.Shield} Tactical Giveaway Protocol`)
  );

  // 5. Action Button
  const button = new ButtonBuilder()
    .setCustomId('giveaway:enter')
    .setLabel(ended ? 'GIVEAWAY ENDED' : 'ENTER GIVEAWAY')
    .setStyle(ended ? ButtonStyle.Secondary : ButtonStyle.Primary)
    .setEmoji(Emoji.Boost)
    .setDisabled(ended);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  return { container, row };
}
