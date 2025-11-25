# Godot Game Chat Integration Guide

This guide explains how to integrate the Discord-powered chat system into your Godot game (Desktop Windows/Linux and Android).

## 🌐 API Endpoint

Your chat backend is running at:
```
https://[your-replit-url].replit.dev
```

Replace `[your-replit-url]` with your actual Replit deployment URL.

## 📡 Available API Endpoints

### 1. Health Check
```
GET /health
```
Returns server status and Discord connection state.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T06:16:08.198Z",
  "discord": "connected",
  "uptime": 26.92
}
```

### 2. Send Message
```
POST /api/send_message
Content-Type: application/json
```

**Request Body:**
```json
{
  "playerName": "Player123",
  "message": "Hello everyone!"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "abc-123-def",
    "playerName": "Player123",
    "message": "Hello everyone!",
    "timestamp": "2025-11-24T06:16:08.198Z"
  }
}
```

### 3. Get Messages
```
POST /api/get_messages
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "abc-123",
      "playerName": "Player1",
      "message": "Hi!",
      "timestamp": "2025-11-24T06:15:00.000Z"
    },
    {
      "id": "def-456",
      "playerName": "Player2",
      "message": "Hello!",
      "timestamp": "2025-11-24T06:16:00.000Z"
    }
  ]
}
```

## 🎮 Godot Implementation

### Step 1: Create HTTPRequest Node

In your Godot scene, add an `HTTPRequest` node:

```gdscript
# ChatManager.gd
extends Node

# Configuration
const API_URL = "https://[your-replit-url].replit.dev"
const POLL_INTERVAL = 3.0  # Poll every 3 seconds

# HTTP Request nodes
var send_request: HTTPRequest
var get_request: HTTPRequest

# Player info
var player_name = ""
var last_message_count = 0

# Signals
signal messages_received(messages)
signal message_sent(success)

func _ready():
	# Create HTTP request nodes
	send_request = HTTPRequest.new()
	add_child(send_request)
	send_request.request_completed.connect(_on_send_completed)
	
	get_request = HTTPRequest.new()
	add_child(get_request)
	get_request.request_completed.connect(_on_get_completed)
	
	# Start polling timer
	var timer = Timer.new()
	add_child(timer)
	timer.wait_time = POLL_INTERVAL
	timer.timeout.connect(_poll_messages)
	timer.start()

# Set player name (fetch from Label3D or player data)
func set_player_name(name: String):
	player_name = name

# Send a message
func send_message(message: String):
	if player_name.is_empty():
		push_error("Player name not set!")
		return
	
	var headers = ["Content-Type: application/json"]
	var body = JSON.stringify({
		"playerName": player_name,
		"message": message
	})
	
	var error = send_request.request(
		API_URL + "/api/send_message",
		headers,
		HTTPClient.METHOD_POST,
		body
	)
	
	if error != OK:
		push_error("Failed to send message: " + str(error))

# Poll for new messages
func _poll_messages():
	var headers = ["Content-Type: application/json"]
	var body = JSON.stringify({})
	
	var error = get_request.request(
		API_URL + "/api/get_messages",
		headers,
		HTTPClient.METHOD_POST,
		body
	)
	
	if error != OK:
		push_error("Failed to get messages: " + str(error))

# Handle send response
func _on_send_completed(result, response_code, headers, body):
	if response_code == 200:
		var json = JSON.new()
		var parse_result = json.parse(body.get_string_from_utf8())
		
		if parse_result == OK:
			var data = json.data
			message_sent.emit(data.success)
		else:
			push_error("Failed to parse send response")
	else:
		push_error("Send failed with code: " + str(response_code))

# Handle get messages response
func _on_get_completed(result, response_code, headers, body):
	if response_code == 200:
		var json = JSON.new()
		var parse_result = json.parse(body.get_string_from_utf8())
		
		if parse_result == OK:
			var data = json.data
			if data.success and data.messages.size() > last_message_count:
				last_message_count = data.messages.size()
				messages_received.emit(data.messages)
		else:
			push_error("Failed to parse messages response")
```

### Step 2: Create Chat UI Scene

Create a simple chat UI in Godot:

```gdscript
# ChatUI.gd
extends Control

@onready var chat_manager = $"/root/ChatManager"  # AutoLoad
@onready var name_panel = $NamePanel
@onready var name_input = $NamePanel/NameInput
@onready var join_button = $NamePanel/JoinButton

@onready var chat_panel = $ChatPanel
@onready var message_list = $ChatPanel/MessageList
@onready var message_input = $ChatPanel/MessageInput
@onready var send_button = $ChatPanel/SendButton

var current_player_name = ""

func _ready():
	# Connect signals
	join_button.pressed.connect(_on_join_pressed)
	send_button.pressed.connect(_on_send_pressed)
	message_input.text_submitted.connect(_on_message_submitted)
	
	chat_manager.messages_received.connect(_on_messages_received)
	
	# Show name entry screen
	name_panel.visible = true
	chat_panel.visible = false

