import { z } from 'zod';
import { OTP_LENGTH, VALIDATION } from '@/constants';

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

const required = (message: string) => z.string().trim().min(1, message);

export const addressSchema = z
  .object({
    fullName: nameSchema,
    mobile: z
      .string()
      .trim()
      .regex(/^\+?\d{7,15}$/, VALIDATION.phoneInvalid),
    addressLine: required(VALIDATION.addressRequired).min(10, VALIDATION.addressShort).max(200),
    country: required(VALIDATION.countryRequired),
    state: required(VALIDATION.stateRequired).max(60),
    city: required(VALIDATION.cityRequired).max(60),
    postalCode: required(VALIDATION.postalRequired).max(10),
  })
  .superRefine((value, ctx) => {
    const india = value.country === 'India';
    if (india && !/^[6-9]\d{9}$/.test(value.mobile)) {
      ctx.addIssue({ code: 'custom', path: ['mobile'], message: VALIDATION.mobileInvalid });
    }
    const postalOk = india
      ? /^[1-9]\d{5}$/.test(value.postalCode)
      : /^[A-Za-z0-9 -]{3,10}$/.test(value.postalCode);
    if (!postalOk) {
      ctx.addIssue({
        code: 'custom',
        path: ['postalCode'],
        message: india ? VALIDATION.pincodeInvalid : VALIDATION.postalInvalid,
      });
    }
  });

export const reviewSchema = z.object({
  rating: z.number().int().min(1, VALIDATION.ratingRequired).max(5),
  title: required(VALIDATION.reviewTitleRequired).max(80),
  body: required(VALIDATION.reviewBodyRequired).min(10, VALIDATION.reviewBodyShort).max(1000),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type AddressForm = z.infer<typeof addressSchema>;
export type ReviewForm = z.infer<typeof reviewSchema>;
