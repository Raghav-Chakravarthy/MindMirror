export type Platform = "claude" | "openai" | "gemini";

export interface Conversation {
  title: string;
  platform: Platform;
  messages: number;
  date: string;
  content_sample: string;
}

export interface CognitiveFingerprint {
  systems_thinking: number;
  pattern_seeking: number;
  first_principles: number;
  execution_speed: number;
  depth_vs_breadth: number;
  uncertainty_tolerance: number;
}

export type TopicDomain =
  | "ai"
  | "frontend"
  | "backend"
  | "devops"
  | "design"
  | "product"
  | "other";

export interface Topic {
  name: string;
  count: number;
  domain: TopicDomain;
  is_returning: boolean;
  depth_score: number;
  verdict: string;
}

export type DependencySeverity = "habit" | "dependency" | "atrophy";

export interface DependencyItem {
  topic: string;
  evidence: string;
  severity: DependencySeverity;
  reclaim_prompt: string;
}

export interface Archetype {
  name: string;
  tagline: string;
  color: string;
}

export interface ShareableCard {
  headline: string;
  stat: string;
  pull_quote: string;
  archetype: Archetype;
}

export interface MindMirrorResult {
  COGNITIVE_FINGERPRINT: CognitiveFingerprint;
  TOPICS: Topic[];
  DEPENDENCY_AUDIT: DependencyItem[];
  UNCOMFORTABLE_QUESTIONS: string[];
  KNOWLEDGE_EDGE: string[];
  ARCHETYPE: Archetype;
  VERDICT: string;
  SHAREABLE_CARD: ShareableCard;
}