func _on_join_pressed():
	var name = name_input.text.strip_edges()
	if name.is_empty():
		return
	
	current_player_name = name
	chat_manager.set_player_name(name)
	
	# Switch to chat screen
	name_panel.visible = false
	chat_panel.visible = true

func _on_send_pressed():
	var message = message_input.text.strip_edges()
	if message.is_empty():
		return
	
	chat_manager.send_message(message)
	message_input.text = ""

func _on_message_submitted(message: String):
	_on_send_pressed()

func _on_messages_received(messages):
	# Clear existing messages
	for child in message_list.get_children():
		child.queue_free()
	
	# Display messages
	for msg in messages:
		var label = Label.new()
		var is_own = msg.playerName == current_player_name
		
		# Format: Own messages left, others right
		if is_own:
			label.text = msg.message
			label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
		else:
			label.text = msg.playerName + ": " + msg.message
			label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		
		message_list.add_child(label)
```

### Step 3: Fetch Player Name from Label3D

If you have a player nickname in a `Label3D` node:

```gdscript
# In your player script
func _ready():
	var nickname_label = $Label3D  # Adjust path to your Label3D
	var player_name = nickname_label.text
	
	# Send to chat manager
	var chat_manager = get_node("/root/ChatManager")
	chat_manager.set_player_name(player_name)
```

## 🔧 Setup Instructions

### 1. Make ChatManager AutoLoad (Singleton)

1. Go to **Project → Project Settings → AutoLoad**
2. Add `ChatManager.gd` as an AutoLoad script
3. Name it `ChatManager`

### 2. Configure API URL

Replace `[your-replit-url]` with your actual Replit deployment URL in `ChatManager.gd`:

```gdscript
const API_URL = "https://your-actual-url.replit.dev"
```

### 3. Build & Export Settings

#### For Desktop (Windows/Linux):
- No special configuration needed
- HTTPRequest works out of the box

#### For Android:
Add to your Android export settings:
1. Go to **Project → Export**
2. Select **Android** preset
3. Under **Permissions**, enable:
   - `INTERNET`
   - `ACCESS_NETWORK_STATE`

## 🎨 UI Styling Tips

For a gaming-focused chat UI:

1. **Own Messages (Left)**:
   - Background: Semi-transparent primary color
   - Alignment: Left
   - Show only message text

2. **Others' Messages (Right)**:
   - Background: Semi-transparent secondary color
   - Alignment: Right
   - Show: `PlayerName: Message`

3. **Styling Example**:
```gdscript
# Create styled message panel
func create_message_panel(message_data, is_own):
	var panel = PanelContainer.new()
	var label = Label.new()
	
	if is_own:
		label.text = message_data.message
		panel.modulate = Color(0.2, 0.5, 1.0, 0.3)  # Blue tint
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	else:
		label.text = message_data.playerName + ": " + message_data.message
		panel.modulate = Color(0.5, 0.5, 0.5, 0.3)  # Gray tint
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	
	panel.add_child(label)
	return panel
```

## 🐛 Troubleshooting

### Messages not appearing?
- Check console for HTTP errors
- Verify API_URL is correct
- Test `/health` endpoint in browser

### Can't connect from Android?
- Ensure HTTPS (Replit uses HTTPS by default)
- Check Android permissions (INTERNET)
- Test on desktop first

### Discord messages not syncing?
- Discord integration is optional
- Chat works without Discord
- Check Discord Channel ID is set correctly

## 📱 Testing

### Test in Browser First:
Open your Replit URL in a browser to test the web chat interface before integrating with Godot.

### Test API with curl:
```bash
# Test health
curl https://[your-url].replit.dev/health

# Send message
curl -X POST https://[your-url].replit.dev/api/send_message \
  -H "Content-Type: application/json" \
  -d '{"playerName":"TestPlayer","message":"Hello!"}'

# Get messages
curl -X POST https://[your-url].replit.dev/api/get_messages \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 🚀 Deployment

Your Replit project is already deployed and accessible at your Replit URL. No additional deployment needed!

## 💡 Advanced Features

### Add Timestamps
```gdscript
func format_timestamp(iso_string: String) -> String:
	# Parse ISO timestamp and format as needed
	var time = Time.get_datetime_dict_from_unix_time(
		Time.get_unix_time_from_datetime_string(iso_string)
	)
	return "%02d:%02d" % [time.hour, time.minute]
```

### Add Message Sounds
```gdscript
func _on_messages_received(messages):
	if messages.size() > last_message_count:
		$MessageSound.play()  # Add AudioStreamPlayer
	# ... rest of code
```

### Connection Status Indicator
```gdscript
func check_connection():
	var health_request = HTTPRequest.new()
	add_child(health_request)
	health_request.request_completed.connect(_on_health_check)
	health_request.request(API_URL + "/health")

func _on_health_check(result, code, headers, body):
	if code == 200:
		$StatusIndicator.modulate = Color.GREEN
	else:
		$StatusIndicator.modulate = Color.RED
```

## 📞 Support

If you need help:
1. Check server health: `https://[your-url].replit.dev/health`
2. View server logs in Replit
3. Test endpoints with curl/Postman first
4. Verify Godot console for HTTP errors

---

**Happy Gaming! 🎮**
