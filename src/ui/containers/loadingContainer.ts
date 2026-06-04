import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';
import { Emoji } from '@config/emoji';

export function createLoadingContainer(message: string = 'Processing...', autoDeleteSeconds?: number) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Loading} Loading\n${message}`)
    );

  if (autoDeleteSeconds) {
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`-# ${Emoji.Info} This message will self-destruct in **${autoDeleteSeconds}** seconds.`)
      );
  }

  return container;
}

export function createProcessingContainer(
  title: string,
  steps: string[],
  currentStep: number
) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Loading} ${title}\nProcessing step ${currentStep + 1} of ${steps.length}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

  steps.forEach((step, index) => {
    const emoji = index < currentStep ? Emoji.Success : index === currentStep ? Emoji.Loading : Emoji.Info;
    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${emoji} ${step}`)
    );
  });

  return container;
}
