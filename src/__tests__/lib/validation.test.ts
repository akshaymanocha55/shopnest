import { addressSchema, loginSchema, otpSchema, signupSchema } from '@/lib/validation';

describe('validation schemas', () => {
  it.each(['9876543210', '6000000000'])('accepts mobile %s', (mobile) => {
    expect(loginSchema.safeParse({ mobile }).success).toBe(true);
  });

  it.each(['12345', '5876543210', '98765432101', 'abcdefghij', ''])(
    'rejects mobile "%s"',
    (mobile) => {
      expect(loginSchema.safeParse({ mobile }).success).toBe(false);
    },
  );

  it('validates signup fields with helpful messages', () => {
    const result = signupSchema.safeParse({ name: 'A', mobile: '9876543210', email: 'bad' });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toEqual(
      expect.arrayContaining(['Name must be at least 2 characters', 'Enter a valid email address']),
    );
  });

  it('requires a 6-digit OTP', () => {
    expect(otpSchema.safeParse('111111').success).toBe(true);
    expect(otpSchema.safeParse('11111').success).toBe(false);
    expect(otpSchema.safeParse('11a111').success).toBe(false);
  });

  it('validates an Indian address', () => {
    const valid = {
      fullName: 'Akshay Manocha',
      mobile: '9876543210',
      pincode: '110092',
      addressLine: '12 Laxmi Nagar Main Road',
      city: 'Delhi',
      state: 'Delhi',
    };
    expect(addressSchema.safeParse(valid).success).toBe(true);
    expect(addressSchema.safeParse({ ...valid, pincode: '011092' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...valid, state: 'Atlantis' }).success).toBe(false);
  });
});
