"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Field, Input, Callout } from "@/components/ui";
import type { AuthState } from "@/lib/actions/auth";

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant="brass" className="w-full" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

type Action = (state: AuthState, formData: FormData) => Promise<AuthState>;

export function LoginForm({ action, next }: { action: Action; next?: string }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <Callout tone="clay">{state.error}</Callout>}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Submit label="Log in" pendingLabel="Checking…" />
    </form>
  );
}

export function SignupForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <Callout tone="clay">{state.error}</Callout>}
      <Field label="Your name" htmlFor="full_name" hint="So we can write to you like a person.">
        <Input id="full_name" name="full_name" autoComplete="name" placeholder="Akhil" />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      <Field
        label="Password"
        htmlFor="password"
        hint="At least 10 characters. We check it against known breached passwords."
      >
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <Field label="Where are you?" htmlFor="market" hint="Sets your currency and the language on your barber card.">
        <select
          id="market"
          name="market"
          defaultValue="IN"
          className="h-11 w-full rounded-sm border border-line bg-surface px-3 text-[15px] text-ink focus:border-brass focus:outline-none"
        >
          <option value="IN">India</option>
          <option value="UK">United Kingdom</option>
        </select>
      </Field>
      <Submit label="Create my account" pendingLabel="Creating…" />
      <p className="text-[12.5px] leading-relaxed text-muted">
        By creating an account you agree to our terms and privacy policy. We ask
        separately, and clearly, before touching any photo.
      </p>
    </form>
  );
}

export function SimpleEmailForm({
  action,
  label,
  pendingLabel,
  defaultEmail,
}: {
  action: Action;
  label: string;
  pendingLabel: string;
  defaultEmail?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <Callout tone="clay">{state.error}</Callout>}
      {state.notice && <Callout tone="sage">{state.notice}</Callout>}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={defaultEmail} />
      </Field>
      <Submit label={label} pendingLabel={pendingLabel} />
    </form>
  );
}

export function NewPasswordForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <Callout tone="clay">{state.error}</Callout>}
      <Field label="New password" htmlFor="password" hint="At least 10 characters, and not one that's been breached.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <Submit label="Set new password" pendingLabel="Saving…" />
    </form>
  );
}
