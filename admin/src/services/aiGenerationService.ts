import Anthropic from '@anthropic-ai/sdk';
import { updateLevel } from './contentService';

const getClient = () => new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are a rare combination of three world-class
minds working as one:

1. MASTER STORYTELLER — You make knowledge feel like a Netflix thriller.
   Every concept has drama, tension, and resolution. You use vivid real
   stories, unexpected analogies, and emotional hooks that make readers
   feel something. You don't explain — you reveal. You don't inform —
   you transform.

2. VIRAL CONTENT CREATOR — You think in Instagram carousels, Twitter
   threads, and YouTube thumbnails. You know the exact moment a reader
   will screenshot and share. Every line earns its place. Every word
   is chosen for maximum impact. You write content that makes people
   feel smart for reading it.

3. WORLD-CLASS UX WRITER — You understand how humans read on screens.
   Short sentences. White space. Pattern interrupts. Emotional peaks
   followed by practical valleys. You write for skimmers AND deep
   readers simultaneously.

YOUR NORTH STAR FOR EVERY PIECE:
  → The reader gets goosebumps at least once
  → The reader thinks "I need to send this to someone"
  → The reader feels 10x smarter after reading
  → The reader has ONE clear action to take
  → An Indian professional aged 22-40 sees themselves in examples

TOKEN EFFICIENCY RULES:
  → Never repeat information across sections
  → Every sentence must earn its place or be cut
  → Use specific numbers, names, examples — never vague generalities
  → Output ONLY valid JSON — no preamble, no explanation, no fences`;

type SupportingFiles = {
  pdfText?: string;
  infographicDescription?: string;
  transcriptText?: string;
  additionalText?: string;
  customNotes?: string;
};

function buildSupportingContext(files?: SupportingFiles): string {
  if (!files) return 'Use your deep knowledge of this book. Be specific: real names, studies, and examples.';
  const parts: string[] = [];
  if (files.pdfText)
    parts.push(`PRIMARY REFERENCE — Summary PDF:\n${files.pdfText.slice(0, 10000)}`);
  if (files.infographicDescription)
    parts.push(`VISUAL SUMMARY:\n${files.infographicDescription}`);
  if (files.transcriptText)
    parts.push(`TRANSCRIPT / NOTES:\n${files.transcriptText.slice(0, 3000)}`);
  if (files.additionalText)
    parts.push(`ADDITIONAL REFERENCE:\n${files.additionalText.slice(0, 3000)}`);
  if (files.customNotes)
    parts.push(`ADMIN NOTES (prioritise these):\n${files.customNotes}`);
  if (parts.length === 0)
    return 'Use your deep knowledge of this book. Be specific.';
  return `REFERENCE MATERIALS (use all of these):\n\n${parts.join('\n\n---\n\n')}`;
}

async function callClaude(prompt: string): Promise<string> {
  const client = getClient();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = msg.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}

function parseJson(raw: string): unknown {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

// ── LEVEL 1 ──────────────────────────────────────────────
export async function generateLevel1(
  bookId: string,
  title: string,
  author: string,
  count: number,
  files?: SupportingFiles
): Promise<void> {
  const supportingContext = buildSupportingContext(files);

  const prompt = `Book: "${title}" by ${author}

${supportingContext}

You are creating the FIRST thing a user sees about this book.
This is the hook. The movie trailer. The reason they lean forward.

Generate exactly ${count} key points.

Each key point MUST follow this structure:
  HEADING: Bold, punchy insight title. Not a chapter name.
           Start with a power word or number.
           ✓ "Your brain is lying to you every morning"
           ✓ "The 2-minute rule that destroys procrastination"
           ✗ "Chapter overview" ← NEVER
           ✗ "Introduction to habits" ← TOO BORING

  DESCRIPTION: Exactly 3 sentences:
    S1: The shocking truth or counterintuitive insight
    S2: The real-world proof (specific story/study/number)
    S3: Why THIS changes everything for the reader

RULES:
  → Heading max 60 chars
  → Description max 200 chars
  → Use "you" and "your" — speak directly
  → At least 3 specific numbers/statistics
  → At least 2 proper nouns (real people, companies)
  → One point must give goosebumps
  → One point must be so counterintuitive: "wait, what?"

