import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createServerinfoContainer } from '@ui/containers/serverinfoContainer';

export default new (class ServerinfoCommand extends BaseCommand {
  constructor() {
    super({
      name: 'serverinfo',
      description: 'Display information about the server',
      category: 'utility',
      cooldown: 5,
      guildOnly: true,
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;

    await interaction.reply({
      components: [createServerinfoContainer(guild)],
      flags: MessageFlags.IsComponentsV2,
    });
  }
})();
