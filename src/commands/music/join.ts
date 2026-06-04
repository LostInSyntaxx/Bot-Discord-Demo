import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  GuildMember,
} from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { MusicService, getShoukaku } from '@services/music.service';
import { createMusicActionContainer } from '@ui/containers/musicContainer';

export default new (class JoinCommand extends BaseCommand {
  constructor() {
    super({
      name: 'join',
      description: 'Make the bot join your voice channel',
      category: 'music',
      cooldown: 3,
      guildOnly: true,
    });

    this.data = new SlashCommandBuilder()
      .setName('join')
      .setDescription('Make the bot join your voice channel')
      .setDMPermission(false);
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    // Check if user is in a voice channel
    if (!voiceChannel) {
      await interaction.reply({
        components: [createMusicActionContainer('❌ You must be in a voice channel to use this command!', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Check if bot is already in a voice channel in this guild
    const existingQueue = MusicService.getQueue(interaction.guildId!);
    if (existingQueue) {
      await interaction.reply({
        components: [createMusicActionContainer('ℹ️ I\'m already in a voice channel! Use `/play` to add songs.', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Check bot permissions
    const botMember = interaction.guild!.members.me!;
    const permissions = voiceChannel.permissionsFor(botMember);
    
    if (!permissions?.has('Connect')) {
      await interaction.reply({
        components: [createMusicActionContainer('❌ I don\'t have permission to join your voice channel!', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    if (!permissions?.has('Speak')) {
      await interaction.reply({
        components: [createMusicActionContainer('❌ I don\'t have permission to speak in your voice channel!', false)],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    try {
      // Join the voice channel
      const shoukaku = getShoukaku();
      const player = await shoukaku.joinVoiceChannel({
        guildId: interaction.guildId!,
        channelId: voiceChannel.id,
        shardId: interaction.guild!.shardId,
      });

      // Create an empty queue
      const queue = MusicService.createQueue(
        interaction.guildId!,
        player,
        interaction.channelId
      );

      // Set up event handlers
      player.on('end', async () => {
        const hasNext = await MusicService.playNext(interaction.guildId!);
        if (!hasNext) {
          await MusicService.deleteQueue(interaction.guildId!);
        }
      });

      player.on('exception', async () => {
        await MusicService.playNext(interaction.guildId!);
      });

      await interaction.reply({
        components: [createMusicActionContainer(`✅ Joined **${voiceChannel.name}**! Now use \`/play\` to add songs.`, true)],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error('Error joining voice channel:', error);
      await interaction.reply({
        components: [createMusicActionContainer('❌ Failed to join the voice channel. Please try again.', false)],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }
})();
