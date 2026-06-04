import { readdirSync } from 'fs';
import { join } from 'path';
import { ExtendedClient } from '@bot-types/Client';
import { Event } from '@bot-types/Event';

export async function loadEvents(client: ExtendedClient): Promise<void> {
  const eventsPath = join(process.cwd(), 'src', 'events');
  const categories = readdirSync(eventsPath);

  let loadedCount = 0;

  for (const category of categories) {
    const categoryPath = join(eventsPath, category);
    const eventFiles = readdirSync(categoryPath).filter((file) => file.endsWith('.ts'));

    for (const file of eventFiles) {
      try {
        const filePath = join(categoryPath, file);
        const eventModule = await import(filePath);
        const event: Event = eventModule.default || eventModule;

        if (!event.options || !event.execute) {
          console.warn(`⚠️  Event ${file} is missing required properties`);
          continue;
        }

        if (event.options.enabled === false) {
          console.log(`⊘ Skipped disabled event: ${event.options.name}`);
          continue;
        }

        if (event.options.once) {
          client.once(event.options.name, (...args) => event.execute(client, ...args));
        } else {
          client.on(event.options.name, (...args) => event.execute(client, ...args));
        }

        loadedCount++;
        console.log(`✓ Loaded event: ${event.options.name} (${category})`);
      } catch (error) {
        console.error(`✗ Failed to load event ${file}:`, error);
      }
    }
  }

  console.log(`\n✅ Successfully loaded ${loadedCount} events\n`);
}
