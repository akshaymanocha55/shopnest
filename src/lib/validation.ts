import { z } from 'zod';
import { INDIAN_STATES, OTP_LENGTH, VALIDATION } from '@/constants';

export const mobileSchema = z
  .string()
  .trim()
  .min(1, VALIDATION.mobileRequired)
  .regex(/^[6-9]\d{9}$/, VALIDATION.mobileInvalid);

export const nameSchema = z
  .string()
  .trim()
  .min(1, VALIDATION.nameRequired)
  .min(2, VALIDATION.nameShort)
  .max(50)
  .regex(/^[a-zA-Z][a-zA-Z\s.'-]*$/, VALIDATION.nameInvalid);

export const emailSchema = z
  .string()
  .trim()
  .min(1, VALIDATION.emailRequired)
  .email(VALIDATION.emailInvalid)
  .max(100);

export const otpSchema = z
  .string()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), VALIDATION.otpRequired);

export const loginSchema = z.object({ mobile: mobileSchema });
export const signupSchema = z.object({
  name: nameSchema,
  mobile: mobileSchema,
  email: emailSchema,
});
export const profileSchema = z.object({ name: nameSchema, email: emailSchema });

export const addressSchema = z.object({
  fullName: nameSchema,
  mobile: mobileSchema,
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, VALIDATION.pincodeInvalid),
  addressLine: z
    .string()
    .trim()
    .min(1, VALIDATION.addressRequired)
    .min(10, VALIDATION.addressShort)
    .max(200),
  city: z.string().trim().min(2, VALIDATION.cityRequired).max(50),
  state: z.enum(INDIAN_STATES, { error: VALIDATION.stateRequired }),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type AddressForm = z.infer<typeof addressSchema>;
