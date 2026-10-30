'use client';

import { useMutation } from '@tanstack/react-query';
import { Pencil, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { PAYMENT_METHODS, ROUTES, TOAST } from '@/constants';
import { getErrorMessage } from '@/lib/errors';
import { formatAddress, formatPrice } from '@/lib/format';
import { discountPercent } from '@/lib/pricing';
import { orderService } from '@/services/order.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAddressById } from '@/store/slices/addresses.slice';
import { selectUser } from '@/store/slices/auth.slice';
import { clearCart, selectCartItems, selectCartSummary } from '@/store/slices/cart.slice';
import { addOrder } from '@/store/slices/orders.slice';
import type { PaymentMethod } from '@/types/order';
import { CouponBox } from '../cart/CouponBox';
import { OrderSummary } from '../cart/OrderSummary';
import { Button } from '../ui/Button';
import { ButtonLink } from '../ui/ButtonLink';
import { EmptyState } from '../ui/EmptyState';
import { AddressStep, type AddressSelection } from './AddressStep';
import { CheckoutSteps } from './CheckoutSteps';
import { PaymentOptions } from './PaymentOptions';

type Step = 0 | 1 | 2;

function StepCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="animate-fade-in rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-mist">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-900">{title}</h2>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900"
          >
            <Pencil className="size-3.5" /> Change
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const items = useAppSelector(selectCartItems);
  const summary = useAppSelector(selectCartSummary);

  const [step, setStep] = useState<Step>(0);
  const [selection, setSelection] = useState<AddressSelection | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>('upi');

  const shipping = useAppSelector((state) =>
    selection ? selectAddressById(state, selection.shippingId) : undefined,
  );
  const billing = useAppSelector((state) =>
    selection ? selectAddressById(state, selection.billingId) : undefined,
  );

  const placeOrder = useMutation({
    mutationFn: orderService.placeOrder,
    onSuccess: (order) => {
      dispatch(addOrder(order));
      toast.success(TOAST.orderPlaced);
      router.replace(ROUTES.orderConfirmation(order.id));
      // Clear after navigating so the "empty cart" state never flashes.
      setTimeout(() => dispatch(clearCart()), 400);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const onAddresses = useCallback((value: AddressSelection) => {
    setSelection(value);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (items.length === 0 && !placeOrder.isSuccess) {
    return (
      <EmptyState
        icon={<ShoppingBag />}
        title="Your cart is empty"
        description="Add something to your cart before checking out."
        action={<ButtonLink href={ROUTES.products}>Browse products</ButtonLink>}
      />
    );
  }

  const paymentLabel = PAYMENT_METHODS.find((m) => m.id === payment)?.label;

  const submitOrder = () => {
    if (!user || !shipping || !billing) return;
    placeOrder.mutate({
      userId: user.id,
      items,
      shippingAddress: shipping,
      billingAddress: billing,
      couponCode: summary.couponCode,
      paymentMethod: payment,
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <CheckoutSteps current={step} />

        {step === 0 ? (
          <StepCard title="Addresses">
            <AddressStep initial={selection} onContinue={onAddresses} />
          </StepCard>
        ) : (
          <StepCard title="Addresses" onEdit={() => setStep(0)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-ink-400">Shipping to</p>
                <p className="mt-1 font-semibold text-ink-900">{shipping?.fullName}</p>
                <p className="text-sm text-ink-600">{shipping && formatAddress(shipping)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-ink-400">Billing address</p>
                {selection?.billingSameAsShipping ? (
                  <p className="mt-1 text-sm text-ink-600">Same as shipping address</p>
                ) : (
                  <>
                    <p className="mt-1 font-semibold text-ink-900">{billing?.fullName}</p>
                    <p className="text-sm text-ink-600">{billing && formatAddress(billing)}</p>
                  </>
                )}
              </div>
            </div>
          </StepCard>
        )}

        {step === 1 && (
          <StepCard title="Payment method">
            <PaymentOptions value={payment} onChange={setPayment} />
            <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={() => setStep(2)}>
              Review order
            </Button>
          </StepCard>
        )}

        {step === 2 && (
          <>
            <StepCard title="Payment method" onEdit={() => setStep(1)}>
              <p className="font-semibold text-ink-900">{paymentLabel}</p>
            </StepCard>
            <StepCard title={`Items (${summary.itemCount})`}>
              <ul className="divide-y divide-mist">
                {items.map((item) => {
                  const off = discountPercent(item.unitPrice, item.unitMrp);
                  return (
                    <li key={item.lineId} className="flex items-center gap-4 py-3">
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-paper">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-contain p-2 mix-blend-multiply"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 font-medium text-ink-800">{item.title}</span>
                        <span className="text-sm text-ink-500">
                          Qty {item.quantity}
                          {item.variantLabel && `, ${item.variantLabel}`}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block leading-6 font-semibold tabular-nums">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                        {off > 0 && (
                          <span className="text-xs font-semibold text-leaf-600">{off}% off</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </StepCard>
          </>
        )}
      </div>

      <aside className="space-y-5 lg:sticky lg:top-36 lg:self-start">
        <CouponBox />
        <OrderSummary summary={summary}>
          {step === 2 ? (
            <Button
              size="lg"
              variant="accent"
              fullWidth
              loading={placeOrder.isPending}
              disabled={placeOrder.isSuccess}
              onClick={submitOrder}
            >
              Place order, {formatPrice(summary.total)}
            </Button>
          ) : (
            <p className="text-center text-sm text-ink-400">
              Complete the steps to place your order
            </p>
          )}
        </OrderSummary>
      </aside>
    </div>
  );
}
