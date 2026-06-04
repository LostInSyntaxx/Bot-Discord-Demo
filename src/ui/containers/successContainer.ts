import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';
import { Emoji } from '@config/emoji';

export function createSuccessContainer(
  title: string,
  description: string,
  fields?: { name: string; value: string; inline?: boolean }[]
) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Success} ${title}\n${description}`)
    );

  if (fields && fields.length > 0) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    fields.forEach((field) => {
      container.addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`**${field.name}**\n${field.value}`)
      );
    });
  }

  return container;
}

export function createInfoContainer(
  title: string,
  description: string,
  fields?: { name: string; value: string; inline?: boolean }[]
) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Info} ${title}\n${description}`)
    );

  if (fields && fields.length > 0) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
    fields.forEach((field) => {
      container.addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`**${field.name}**\n${field.value}`)
      );
    });
  }

  return container;
}
