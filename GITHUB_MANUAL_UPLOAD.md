# Manual GitHub Upload & Environment Variables Setup

Complete step-by-step guide for uploading your project to GitHub manually and configuring environment variables for Render.

---

## Part 1: Download Project from Replit

### Step 1: Download as ZIP

1. **In Replit**, click the **three-dot menu** (⋯) at the top left
2. Select **Download as ZIP**
3. Save the file to your computer (e.g., `godot-chat-backend.zip`)

### Step 2: Extract the ZIP

1. **Right-click** the ZIP file
2. Select **Extract All** (or **Unzip**)
3. You now have a folder with all your project files

---

## Part 2: Create GitHub Repository

### Step 1: Create New Repository

1. Go to https://github.com
2. Sign in to your account
3. Click **+** (top right) → **New repository**
4. Fill in:
   - **Repository name:** `godot-chat-backend`
   - **Description:** "Godot Game Chat Backend with Discord Integration"
   - **Public** (so Render can access it)
   - **DO NOT** check "Add a README" (you already have one)
5. Click **Create repository**

### Step 2: Copy Repository URL

After creating, you'll see:
```
https://github.com/YOUR_USERNAME/godot-chat-backend.git
```

**Copy this URL** - you'll need it later.

---

## Part 3: Upload Files to GitHub

You have **2 options**: 
- **Option A: Web Upload** (simpler, faster)
- **Option B: Git Command Line** (more professional)

### Option A: Web Upload (Simplest) ✅

**Best for beginners - drag and drop!**

1. Go to your GitHub repository page
2. Click **Add file** → **Upload files**
3. **Drag and drop** all files from your extracted folder into GitHub
   - Or click **choose your files** and select them
4. At the bottom, click **Commit changes**

**That's it! Your files are now on GitHub.**

---

### Option B: Git Command Line (More Control)

**For those comfortable with terminal:**

1. Open **Command Prompt** (Windows) or **Terminal** (Mac/Linux)
2. Navigate to your extracted project folder:
   ```bash
   cd path/to/godot-chat-backend
   ```

3. Initialize git and upload:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Godot chat backend with Discord integration"
   git remote add origin https://github.com/YOUR_USERNAME/godot-chat-backend.git
   git branch -M main
   git push -u origin main
   ```

4. Enter your GitHub credentials when prompted

**Done! Your project is now on GitHub.**

---

## Part 4: Create .env File (DO NOT UPLOAD)

⚠️ **IMPORTANT: Never commit secrets to GitHub!**

### Step 1: Create .env File Locally

1. In your extracted project folder, create a new file named `.env`
2. Add these variables:

```env
DISCORD_BOT_TOKEN=MTQ0MTA3MzYzMzcxMDgzNzg2MA.GPAwYW.txv-4ng5PE1yjM1JeWjpeaKbbWIn9TYSKe3hdE
DISCORD_CHANNEL_ID=1442398136525131899
NODE_ENV=development
```

3. **Save this file** (keep it on your computer, never push to GitHub)

### Step 2: Create .env.example (upload this instead)

Create a file named `.env.example` with placeholder values:

```env
DISCORD_BOT_TOKEN=your-bot-token-here
DISCORD_CHANNEL_ID=your-channel-id-here
NODE_ENV=production
PORT=10000
```

**Upload `.env.example` to GitHub** (this shows what variables are needed, without exposing secrets)

### Step 3: Add .env to .gitignore

Make sure `.gitignore` file has:

```
.env
.env.local
.env.*.local
```

**This prevents `.env` from ever being uploaded to GitHub.**

---

## Part 5: Update Code for Environment Variables

Your code **already handles environment variables correctly**, but here's what it does:

### Backend (server/discord.ts)

```typescript
// Already uses environment variables correctly:
const botToken = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;
```

### Frontend (client/src/lib/queryClient.ts)

For frontend variables (if needed), prefix with `VITE_`:

```bash
VITE_API_URL=https://your-api.com
```

Then access in frontend:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

---

## Part 6: Deploy to Render

### Step 1: Connect Render to GitHub

1. Go to https://render.com
2. Click **New +** → **Web Service**
3. Click **Connect account** → **GitHub**
4. Authorize Render to access your GitHub

### Step 2: Select Your Repository

1. After authorizing, search for `godot-chat-backend`
2. Click **Connect** next to your repository

### Step 3: Configure Render Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `godot-chat-backend` |
| **Environment** | `Node` |
| **Region** | `Oregon` (closest to you) |
| **Branch** | `main` |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `node dist/index.js` |

### Step 4: Add Environment Variables

1. Click **Environment** tab
2. Add these variables:

```
DISCORD_BOT_TOKEN = MTQ0MTA3MzYzMzcxMDgzNzg2MA.GPAwYW.txv-4ng5PE1yjM1JeWjpeaKbbWIn9TYSKe3hdE
DISCORD_CHANNEL_ID = 1442398136525131899
NODE_ENV = production
PORT = 10000
```

⚠️ **NEVER commit these to GitHub** - only set them in Render dashboard!

### Step 5: Deploy

1. Click **Create Web Service**
2. Render will build and deploy automatically
3. Wait 3-5 minutes for deployment
4. Your app URL: `https://godot-chat-backend.onrender.com`

