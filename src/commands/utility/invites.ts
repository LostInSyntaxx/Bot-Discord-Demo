import { ChatInputCommandInteraction, MessageFlags, GuildMember } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { InviteService } from '@services/invite.service';
import { createSuccessContainer } from '@ui/containers/successContainer';
import { Emoji } from '@config/emoji';

export default new (class InvitesCommand extends BaseCommand {
  constructor() {
    super({
      name: 'invites',
      description: 'Check your invitation statistics or those of another user',
      category: 'utility',
      guildOnly: true,
    });

    this.data
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to check invites for')
          .setRequired(false)
      );
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const stats = InviteService.getInvites(interaction.guildId!, targetUser.id);

    const total = stats.regular + stats.bonus - stats.fake;

    await interaction.reply({
      components: [
        createSuccessContainer(
          'INVITATION STATS',
          `Invitation summary for **${targetUser.tag}**`,
          [
            { name: 'Total Invites', value: `**${total}**` },
            { name: 'Regular', value: `${stats.regular}`, inline: true },
            { name: 'Bonus', value: `${stats.bonus}`, inline: true },
            { name: 'Fake/Left', value: `${stats.fake}`, inline: true }
          ]
        )
      ],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
