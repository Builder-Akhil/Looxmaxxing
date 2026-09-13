"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, ImageUp, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Callout, Card } from "@/components/ui";
import { MAX_PHOTO_BYTES } from "@/lib/validation";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export function PhotoUploader({ userId }: { userId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  function accept(picked: File | undefined | null) {
    setError(null);
    if (!picked) return;
    if (!ACCEPTED.includes(picked.type)) {
      setError("That file type won't work. Use a JPEG, PNG or WebP.");
      return;
    }
    if (picked.size > MAX_PHOTO_BYTES) {
      setError(
        `That photo is ${(picked.size / 1024 / 1024).toFixed(1)} MB. The limit is 8 MB — most phones let you send a smaller copy.`,
      );
      return;
    }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw new Error(upErr.message);

      const { data: row, error: rowErr } = await supabase
        .from("photos")
        .insert({
          user_id: userId,
          storage_path: path,
          angle: "front",
          bytes: file.size,
          mime: file.type,
        })
        .select("id")
        .single();
      if (rowErr) throw new Error(rowErr.message);

      router.push(`/start/analysing?photo=${row.id}`);
    } catch (e) {
      setBusy(false);
      setError(
        e instanceof Error && e.message.includes("row-level security")
          ? "Your session expired. Please log in again."
          : "The upload didn't go through. Check your connection and try again.",
      );
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files?.[0]);
          }}
          className={`relative flex min-h-[300px] flex-col items-center justify-center border-2 border-dashed p-8 text-center transition-colors ${
            dragging ? "border-brass bg-brass-wash" : "border-line bg-surface-2/40"
          }`}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="The photo you selected"
                className="max-h-[320px] w-auto rounded-sm object-contain"
              />
              <button
                type="button"
                onClick={clear}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-muted hover:text-clay"
                aria-label="Remove this photo"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <ImageUp className="h-9 w-9 text-faint" strokeWidth={1.4} />
              <p className="mt-4 text-[16px] font-medium text-ink">Drop a photo here</p>
              <p className="mt-1 text-[14px] text-muted">JPEG, PNG or WebP · up to 8 MB</p>
              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-4 w-4" /> Choose a photo
              </Button>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            onChange={(e) => accept(e.target.files?.[0])}
          />
        </div>

        {error && (
          <Callout tone="clay" className="mt-5">
            {error}
          </Callout>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="brass" size="lg" onClick={upload} disabled={!file || busy}>
            {busy ? "Uploading…" : "Read my face"}
          </Button>
          <Link
            href="/start/analysing?photo=skip"
            className="px-2 text-[14.5px] text-ink-2 underline decoration-line underline-offset-4 hover:text-brass-ink"
          >
            Skip — use my quiz answers only
          </Link>
        </div>
      </div>

      <Card className="h-fit p-6">
        <p className="eyebrow">Getting a good read</p>
        <ul className="mt-4 space-y-3.5 text-[14.5px] leading-relaxed text-ink-2">
          {[
            ["Face the window", "Daylight from the front. Overhead light throws shadows that read as bone structure."],
            ["Hair off your forehead", "We need to see your actual hairline, not your fringe."],
            ["Neutral expression", "A big smile changes your whole face shape."],
            ["No filters", "Beauty filters reshape jawlines. The read will be wrong."],
            ["Head and shoulders", "Close enough that your face fills most of the frame."],
          ].map(([t, d]) => (
            <li key={t}>
              <span className="font-semibold text-ink">{t}.</span> {d}
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
          Stored privately, deletable in one click from settings. Nothing is public,
          ever.
        </p>
      </Card>
    </div>
  );
}
