'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Pencil, Phone } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { TOAST } from '@/constants';
import { formatDate } from '@/lib/format';
import { profileSchema, type ProfileForm } from '@/lib/validation';
import { authService } from '@/services/auth.service';
import { useAppDispatch } from '@/store/hooks';
import { userUpdated } from '@/store/slices/auth.slice';
import type { User } from '@/types/auth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function ProfileCard({ user }: { user: User }) {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  // PUT /users/:id via the API client, plus the mock auth store.
  const update = useMutation({
    mutationFn: (values: ProfileForm) => authService.updateProfile(user.id, values),
    onSuccess: (updated) => {
      dispatch(userUpdated(updated));
      reset({ name: updated.name, email: updated.email });
      setEditing(false);
      toast.success(TOAST.profileUpdated);
    },
  });

  return (
    <section className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-mist">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-marigold-100 font-display text-2xl font-bold text-ink-800">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h2 className="text-xl font-bold text-ink-900">{user.name}</h2>
            <p className="text-sm text-ink-400">Member since {formatDate(user.createdAt)}</p>
          </div>
        </div>
        {!editing && (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" /> Edit
          </Button>
        )}
      </div>

      {editing ? (
        <form
          onSubmit={handleSubmit((v) => update.mutate(v))}
          noValidate
          className="mt-6 grid animate-fade-in gap-4 sm:grid-cols-2"
        >
          <Input label="Full name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" loading={update.isPending} disabled={!isDirty}>
              Save changes
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                reset();
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-paper p-4">
            <Phone className="size-4 text-ink-400" />
            <div>
              <dt className="text-xs text-ink-400">Mobile</dt>
              <dd className="font-medium">+91 {user.mobile}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-paper p-4">
            <Mail className="size-4 text-ink-400" />
            <div className="min-w-0">
              <dt className="text-xs text-ink-400">Email</dt>
              <dd className="truncate font-medium">{user.email}</dd>
            </div>
          </div>
        </dl>
      )}
    </section>
  );
}
