import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);
  let nextId = 0;

  function showToast(message: string, type: ToastType = 'info', duration: number = 3000) {
    const id = nextId++;
    toasts.value.push({ id, message, type, duration });
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  }
  
  function removeToast(id: number) {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }
  
  const success = (message: string, duration?: number) => showToast(message, 'success', duration);
  const error = (message: string, duration?: number) => showToast(message, 'error', duration);
  const info = (message: string, duration?: number) => showToast(message, 'info', duration);
  const warning = (message: string, duration?: number) => showToast(message, 'warning', duration);

  const showFriendRequest = (senderName: string) => {
    return showToast(`${senderName} sent you a friend request`, 'info', 8000);
  };

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
    showFriendRequest,
  };
});