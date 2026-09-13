import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QuizFlow } from "@/components/QuizFlow";
import { createClient } from "@/lib/supabase/server";
import type { QuizAnswers } from "@/lib/quiz";
import type { Market } from "@/lib/brand";

export const metadata: Metadata = { title: "A few questions" };

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/start/quiz");

  const [{ data: profile }, { data: existing }] = await Promise.all([
    supabase.from("profiles").select("market").eq("id", user.id).maybeSingle(),
    supabase.from("quiz_responses").select("answers").eq("user_id", user.id).maybeSingle(),
  ]);

  return (
    <QuizFlow
      market={(profile?.market as Market) ?? "IN"}
      initial={(existing?.answers as QuizAnswers) ?? {}}
    />
  );
}
