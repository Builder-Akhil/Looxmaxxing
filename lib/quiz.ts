import type { Market } from "./brand";

export type QuizOption = {
  value: string;
  label: string;
  /** Market-specific label, used for money questions. */
  labelBy?: Partial<Record<Market, string>>;
  hint?: string;
  /** Key into the icon set drawn in components/QuizIcon.tsx */
  icon: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  why: string;
  type: "single" | "multi";
  options: QuizOption[];
  /** Shown under the options — used for the medical wording. */
  footnote?: string;
};

/**
 * Nine questions. Every one of them asks something a camera cannot answer:
 * taste, time, money, lifestyle, and the things people quietly rule out.
 */
export const QUIZ: QuizQuestion[] = [
  {
    id: "goal",
    question: "What brought you here?",
    why: "Sets the tone for everything we suggest.",
    type: "single",
    options: [
      { value: "reset", label: "I want a proper reset", hint: "Bored of the same cut", icon: "scissors" },
      { value: "beard", label: "Sort out my beard", hint: "Shape, length, or whether to keep it", icon: "beard" },
      { value: "impression", label: "Look sharper at work", hint: "Meetings, camera, first impressions", icon: "tie" },
      { value: "event", label: "Something's coming up", hint: "Wedding, shoot, interview", icon: "sparkle" },
    ],
  },
  {
    id: "morning_minutes",
    question: "Honestly — how long do you spend on your hair in the morning?",
    why: "The single best predictor of whether you'll keep a style.",
    type: "single",
    options: [
      { value: "2", label: "Under 2 minutes", hint: "Towel, hands, done", icon: "clock1" },
      { value: "5", label: "About 5 minutes", icon: "clock2" },
      { value: "10", label: "Around 10 minutes", icon: "clock3" },
      { value: "15", label: "15 minutes or more", hint: "I enjoy the ritual", icon: "clock4" },
    ],
  },
  {
    id: "setting",
    question: "Where do people mostly see you?",
    why: "A trading floor and a film set want different silhouettes.",
    type: "single",
    options: [
      { value: "corporate", label: "Client-facing office", icon: "building" },
      { value: "creative", label: "Creative or startup studio", icon: "palette" },
      { value: "camera", label: "On camera or on stage", icon: "camera" },
      { value: "field", label: "Outdoors, site, or helmet on", icon: "helmet" },
    ],
  },
  {
    id: "salon_frequency",
    question: "Realistically, how often will you sit in the chair?",
    why: "We won't recommend a fade if you visit twice a year. It stops looking like a fade in three weeks.",
    type: "single",
    options: [
      { value: "2w", label: "Every 2–3 weeks", icon: "cal1" },
      { value: "4w", label: "Monthly", icon: "cal2" },
      { value: "8w", label: "Every couple of months", icon: "cal3" },
      { value: "rare", label: "Twice a year, if that", icon: "cal4" },
    ],
  },
  {
    id: "budget",
    question: "What do you usually pay for a cut?",
    why: "Some techniques simply cost more chair time.",
    type: "single",
    options: [
      { value: "low", label: "₹200–500", labelBy: { UK: "Under £15" }, icon: "coin1" },
      { value: "mid", label: "₹500–1,200", labelBy: { UK: "£15–30" }, icon: "coin2" },
      { value: "high", label: "₹1,200–2,500", labelBy: { UK: "£30–60" }, icon: "coin3" },
      { value: "premium", label: "₹2,500+", labelBy: { UK: "£60+" }, icon: "coin4" },
    ],
  },
  {
    id: "hair_behaviour",
    question: "What does your hair do that annoys you?",
    why: "This is the difference between a style that works on you and one that works in a photo.",
    type: "multi",
    options: [
      { value: "flat", label: "Goes flat by lunchtime", icon: "flat" },
      { value: "frizz", label: "Frizzes in humidity", icon: "frizz" },
      { value: "wont_hold", label: "Won't hold a shape", icon: "hold" },
      { value: "greasy", label: "Greasy by evening", icon: "grease" },
      { value: "dry", label: "Dry and rough", icon: "dry" },
      { value: "cowlick", label: "One bit sticks up. Always.", icon: "cowlick" },
      { value: "fine", label: "Nothing — it behaves", icon: "check" },
    ],
  },
  {
    id: "conditions",
    question: "Anything we should style around?",
    why: "We route recommendations around these rather than ignoring them.",
    type: "multi",
    options: [
      { value: "flaky", label: "Flaky or itchy scalp", icon: "scalp" },
      { value: "sensitive", label: "Sensitive skin", icon: "sensitive" },
      { value: "thinning", label: "Thinning or receding", icon: "thinning" },
      { value: "patchy_beard", label: "Patchy beard growth", icon: "patchy" },
      { value: "hair_fall", label: "Noticeable hair fall lately", icon: "fall" },
      { value: "none", label: "None of these", icon: "check" },
    ],
    footnote:
      "We suggest styles, not treatments. Nothing here is medical advice — for anything persistent, see a dermatologist or trichologist.",
  },
  {
    id: "taste",
    question: "Which of these is more you?",
    why: "Two people with identical faces can want opposite things.",
    type: "single",
    options: [
      { value: "sharp", label: "Sharp and structured", hint: "Clean lines, defined edges", icon: "sharp" },
      { value: "relaxed", label: "Relaxed and lived-in", hint: "Texture, movement, low effort", icon: "relaxed" },
      { value: "classic", label: "Classic and understated", hint: "Nothing anyone would call trendy", icon: "classic" },
      { value: "bold", label: "Bold — surprise me", hint: "I'll try the thing", icon: "bold" },
    ],
  },
  {
    id: "off_limits",
    question: "Anything that's a hard no?",
    why: "So we never waste a recommendation slot on it.",
    type: "multi",
    options: [
      { value: "no_short", label: "Never going very short", icon: "noshort" },
      { value: "no_beard", label: "No facial hair", icon: "nobeard" },
      { value: "no_colour", label: "No colour or dye", icon: "nocolour" },
      { value: "no_product", label: "I won't use product daily", icon: "noproduct" },
      { value: "open", label: "Nothing's off limits", icon: "check" },
    ],
  },
];

export type QuizAnswers = Record<string, string | string[]>;

export function isComplete(answers: QuizAnswers): boolean {
  return QUIZ.every((q) => {
    const a = answers[q.id];
    if (q.type === "multi") return Array.isArray(a) && a.length > 0;
    return typeof a === "string" && a.length > 0;
  });
}

export function optionLabel(option: QuizOption, market: Market): string {
  return option.labelBy?.[market] ?? option.label;
}

/** Turns raw answers into the plain-English brief we hand the model. */
export function answersToBrief(answers: QuizAnswers, market: Market): string {
  const lines: string[] = [];
  for (const q of QUIZ) {
    const a = answers[q.id];
    if (!a) continue;
    const values = Array.isArray(a) ? a : [a];
    const labels = values
      .map((v) => q.options.find((o) => o.value === v))
      .filter((o): o is QuizOption => Boolean(o))
      .map((o) => optionLabel(o, market));
    if (labels.length) lines.push(`${q.question} → ${labels.join("; ")}`);
  }
  return lines.join("\n");
}
