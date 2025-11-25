# Chat API Reference

Quick reference for the Discord-integrated chat API.

## Base URL
```
https://[your-replit-url].replit.dev
```

## Endpoints

### GET /health
Health check endpoint for monitoring server status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T06:16:08.198Z",
  "discord": "connected" | "disconnected",
  "uptime": 26.92
}
```

### GET /api/status
Quick status check for connection monitoring.

**Response:**
```json
{
  "online": true,
  "timestamp": 1700000000000,
  "discord": true | false
}
```

### POST /api/send_message
Send a chat message from a player.

**Request:**
```json
{
  "playerName": "string (required, min 1 char)",
  "message": "string (required, min 1 char, max 500 chars)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "playerName": "string",
    "message": "string",
    "timestamp": "ISO 8601 string"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Player name is required" | "Message cannot be empty" | "Message too long"
}
```

### POST /api/get_messages
Retrieve all chat messages.

**Request:**
```json
{}
```

**Success Response (200):**
```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "playerName": "string",
      "message": "string",
      "timestamp": "ISO 8601 string"
    }
  ]
}
```

## CORS Configuration
- **Allowed Origins:** `*` (all origins)
- **Allowed Methods:** `GET`, `POST`, `OPTIONS`
- **Allowed Headers:** `Content-Type`

## Discord Integration

When properly configured with `DISCORD_CHANNEL_ID`:
- All game messages are forwarded to Discord channel
- Discord messages are synced back to game
- Messages appear with format: `**PlayerName:** message`

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request (validation error) |
| 500  | Internal Server Error |

## Rate Limiting
No rate limiting currently implemented. Recommended polling interval: 3 seconds.

## Data Persistence
Messages are stored in-memory. Messages are lost on server restart.

## Example Usage

### cURL Examples

**Send Message:**
```bash
curl -X POST https://[your-url].replit.dev/api/send_message \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Player1","message":"Hello world!"}'
```

**Get Messages:**
```bash
curl -X POST https://[your-url].replit.dev/api/get_messages \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Health Check:**
```bash
curl https://[your-url].replit.dev/health
```

### JavaScript/Fetch Example

```javascript
// Send message
async function sendMessage(playerName, message) {
  const response = await fetch('https://[your-url].replit.dev/api/send_message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, message })
  });
  return await response.json();
}

// Get messages
async function getMessages() {
  const response = await fetch('https://[your-url].replit.dev/api/get_messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  return await response.json();
}

// Poll for messages every 3 seconds
setInterval(async () => {
  const data = await getMessages();
  console.log('Messages:', data.messages);
}, 3000);
```

## Notes

- All timestamps are in UTC ISO 8601 format
- Message IDs are UUIDs (v4)
- Messages are returned in chronological order (oldest first)
- Empty message list is valid when no messages exist
