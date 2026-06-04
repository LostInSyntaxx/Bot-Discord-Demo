/**
 * Deployment Handler
 *
 * This module provides the core logic for scanning, loading, and deploying
 * Discord slash commands. It handles both global and guild-specific deployments
 * with comprehensive error handling and logging.
 */

import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { readdirSync, statSync } from 'fs';
import { join, resolve, relative } from 'path';
import { env } from '@config/env';
import { Command } from '@bot-types/Command';
import { logger } from '@utils/logger';

interface CommandLoadResult {
  success: boolean;
  category: string;
  name: string;
  command?: Command;
  error?: string;
}

/**
 * Recursively scan and load commands from the commands directory
 */
async function loadCommandsFromDirectory(
  basePath: string,
  category: string = 'default'
): Promise<CommandLoadResult[]> {
  const results: CommandLoadResult[] = [];

  try {
    const entries = readdirSync(basePath);

    for (const entry of entries) {
      const fullPath = join(basePath, entry);
      const stat = statSync(fullPath);

      // Handle subdirectories (subcategories)
      if (stat.isDirectory()) {
        const subResults = await loadCommandsFromDirectory(fullPath, entry);
        results.push(...subResults);
        continue;
      }

      // Skip non-TypeScript files
      if (!entry.endsWith('.ts')) {
        continue;
      }

      try {
        const commandModule = await import(`file://${resolve(fullPath)}`);
        const command: Command = commandModule.default || commandModule;

        // Validate command structure
        if (!command.data) {
          results.push({
            success: false,
            category,
            name: entry,
            error: 'Missing data property (must extend BaseCommand)',
          });
          continue;
        }

        if (typeof command.execute !== 'function') {
          results.push({
            success: false,
            category,
            name: entry,
            error: 'Missing execute method',
          });
          continue;
        }

        results.push({
          success: true,
          category,
          name: command.data.name,
          command,
        });
      } catch (error) {
        results.push({
          success: false,
          category,
          name: entry,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } catch (error) {
    logger.error(`Failed to read directory ${basePath}:`, error);
  }

  return results;
}

/**
 * Deploy commands to Discord API
 */
async function deployCommands(): Promise<void> {
  const commandsPath = resolve(join(process.cwd(), 'src', 'commands'));

  // Phase 1: Load commands
  logger.info('📂 Scanning commands directory...');
  const commandResults = await loadCommandsFromDirectory(commandsPath);

  if (commandResults.length === 0) {
    logger.error('No commands found to deploy!');
    process.exit(1);
  }

  // Separate successful and failed loads
  const successfulCommands = commandResults.filter((r) => r.success);
  const failedCommands = commandResults.filter((r) => !r.success);

  // Phase 2: Report loading results
  logger.info(`\n📝 Command Loading Report:`);
  logger.info(`   • Total scanned: ${commandResults.length}`);
  logger.info(`   • Successful: ${successfulCommands.length}`);
  if (failedCommands.length > 0) {
    logger.warn(`   • Failed: ${failedCommands.length}`);
  }

  // Log detailed results
  if (successfulCommands.length > 0) {
    logger.debug('\n✓ Loaded Commands:');
    const byCategory: Record<string, string[]> = {};
    successfulCommands.forEach((cmd) => {
      if (!byCategory[cmd.category]) {
        byCategory[cmd.category] = [];
      }
      byCategory[cmd.category].push(cmd.name);
    });

    Object.entries(byCategory).forEach(([cat, names]) => {
      logger.debug(`   ${cat}: ${names.join(', ')}`);
    });
  }

  if (failedCommands.length > 0) {
    logger.warn('\n✗ Failed to Load:');
    failedCommands.forEach((cmd) => {
      logger.warn(`   ${cmd.name}: ${cmd.error}`);
    });
  }

  // Phase 3: Prepare slash command data
  const slashCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = successfulCommands
    .map((result) => result.command!.data.toJSON());

  logger.info(`\n📦 Preparing ${slashCommands.length} commands for deployment...`);

  // Phase 4: Deploy to Discord
  const rest = new REST().setToken(env.DISCORD_TOKEN);

  try {
    if (env.GUILD_ID) {
      // Guild-specific deployment (instant, for testing)
      logger.info(`🎯 Deploying to guild: ${env.GUILD_ID}`);
      logger.info('');

      const data = await rest.put(
        Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID),
        { body: slashCommands }
      );

      logger.success(`Guild deployment successful!`);
      logger.info(`   • Commands registered: ${Array.isArray(data) ? data.length : 1}`);
      logger.info(`   • Deployment type: Guild-specific (immediate)`);
    } else {
      // Global deployment (takes up to 1 hour)
      logger.info('🌍 Deploying globally to all servers...');
      logger.info('');

      const data = await rest.put(
        Routes.applicationCommands(env.CLIENT_ID),
        { body: slashCommands }
      );

      logger.success(`Global deployment successful!`);
      logger.info(`   • Commands registered: ${Array.isArray(data) ? data.length : 1}`);
      logger.info(`   • Deployment type: Global (may take up to 1 hour to propagate)`);
      logger.warn(`   • Use GUILD_ID environment variable for instant testing`);
    }

    logger.info('');
  } catch (error) {
    logger.error('Deployment failed!');
    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
      if (error.message.includes('401')) {
        logger.error('Hint: Invalid or expired DISCORD_TOKEN');
      } else if (error.message.includes('403')) {
        logger.error('Hint: Bot lacks necessary permissions');
      }
    }
    throw error;
  }
}

// Support direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  deployCommands().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}

export { deployCommands, loadCommandsFromDirectory };
