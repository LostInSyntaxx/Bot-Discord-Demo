import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { LevelingService } from '@services/leveling.service';
import { createLeaderboardContainer } from '@ui/containers/levelContainer';

export default new (class LeaderboardCommand extends BaseCommand {
  constructor() {
    super({
      name: 'leaderboard',
      description: 'View the XP leaderboard for this server',
      category: 'utility',
      cooldown: 10,
      guildOnly: true,
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId!;
    const top = LevelingService.getLeaderboard(guildId, 10);

    const entries = await Promise.all(
      top.map(async data => {
        const user = await client.users.fetch(data.user_id).catch(() => null);
        return { user, data };
      })
    );

    await interaction.reply({
      components: [createLeaderboardContainer(entries, interaction.guild!.name)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
