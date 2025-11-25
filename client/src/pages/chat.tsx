import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage, SendMessageRequest, GetMessagesResponse } from "@shared/schema";

export default function ChatPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch messages
  const { data: messagesData, isLoading } = useQuery<GetMessagesResponse>({
    queryKey: ['/api/get_messages'],
    enabled: hasJoined && isChatOpen,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  const messages = messagesData?.messages || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      return apiRequest('POST', '/api/send_message', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/get_messages'] });
      setCurrentMessage("");
    },
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && hasJoined && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen, hasJoined]);

  const handleJoinChat = () => {
    if (playerName.trim()) {
      setHasJoined(true);
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim() && playerName) {
      sendMessageMutation.mutate({
        playerName,
        message: currentMessage.trim(),
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasJoined) {
        handleSendMessage();
      } else {
        handleJoinChat();
      }
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCloseChat();
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isChatOpen]);

  if (!isChatOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          onClick={() => setIsChatOpen(true)}
          className="w-12 h-12 rounded-full shadow-lg"
          data-testid="button-toggle-chat"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={handleCloseChat}
        data-testid="overlay-chat-backdrop"
      />

      {/* Chat container */}
      <div className="fixed bottom-0 right-0 md:bottom-4 md:right-4 w-full h-full md:w-80 md:h-96 z-50 md:rounded-lg overflow-hidden shadow-2xl">
        <Card className="w-full h-full flex flex-col rounded-none md:rounded-lg border-2">
          {/* Header */}
          <div className="flex items-center justify-between h-12 px-4 border-b bg-primary text-primary-foreground">
            <h3 className="text-base font-bold" data-testid="text-chat-title">Live Chat</h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCloseChat}
              className="w-8 h-8 text-primary-foreground hover:bg-primary-foreground/20"
              data-testid="button-close-chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Name entry screen */}
          {!hasJoined ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 bg-card">
              <MessageCircle className="w-16 h-16 text-primary" />
              <h3 className="text-lg font-semibold text-card-foreground" data-testid="text-welcome-title">
                Welcome to Live Chat
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Enter your name to join the conversation
              </p>
              <div className="w-full space-y-3">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2.5 rounded-md"
                  autoFocus
                  data-testid="input-player-name"
                />
                <Button
                  onClick={handleJoinChat}
                  disabled={!playerName.trim()}
                  className="w-full px-4 py-3 rounded-md font-semibold"
                  data-testid="button-join-chat"
                >
                  Join Chat
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages area */}
              <ScrollArea className="flex-1 bg-card">
                <div className="p-4 space-y-3">
                  {isLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm">Loading messages...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground italic">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.playerName === playerName;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${msg.id}`}
                        >
                          <div className={`max-w-[75%] ${isOwn ? 'items-start' : 'items-end'}`}>
                            {!isOwn && (
                              <p className="text-xs text-muted-foreground mb-1 px-1" data-testid={`text-sender-${msg.id}`}>
                                {msg.playerName}
                              </p>
                            )}
                            <div
                              className={`px-3 py-2 rounded-2xl ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground rounded-bl-sm'
                                  : 'bg-muted text-card-foreground rounded-br-sm'
                              }`}
                              data-testid={`text-message-${msg.id}`}
                            >
                              <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {sendMessageMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-primary/50 text-primary-foreground px-3 py-2 rounded-2xl rounded-bl-sm animate-pulse">
                        <p className="text-sm">●●●</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input area */}
              <div className="flex items-center gap-2 p-3 border-t bg-card">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1 px-3 py-2 rounded-full"
                  data-testid="input-message"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || sendMessageMutation.isPending}
                  className="w-10 h-10 rounded-full"
                  data-testid="button-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
