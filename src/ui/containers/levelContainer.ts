import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  User,
} from 'discord.js';
import { Emoji } from '@config/emoji';
import { LevelData, xpForNextLevel } from '@services/leveling.service';

export function createRankContainer(user: User, data: LevelData, rank: number): ContainerBuilder {
  const xpNeeded = xpForNextLevel(data.level);
  const progress = Math.min(Math.floor((data.xp / xpNeeded) * 10), 10);
  const bar = '█'.repeat(progress) + '░'.repeat(10 - progress);

  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Star} ${user.username}'s Rank`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `${Emoji.Trophy} **Rank:** #${rank}\n` +
          `${Emoji.Stats} **Level:** ${data.level}\n` +
          `${Emoji.Stats} **XP:** ${data.xp} / ${xpNeeded}\n` +
          `\`${bar}\``
        )
    );
}

export function createLeaderboardContainer(
  entries: { user: User | null; data: LevelData }[],
  guildName: string
): ContainerBuilder {
  const medals = ['🥇', '🥈', '🥉'];

  const list = entries.map((e, i) => {
    const name = e.user?.username ?? `Unknown (${e.data.user_id})`;
    const prefix = medals[i] ?? `**#${i + 1}**`;
    return `${prefix} ${name} — Lv.${e.data.level} (${e.data.xp} XP)`;
  }).join('\n');

  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Trophy} Leaderboard — ${guildName}`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(list || 'No data yet')
    );
}

export function createLevelUpContainer(user: User, newLevel: number): ContainerBuilder {
  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `# ${Emoji.Star} Level Up!\n` +
          `${user} reached **Level ${newLevel}** ${Emoji.Trophy}`
        )
    );
}
