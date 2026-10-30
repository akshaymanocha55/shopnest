import {
  addressSchema,
  loginSchema,
  otpSchema,
  reviewSchema,
  signupSchema,
} from '@/lib/validation';

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

  const address = {
    fullName: 'Akshay Manocha',
    mobile: '9876543210',
    addressLine: '12 Laxmi Nagar Main Road',
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    postalCode: '110092',
  };

  it('validates an Indian address (6-digit pincode, 10-digit mobile)', () => {
    expect(addressSchema.safeParse(address).success).toBe(true);
    expect(addressSchema.safeParse({ ...address, postalCode: '011092' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...address, mobile: '12345' }).success).toBe(false);
  });

  it('uses international rules outside India', () => {
    const uk = {
      ...address,
      country: 'United Kingdom',
      state: 'England',
      city: 'London',
      postalCode: 'SW1A 1AA',
      mobile: '+447911123456',
    };
    expect(addressSchema.safeParse(uk).success).toBe(true);
    expect(addressSchema.safeParse({ ...uk, country: '' }).success).toBe(false);
  });

  it('validates reviews', () => {
    expect(
      reviewSchema.safeParse({ rating: 5, title: 'Great', body: 'Really happy with it.' }).success,
    ).toBe(true);
    expect(
      reviewSchema.safeParse({ rating: 0, title: 'Great', body: 'Really happy with it.' }).success,
    ).toBe(false);
    expect(reviewSchema.safeParse({ rating: 4, title: '', body: 'short' }).success).toBe(false);
  });
});
