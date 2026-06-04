# Discord Bot Dashboard

A comprehensive web dashboard for managing your Discord bot with real-time updates.

## 🚀 Features

- **Discord OAuth2 Authentication** - Secure login with Discord
- **Guild/Server Selector** - Switch between multiple servers
- **Bot Statistics Dashboard** - Real-time bot metrics and analytics
- **Music Control Panel** - Control music playback, queue, and volume
- **Moderation Settings** - Configure anti-spam, anti-links, and auto moderation
- **Welcome & Auto Role System** - Set up welcome messages and automatic roles
- **Logs System** - View and filter moderation logs
- **Real-time WebSocket Updates** - Live updates without page refresh

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, TypeScript, TailwindCSS, NextUI
- **Backend:** Express.js, WebSocket
- **Icons:** Material UI Icons
- **State Management:** Zustand
- **Authentication:** Discord OAuth2, JWT

## 📦 Installation

1. **Install dependencies:**
```bash
cd dashboard
npm install
```

2. **Configure environment variables:**
```bash
cp .envexample .env


Edit `.env.local` with your Discord application credentials:
- `DISCORD_CLIENT_ID` - Your Discord bot client ID
- `DISCORD_CLIENT_SECRET` - Your Discord bot client secret
- `JWT_SECRET` - A random secret key for JWT tokens

3. **Set up Discord OAuth2:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application
   - Go to "OAuth2" section
   - Add redirect URL: `http://localhost:3001/api/auth/callback`
   - Copy Client ID and Client Secret to `.env.local`

## 🎮 Usage

### Development

Run both frontend and backend in development mode:

```bash
# Run everything (frontend + backend)
npm run dev:all

# Or run separately
npm run dev          # Frontend only (port 3000)
npm run server       # Backend only (port 3001)
```

### Production

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   │   └── login/         # Login page
│   │   ├── (dashboard)/       # Dashboard pages
│   │   │   ├── layout.tsx     # Dashboard layout
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── music/         # Music control
│   │   │   ├── moderation/    # Moderation settings
│   │   │   ├── welcome/       # Welcome & Auto Role
│   │   │   └── logs/          # Logs system
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   └── icons/             # Custom icons
│   ├── lib/                   # Utilities
│   │   ├── api.ts             # API client
│   │   └── websocket.ts       # WebSocket client
│   └── store/                 # State management
│       └── authStore.ts       # Auth state
├── server/                    # Express.js backend
│   └── index.ts               # API server
├── public/                    # Static files
└── .env.local                 # Environment variables
```

## 🎨 Color Palette

The dashboard uses a custom dark theme:

- Background: `bg-[#1a1a1a]`
- Card Background: `bg-[#242424]`
- Border: `border-[#2f2f2f]`
- Text: `text-white`
- Secondary Text: `text-zinc-400`

## 🔐 Authentication Flow

1. User clicks "Login with Discord"
2. Redirected to Discord OAuth2 consent screen
3. User authorizes the application
4. Discord redirects back with authorization code
5. Backend exchanges code for access token
6. Backend creates JWT token and redirects to dashboard
7. Frontend stores JWT and uses it for API requests

## 🔄 Real-time Updates

The dashboard uses WebSocket for real-time updates:

- Music playback status
- New moderation actions
- Member joins/leaves
- Bot statistics changes

## 📝 API Endpoints

### Authentication
- `GET /api/auth/discord` - Redirect to Discord OAuth2
- `GET /api/auth/callback` - OAuth2 callback handler
- `GET /api/auth/me` - Get current user

### Guilds
- `GET /api/guilds` - Get user's guilds

### Statistics
- `GET /api/stats/bot` - Get bot-wide statistics
- `GET /api/stats/guild/:guildId` - Get guild statistics

### Music
- `GET /api/music/:guildId` - Get music status
- `POST /api/music/:guildId/:action` - Control music (play, pause, skip, etc.)

### Moderation
- `GET /api/moderation/:guildId` - Get moderation config
- `PUT /api/moderation/:guildId` - Update moderation config

### Welcome & Auto Role
- `GET /api/welcome/:guildId` - Get welcome config
- `PUT /api/welcome/:guildId` - Update welcome config
- `GET /api/autorole/:guildId` - Get auto role config
- `PUT /api/autorole/:guildId` - Update auto role config

### Logs
- `GET /api/logs/:guildId` - Get moderation logs
- `GET /api/logs/:guildId/config` - Get logs config
- `PUT /api/logs/:guildId` - Update logs config

## 🔗 Integration with Main Bot

To integrate the dashboard with your main Discord bot:

1. **Share Database:** Both the bot and dashboard should use the same database
2. **WebSocket Events:** Emit events from bot to dashboard for real-time updates
3. **API Authentication:** Use the same Discord token for API requests

Example integration in your main bot (`src/index.ts`):

```typescript
import { broadcastToAll } from '../dashboard/server/index';

// Emit event when something happens
client.on('guildMemberAdd', (member) => {
  broadcastToAll({
    type: 'member_join',
    guild: member.guild.id,
    user: member.user,
    timestamp: new Date().toISOString(),
  });
});
```

## 🐛 Troubleshooting

**Issue:** OAuth2 redirect mismatch
- **Solution:** Make sure the redirect URL in Discord Developer Portal exactly matches `DISCORD_REDIRECT_URI`

**Issue:** CORS errors
- **Solution:** Ensure `CORS_ORIGIN` in `.env.local` matches your frontend URL

**Issue:** WebSocket not connecting
- **Solution:** Check that `NEXT_PUBLIC_WS_URL` is correct and the server is running

## 📄 License

MIT License - feel free to use this for your projects!

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 💡 Future Enhancements

- [ ] Command management interface
- [ ] Custom command creation
- [ ] Analytics charts and graphs
- [ ] Backup and restore settings
- [ ] Multi-language support
- [ ] Mobile responsive improvements
- [ ] Plugin system
- [ ] Automated backups

---

Made with ❤️ for Discord bot developers
