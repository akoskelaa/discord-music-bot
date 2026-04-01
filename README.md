# Discord Music Bot

A Discord bot that plays music from YouTube, Spotify, and SoundCloud links in voice channels.

## Prerequisites

- Node.js >= 22.12.0
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from the example:

```bash
cp .env.example .env
```

3. Add your bot token to `.env`:

```
BOT_TOKEN=your-bot-token-here
```

4. Invite the bot to your server with the following permissions: Send Messages, Connect, Speak. The bot also requires the **Message Content** privileged intent enabled in the Developer Portal.

## Running

```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

## Commands

| Command | Description |
|---------------|-------------------------------|
| `!play <url>` | Play a song from a URL |
| `!skip` | Skip the current song |
| `!stop` | Stop playback and clear queue |
| `!queue` | Show the current queue |

Supported platforms: YouTube, YouTube Music, Spotify, SoundCloud.
