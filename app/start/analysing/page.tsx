import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Analysing } from "@/components/Analysing";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Reading your face" };

export default async function AnalysingPage({
  searchParams,
}: {
  searchParams: Promise<{ photo?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login?next=/start/quiz");

  const { photo } = await searchParams;
  const photoId = photo && photo !== "skip" ? photo : null;

  return <Analysing photoId={photoId} />;
}
