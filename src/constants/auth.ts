/** The only OTP the mock auth service accepts (assignment requirement). */
export const MOCK_OTP = '111111';
export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 30;

export const TOKEN_TTL = {
  accessSeconds: 15 * 60,
  refreshSeconds: 7 * 24 * 60 * 60,
  /** Refresh the access token this many seconds before it expires. */
  refreshLeewaySeconds: 30,
} as const;

/** Cookie names. All values are AES-GCM encrypted before being written. */
export const COOKIE_KEYS = {
  accessToken: 'sn_at',
  refreshToken: 'sn_rt',
  userId: 'sn_uid',
  user: 'sn_user',
} as const;

/** localStorage keys for non-sensitive, per-user data. */
export const STORAGE_KEYS = {
  users: 'sn_users_db',
  cart: (userId: string) => `sn_cart_${userId}`,
  orders: (userId: string) => `sn_orders_${userId}`,
} as const;
