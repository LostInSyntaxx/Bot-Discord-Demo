import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService } from '@services/music.service';
import { createMusicActionContainer } from '@ui/containers/musicContainer';

export default new (class LoopCommand extends BaseCommand {
  constructor() {
    super({
      name: 'loop',
      description: 'Set loop mode (none / track / queue)',
      category: 'utility',
      cooldown: 2,
      guildOnly: true,
    });

    this.data = new SlashCommandBuilder()
      .setName('loop')
      .setDescription('Set loop mode')
      .setDMPermission(false)
      .addStringOption(opt =>
        opt.setName('mode')
          .setDescription('Loop mode')
          .setRequired(true)
          .addChoices(
            { name: 'None', value: 'none' },
            { name: 'Track', value: 'track' },
            { name: 'Queue', value: 'queue' }
          )
      ) as SlashCommandBuilder;
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const queue = MusicService.getQueue(interaction.guildId!);
    if (!queue) {
      await interaction.reply({
        components: [createMusicActionContainer('Nothing is playing', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const mode = interaction.options.getString('mode', true) as 'none' | 'track' | 'queue';
    queue.loop = mode;

    const icons = { none: '➡️', track: '🔂', queue: '🔁' };
    await interaction.reply({
      components: [createMusicActionContainer(`${icons[mode]} Loop set to **${mode}**`)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
