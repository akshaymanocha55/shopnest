export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  jti: string;
}

export type AuthStatus = 'checking' | 'authenticated' | 'guest';

export interface SignupInput {
  name: string;
  mobile: string;
  email: string;
}

export interface Session {
  user: User;
  tokens: AuthTokens;
}