Return JSON:
{
  "keyPoints": [
    {
      "order": 1,
      "heading": "...",
      "description": "...",
      "emoji": "single most relevant emoji",
      "impactScore": "GOOSEBUMP | MINDBLOWN | ACTIONABLE | INSPIRING"
    }
  ]
}`;

  const raw = await callClaude(prompt);
  const data = parseJson(raw) as { keyPoints: unknown[] };
  if (!data.keyPoints?.length) throw new Error('No key points in response');

  await updateLevel(bookId, 1, {
    content: data,
    status: 'DRAFT',
    requiredPlan: 'FREE',
  });
}

// ── LEVEL 2 ──────────────────────────────────────────────
export async function generateLevel2(
  bookId: string,
  title: string,
  author: string,
  count: number,
  files?: SupportingFiles
): Promise<void> {
  const supportingContext = buildSupportingContext(files);

  const prompt = `Book: "${title}" by ${author}

${supportingContext}

You are creating Instagram story cards people SCREENSHOT AND SAVE.
Think Canva template meets genius insight meets perfect typography.

Generate ${count} flashcards. Each card = one concept. Unforgettable.

Card structure:
  TITLE: Magnetic concept name. Max 5 words.
         What would you title an Instagram post about this?

  BODY: Exactly 4 sentences:
    S1 — THE HOOK: Stat/story/question that stops the scroll
    S2 — THE CONCEPT: Idea through a vivid analogy
    S3 — THE PROOF: Real person/company/result
    S4 — THE TAKEAWAY: What reader does TODAY

  VISUAL_DIRECTION: 5 words describing the perfect illustration

  QUOTE: Best quote from book on this concept. Max 15 words.
         Empty string if none.

RULES:
  → Body max 300 chars
  → Each card = one complete idea
  → Vary openings: question / stat / story / bold claim
  → One card makes reader feel guilty about current habit
  → One card makes reader excited about future possibility

Return JSON:
{
  "cards": [
    {
      "order": 1,
      "title": "...",
      "body": "...",
      "visualDirection": "...",
      "quote": "...",
      "cardType": "MINDBLOWN | ACTIONABLE | STORY | STAT | QUOTE",
      "colorMood": "ENERGETIC | CALM | DEEP | PLAYFUL"
    }
  ]
}`;

  const raw = await callClaude(prompt);
  const data = parseJson(raw) as { cards: unknown[] };
  if (!data.cards?.length) throw new Error('No cards in response');

  await updateLevel(bookId, 2, {
    content: data,
    status: 'DRAFT',
    requiredPlan: 'FREE',
  });
}

// ── LEVEL 4 ──────────────────────────────────────────────
export async function generateLevel4(
  bookId: string,
  title: string,
  author: string,
  targetWords: number,
  files?: SupportingFiles
): Promise<void> {
  const supportingContext = buildSupportingContext(files);

  const prompt = `Book: "${title}" by ${author}

${supportingContext}

You are writing the DEFINITIVE GUIDE to this book.
Not a summary. A TRANSFORMATION MANUAL.

Imagine the smartest person you know read this book 10 times
and wrote you a personal letter explaining what they learned.
That's what you're writing.

OVERVIEW (2 paragraphs):
  Para 1: The ONE core thesis. What does the author want you
          to DO differently? What problem does it solve?
  Para 2: Why this matters for an Indian professional RIGHT NOW.

For EACH CHAPTER / SECTION in the source material:

  TITLE: Original name + your punchy subtitle
         "The Habit Loop — Why You Can't Just Try Harder"

  OPENING_HOOK: One sentence making reader desperate to continue

  NARRATIVE_SUMMARY: 3-5 paragraphs that:
    → Tell the STORY (not describe — TELL)
    → Include specific case studies from the source
    → Make complex ideas feel obvious through analogies
    → Alternate: insight → proof → insight → proof
    → One paragraph must use Indian context where relevant

  KEY_TAKEAWAYS: 3 precise, actionable insights
    Format: "INSIGHT: What it means for you"

  MEMORABLE_MOMENT: The ONE story/stat remembered in 10 years

CONCLUSION:
  Book in 3 sentences. ONE action this week. The big question left.

