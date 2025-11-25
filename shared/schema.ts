import { z } from "zod";

// Chat Message Schema
export const chatMessageSchema = z.object({
  id: z.string(),
  playerName: z.string(),
  message: z.string(),
  timestamp: z.string(),
  isOwn: z.boolean().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// API Request/Response Schemas
export const sendMessageSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
  message: z.string().min(1, "Message cannot be empty").max(500, "Message too long"),
});

export type SendMessageRequest = z.infer<typeof sendMessageSchema>;

export const getMessagesResponseSchema = z.object({
  success: z.boolean(),
  messages: z.array(chatMessageSchema),
});

export type GetMessagesResponse = z.infer<typeof getMessagesResponseSchema>;

export const sendMessageResponseSchema = z.object({
  success: z.boolean(),
  message: chatMessageSchema.optional(),
  error: z.string().optional(),
});

export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;
