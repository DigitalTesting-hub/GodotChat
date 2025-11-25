import { Client, GatewayIntentBits, TextChannel, Message } from 'discord.js';
import { storage } from './storage';

let discordClient: Client | null = null;
let isReady = false;
let channelId: string | null = null;

export async function initializeDiscordBot() {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    channelId = process.env.DISCORD_CHANNEL_ID || null;

    if (!botToken) {
      console.warn('⚠️ DISCORD_BOT_TOKEN not set. Discord integration will be disabled.');
      return;
    }

    if (!channelId) {
      console.warn('⚠️ DISCORD_CHANNEL_ID not set. Discord integration will be disabled.');
      return;
    }

    console.log('🤖 Initializing Discord bot...');

    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    discordClient.once('ready', async () => {
      console.log(`✅ Discord bot logged in as ${discordClient?.user?.tag}`);
      console.log(`🔄 Monitoring channel ID: ${channelId}`);
      isReady = true;
      
      // Backfill recent messages from Discord on startup
      await backfillDiscordMessages();
    });

    // Listen for messages from Discord
    discordClient.on('messageCreate', async (message: Message) => {
      // Ignore bot messages
      if (message.author.bot) return;
      
      // Only process messages in the configured channel
      if (message.channelId !== channelId) return;

      try {
        // Store message from Discord in our storage
        await storage.addMessage(message.author.username, message.content);
        console.log(`📨 Discord message from ${message.author.username}: ${message.content}`);
      } catch (error) {
        console.error('Error storing Discord message:', error);
      }
    });

    await discordClient.login(botToken);
  } catch (error) {
    console.error('❌ Failed to initialize Discord bot:', error);
    console.warn('⚠️ Discord integration disabled. Chat will work without Discord sync.');
  }
}

export async function sendToDiscord(playerName: string, message: string): Promise<boolean> {
  if (!discordClient || !isReady || !channelId) {
    console.log('⚠️ Discord not configured, skipping Discord sync');
    return false;
  }

  try {
    const channel = await discordClient.channels.fetch(channelId);
    
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send(`**${playerName}:** ${message}`);
      console.log(`📤 Sent to Discord: ${playerName}: ${message}`);
      return true;
    } else {
      console.error('❌ Channel is not a text channel');
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending to Discord:', error);
    return false;
  }
}

async function backfillDiscordMessages() {
  if (!discordClient || !channelId) return;
  
  try {
    const channel = await discordClient.channels.fetch(channelId);
    
    if (channel && channel.isTextBased()) {
      // Fetch last 50 messages to sync recent history
      const messages = await (channel as TextChannel).messages.fetch({ limit: 50 });
      
      // Add messages to storage in chronological order (oldest first)
      const messageArray = Array.from(messages.values()).reverse();
      
      for (const msg of messageArray) {
        if (!msg.author.bot) {
          await storage.addMessage(msg.author.username, msg.content);
        }
      }
      
      console.log(`📥 Backfilled ${messageArray.filter(m => !m.author.bot).length} Discord messages`);
    }
  } catch (error) {
    console.error('⚠️ Failed to backfill Discord messages:', error);
  }
}

export function isDiscordReady(): boolean {
  return isReady && channelId !== null;
}