RULES:
  → Target ~${targetWords} words
  → Never "the author says" — explain as if to a friend
  → Include all proper nouns from source
  → Bold most important phrase per section with **
  → Every section needs at least one number/statistic

Return JSON:
{
  "overview": "...",
  "chapters": [
    {
      "title": "...",
      "subtitle": "...",
      "openingHook": "...",
      "narrativeSummary": "...",
      "keyTakeaways": ["insight: implication"],
      "memorableMoment": "..."
    }
  ],
  "conclusion": "...",
  "oneAction": "...",
  "theBigQuestion": "...",
  "wordCount": 0
}`;

  const raw = await callClaude(prompt);
  const data = parseJson(raw) as {
    overview: string;
    chapters: Array<{
      title: string;
      subtitle: string;
      openingHook: string;
      narrativeSummary: string;
      keyTakeaways: string[];
      memorableMoment: string;
    }>;
    conclusion: string;
    oneAction: string;
    theBigQuestion: string;
    wordCount: number;
  };
  if (!data.chapters?.length) throw new Error('No chapters in response');

  let inlineText = `# ${title}\n\n${data.overview}\n\n`;
  for (const ch of data.chapters) {
    inlineText += `## ${ch.title}${ch.subtitle ? ` — ${ch.subtitle}` : ''}\n\n`;
    if (ch.openingHook) inlineText += `*${ch.openingHook}*\n\n`;
    inlineText += `${ch.narrativeSummary}\n\n`;
    if (ch.keyTakeaways?.length) {
      inlineText += `**Key Takeaways:**\n`;
      ch.keyTakeaways.forEach((t) => { inlineText += `- ${t}\n`; });
      inlineText += '\n';
    }
    if (ch.memorableMoment) inlineText += `> ${ch.memorableMoment}\n\n`;
  }
  inlineText += `## Conclusion\n\n${data.conclusion}`;
  if (data.oneAction) inlineText += `\n\n**One Action:** ${data.oneAction}`;
  if (data.theBigQuestion) inlineText += `\n\n**The Big Question:** ${data.theBigQuestion}`;

  const wordCount = inlineText.split(/\s+/).filter(Boolean).length;

  await updateLevel(bookId, 4, {
    content: {
      pdfUrl: '',
      pdfKey: '',
      pageCount: 0,
      inlineText,
      wordCount,
    },
    status: 'DRAFT',
    requiredPlan: 'STARTER',
  });
}

// ── LEVEL 5 ──────────────────────────────────────────────
export async function generateLevel5(
  bookId: string,
  title: string,
  author: string,
  easy: number,
  medium: number,
  hard: number,
  files?: SupportingFiles
): Promise<void> {
  const supportingContext = buildSupportingContext(files);

  const prompt = `Book: "${title}" by ${author}

${supportingContext}

You are designing a MASTERY ASSESSMENT — not a boring test.
Every question feels like a detective puzzle or consultant case.

Generate:
  ${easy} EASY (recall + basic comprehension)
  ${medium} MEDIUM (analysis + implications)
  ${hard} HARD (application to real Indian scenarios)

EASY: Direct recall. Clear right answer. Plausible wrong options.
MEDIUM: Require understanding WHY not just WHAT.
  30%+ use scenario framing:
  "Riya has been trying to quit smoking for 3 years...
   Based on the book, what is MOST LIKELY the issue?"

HARD: Real Indian workplace/life scenarios.
  Synthesise multiple concepts. At least 2 where obvious answer is WRONG.
  Names: Rahul, Priya, Arjun, Sneha, Kiran, Vikram
  Contexts: startup, MNC, family business, IIT, IIM

ALL: Explanation = why correct AND why most tempting wrong answer fails.

Return JSON:
{
  "questions": [
    {
      "id": "q1",
      "order": 1,
      "difficulty": "EASY",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "...",
      "conceptTested": "..."
    }
  ]
}`;

  const raw = await callClaude(prompt);
  const data = parseJson(raw) as { questions: unknown[] };
  if (!data.questions?.length) throw new Error('No questions in response');

  const questions = data.questions as Array<{ difficulty: string }>;
  await updateLevel(bookId, 5, {
    content: {
      totalQuestions: questions.length,
      easyCount: questions.filter((q) => q.difficulty === 'EASY').length,
      mediumCount: questions.filter((q) => q.difficulty === 'MEDIUM').length,
      hardCount: questions.filter((q) => q.difficulty === 'HARD').length,
      questions,
    },
    status: 'DRAFT',
    requiredPlan: 'STARTER',
  });
}

