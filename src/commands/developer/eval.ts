import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseCommand } from '@structures/BaseCommand';
import { createEvalSuccessContainer, createEvalErrorContainer } from '@ui/containers/evalContainer';

export default new (class EvalCommand extends BaseCommand {
  constructor() {
    super({
      name: 'eval',
      description: 'Evaluate JavaScript code (Owner only)',
      category: 'developer',
      cooldown: 0,
      ownerOnly: true,
    });

    this.data.addStringOption((option) =>
      option
        .setName('code')
        .setDescription('The code to evaluate')
        .setRequired(true)
    );
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true);

    try {
      let evaled = eval(code);

      if (typeof evaled !== 'string') {
        evaled = require('util').inspect(evaled, { depth: 0 });
      }

      const output = evaled.length > 1000 ? evaled.substring(0, 1000) + '...' : evaled;

      await interaction.reply({
        components: [createEvalSuccessContainer(code, output)],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        components: [createEvalErrorContainer(code, error instanceof Error ? error.message : String(error))],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }
  }
})();
