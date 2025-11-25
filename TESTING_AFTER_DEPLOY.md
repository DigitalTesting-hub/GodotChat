# Testing After Deployment to Render

Complete testing checklist to verify your chat backend is working on Render.

## Replace This URL in All Commands

Replace `https://godot-chat-backend.onrender.com` with your actual Render URL:
- Your Render URL is shown on your Render dashboard
- Format: `https://[your-service-name].onrender.com`

## Test 1: Health Check ✅

Check if the server is running:

```bash
curl https://godot-chat-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T06:26:34.877Z",
  "discord": "connected",
  "uptime": 10.479890491
}
```

**What to look for:**
- ✅ `"status": "healthy"` - Server is running
- ✅ `"discord": "connected"` - Discord bot connected
- ⚠️ If `"discord": "disconnected"` - Check Discord token in Render environment vars

---

## Test 2: Send a Message 📤

Send a test message:

```bash
curl -X POST https://godot-chat-backend.onrender.com/api/send_message \
  -H "Content-Type: application/json" \
  -d '{"playerName":"TestPlayer","message":"Hello from Render!"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": {
    "id": "abc-123-def",
    "playerName": "TestPlayer",
    "message": "Hello from Render!",
    "timestamp": "2025-11-24T06:26:41.622Z"
  }
}
```

**What to check:**
- ✅ `"success": true` - Message sent successfully
- ✅ `"id"` exists - Message stored with unique ID
- ✅ `"timestamp"` exists - Server timestamp recorded

**Common Issues:**
- `"success": false, "error": "Player name is required"` → Check playerName field
- `"success": false, "error": "Message too long"` → Message must be ≤ 500 characters

---

## Test 3: Get Messages 📥

Retrieve all messages:

```bash
curl -X POST https://godot-chat-backend.onrender.com/api/get_messages \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "abc-123-def",
      "playerName": "TestPlayer",
      "message": "Hello from Render!",
      "timestamp": "2025-11-24T06:26:41.622Z"
    }
  ]
}
```

**What to check:**
- ✅ `"success": true`
- ✅ Messages array includes your test message
- ✅ Message appears with correct playerName and text

---

## Test 4: Discord Sync Check 🔗

Verify messages are syncing to Discord:

1. **Send a message** (using Test 2 above)
2. **Check your Discord channel** (ID: 1442398136525131899)
3. **Look for the message** in that channel

**Expected in Discord:**
```
TestPlayer: Hello from Render!
```

**If message doesn't appear:**
- Check Discord bot has permission to send messages
- Verify DISCORD_CHANNEL_ID is correct in Render
- Check Render logs for Discord errors

---

## Test 5: Godot Game Integration 🎮

**Update your Godot code with the new URL:**

```gdscript
# ChatManager.gd
const API_URL = "https://godot-chat-backend.onrender.com"
```

**Test from Godot:**

```gdscript
func _ready():
    # Send test message
    send_message("GodotPlayer", "Testing from Godot game!")
    
    # Check messages are received
    _poll_messages()
```

**What to verify:**
- ✅ Messages send without errors
- ✅ Messages appear in chat UI
- ✅ Messages appear in Discord channel
- ✅ Multiple players' messages display correctly

---

## Test 6: CORS Testing 🔄

Verify cross-origin requests work (required for Godot):

```bash
curl -i -X OPTIONS https://godot-chat-backend.onrender.com/api/send_message \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST"
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**If this fails:** Contact Render support - usually indicates build issue.

---

## Test 7: Load Testing (Optional)

Send multiple messages to test performance:

```bash
for i in {1..10}; do
  curl -X POST https://godot-chat-backend.onrender.com/api/send_message \
    -H "Content-Type: application/json" \
    -d "{\"playerName\":\"Player$i\",\"message\":\"Message number $i\"}"
  sleep 0.5
done

# Then get all messages
curl -X POST https://godot-chat-backend.onrender.com/api/get_messages \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:**
- All 10 messages stored
- No errors or timeouts
- Render dashboard shows normal CPU usage

---

## Test 8: Verify Logs in Render

1. Go to your **Render Dashboard**
2. Click your service: `godot-chat-backend`
3. Go to **Logs** tab
4. You should see:

```
✅ Discord bot logged in as ChatBot#9318
✅ 💬 Chat API ready for Godot game clients
✅ 📤 Sent to Discord: [message info]
✅ POST /api/send_message 200
✅ POST /api/get_messages 200
```

**If you see errors:**
- `TokenInvalid` → Discord token is wrong or expired
- `ECONNREFUSED` → Database connection issue (check DATABASE_URL)
- `TypeError` → Code error during build

---

## Troubleshooting Guide

### API returns 502 Bad Gateway
**Cause:** Server crashed or not responding
**Fix:**
1. Check Render logs for errors
2. Verify environment variables are set
3. Check Discord bot token is correct

### Messages not appearing in Discord
**Cause:** Discord integration issue
**Fix:**
1. Verify DISCORD_BOT_TOKEN is set in Render
2. Verify DISCORD_CHANNEL_ID is correct
3. Verify bot has permission in Discord server
4. Check Render logs for Discord errors

### Slow response times
**Cause:** Free tier Render service spinning up
**Fix:**
1. Expected first request takes 15-30 seconds
2. After requests, stays awake for 15 minutes
3. Upgrade to Starter ($7/month) for always-on

### Build failed on Render
**Cause:** Missing files or build command issue
**Fix:**
1. Verify all source files uploaded to GitHub
2. Run locally: `npm run build` to test build
3. Check TypeScript errors: `npm run type-check`
4. Verify package.json and package-lock.json are up to date

---

## Testing Checklist

- [ ] Health endpoint returns `"status": "healthy"`
- [ ] Health endpoint shows `"discord": "connected"`
- [ ] Can send message via API
- [ ] Message appears in response with correct data
- [ ] Can retrieve messages via API
- [ ] Message appears in Discord channel
- [ ] Multiple messages work correctly
- [ ] CORS headers present in response
- [ ] No 502 errors in logs
- [ ] Godot game can connect and send messages

---

## Success! 🎉

If all tests pass, your chat backend is ready for production with your Godot game!

**Next Steps:**
1. ✅ Fully integrate with your Godot game
2. ✅ Test with real players
3. ✅ Monitor Render dashboard for issues
4. ✅ Enjoy real-time multiplayer chat!

---

## Quick Test Script

Save this as `test.sh` and run with:
```bash
chmod +x test.sh
./test.sh https://godot-chat-backend.onrender.com
```

```bash
#!/bin/bash
URL=$1

echo "=== Testing Godot Chat Backend ==="
echo "URL: $URL"
echo ""

echo "1️⃣ Health Check..."
curl -s "$URL/health" | jq '.'
echo ""

echo "2️⃣ Send Test Message..."
curl -s -X POST "$URL/api/send_message" \
  -H "Content-Type: application/json" \
  -d '{"playerName":"TestBot","message":"Automated test"}' | jq '.'
echo ""

echo "3️⃣ Get Messages..."
curl -s -X POST "$URL/api/get_messages" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'
echo ""

echo "✅ All tests completed!"
```

---

**Happy testing!** 🚀
