import { defineStore } from 'pinia';
import { handleRequest, apiService } from '../services/requester';
import { socketService } from '../services/socket.service';

interface FriendRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    avatar: string;
  };
  friendId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export const useFriendsStore = defineStore('friends', {
  state: () => ({
    pendingRequests: [] as FriendRequest[],
    loading: false,
    error: null as string | null,
    _boundHandlers: null as any,
    refreshTrigger: 0,
  }),

  getters: {
    pendingRequestsCount: (state) => {
      const count = state.pendingRequests.length + (state.refreshTrigger * 0);
      return count;
    },
    hasPendingRequests: (state) => {
      const hasRequests = state.pendingRequests.length > 0;
      return hasRequests;
    },
  },

  actions: {
    async fetchPendingRequests() {
      try {
        this.loading = true;
        await handleRequest<FriendRequest[]>(
          () => apiService.get('/friends/pending-requests'),
          this,
          (response) => {
            this.pendingRequests = response.data || [];
            this.refreshTrigger++;
          }
        );
      } catch (error) {
        this.pendingRequests = [];
      } finally {
        this.loading = false;
      }
    },

    async acceptFriendRequest(requestId: string) {
      try {
        const request = this.pendingRequests.find(req => req._id === requestId);
        if (!request) {
          throw new Error('Friend request not found');
        }

        await handleRequest(
          () => apiService.post('/friends/accept-request', { friendId: request.userId._id }),
          this
        );
        this.pendingRequests = this.pendingRequests.filter(req => req._id !== requestId);
        this.refreshTrigger++;
      } catch (error) {
        throw error;
      }
    },

    async rejectFriendRequest(requestId: string) {
      try {
        const request = this.pendingRequests.find(req => req._id === requestId);
        if (!request) {
          throw new Error('Friend request not found');
        }

        await handleRequest(
          () => apiService.post('/friends/reject-request', { friendId: request.userId._id }),
          this
        );
        this.pendingRequests = this.pendingRequests.filter(req => req._id !== requestId);
        this.refreshTrigger++;
      } catch (error) {
        throw error;
      }
    },

    async sendFriendRequest(userId: string) {
      try {
        await handleRequest(
          () => apiService.post('/friends/send-request', { receiverId: userId }),
          this
        );
      } catch (error) {
        throw error;
      }
    },

    async handleFriendRequestReceived() {
      try {
        await this.fetchPendingRequests();
        this.refreshTrigger++;
      } catch (error) {
      }
    },

    async handleFriendshipUpdated() {
      try {
        await this.fetchPendingRequests();
      } catch (error) {
      }
    },

    setupSocketListeners() {
      const boundHandleRequest = this.handleFriendRequestReceived.bind(this);
      const boundHandleFriendship = this.handleFriendshipUpdated.bind(this);
      
      socketService.on('refresh_friend_requests', boundHandleRequest);
      socketService.on('friendship_updated', boundHandleFriendship);
      
      this._boundHandlers = {
        handleFriendRequestReceived: boundHandleRequest,
        handleFriendshipUpdated: boundHandleFriendship
      };
    },

    cleanupSocketListeners() {
      if (this._boundHandlers) {
        socketService.off('refresh_friend_requests', this._boundHandlers.handleFriendRequestReceived);
        socketService.off('friendship_updated', this._boundHandlers.handleFriendshipUpdated);
        this._boundHandlers = null;
      }
    },

    async initialize() {
      await this.fetchPendingRequests();
      this.setupSocketListeners();
    },

    cleanup() {
      this.cleanupSocketListeners();
    }
  }
});
