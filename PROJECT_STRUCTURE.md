# Discord Bot Project Structure

Professional Discord.js v14 + TypeScript Architecture

---

# Tech Stack

- Bun
- TypeScript
- Discord.js v14.26.4
- Components V2
- Modular Architecture

---

# Project Structure

```txt
Bot-Discord-Demo/
│
├── src/
│   │
│   ├── commands/
│   │   ├── info/
│   │   ├── moderation/
│   │   ├── utility/
│   │   └── developer/
│   │
│   ├── events/
│   │   ├── client/
│   │   ├── interaction/
│   │   ├── guild/
│   │   └── message/
│   │
│   ├── handlers/
│   │   ├── commandHandler.ts
│   │   ├── eventHandler.ts
│   │   ├── componentHandler.ts
│   │   └── deployHandler.ts
│   │
│   ├── components/
│   │   ├── buttons/
│   │   ├── modals/
│   │   └── selectMenus/
│   │
│   ├── ui/
│   │   ├── containers/
│   │   ├── layouts/
│   │   └── themes/
│   │
│   ├── services/
│   │   ├── cooldown.service.ts
│   │   ├── logger.service.ts
│   │   ├── permission.service.ts
│   │   └── command.service.ts
│   │
│   ├── middleware/
│   │   ├── cooldown.ts
│   │   ├── permissions.ts
│   │   ├── ownerOnly.ts
│   │   └── maintenance.ts
│   │
│   ├── structures/
│   │   ├── BaseCommand.ts
│   │   ├── BaseEvent.ts
│   │   ├── BaseComponent.ts
│   │   └── BaseService.ts
│   │
│   ├── utils/
│   │   ├── formatUptime.ts
│   │   ├── formatBytes.ts
│   │   ├── generateId.ts
│   │   ├── chunkArray.ts
│   │   └── validator.ts
│   │
│   ├── types/
│   │   ├── Command.ts
│   │   ├── Client.ts
│   │   ├── Event.ts
│   │   └── Component.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── colors.ts
│   │   ├── emoji.ts
│   │   ├── constants.ts
│   │   └── permissions.ts
│   │
│   ├── locales/
│   │   ├── en.json
│   │   └── th.json
│   │
│   └── index.ts
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── pnpm-lock.yaml
└── README.md
```
