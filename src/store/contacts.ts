import { defineStore } from 'pinia';
import { handleRequest, apiService } from '../services/requester';
import type { Contact } from '../types/Contact';
import { socketService } from '../services/socket.service';

export const useContactsStore = defineStore('contacts', {
  state: () => ({
    contacts: [] as Contact[],
    loading: false,
    error: null as string | null,
    selectedContact: null as Contact | null,
    selectedConversationId: null as string | null,
  }),
  actions: {
    async fetchContacts() {
      try {
        await handleRequest<Contact[]>(
          () => apiService.get('/friends/get-friends'),
          this,
          (response) => {
            this.contacts = response.data;
            this.setupSocketListeners();
          }
        );
      } catch (error) {
        console.error('Error loading contacts:', error);
        this.contacts = [];
      }
    },
    selectContact(contact: Contact) {
      this.selectedContact = contact;
      this.selectedConversationId = null;
      if (contact.unreadCount && contact.unreadCount > 0) {
        this.updateUnreadCount(contact._id, 0);
      }
    },
    setConversationId(conversationId: string) {
      this.selectedConversationId = conversationId;
    },
    updateFriendStatus(friendId: string, isOnline: boolean) {
      const contact = this.contacts.find(c => c._id === friendId);
      if (contact) {
        contact.isOnline = isOnline;
      }
    },
    updateUnreadCount(friendId: string, count: number) {
      const contact = this.contacts.find(c => c._id === friendId);
      if (contact) {
        contact.unreadCount = count;
      }
    },
    setupSocketListeners() {
      socketService.on('friend_status_change', (data: { userId: string; isOnline: boolean }) => {
        this.updateFriendStatus(data.userId, data.isOnline);
      });
      
      socketService.on('friend_status_response', (data: { friendId: string; isOnline: boolean }) => {
        this.updateFriendStatus(data.friendId, data.isOnline);
      });

      socketService.on('unread_count_update', (data: { friendId: string; unreadCount: number }) => {
        this.updateUnreadCount(data.friendId, data.unreadCount);
      });
    },
    requestFriendStatus(friendId: string) {
      socketService.getFriendStatus(friendId);
    },

    cleanup() {
      socketService.off('friend_status_change');
      socketService.off('friend_status_response');
      socketService.off('unread_count_update');
    }
  }
});

