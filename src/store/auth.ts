import { defineStore } from "pinia";
import { apiService, handleRequest } from "../services/requester";
import {
  type LoginUser,
  type AuthState,
  type LoginResponse,
  type RegisterUser,
  type RegisterResponse,
  type RefreshTokenResponse,
} from "../types/User";

export const useAuthStore = defineStore("authStore", {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    accessToken: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    isAuthReady: false,
    tokenRefreshTimer: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isLoading: (state) => state.loading,
    getUser: (state) => state.user,
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
    getError: (state) => state.error,
  },
  
  actions: {
    async checkAuth() {
      if (!this.accessToken) {
        this.isAuthReady = true;
        return false;
      }
      
      this.loading = true;
      
      try {
        const response = await handleRequest(
          () => apiService.get('/auth/verify'),
          this,
          (response) => {
            this.user = response.data.user;
            this.startTokenRefreshTimer();
          }
        );
        
        this.isAuthReady = true;
        return !!response;
      } catch (error) {
        this.clearAuth();
        this.isAuthReady = true;
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async login(userData: LoginUser) {
      const response = await handleRequest(
        () => apiService.post<LoginResponse>("/auth/login", userData),
        this,
        (response) => {
          this.user = response.data.user;
          this.accessToken = response.data.accessToken;
          this.refreshToken = response.data.refreshToken;

          localStorage.setItem("token", this.accessToken as string);
          localStorage.setItem("refreshToken", this.refreshToken as string);
          
          this.startTokenRefreshTimer();
        }
      );

      return response;
    },
    
    async register(userData: RegisterUser) {
      const response = await handleRequest<RegisterResponse>(
        () => apiService.post<RegisterResponse>("/auth/signup", userData),
        this,
        null 
      );

      return response; 
    },
    
    async logout() {
      const response = await handleRequest(
        () => apiService.post("/auth/logout"),
        this,
        () => {
          this.clearAuth();
        }
      );
      return response;
    },
    
    async refreshAccessToken() {
      if (!this.refreshToken) return false;
      
      try {
        const response = await apiService.post<RefreshTokenResponse>('/auth/refresh-token', {
          refreshToken: this.refreshToken
        });
        
        if (response.data.accessToken) {
          this.accessToken = response.data.accessToken;
          localStorage.setItem("token", this.accessToken);
          return true;
        }
        return false;
      } catch (error) {
        this.clearAuth();
        return false;
      }
    },
    

    clearAuth() {
      if (this.tokenRefreshTimer) {
        clearInterval(this.tokenRefreshTimer);
        this.tokenRefreshTimer = null;
      }
      
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },

    startTokenRefreshTimer() {
      if (this.tokenRefreshTimer) {
        clearInterval(this.tokenRefreshTimer);
      }

      this.tokenRefreshTimer = window.setInterval(async () => {
        
        if (this.refreshToken) {
          const success = await this.refreshAccessToken();
          if (!success) {
            this.clearAuth();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
      }, 14 * 60 * 1000);
    },

    stopTokenRefreshTimer() {
      if (this.tokenRefreshTimer) {
        clearInterval(this.tokenRefreshTimer);
        this.tokenRefreshTimer = null;
      }
    },
    
    async updateProfile(profileData: Partial<RegisterUser>) {
      
      try {
        const response = await handleRequest(
          () => apiService.put('/auth/profile', profileData),
          this,
          (response) => {
            this.user = response.data.user;
          }
        );
        return response;
      } catch (error: any) {
        throw error;
      }
    },
  },
});
