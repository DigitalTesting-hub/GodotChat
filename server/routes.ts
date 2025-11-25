import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendToDiscord, isDiscordReady } from "./discord";
import { sendMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      discord: isDiscordReady() ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    });
  });

  // Status endpoint for quick checks
  app.get('/api/status', (req, res) => {
    res.json({
      online: true,
      timestamp: Date.now(),
      discord: isDiscordReady(),
    });
  });

  // Send a message
  app.post('/api/send_message', async (req, res) => {
    try {
      const validation = sendMessageSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.errors[0].message,
        });
      }

      const { playerName, message } = validation.data;

      // Store message in memory
      const chatMessage = await storage.addMessage(playerName, message);

      // Try to send to Discord (non-blocking)
      sendToDiscord(playerName, message).catch(err => {
        console.error('Discord send failed:', err);
      });

      res.json({
        success: true,
        message: chatMessage,
      });
    } catch (error) {
      console.error('Error in send_message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message',
      });
    }
  });

  // Get all messages (both GET and POST for flexibility)
  const getMessagesHandler = async (req: any, res: any) => {
    try {
      const messages = await storage.getMessages();
      
      res.json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error('Error in get_messages:', error);
      res.status(500).json({
        success: false,
        messages: [],
      });
    }
  };

  app.get('/api/get_messages', getMessagesHandler);
  app.post('/api/get_messages', getMessagesHandler);

  const httpServer = createServer(app);

  return httpServer;
}
