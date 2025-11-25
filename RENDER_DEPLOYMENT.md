# Deploying to Render

Complete guide to deploy your Godot chat backend to Render.

## Prerequisites

- Render account (free tier available at https://render.com)
- Your Discord bot credentials:
  - Bot Token: `MTQ0MTA3MzYzMzcxMDgzNzg2MA.GPAwYW.txv-4ng5PE1yjM1JeWjpeaKbbWIn9TYSKe3hdE`
  - Application ID: `1441073633710837860`
  - Server ID: `1441063841931727022`
- GitHub account (for easy deployment)

## Step 1: Push to GitHub

1. Create a new GitHub repository
2. Push your Replit project to GitHub:

```bash
# In your Replit terminal
git init
git add .
git commit -m "Initial commit: Godot chat backend with Discord integration"
git remote add origin https://github.com/YOUR_USERNAME/godot-chat-backend.git
git branch -M main
git push -u origin main
```

## Step 2: Create Render Service

1. Go to https://render.com
2. Sign in with GitHub
3. Click **New +** → **Web Service**
4. Select your GitHub repository
5. Configure settings:

| Setting | Value |
|---------|-------|
| **Name** | `godot-chat-backend` |
| **Environment** | `Node` |
| **Region** | `Oregon` (or closest to you) |
| **Branch** | `main` |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `node dist/index.js` |

## Step 3: Add Environment Variables

In Render dashboard, go to **Environment** and add:

```
DISCORD_BOT_TOKEN=MTQ0MTA3MzYzMzcxMDgzNzg2MA.GPAwYW.txv-4ng5PE1yjM1JeWjpeaKbbWIn9TYSKe3hdE
DISCORD_CHANNEL_ID=1442398136525131899
NODE_ENV=production
PORT=10000
```

## Step 4: Deploy

1. Click **Create Web Service**
2. Render will automatically build and deploy
3. Wait for build to complete (3-5 minutes)
4. Your app URL: `https://godot-chat-backend.onrender.com`

## Verify Deployment

Test your deployed API:

```bash
# Check health
curl https://godot-chat-backend.onrender.com/health

# Send test message
curl -X POST https://godot-chat-backend.onrender.com/api/send_message \
  -H "Content-Type: application/json" \
  -d '{"playerName":"TestPlayer","message":"Hello from Render!"}'

# Get messages
curl -X POST https://godot-chat-backend.onrender.com/api/get_messages \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Update Godot Integration

Replace the API URL in your Godot code:

```gdscript
# Before (Replit)
const API_URL = "https://[your-replit-url].replit.dev"

# After (Render)
const API_URL = "https://godot-chat-backend.onrender.com"
```

## Production Configuration

### Build Command Explanation

The build command performs:
1. **Install dependencies**: `npm install`
2. **Build backend**: TypeScript compilation to `dist/server.js`
3. **Build frontend**: Vite builds to `dist/public`

### Start Command

The production server:
- Serves both backend API and frontend static files
- Runs on port 10000 (default for Render)
- Uses optimized builds from `dist/`

## Troubleshooting

### Build Fails

**Error: "TypeScript compilation failed"**
- Verify `tsconfig.json` is correct
- Check for TypeScript errors: `npm run type-check`

**Error: "Missing dependencies"**
- Ensure `package.json` is properly formatted
- Run `npm install` locally and commit `package-lock.json`

### Deployment Issues

**App keeps restarting**
- Check Render logs for errors
- Verify environment variables are set
- Ensure Discord bot token is correct

**Discord not connecting**
- Verify `DISCORD_BOT_TOKEN` is set in Render environment
- Check Discord bot has required permissions
- Verify `DISCORD_CHANNEL_ID` is correct

### Slow Builds

Render's free tier has limited resources. To optimize:
1. Add `.renderignore` file:
```
node_modules/
.git/
client/node_modules/
dist/
```

2. Use `npm ci` instead of `npm install` for faster installs:
   - Update Build Command: `npm ci && npm run build`

## Scaling to Paid Plans

Free tier limitations:
- Spins down after 15 minutes of inactivity
- Limited CPU/RAM
- No horizontal scaling

For production, upgrade to **Starter** ($7/month):
- Always-on service
- Better performance
- Custom domains

## Custom Domain (Optional)

1. In Render dashboard, go to **Settings**
2. Click **Add Custom Domain**
3. Point your domain's DNS to Render's nameservers
4. SSL certificate added automatically

## Auto-Deploy on GitHub Push

Render automatically redeploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update message validation"
git push origin main

# Render automatically rebuilds and deploys!
```

## Monitoring

In Render dashboard you can view:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, request counts
- **Build history**: Previous deployments

## Backup & Recovery

Render stores your service configuration. To backup:

1. Export environment variables
2. Keep your GitHub repository updated
3. Render keeps 10 days of logs

## Cost Estimation

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | Development, spins down |
| **Starter** | $7/month | Always-on, 0.5 CPU |
| **Standard** | $15+/month | 1 CPU, autoscaling |

Your chat backend should run comfortably on the free tier for testing or small communities.

## Next Steps

1. ✅ Push to GitHub
2. ✅ Create Render service
3. ✅ Set environment variables
4. ✅ Deploy and test
5. ✅ Update Godot code with new URL
6. ✅ Monitor Render dashboard

## Support

For Render-specific issues:
- Render Docs: https://render.com/docs
- Status page: https://status.render.com

For chat backend issues:
- See `GODOT_INTEGRATION_GUIDE.md`
- See `API_REFERENCE.md`

---

**Your chat backend is now ready for production on Render!** 🚀
