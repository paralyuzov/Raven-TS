export interface RegisterUser {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface LoginUser {
  identifier: string;
  password: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  avatar: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string; 
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthReady: boolean;
  tokenRefreshTimer: number | null;
}

export interface RegisterResponse {
  message: string;
  data: {
    firstName: string;
    lastName: string;
    nickname: string;
    email: string;
  };
}
