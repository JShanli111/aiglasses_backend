import request from '@/utils/request';
import type { LoginParams, RegisterParams, User } from '@/types';

export const login = (data: LoginParams) =>
  request.post<any, { access_token: string; token_type: string }>(
    '/auth/token',
    new URLSearchParams({
      username: data.username,
      password: data.password,
      grant_type: 'password'
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

export const register = (data: RegisterParams) =>
  request.post<any, User>('/auth/register', data);

export const getCurrentUser = () =>
  request.get<any, User>('/auth/me'); 