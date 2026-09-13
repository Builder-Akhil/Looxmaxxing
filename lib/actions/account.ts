"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData): Promise<void> {
  const parsed = z
    .object({
      full_name: z.string().max(80).nullable(),
      market: z.enum(["IN", "UK"]),
      locale: z.enum(["en", "hi"]),
    })
    .safeParse({
      full_name: (String(formData.get("full_name") ?? "").trim() || null),
      market: String(formData.get("market") ?? "IN"),
      locale: String(formData.get("locale") ?? "en"),
    });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  revalidatePath("/settings");
}

/** Deletes the stored file as well as the row — a row alone leaves the image behind. */
export async function deletePhoto(formData: FormData): Promise<void> {
  const id = String(formData.get("photoId") ?? "");
  if (!z.string().uuid().safeParse(id).success) return;

  const supabase = await createClient();
  const { data: photo } = await supabase.from("photos").select("storage_path").eq("id", id).maybeSingle();
  if (!photo) return;

  await supabase.storage.from("photos").remove([photo.storage_path]);
  await supabase.from("photos").delete().eq("id", id);
  await supabase.rpc("log_audit", { p_action: "photo_deleted", p_detail: { id } });

  revalidatePath("/settings");
}

export async function deleteAllPhotos(): Promise<void> {
  const supabase = await createClient();
  const { data: photos } = await supabase.from("photos").select("id, storage_path").is("deleted_at", null);
  if (photos?.length) {
    await supabase.storage.from("photos").remove(photos.map((p) => p.storage_path));
    await supabase.from("photos").delete().in("id", photos.map((p) => p.id));
  }
  await supabase.rpc("withdraw_photo_retention");
  revalidatePath("/settings");
}

export async function deleteAccount(formData: FormData): Promise<void> {
  const confirm = String(formData.get("confirm") ?? "").trim().toUpperCase();
  if (confirm !== "DELETE") {
    redirect("/settings?error=confirm");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Remove the stored files first — the cascade only clears database rows.
  const [{ data: photos }, { data: tryons }] = await Promise.all([
    supabase.from("photos").select("storage_path"),
    supabase.from("tryon_jobs").select("result_path").not("result_path", "is", null),
  ]);

  if (photos?.length) {
    await supabase.storage.from("photos").remove(photos.map((p) => p.storage_path));
  }
  if (tryons?.length) {
    await supabase.storage.from("tryons").remove(tryons.map((t) => t.result_path as string));
  }

  await supabase.rpc("delete_my_account");
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}

export async function setTier(formData: FormData): Promise<void> {
  const tier = String(formData.get("tier") ?? "");
  if (!["free", "plus", "pro"].includes(tier)) return;

  const supabase = await createClient();
  await supabase.rpc("set_my_tier", { p_tier: tier });
  revalidatePath("/billing");
  revalidatePath("/dashboard");
}
