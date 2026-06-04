import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';
import { Emoji } from '@config/emoji';

export function createErrorContainer(
  title: string,
  description: string,
  details?: string
) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Error} ${title}\n${description}`)
    );

  if (details) {
    container
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`**Details**\n${details}`)
      );
  }

  return container;
}

export function createPermissionErrorContainer(missingPermissions: string[]) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Error} Missing Permissions\nYou need the following permissions to use this command:`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

  missingPermissions.forEach((perm) => {
    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Shield} ${perm}`)
    );
  });

  return container;
}

export function createCooldownErrorContainer(timeLeft: string, commandName: string) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Loading} Cooldown Active\nPlease wait **${timeLeft}** before using \`${commandName}\` again.`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Info} Cooldowns prevent spam and ensure fair usage`)
    );

  return container;
}
