/**
 * Discord Slash Commands Deployment Script
 *
 * This script handles the registration of all slash commands to Discord's API.
 * It supports both global and guild-specific deployments and provides detailed
 * logging of the deployment process.
 *
 * Usage:
 *   Global deployment:  bun run src/scripts/deployCommands.ts
 *   Guild deployment:   GUILD_ID=xxx bun run src/scripts/deployCommands.ts
 *
 * Environment Variables:
 *   - DISCORD_TOKEN: Your bot's authentication token (required)
 *   - CLIENT_ID: Your application's client ID (required)
 *   - GUILD_ID: Specific guild ID for guild-only deployment (optional)
 */

import { deployCommands } from '@handlers/deployHandler';
import { env } from '@config/env';
import { logger } from '@utils/logger';

/**
 * Main deployment entry point
 */
async function main(): Promise<void> {
  try {
    logger.info('🚀 Starting Slash Commands Deployment System');
    logger.info('━'.repeat(50));

    // Validate required environment variables
    if (!env.DISCORD_TOKEN) {
      throw new Error('DISCORD_TOKEN environment variable is not set');
    }
    if (!env.CLIENT_ID) {
      throw new Error('CLIENT_ID environment variable is not set');
    }

    // Execute deployment
    await deployCommands();

    logger.info('━'.repeat(50));
    logger.success('✨ Deployment completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Deployment failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Execute the main function
main();
