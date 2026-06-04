import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';
import { Emoji } from '@config/emoji';

export function createModerationSuccessContainer(
  action: string,
  targetTag: string,
  fields: { name: string; value: string; inline?: boolean }[]
) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Success} ${action}\nSuccessfully ${action.toLowerCase()} **${targetTag}**`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

  fields.forEach((field) => {
    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`**${field.name}**\n${field.value}`)
    );
  });

  container
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Shield} Action logged • ${new Date().toLocaleTimeString()}`)
    );

  return container;
}

export function createModerationErrorContainer(
  title: string,
  description: string
) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Error} ${title}\n${description}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Info} Please check permissions and try again`)
    );

  return container;
}
export function createClearChatContainer(count: number, executorTag: string, autoDeleteSeconds?: number) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Delete} CHANNEL PURGE COMPLETE`)
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `> ${Emoji.Success} **STATUS:** Cleared **${count}** messages successfully.\n` +
          `> ${Emoji.User} **OPERATOR:** ${executorTag}`
        )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

  const footer = [`${Emoji.Shield} Audit log entry generated • ${new Date().toLocaleTimeString()}`];
  if (autoDeleteSeconds) footer.push(`${Emoji.Info} Auto-cleanup in **${autoDeleteSeconds}s**`);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${footer.join(' • ')}`)
  );

  return container;
}
