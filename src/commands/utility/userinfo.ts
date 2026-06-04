import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createUserinfoContainer } from '@ui/containers/userinfoContainer';

export default new (class UserinfoCommand extends BaseCommand {
  constructor() {
    super({
      name: 'userinfo',
      description: 'Display information about a user',
      category: 'utility',
      cooldown: 5,
      guildOnly: true,
    });

    this.data.addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to get information about')
        .setRequired(false)
    );
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;

    await interaction.reply({
      components: [createUserinfoContainer(targetUser, member)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
