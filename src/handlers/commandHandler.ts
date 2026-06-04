import { readdirSync } from 'fs';
import { join } from 'path';
import { ExtendedClient } from '@bot-types/Client';
import { Command } from '@bot-types/Command';

export async function loadCommands(client: ExtendedClient): Promise<void> {
  const commandsPath = join(process.cwd(), 'src', 'commands');
  const categories = readdirSync(commandsPath);

  let loadedCount = 0;

  for (const category of categories) {
    const categoryPath = join(commandsPath, category);
    const commandFiles = readdirSync(categoryPath).filter((file) => file.endsWith('.ts'));

    for (const file of commandFiles) {
      try {
        const filePath = join(categoryPath, file);
        const commandModule = await import(filePath);
        const command: Command = commandModule.default || commandModule;

        if (!command.data || !command.execute) {
          console.warn(`⚠️  Command ${file} is missing required properties`);
          continue;
        }

        client.commands.set(command.data.name, command);
        loadedCount++;
        console.log(`✓ Loaded command: ${command.data.name} (${category})`);
      } catch (error) {
        console.error(`✗ Failed to load command ${file}:`, error);
      }
    }
  }

  console.log(`\n✅ Successfully loaded ${loadedCount} commands\n`);
}
