import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { LevelingService } from '@services/leveling.service';
import { createRankContainer } from '@ui/containers/levelContainer';

export default new (class RankCommand extends BaseCommand {
  constructor() {
    super({
      name: 'rank',
      description: 'Check your or another member\'s rank',
      category: 'utility',
      cooldown: 5,
      guildOnly: true,
    });

    this.data = new SlashCommandBuilder()
      .setName('rank')
      .setDescription('Check your or another member\'s rank')
      .setDMPermission(false)
      .addUserOption(opt =>
        opt.setName('user').setDescription('User to check (defaults to you)')
      ) as SlashCommandBuilder;
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const guildId = interaction.guildId!;

    const data = LevelingService.getData(guildId, target.id);
    const rank = LevelingService.getRank(guildId, target.id);

    await interaction.reply({
      components: [createRankContainer(target, data, rank)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
