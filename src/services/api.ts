import axios from 'axios';
import { socketService } from './socket.service';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/',
  timeout: 30000, 
  maxContentLength: 10 * 1024 * 1024, 
  maxBodyLength: 10 * 1024 * 1024, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (localStorage.getItem('refreshToken')) {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + String(token);
              return api(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken');
        try {
          const res = await api.post('/auth/refresh-token', { refreshToken });
          const newToken = res.data.accessToken;
          localStorage.setItem('token', newToken);
          api.defaults.headers['Authorization'] = 'Bearer ' + newToken;
          
          try {
            await socketService.reconnectWithToken(newToken);
          } catch (socketError) {
          }
          
          processQueue(null, newToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(error);
  }
);

export const uploadFile = async (file: File, onProgress?: (progress: number) => void): Promise<{ url: string; filename: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  const uploadData = response.data.data;
  return {
    url: uploadData.fileUrl,
    filename: uploadData.originalFileName
  };
};

export default api;