import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  parseEmoji
} from 'discord.js';
import { Emoji } from '@config/emoji';
import { Command } from '@bot-types/Command';

export function createHelpContainer(
  botName: string,
  categories: string[],
  totalCommands: number
) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Help} ${botName} Help Menu\nSelect a category from the dropdown menu below to view commands.`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Info} Available Categories\n${categories.map((cat) => `${Emoji.ArrowRight} **${cat}**`).join('\n')}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Stats} Statistics\nTotal Commands: **${totalCommands}**\nCategories: **${categories.length}**`)
    );

  const selectMenu = createHelpSelectMenu(categories);

  return {
    container,
    selectMenu
  };
}

export function createCategoryContainer(
  category: string,
  commands: Command[]
) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Info} ${category} Commands\nShowing ${commands.length} command(s) in this category`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

  commands.forEach((cmd) => {
    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`## ${Emoji.Code} /${cmd.options.name}\n${cmd.options.description}`)
    );
  });

  if (commands.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`${Emoji.Info} No commands available in this category.`)
    );
  }

  return container;
}

export function createCommandDetailContainer(command: Command) {
  const lines = [
    `# ${Emoji.Code} /${command.options.name}`,
    `${command.options.description}`,
    '',
    `**Category:** ${command.options.category}`,
    `**Cooldown:** ${command.options.cooldown || 3} seconds`
  ];

  if (command.options.permissions && command.options.permissions.length > 0) {
    lines.push('', `**${Emoji.Shield} Required Permissions:**`);
    command.options.permissions.forEach((perm) => {
      lines.push(`${Emoji.Check} ${perm.toString()}`);
    });
  }

  if (command.options.ownerOnly) {
    lines.push('', `**${Emoji.Crown} Restrictions:** Owner Only`);
  }

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(lines.join('\n'))
    );

  return container;
}

export function createHelpSelectMenu(categories: string[]): ActionRowBuilder<StringSelectMenuBuilder> {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('help:category')
    .setPlaceholder('Select a category')
    .addOptions([
      {
        label: 'Main Menu',
        value: 'main',
        description: 'Back to the help overview',
        emoji: '🏠'
      },
      ...categories.map((category) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: category.toLowerCase(),
        description: `View ${category} commands`,
        emoji: '➡️'
      }))
    ]);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
}