// ── LEVEL 6 ──────────────────────────────────────────────
export async function generateLevel6(
  bookId: string,
  title: string,
  author: string,
  sections: number,
  files?: SupportingFiles
): Promise<void> {
  const supportingContext = buildSupportingContext(files);

  const prompt = `Book: "${title}" by ${author}

${supportingContext}

You are creating a PERSONAL TRANSFORMATION WORKBOOK.
Not a corporate template. A coaching session with
the best executive coach you've ever met.

DAILY — habits and small daily actions:
  Title: References book's core concept
  Each prompt: Max 10 words. Direct. Book-specific.
  Placeholder: Specific example answer

WEEKLY — patterns and adjustments:
  Title: References progress and growth
  Each prompt: Deeper reflection. What changed? What didn't?
  Placeholder: Guide with partial answer

MONTHLY — transformation tracking:
  Title: References identity change
  Each prompt: Big picture tied to book's core message
  Placeholder: "E.g., Before reading: [X]. Now: [Y]"

RULES:
  → Every prompt = question or incomplete sentence
  → No prompt over 15 words
  → Each section title makes user WANT to fill it
  → Use exact terminology from the book
  → Generate ${sections} sections per format

Return JSON:
{
  "daily": {
    "title": "...",
    "sections": [
      { "title": "...", "prompt": "...", "placeholder": "..." }
    ]
  },
  "weekly": { "title": "...", "sections": [...] },
  "monthly": { "title": "...", "sections": [...] }
}`;

  const raw = await callClaude(prompt);
  const data = parseJson(raw) as { daily: unknown; weekly: unknown; monthly: unknown };
  if (!data.daily) throw new Error('No workbook data in response');

  await updateLevel(bookId, 6, {
    content: data,
    status: 'DRAFT',
    requiredPlan: 'STARTER',
  });
}

// ── LEVEL 7 ──────────────────────────────────────────────
export async function generateLevel7(
  bookId: string,
  title: string,
  author: string,
  targetWords: number,
  files?: SupportingFiles
): Promise<void> {
  const supportingContext = buildSupportingContext(files);

  const prompt = `Book: "${title}" by ${author}

${supportingContext}

You are writing the ULTIMATE CHEAT SHEET for this book.
Designed for scanning in 3 minutes OR deep reading in 10.

Write in markdown with this EXACT structure:

## 🧠 The Core Idea
[The entire book in exactly 2 sentences. Precise. Powerful.]

## ⚡ The Framework
[Main model as TEXT DIAGRAM using → and --- boxes]
[Scannable and memorable]

## 📊 Key Concepts at a Glance
[Table: Concept | What it means | Real example]
[Max 8 rows. Essential concepts only.]

## 🔀 Critical Distinctions
[3-5 most common confusions]
[Format: "❌ Common belief: [X]  ✅ The truth: [Y]"]

## 📖 Stories You'll Remember Forever
[4-5 best case studies. One line each:]
[Person/Company → What they did → The surprising result]

## 💡 Quotes Worth Memorising
[3-5 best quotes, each under 15 words]

## ✅ Your 5-Minute Exam
[5 questions testing REAL understanding]
[Answers after --- divider at bottom]

## 🚀 The One Action
[If you take ONE thing from this book, it's THIS]
[Specific. Immediate. Measurable.]

RULES:
  → Target ~${targetWords} words
  → Emojis as visual anchors (one per header only)
  → Short punchy sentences. Fragments OK.
  → Every table exactly 3 columns
  → Stories section must give goosebumps

Return JSON:
{ "richText": "...full markdown...", "wordCount": 0 }`;

  const raw = await callClaude(prompt);
  const data = parseJson(raw) as { richText: string; wordCount: number };
  if (!data.richText) throw new Error('No richText in response');

  const wordCount = data.richText.split(/\s+/).filter(Boolean).length;

  await updateLevel(bookId, 7, {
    content: { richText: data.richText, wordCount },
    status: 'DRAFT',
    requiredPlan: 'STARTER',
  });
}
