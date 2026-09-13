/** Shared, immutable homepage copy used by the process, modality and FAQ sections. */

export type LineIconName =
  | "counselling"
  | "arts"
  | "music"
  | "welcome"
  | "explore"
  | "grow";

interface Modality {
  number: string;
  icon: LineIconName;
  title: string;
  eyebrow: string;
  description: string;
  details: readonly string[];
  tone: "sage" | "clay" | "ochre";
}

interface ProcessStep {
  number: string;
  icon: LineIconName;
  label: string;
  title: string;
  text: string;
}

interface Faq {
  question: string;
  answer: string;
}

export const MODALITIES: readonly Modality[] = [
  {
    number: "01",
    icon: "counselling",
    title: "Counselling",
    eyebrow: "Space to speak",
    description:
      "A confidential space to explore your thoughts, emotions and life experiences with curiosity, compassion and care.",
    details: ["Emotional wellbeing", "Self-understanding", "Anxiety & stress", "Relationships"],
    tone: "sage",
  },
  {
    number: "02",
    icon: "arts",
    title: "Arts-Based Therapy",
    eyebrow: "Space to create",
    description:
      "Through drawing, painting, movement, storytelling and other creative processes, we explore emotions in ways that feel natural and meaningful.",
    details: ["Creative expression", "Emotional exploration", "Visual reflection", "Self-discovery"],
    tone: "clay",
  },
  {
    number: "03",
    icon: "music",
    title: "Music Therapy",
    eyebrow: "Space to listen",
    description:
      "Connect with emotions, memories, the body and the present moment. Together we use rhythm, sound and carefully chosen musical experiences to support wellbeing.",
    details: ["Receptive music experiences", "Rhythm & grounding", "Emotional expression", "Relaxation & regulation"],
    tone: "ochre",
  },
];

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    number: "01",
    icon: "welcome",
    label: "Begin",
    title: "Getting to know you",
    text: "A brief conversation to understand what brings you here and explore whether this space is right for you.",
  },
  {
    number: "02",
    icon: "explore",
    label: "Explore",
    title: "Finding what works for you",
    text: "Every person’s journey is different. Together, we shape an approach that may include conversation, music, creative expression, reflection or a thoughtful combination.",
  },
  {
    number: "03",
    icon: "grow",
    label: "Grow",
    title: "Growing at your own pace",
    text: "Change doesn’t always happen all at once. Together we notice patterns, celebrate small shifts and create space for growth.",
  },
];

export const FAQS: readonly Faq[] = [
  {
    question: "What happens in the first session?",
    answer:
      "The first session is a gentle conversation about what brings you here, what support may feel useful and whether Swaraagam is the right fit. You do not need to prepare anything in advance.",
  },
  {
    question: "How do arts-based and music therapy sessions work online?",
    answer:
      "Online sessions can include conversation, guided listening, rhythm, drawing, movement or reflective creative prompts using materials already available to you. No artistic or musical experience is required.",
  },
  {
    question: "What session formats and availability are offered?",
    answer:
      "Online sessions are available across India. In-person sessions in Mumbai are subject to location and appointment availability. Individual sessions are generally 45–60 minutes.",
  },
  {
    question: "Do you work with children and adolescents?",
    answer:
      "Yes. Swaraagam works with children, adolescents and adults. Services for minors are provided with appropriate parent or guardian consent and involvement, where applicable.",
  },
];
