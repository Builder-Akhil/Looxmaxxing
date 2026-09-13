import type { Metadata } from "next";
import { Download, Trash2 } from "lucide-react";
import { Card, Button, Badge, Callout, Field, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { updateProfile, deletePhoto, deleteAllPhotos, deleteAccount } from "@/lib/actions/account";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: photos }, { data: consents }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
    supabase.from("photos").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.from("consents").select("*").order("created_at", { ascending: false }),
  ]);

  // The newest record for each consent kind is the one in force.
  const latest = new Map<string, { granted: boolean; created_at: string; policy_version: string }>();
  for (const c of consents ?? []) if (!latest.has(c.kind)) latest.set(c.kind, c);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <header>
        <p className="eyebrow">Your account</p>
        <h1 className="mt-2 font-display text-[clamp(28px,4.2vw,40px)] font-bold leading-tight tracking-[-0.015em]">
          Settings
        </h1>
      </header>

      {/* ------------------------------------------------ profile */}
      <Card className="p-6">
        <p className="eyebrow border-b border-line pb-3">Profile</p>
        <form action={updateProfile} className="flex flex-col gap-5 pt-5">
          <Field label="Your name" htmlFor="full_name">
            <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} />
          </Field>
          <Field label="Email" htmlFor="email" hint="Changing your email isn't available yet — write to us and we'll do it.">
            <Input id="email" defaultValue={user?.email ?? ""} disabled />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Market" htmlFor="market" hint="Sets your currency.">
              <select
                id="market"
                name="market"
                defaultValue={profile?.market ?? "IN"}
                className="h-11 w-full rounded-sm border border-line bg-surface px-3 text-[15px] focus:border-brass focus:outline-none"
              >
                <option value="IN">India (₹)</option>
                <option value="UK">United Kingdom (£)</option>
              </select>
            </Field>
            <Field label="Barber card language" htmlFor="locale" hint="Both languages always appear; this sets which comes first.">
              <select
                id="locale"
                name="locale"
                defaultValue={profile?.locale ?? "en"}
                className="h-11 w-full rounded-sm border border-line bg-surface px-3 text-[15px] focus:border-brass focus:outline-none"
              >
                <option value="en">English first</option>
                <option value="hi">हिन्दी first</option>
              </select>
            </Field>
          </div>
          <Button type="submit" variant="brass" className="self-start">
            Save changes
          </Button>
        </form>
      </Card>

      {/* ------------------------------------------------ photos */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <p className="eyebrow">Your photos</p>
          <span className="font-mono text-[11.5px] text-faint">{photos?.length ?? 0} stored</span>
        </div>

        {photos && photos.length > 0 ? (
          <>
            <ul className="divide-y divide-line-soft pt-2">
              {photos.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div>
                    <p className="font-mono text-[13px] text-ink">{p.storage_path.split("/").pop()}</p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}
                      {p.bytes ? `${(p.bytes / 1024 / 1024).toFixed(1)} MB` : "—"}
                      {" · "}
                      {p.status}
                    </p>
                  </div>
                  <form action={deletePhoto}>
                    <input type="hidden" name="photoId" value={p.id} />
                    <Button size="sm" variant="danger" type="submit">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
            <form action={deleteAllPhotos} className="mt-5 border-t border-line pt-4">
              <Button size="sm" variant="danger" type="submit">
                Delete every photo and withdraw retention consent
              </Button>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Your Style DNA and looks stay — they&rsquo;re text, not images. You&rsquo;ll
                need a fresh photo for your next try-on.
              </p>
            </form>
          </>
        ) : (
          <p className="pt-4 text-[14.5px] text-muted">
            We&rsquo;re not holding any photos of you.
          </p>
        )}
      </Card>

      {/* ------------------------------------------------ consents */}
      <Card className="p-6">
        <p className="eyebrow border-b border-line pb-3">What you&rsquo;ve agreed to</p>
        <ul className="divide-y divide-line-soft pt-2">
          {(["biometric_processing", "photo_retention", "marketing"] as const).map((kind) => {
            const c = latest.get(kind);
            const label = {
              biometric_processing: "Analyse my photo",
              photo_retention: "Keep my photo for restyles",
              marketing: "Grooming tips by email",
            }[kind];
            return (
              <li key={kind} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div>
                  <p className="text-[15px] font-medium text-ink">{label}</p>
                  <p className="mt-0.5 font-mono text-[11.5px] text-faint">
                    {c
                      ? `${c.granted ? "granted" : "withdrawn"} · ${new Date(c.created_at).toLocaleDateString("en-GB")} · policy ${c.policy_version}`
                      : "never asked"}
                  </p>
                </div>
                <Badge tone={c?.granted ? "sage" : "neutral"}>{c?.granted ? "Active" : "Off"}</Badge>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">
          Every change is stored with a timestamp and never edited — that record is
          what makes the consent meaningful rather than decorative.
        </p>
      </Card>

      {/* ------------------------------------------------ export */}
      <Card className="p-6">
        <p className="eyebrow border-b border-line pb-3">Take your data</p>
        <p className="py-4 text-[14.5px] leading-relaxed text-ink-2">
          Everything we hold about you — profile, answers, readings, looks, cards,
          consents and billing history — as one JSON file.
        </p>
        <a
          href="/api/account/export"
          className="inline-flex h-10 items-center gap-2 rounded-sm border border-line bg-surface px-5 text-[14.5px] font-medium transition-colors hover:border-brass hover:text-brass-ink"
        >
          <Download className="h-4 w-4" /> Download my data
        </a>
      </Card>

      {/* ------------------------------------------------ delete */}
      <Card className="border-clay/40 p-6">
        <p className="eyebrow border-b border-line pb-3 text-clay">Delete your account</p>
        {error === "confirm" && (
          <Callout tone="clay" className="mt-4">
            You need to type DELETE exactly — it&rsquo;s the one guard against doing this
            by accident.
          </Callout>
        )}
        <p className="py-4 text-[14.5px] leading-relaxed text-ink-2">
          This removes your account, your photos, your readings, your looks, your
          cards and your history. Immediately and permanently. There is no undo and
          no grace period.
        </p>
        <form action={deleteAccount} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Type DELETE to confirm" htmlFor="confirm">
              <Input id="confirm" name="confirm" placeholder="DELETE" autoComplete="off" />
            </Field>
          </div>
          <Button type="submit" variant="danger">
            <Trash2 className="h-4 w-4" /> Delete everything
          </Button>
        </form>
      </Card>
    </div>
  );
}
