import { MindMirrorResult } from "./types";

export const SAMPLE_RESULT: MindMirrorResult = {
  COGNITIVE_FINGERPRINT: {
    systems_thinking: 72,
    pattern_seeking: 85,
    first_principles: 41,
    execution_speed: 88,
    depth_vs_breadth: 68,
    uncertainty_tolerance: 35,
  },
  TOPICS: [
    {
      name: "React Components",
      count: 47,
      domain: "frontend",
      is_returning: true,
      depth_score: 32,
      verdict:
        "You've asked about React 47 times. You still don't know React — you know how to ask about React.",
    },
    {
      name: "SQL Queries",
      count: 38,
      domain: "backend",
      is_returning: true,
      depth_score: 18,
      verdict:
        "You outsource every JOIN to AI. This skill is actively decaying.",
    },
    {
      name: "RAG Pipelines",
      count: 29,
      domain: "ai",
      is_returning: true,
      depth_score: 71,
      verdict:
        "Your RAG questions show genuine depth. This is where your curiosity actually lives.",
    },
    {
      name: "CSS Layout",
      count: 24,
      domain: "frontend",
      is_returning: true,
      depth_score: 15,
      verdict:
        "Flexbox vs Grid — asked 24 times, understood 0 times. You're using AI as a CSS crutch.",
    },
    {
      name: "Python Debugging",
      count: 21,
      domain: "backend",
      is_returning: false,
      depth_score: 45,
      verdict:
        "You debug by pasting errors into AI. Your stack trace literacy is atrophying.",
    },
    {
      name: "System Design",
      count: 16,
      domain: "backend",
      is_returning: true,
      depth_score: 82,
      verdict:
        "Your system design questions are sophisticated. This is your real strength — lean into it.",
    },
    {
      name: "LLM Prompting",
      count: 14,
      domain: "ai",
      is_returning: true,
      depth_score: 58,
      verdict:
        "You're meta-optimizing your AI usage. Recursive, but productive.",
    },
    {
      name: "Git Operations",
      count: 12,
      domain: "devops",
      is_returning: true,
      depth_score: 8,
      verdict:
        "12 conversations about git rebase. Just learn it. Please.",
    },
    {
      name: "API Design",
      count: 11,
      domain: "backend",
      is_returning: false,
      depth_score: 67,
      verdict:
        "Your REST vs GraphQL questions show genuine architectural thinking.",
    },
    {
      name: "TypeScript Types",
      count: 9,
      domain: "frontend",
      is_returning: true,
      depth_score: 42,
      verdict:
        "You understand generics conceptually but panic at conditional types. Normal, but fixable.",
    },
    {
      name: "Docker Setup",
      count: 7,
      domain: "devops",
      is_returning: false,
      depth_score: 22,
      verdict:
        "You copy-paste Dockerfiles. You don't understand layers. That's fine until it isn't.",
    },
    {
      name: "Neural Networks",
      count: 5,
      domain: "ai",
      is_returning: false,
      depth_score: 89,
      verdict:
        "Only 5 conversations but the depth score is off the charts. This is your sleeper interest.",
    },
  ],
  DEPENDENCY_AUDIT: [
    {
      topic: "SQL Query Writing",
      evidence:
        "38 conversations, depth score of 18. You're not learning SQL — you're renting it.",
      severity: "atrophy",
      reclaim_prompt:
        "Can you write a 3-table JOIN with a subquery without any AI assistance right now?",
    },
    {
      topic: "CSS Layout",
      evidence:
        "24 repeated questions about the same flexbox patterns. The answers aren't sticking.",
      severity: "dependency",
      reclaim_prompt:
        "What would happen to your productivity if you couldn't ask AI about CSS for a week?",
    },
    {
      topic: "Git Operations",
      evidence:
        "You've asked how to rebase interactively at least 4 separate times.",
      severity: "habit",
      reclaim_prompt:
        "Have you ever read the git documentation, or do you only learn git through AI?",
    },
    {
      topic: "Error Debugging",
      evidence:
        "Your debugging pattern is: see error → paste into AI → apply fix. No hypothesis step.",
      severity: "dependency",
      reclaim_prompt:
        "When was the last time you read a stack trace top-to-bottom before asking for help?",
    },
  ],
  UNCOMFORTABLE_QUESTIONS: [
    "You've asked about React 47 times across 6 months. At what point does curiosity become avoidance of actually building?",
    "Your questions get noticeably vaguer on Friday afternoons. What are you avoiding when your energy drops?",
    "You've never once asked about testing. Is that a conscious choice or a blind spot you're not ready to confront?",
    "Your SQL dependency score is in the 'atrophy' zone. If AI disappeared tomorrow, could you still do your job?",
    "You ask about system design with genuine depth but never about implementation. Are you an architect who can't build?",
    "Your conversation frequency tripled in March. What happened in your life that made you lean harder on AI?",
    "You've never asked about accessibility, performance, or security. What does that say about what you value?",
  ],
  KNOWLEDGE_EDGE: [
    "Your RAG pipeline questions show unusual sophistication — you're thinking about retrieval quality metrics that most developers ignore entirely.",
    "You're one of the few people asking about neural network interpretability alongside practical engineering. That cross-domain curiosity is rare.",
    "Your system design conversations reference distributed systems concepts that suggest deeper CS fundamentals than your day-to-day work requires.",
    "You ask about LLM prompting with an engineering rigor that most prompt engineers lack. You're treating it as a real discipline.",
  ],
  ARCHETYPE: {
    name: "THE ANXIOUS BUILDER",
    tagline:
      "You know more than you think you do, but you don't trust yourself enough to stop asking for confirmation.",
    color: "#7c3aed",
  },
  VERDICT:
    "You are a developer with genuine architectural instincts who has developed a dependency on AI for implementation details. Your 47 React conversations and 38 SQL queries tell the same story: you understand the 'why' but outsource the 'how.' Your RAG pipeline work (depth score: 71) and system design questions (depth score: 82) reveal where your real intellectual curiosity lives — and it's not in the frontend code you spend most of your time asking about. The risk: your implementation skills are atrophying while your architectural thinking grows. The edge: your cross-domain curiosity (neural networks + system design + RAG) positions you uniquely. This week, write one complete feature — frontend to backend — without asking AI a single question. See what you actually know.",
  SHAREABLE_CARD: {
    headline: "47 React Questions Later, Still Asking",
    stat: "38 SQL queries outsourced to AI",
    pull_quote:
      "You understand the 'why' but outsource the 'how.'",
    archetype: {
      name: "THE ANXIOUS BUILDER",
      tagline:
        "You know more than you think you do, but you don't trust yourself enough to stop asking.",
      color: "#7c3aed",
    },
  },
};
