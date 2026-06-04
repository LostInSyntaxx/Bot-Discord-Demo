import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';
import { Emoji } from '@config/emoji';
import { codeBlock } from '@utils/validator';

export function createEvalSuccessContainer(code: string, output: string) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Success} Evaluation Successful\nCode executed successfully`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Code} Input**\n${codeBlock(code, 'js')}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Terminal} Output**\n${codeBlock(output, 'js')}`)
    );

  return container;
}

export function createEvalErrorContainer(code: string, error: string) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Error} Evaluation Failed\nAn error occurred during code execution`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Code} Input**\n${codeBlock(code, 'js')}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**${Emoji.Error} Error**\n${codeBlock(error, 'js')}`)
    );

  return container;
}
