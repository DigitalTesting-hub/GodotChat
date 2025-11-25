# Godot Game Chat Backend

A Discord-integrated chat backend API for Godot games (Desktop Windows/Linux and Android).

## 🎮 Overview

This backend provides a simple, real-time chat system for Godot games with Discord integration. Players can chat with each other in-game, and all messages are optionally synced to a Discord channel for community engagement.

## ✨ Features

- **Simple API** - RESTful endpoints for sending and receiving messages
- **Discord Integration** - Two-way sync with Discord channels
- **CORS Enabled** - Works seamlessly with Godot HTTP requests
- **In-Memory Storage** - Fast message retrieval
- **Message Backfill** - Syncs recent Discord history on startup
- **Health Monitoring** - Status endpoints for connection monitoring

## 🚀 Quick Start

### 1. Set Discord Channel ID

The environment variable `DISCORD_CHANNEL_ID` is already configured with your channel: `1442398136525131899`

### 2. Access Your API

Your chat backend is running at:
```
https://[your-replit-url].replit.dev
```

### 3. Test the API

```bash
# Check health
curl https://[your-url].replit.dev/health

# Send a message
curl -X POST https://[your-url].replit.dev/api/send_message \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Player1","message":"Hello!"}'

# Get messages
curl -X POST https://[your-url].replit.dev/api/get_messages \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 📚 Documentation

- **[Godot Integration Guide](./GODOT_INTEGRATION_GUIDE.md)** - Complete guide for integrating with Godot
- **[API Reference](./API_REFERENCE.md)** - Detailed API documentation

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check with Discord status |
| `/api/status` | GET | Quick status check |
| `/api/send_message` | POST | Send a chat message |
| `/api/get_messages` | POST | Get all messages |

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_CHANNEL_ID` | Discord channel ID for message sync | Yes |
| `PORT` | Server port (default: 5000) | No |

## 💻 Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Discord**: discord.js v14
- **Frontend**: React + Vite (for web testing)
- **Storage**: In-memory (MemStorage)

## 🎮 Godot Integration

See the [Godot Integration Guide](./GODOT_INTEGRATION_GUIDE.md) for complete instructions on integrating this backend with your Godot game.

Quick example:

```gdscript
# Send a message from Godot
var headers = ["Content-Type: application/json"]
var body = JSON.stringify({
    "playerName": player_name,
    "message": "Hello from Godot!"
})

$HTTPRequest.request(
    "https://[your-url].replit.dev/api/send_message",
    headers,
    HTTPClient.METHOD_POST,
    body
)
```

## 🔄 Discord Sync

When Discord integration is active:
- ✅ Game messages → Discord channel
- ✅ Discord messages → Game chat
- ✅ Recent Discord history loaded on startup (last 50 messages)
- ✅ Graceful degradation if Discord is unavailable

## 📝 Message Format

All messages follow this structure:

```typescript
{
  id: string,          // UUID
  playerName: string,  // Player's display name
  message: string,     // Chat message content
  timestamp: string    // ISO 8601 timestamp (UTC)
}
```

## 🛡️ CORS Configuration

CORS is configured to allow all origins for game clients:
- **Origins**: `*` (all)
- **Methods**: `GET`, `POST`, `OPTIONS`
- **Headers**: `Content-Type`

## 🧪 Testing

### Web Interface
Open your Replit URL in a browser to test the chat using the web interface.

### API Testing
Use curl or Postman to test the API endpoints:

```bash
# Send test message
curl -X POST http://localhost:5000/api/send_message \
  -H "Content-Type: application/json" \
  -d '{"playerName":"TestPlayer","message":"Test message"}'

# Retrieve messages
curl -X POST http://localhost:5000/api/get_messages \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 📦 Dependencies

Main dependencies:
- `express` - Web framework
- `discord.js` - Discord integration
- `cors` - Cross-origin support
- `typescript` - Type safety
- `react` - Frontend UI

## 🚀 Deployment

This project is deployed on Replit and is ready to use. No additional setup required!

## 🐛 Troubleshooting

### Discord not connecting?
- Verify `DISCORD_CHANNEL_ID` is set correctly
- Check Discord bot permissions (Read Messages, Send Messages)
- Chat will still work without Discord sync

### Messages not appearing?
- Test `/health` endpoint to verify server status
- Check server logs for errors
- Verify CORS is working from your game client

### Godot can't connect?
- Ensure you're using HTTPS (Replit provides this)
- Verify API URL is correct
- Test with curl first to isolate the issue

## 📄 License

MIT License - feel free to use this in your games!

## 🤝 Contributing

This is a game-specific backend, but improvements are welcome!

## 📞 Support

For issues:
1. Check `/health` endpoint
2. Review server logs in Replit
3. Test with curl/Postman
4. Check Godot console for HTTP errors

---

**Built for Godot game developers 🎮**
