import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';
import { Emoji } from '@config/emoji';

/**
 * Creates a tactical log entry for server activities.
 */
export function createLogContainer(
  title: string,
  emoji: string,
  details: string,
  metadata?: { name: string; value: string }[]
): ContainerBuilder {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emoji} ${title}`)
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`> ${details}`)
    );

  if (metadata && metadata.length > 0) {
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    
    const metaStr = metadata.map(m => `**${m.name}:** ${m.value}`).join('\n');
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(metaStr)
    );
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${Emoji.Shield} System Audit • ${new Date().toLocaleTimeString()}`)
  );

  return container;
}
