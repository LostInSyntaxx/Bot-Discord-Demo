export const Constants = {
  // Bot Information
  BOT_NAME: 'Discord Bot Demo',
  BOT_VERSION: '1.0.0',
  BOT_DESCRIPTION: 'Professional Discord.js v14 Bot',
  
  // Links
  SUPPORT_SERVER: 'https://discord.gg/your-server',
  INVITE_URL: 'https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands',
  GITHUB_URL: 'https://github.com/your-repo',
  WEBSITE_URL: 'https://your-website.com',
  
  // Limits
  MAX_EMBED_FIELDS: 25,
  MAX_EMBED_DESCRIPTION: 4096,
  MAX_EMBED_TITLE: 256,
  MAX_EMBED_FOOTER: 2048,
  MAX_EMBED_AUTHOR: 256,
  MAX_EMBEDS_PER_MESSAGE: 10,
  
  // Timeouts
  DEFAULT_COOLDOWN: 3000, // 3 seconds
  COMPONENT_TIMEOUT: 300000, // 5 minutes
  MODAL_TIMEOUT: 600000, // 10 minutes
  
  // Pagination
  ITEMS_PER_PAGE: 10,
  MAX_PAGES: 25,
  
  // Cache
  CACHE_TTL: 3600000, // 1 hour
  
  // Permissions
  ADMIN_PERMISSIONS: ['Administrator', 'ManageGuild'],
  MOD_PERMISSIONS: ['KickMembers', 'BanMembers', 'ManageMessages'],
} as const;
