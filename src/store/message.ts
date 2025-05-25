import { defineStore } from 'pinia';
import { handleRequest, apiService } from '../services/requester';
import type { Message } from '../types/Message';

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: [] as Message[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchMessages(conversationId: string) {
      try {
        await handleRequest<Message[]>(
          () => apiService.get('/messages/get-messages', { conversationId }),
          this,
          (response) => {
            this.messages = response.data as Message[];
          }
        );
      } catch (error) {
        console.error('Error loading messages:', error);
        this.messages = [];
      }
    },
    addMessage(message: Message) {
      this.messages.push(message);
    },
    clearMessages() {
      this.messages = [];
    }
  }
});
