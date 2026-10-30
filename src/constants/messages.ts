import { MOCK_OTP } from './auth';

export const TOAST = {
  otpSent: (target: string) => `OTP sent to ${target}. Use ${MOCK_OTP} to continue.`,
  loginSuccess: (name: string) => `Welcome back, ${name}!`,
  signupSuccess: (name: string) => `Account created. Welcome, ${name}!`,
  logout: 'You have been logged out.',
  sessionExpired: 'Your session expired. Please log in again.',
  addedToCart: (title: string) => `Added “${title}” to cart`,
  removedFromCart: 'Item removed from cart',
  quantityUpdated: 'Quantity updated',
  maxQuantity: (max: number) => `You can add up to ${max} of this item`,
  selectVariant: (name: string) => `Please select a ${name.toLowerCase()}`,
  outOfStock: 'This option is out of stock',
  orderPlaced: 'Order placed successfully!',
  orderCancelled: 'Order cancelled',
  profileUpdated: 'Profile updated',
  loginRequired: 'Please log in to continue',
  genericError: 'Something went wrong. Please try again.',
  networkError: 'Network error. Check your connection and try again.',
  emptyCartCheckout: 'Your cart is empty',
} as const;

export const VALIDATION = {
  nameRequired: 'Please enter your name',
  nameShort: 'Name must be at least 2 characters',
  nameInvalid: 'Name can only contain letters and spaces',
  mobileRequired: 'Please enter your mobile number',
  mobileInvalid: 'Enter a valid 10-digit Indian mobile number',
  emailRequired: 'Please enter your email',
  emailInvalid: 'Enter a valid email address',
  otpRequired: 'Please enter the 6-digit OTP',
  otpInvalid: 'Incorrect OTP. Hint: use 111111',
  pincodeInvalid: 'Enter a valid 6-digit pincode',
  addressRequired: 'Please enter your address',
  addressShort: 'Address is too short',
  cityRequired: 'Please enter your city',
  stateRequired: 'Please select your state',
  userNotFound: 'No account found with this mobile number. Please sign up.',
  userExists: 'An account with this mobile number already exists. Please log in.',
} as const;

export const ERROR_MESSAGES = {
  timeout: 'The request took too long. Please try again.',
  network: 'Unable to reach the server. Check your internet connection.',
  unauthorized: 'Your session has expired. Please log in again.',
  notFound: 'We could not find what you were looking for.',
  server: 'Our server is having trouble right now. Please try again shortly.',
  unknown: 'Something went wrong. Please try again.',
} as const;
