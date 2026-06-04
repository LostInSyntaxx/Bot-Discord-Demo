import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Colors } from '@config/colors';
import { Emoji } from '@config/emoji';
import { paginate } from '@utils/chunkArray';

export interface ListLayoutOptions<T> {
  title: string;
  items: T[];
  page: number;
  itemsPerPage: number;
  formatItem: (item: T, index: number) => string;
  color?: number;
}

export function createListLayout<T>(options: ListLayoutOptions<T>) {
  const { items, page, itemsPerPage, formatItem, title, color } = options;
  
  const paginatedData = paginate(items, page, itemsPerPage);
  const { items: pageItems, totalPages, hasNext, hasPrev } = paginatedData;

  const description = pageItems.length > 0
    ? pageItems.map((item, index) => formatItem(item, (page - 1) * itemsPerPage + index)).join('\n')
    : 'No items to display.';

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${title}\n${description}\n\n**Page ${page} of ${totalPages}** • ${items.length} total items`)
    );

  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  if (totalPages > 1) {
    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`list:first:${page}`)
          .setEmoji(Emoji.Home)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId(`list:prev:${page}`)
          .setEmoji(Emoji.ArrowLeft)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasPrev),
        new ButtonBuilder()
          .setCustomId(`list:page:${page}`)
          .setLabel(`${page}/${totalPages}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`list:next:${page}`)
          .setEmoji(Emoji.ArrowRight)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!hasNext),
        new ButtonBuilder()
          .setCustomId(`list:last:${page}`)
          .setEmoji(Emoji.Forward)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages)
      );

    components.push(buttonRow);
  }

  return { container, components };
}
