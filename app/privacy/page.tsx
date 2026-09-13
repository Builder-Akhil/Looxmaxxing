import type { Metadata } from "next";
import { LegalPage, Clause } from "@/components/LegalPage";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What we collect, why, how long we keep it, and how to get rid of it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="13 September 2026" draftNotice>
      <Clause heading="The short version">
        <p>
          We collect your email, your quiz answers and — only if you agree — a
          photograph of your face. We use them to work out what suits you. We do
          not sell anything, we do not train models on your photo, and one button
          in your settings deletes all of it permanently.
        </p>
      </Clause>

      <Clause heading="Your photograph">
        <p>
          A photograph of a face is biometric data. Under UK GDPR it is a special
          category; under India&rsquo;s Digital Personal Data Protection Act it is
          personal data requiring clear, informed consent. We treat it that way.
        </p>
        <p>
          We ask before the camera opens, on a screen of its own, in plain English.
          The record of what you agreed to — including the policy version and the
          time — is stored and never edited. You can withdraw it whenever you like.
        </p>
        <p>
          Your photo is stored in private object storage. It is reachable only
          through a signed link that expires. No other user can see it, no search
          engine can index it, and it is never shown to anyone.
        </p>
        <p>
          If you decline retention, we delete the photo shortly after the reading
          and keep only the text description we derived from it.
        </p>
      </Clause>

      <Clause heading="What we work out from it">
        <p>
          Styling features only: face shape, jawline, forehead proportion, hairline,
          hair type and texture, density, skin undertone, contrast level, beard
          coverage and brow shape. We do not attempt to determine your identity,
          age, ethnicity, health or emotional state, and we instruct the model not
          to comment on them.
        </p>
      </Clause>

      <Clause heading="Everything else we hold">
        <p>
          Your email address and name; your quiz answers, including any scalp or
          skin conditions you chose to tell us about; your readings, looks and
          barber cards; your upkeep routine; your plan, usage counts and credit
          history; and a log of security-relevant actions such as consent changes
          and deletions.
        </p>
      </Clause>

      <Clause heading="Who we share it with">
        <p>
          Three processors, and no one else. <strong>Supabase</strong> stores the
          database and files, hosted in Mumbai. <strong>Vercel</strong> serves the
          application. <strong>OpenAI</strong> receives your photograph and quiz
          summary at the moment of a reading, to produce the analysis; under their
          API terms this data is not used to train their models.
        </p>
        <p>We never sell your data and we run no advertising on it.</p>
      </Clause>

      <Clause heading="How long we keep it">
        <p>
          Your photograph: until you delete it, or shortly after the reading if you
          declined retention. Your readings, looks and cards: until you delete your
          account. Consent and security logs: retained after deletion in
          non-identifying form, because a record that a consent existed is the point
          of keeping one.
        </p>
      </Clause>

      <Clause heading="Your rights">
        <p>
          You can download everything we hold as a single JSON file, and delete your
          account entirely — both from your settings page, both immediate, neither
          requiring you to email anyone. You can withdraw any consent at any time.
        </p>
        <p>
          If you are in the UK you may complain to the Information Commissioner&rsquo;s
          Office. If you are in India you may approach the Data Protection Board.
          We would rather you wrote to us first: {brand.supportEmail}.
        </p>
      </Clause>

      <Clause heading="Children">
        <p>
          {brand.name} is not for anyone under 18, and we do not knowingly process
          a child&rsquo;s photograph. If you believe we have, write to us and we will
          delete it.
        </p>
      </Clause>

      <Clause heading="Security">
        <p>
          Access to your data is enforced by the database itself, not only by the
          application: every table refuses to return another person&rsquo;s rows.
          Passwords are hashed and checked against known breach lists at signup. AI
          credentials never reach your browser.
        </p>
      </Clause>
    </LegalPage>
  );
}
