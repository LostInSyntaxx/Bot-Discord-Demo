# Discord Bot Demo

Professional Discord.js v14 Bot with TypeScript and Bun - Production-ready architecture with modular design.

## 🚀 Features

- ✅ **Discord.js v14** - Latest version with full TypeScript support
- ✅ **Bun Runtime** - Fast JavaScript runtime and package manager
- ✅ **Modular Architecture** - Clean separation of concerns
- ✅ **Slash Commands** - Modern Discord command system
- ✅ **Components V2** - Buttons, Modals, and Select Menus
- ✅ **Event System** - Organized event handlers
- ✅ **Service Layer** - Reusable business logic
- ✅ **Middleware** - Cooldowns, permissions, and more
- ✅ **UI System** - Pre-built containers and themes
- ✅ **Localization** - Multi-language support (EN, TH)
- ✅ **Type Safety** - Full TypeScript coverage

## 📋 Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher
- Node.js v18.0.0 or higher (for compatibility)
- Discord Bot Token ([Get one here](https://discord.com/developers/applications))

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Bot-Discord-Demo
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your bot credentials:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here  # Optional: for faster command deployment
   BOT_OWNER_ID=your_user_id_here
   ```

4. **Deploy slash commands**
   ```bash
   bun run deploy
   ```

5. **Start the bot**
   ```bash
   bun run dev
   ```

## 📁 Project Structure

```
Bot-Discord-Demo/
├── src/
│   ├── commands/          # Slash commands
│   │   ├── info/         # Information commands
│   │   ├── moderation/   # Moderation commands
│   │   ├── utility/      # Utility commands
│   │   └── developer/    # Developer-only commands
│   │
│   ├── events/           # Discord event handlers
│   │   ├── client/       # Client events (ready, error)
│   │   ├── interaction/  # Interaction events
│   │   ├── guild/        # Guild events
│   │   └── message/      # Message events
│   │
│   ├── handlers/         # System loaders
│   │   ├── commandHandler.ts
│   │   ├── eventHandler.ts
│   │   ├── componentHandler.ts
│   │   └── deployHandler.ts
│   │
│   ├── components/       # Discord Components V2
│   │   ├── buttons/      # Button interactions
│   │   ├── modals/       # Modal forms
│   │   └── selectMenus/  # Select menu interactions
│   │
│   ├── ui/              # UI System
│   │   ├── containers/  # Pre-built embeds
│   │   ├── layouts/     # Layout templates
│   │   └── themes/      # Color themes
│   │
│   ├── services/        # Business logic
│   │   ├── cooldown.service.ts
│   │   ├── logger.service.ts
│   │   ├── permission.service.ts
│   │   └── command.service.ts
│   │
│   ├── middleware/      # Pre-execution checks
│   │   ├── cooldown.ts
│   │   ├── permissions.ts
│   │   ├── ownerOnly.ts
│   │   └── maintenance.ts
│   │
│   ├── structures/      # Base classes
│   │   ├── BaseCommand.ts
│   │   ├── BaseEvent.ts
│   │   ├── BaseComponent.ts
│   │   └── BaseService.ts
│   │
│   ├── utils/          # Helper functions
│   │   ├── formatUptime.ts
│   │   ├── formatBytes.ts
│   │   ├── generateId.ts
│   │   ├── chunkArray.ts
│   │   └── validator.ts
│   │
│   ├── types/          # TypeScript definitions
│   │   ├── Command.ts
│   │   ├── Client.ts
│   │   ├── Event.ts
│   │   └── Component.ts
│   │
│   ├── config/         # Configuration files
│   │   ├── env.ts
│   │   ├── colors.ts
│   │   ├── emoji.ts
│   │   ├── constants.ts
│   │   └── permissions.ts
│   │
│   ├── locales/        # Translations
│   │   ├── en.json
│   │   └── th.json
│   │
│   └── index.ts        # Entry point
│
├── .env.example        # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🎮 Available Commands

### Information Commands
- `/ping` - Check bot latency
- `/help` - Display help menu
- `/userinfo` - Show user information
- `/serverinfo` - Show server information

### Moderation Commands
- `/kick` - Kick a member
- `/ban` - Ban a member
- `/timeout` - Timeout a member

### Developer Commands
- `/eval` - Evaluate JavaScript code (Owner only)

## 🎨 UI Themes

The bot includes 4 pre-built themes:

1. **Dark Theme** - Minimal dark design
2. **Gaming Theme** - Neon colors for gaming communities
3. **Glassmorphism** - Modern glass effect
4. **Terminal Theme** - Retro terminal style

## 🔧 Development

### Scripts

```bash
# Development with hot-reload
bun run dev

# Build for production
bun run build

# Start production build
bun run start

# Deploy slash commands
bun run deploy

# Type checking
bun run lint
```

### Creating a New Command

1. Create a new file in `src/commands/<category>/`
2. Extend `BaseCommand` class
3. Implement the `execute` method
4. The command will be auto-loaded on restart

Example:
```typescript
import { ChatInputCommandInteraction } from 'discord.js';
import { ExtendedClient } from '@types/Client';
import { BaseCommand } from '@structures/BaseCommand';

export default new (class MyCommand extends BaseCommand {
  constructor() {
    super({
      name: 'mycommand',
      description: 'My custom command',
      category: 'utility',
      cooldown: 5,
    });
  }

  async execute(client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Hello World!');
  }
})();
```

### Creating a New Event

1. Create a new file in `src/events/<category>/`
2. Extend `BaseEvent` class
3. Implement the `execute` method

Example:
```typescript
import { Message } from 'discord.js';
import { ExtendedClient } from '@types/Client';
import { BaseEvent } from '@structures/BaseEvent';

export default new (class MyEvent extends BaseEvent {
  constructor() {
    super({
      name: 'messageCreate',
    });
  }

  async execute(client: ExtendedClient, message: Message): Promise<void> {
    console.log(`New message: ${message.content}`);
  }
})();
```

## 🌐 Localization

Add translations in `src/locales/`:

```json
{
  "commands": {
    "ping": {
      "name": "ping",
      "description": "Check bot latency"
    }
  }
}
```

## 🔒 Permissions

The bot uses Discord's permission system. Configure required permissions in command options:

```typescript
permissions: [PermissionFlagsBits.ManageMessages]
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your bot token | ✅ |
| `CLIENT_ID` | Your application ID | ✅ |
| `GUILD_ID` | Guild ID for testing | ❌ |
| `BOT_OWNER_ID` | Your Discord user ID | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |
| `DEFAULT_LOCALE` | Default language (en/th) | ❌ |
| `LOG_LEVEL` | Logging level | ❌ |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [Bun Documentation](https://bun.sh/docs)

## 💬 Support

For support, join our Discord server or open an issue on GitHub.

---

Made with ❤️ using Discord.js v14, TypeScript, and Bun
