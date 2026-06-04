import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  GuildMember,
} from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService } from '@services/music.service';
import { createMusicActionContainer } from '@ui/containers/musicContainer';

export default new (class LeaveCommand extends BaseCommand {
  constructor() {
    super({
      name: 'leave',
      description: 'Make the bot leave the voice channel',
      category: 'music',
      cooldown: 3,
      guildOnly: true,
    });

    this.data = new SlashCommandBuilder()
      .setName('leave')
      .setDescription('Make the bot leave the voice channel')
      .setDMPermission(false);
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    // Check if bot is in a voice channel
    const queue = MusicService.getQueue(interaction.guildId!);
    if (!queue) {
      await interaction.reply({
        components: [createMusicActionContainer('❌ I\'m not in any voice channel!', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    try {
      // Delete queue and leave voice channel
      await MusicService.deleteQueue(interaction.guildId!);

      await interaction.reply({
        components: [createMusicActionContainer('✅ Left the voice channel! See you next time!', true)],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error('Error leaving voice channel:', error);
      await interaction.reply({
        components: [createMusicActionContainer('❌ Failed to leave the voice channel. Please try again.', false)],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }
})();