---

## Part 7: Update Your Godot Code

Replace the API URL in your Godot script:

```gdscript
# Before (Replit):
const API_URL = "https://your-replit-url.replit.dev"

# After (Render):
const API_URL = "https://godot-chat-backend.onrender.com"
```

---

## Complete Checklist

- [ ] **Downloaded** project as ZIP from Replit
- [ ] **Extracted** ZIP file to your computer
- [ ] **Created** new GitHub repository
- [ ] **Uploaded** all project files to GitHub (Option A or B)
- [ ] **Created** `.env` file locally (not uploaded)
- [ ] **Created** `.env.example` and uploaded to GitHub
- [ ] **Verified** `.gitignore` includes `.env`
- [ ] **Connected** Render to GitHub repository
- [ ] **Added** environment variables in Render dashboard
- [ ] **Deployed** to Render
- [ ] **Updated** Godot code with new API URL
- [ ] **Tested** that messages work with Render deployment

---

## Troubleshooting

### Files Not Showing on GitHub

**Problem:** You uploaded files but they're not visible on GitHub
**Solution:** 
1. Refresh your GitHub page (Ctrl+F5 or Cmd+Shift+R)
2. Check if you clicked **Commit changes** button
3. Make sure files were successfully selected before uploading

### Render Build Fails

**Problem:** "Cannot find module" or build error
**Solution:**
1. Verify all source files uploaded to GitHub (not just package.json)
2. Check that `tsconfig.json`, `vite.config.ts`, and `server/` folder exist
3. Run locally: `npm install && npm run build` to test

### Discord Not Connecting on Render

**Problem:** Discord shows "disconnected" after deploying
**Solution:**
1. Go to Render dashboard → Your service
2. Check **Environment** variables are set correctly
3. Verify `DISCORD_BOT_TOKEN` is complete (copy from Replit if needed)
4. Check Render **Logs** for error messages

### Messages Not Showing in Web Chat

**Problem:** Deployed but chat shows "No messages yet"
**Solution:**
1. Test API endpoints:
   ```bash
   curl https://godot-chat-backend.onrender.com/health
   ```
2. Send test message:
   ```bash
   curl -X POST https://godot-chat-backend.onrender.com/api/send_message \
     -H "Content-Type: application/json" \
     -d '{"playerName":"TestPlayer","message":"Hello"}'
   ```
3. Check Render logs for errors

---

## Environment Variables Reference

### Required Variables

| Variable | Value | Where to Set |
|----------|-------|--------------|
| `DISCORD_BOT_TOKEN` | `MTQ0MTA3MzYzMzcxMDgzNzg2MA.GPAwYW.txv-4ng5PE1yjM1JeWjpeaKbbWIn9TYSKe3hdE` | Render only |
| `DISCORD_CHANNEL_ID` | `1442398136525131899` | Render only |
| `NODE_ENV` | `production` | Render only |
| `PORT` | `10000` | Render only |

### Never Commit These to GitHub!
- `.env` files
- Discord tokens
- API keys
- Passwords
- Private credentials

---

## File Structure After Upload

Your GitHub repo should look like:

```
godot-chat-backend/
├── server/
│   ├── discord.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── app.ts
│   ├── index-dev.ts
│   └── index-prod.ts
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   └── chat.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   └── ...
├── shared/
│   └── schema.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .gitignore
├── README.md
├── GODOT_INTEGRATION_GUIDE.md
└── API_REFERENCE.md
```

---

## Next Steps After Deployment

1. ✅ Test API endpoints with curl (see TESTING_AFTER_DEPLOY.md)
2. ✅ Update Godot code with new API URL
3. ✅ Test from your Godot game
4. ✅ Monitor Render dashboard for errors
5. ✅ Share with your Discord community!

---

**You're all set!** Your chat backend is now running on Render and ready for your Godot game! 🚀
