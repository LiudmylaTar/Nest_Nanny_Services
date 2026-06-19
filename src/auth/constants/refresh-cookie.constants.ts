import { REFRESH_TOKEN_TTL_MS } from '../utils/refresh-token.util';

export const REFRESH_COOKIE_NAME = 'refreshToken';

const refreshCookieBaseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export const refreshCookieOptions = {
  ...refreshCookieBaseOptions,
  maxAge: REFRESH_TOKEN_TTL_MS,
};

export const refreshCookieClearOptions = {
  ...refreshCookieBaseOptions,
};
