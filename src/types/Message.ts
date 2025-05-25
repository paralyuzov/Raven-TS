export type MessageType = "text" | "image" | "video" | "gif";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  type: MessageType;
  createdAt?: string;
  updatedAt?: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface MessageState {
  messages: Message[] | null;
  loading: boolean;
  error: string | null;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: MessageType;
}
