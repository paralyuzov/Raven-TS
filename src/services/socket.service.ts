import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/auth";
import { useToastStore } from "../store/toast";

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentConversationId: string | null = null;

  connect(): void {
    const authStore = useAuthStore();
    if (!authStore.accessToken) {
      return;
    }
    if (this.socket?.connected) {
      return;
    }
    if (this.socket) {
      this.disconnect();
    }
    
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    this.socket = io(`${baseUrl}/chat`, {
      auth: { token: authStore.accessToken },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });
    this.setupListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentConversationId = null;
      this.reconnectAttempts = 0;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  joinConversation(conversationId: string): void {
    if (!this.socket) return;
    
    if (this.currentConversationId && this.currentConversationId !== conversationId) {
      this.leaveConversation(this.currentConversationId);
    }
    
    this.currentConversationId = conversationId;
    this.socket.emit("join_conversation", { conversationId });
  }

  leaveConversation(conversationId?: string): void {
    if (!this.socket) return;
    
    const roomToLeave = conversationId || this.currentConversationId;
    if (roomToLeave) {
      this.socket.emit("leave_conversation", { conversationId: roomToLeave });
      if (roomToLeave === this.currentConversationId) {
        this.currentConversationId = null;
      }
    }
  }

  sendMessage(
    conversationId: string,
    content: string,
    type: string = "text"
  ): void {
    if (!this.socket) return;
    this.socket.emit("send_message", { conversationId, content, type });
  }

  sendMediaMessage(
    conversationId: string,
    fileUrl: string,
    type: 'image' | 'video',
    originalFileName: string,
    fileSize: number,
    mimeType: string
  ): void {
    if (!this.socket) return;
    this.socket.emit("send_media_message", {
      conversationId,
      fileUrl,
      type,
      originalFileName,
      fileSize,
      mimeType
    });
  }

  getFriendStatus(friendId: string): void {
    if (!this.socket) return;
    this.socket.emit("get_friend_status", { friendId });
  }

  reconnectWithToken(newToken: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        resolve(false);
        return;
      }

      const conversationToRejoin = this.currentConversationId;

      this.socket.auth = { token: newToken };
      
      const onConnect = () => {
        this.reconnectAttempts = 0;
        
        if (conversationToRejoin) {
          this.joinConversation(conversationToRejoin);
        }
        
        cleanup();
        resolve(true);
      };

      const onConnectError = () => {
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          cleanup();
          reject(new Error("Socket reconnection failed after max attempts"));
        } else {
          setTimeout(() => {
            this.socket?.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      const cleanup = () => {
        this.socket?.off("connect", onConnect);
        this.socket?.off("connect_error", onConnectError);
      };

      this.socket.on("connect", onConnect);
      this.socket.on("connect_error", onConnectError);

      this.socket.disconnect();
      this.socket.connect();
    });
  }

  on(event: string, handler: (...args: any[]) => void): void {
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void): void {
    this.socket?.off(event, handler);
  }

  private setupListeners(): void {
    if (!this.socket) return;
    
    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
    });
    
    this.socket.on("disconnect", () => {
      this.currentConversationId = null;
    });
    
    this.socket.on("error", () => {});
    
    this.socket.on("connect_error", () => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.socket?.disconnect();
      }
    });

    this.socket.on("auth_error", (data: { type: string; message: string }) => {
      
      if (data.type === "token_expired") {
        this.handleTokenExpiration();
      } else if (data.type === "invalid_token") {
        this.handleAuthFailure();
      } else {
        this.handleAuthFailure();
      }
    });

    this.socket.on("joined_conversation", () => {
    });

    this.socket.on("refresh_friend_requests", (data: { message: string; sender: { id: string; username: string } }) => {
      
      try {
        const toastStore = useToastStore();
        toastStore.showFriendRequest(data.sender.username);
      } catch (error) {
      }
    });
  }

  private async handleTokenExpiration(): Promise<void> {
    const authStore = useAuthStore();
    
    try {
      const refreshSuccess = await authStore.refreshAccessToken();
      
      if (refreshSuccess && authStore.accessToken) {
        await this.reconnectWithToken(authStore.accessToken);
      } else {
        this.handleAuthFailure();
      }
    } catch (error) {
      this.handleAuthFailure();
    }
  }

  private handleAuthFailure(): void {
    const authStore = useAuthStore();
    authStore.clearAuth();
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

export const socketService = new SocketService();
