import { readdirSync } from 'fs';
import { join } from 'path';
import { ExtendedClient } from '@bot-types/Client';
import { Component } from '@bot-types/Component';

export async function loadComponents(client: ExtendedClient): Promise<void> {
  const componentsPath = join(process.cwd(), 'src', 'components');
  const componentTypes = ['buttons', 'modals', 'selectMenus'];

  let loadedCount = 0;

  for (const type of componentTypes) {
    const typePath = join(componentsPath, type);
    
    try {
      const componentFiles = readdirSync(typePath).filter((file) => file.endsWith('.ts'));

      for (const file of componentFiles) {
        try {
          const filePath = join(typePath, file);
          const componentModule = await import(filePath);
          const component: Component = componentModule.default || componentModule;

          if (!component.options || !component.execute) {
            console.warn(`⚠️  Component ${file} is missing required properties`);
            continue;
          }

          const collectionMap = {
            buttons: client.components.buttons,
            modals: client.components.modals,
            selectMenus: client.components.selectMenus,
          };

          const collection = collectionMap[type as keyof typeof collectionMap];
          collection.set(component.options.customId, component);

          loadedCount++;
          console.log(`✓ Loaded ${type.slice(0, -1)}: ${component.options.customId}`);
        } catch (error) {
          console.error(`✗ Failed to load component ${file}:`, error);
        }
      }
    } catch (error) {
      // Directory doesn't exist yet, skip
      console.log(`⊘ No ${type} directory found, skipping...`);
    }
  }

  console.log(`\n✅ Successfully loaded ${loadedCount} components\n`);
}
