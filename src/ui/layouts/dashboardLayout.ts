import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '@config/colors';
import { Emoji } from '@config/emoji';

export interface DashboardOptions {
  title: string;
  description?: string;
  sections: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
  buttons?: {
    label: string;
    customId: string;
    style?: ButtonStyle;
    emoji?: string;
  }[];
}

export function createDashboardLayout(options: DashboardOptions) {
  const lines: string[] = [
    `# ${options.title}`
  ];

  if (options.description) {
    lines.push(options.description);
  }

  if (options.sections.length > 0) {
    lines.push('');
    options.sections.forEach((section) => {
      lines.push(`**${section.name}**`);
      lines.push(section.value);
      lines.push('');
    });
  }

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(lines.join('\n').trim())
    );

  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  if (options.buttons && options.buttons.length > 0) {
    const buttonRow = new ActionRowBuilder<ButtonBuilder>();

    for (const button of options.buttons) {
      const btn = new ButtonBuilder()
        .setCustomId(button.customId)
        .setLabel(button.label)
        .setStyle(button.style || ButtonStyle.Primary);

      if (button.emoji) {
        btn.setEmoji(button.emoji);
      }

      buttonRow.addComponents(btn);
    }

    components.push(buttonRow);
  }

  return { container, components };
}
