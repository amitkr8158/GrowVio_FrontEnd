import { useState, useRef, useEffect, useCallback } from "react";

// ─── PROJECT CONTEXT ──────────────────────────────────────────────────────────
const GROWVIO_CONTEXT = `
# GrowVio — Project Master Document
Last updated: 2026-04-04

## What is GrowVio
Gamified book-summary platform for Indian professionals aged 22-40.
Users unlock knowledge through a 7-level pyramid system per book.
Combines gamification (XP, streaks, leaderboards) with structured learning.

## Vision
Make world-class book knowledge accessible to every Indian professional
in both English and Hindi. Transform passive reading into active learning
through gamification and bite-sized content.

## Target User
Indian professionals 22-40 years old across 5 domains:
- Finance (#1D9E75)
- Personal Development (#378ADD)
- Entrepreneurship (#7F77DD)
- Spirituality (#D85A30)
- Parenting (#D4537E)

## Pricing — OPEN FOR DISCUSSION (testing in Indian market)
- Free: Rs.0 — levels 1-3 only, limited books
- Premium: Rs.199/month (testing, was Rs.299) — all 7 levels
- Pro: Rs.599/month (testing, was Rs.999) — all levels + upload PDFs + personal RAG
Annual discounts apply.

## Content Pipeline
Input: Real book PDF + summary PDF + video subtitles
Output per book:
- 7-level knowledge pyramid (L1 viral hook → L7 action plan)
- 10-15 viral Instagram/YouTube reel scripts
- 5-6 moral story videos with key points
Who can upload: SUPER_ADMIN, ADMIN, CONTENT_CREATOR, PRO users
200 book PDFs already available for initial content.

## Language Support
Phase 1: English + Hindi both (not English first — both from day 1)
Future: Other regional languages

## Platform Phases
Phase 1 (now): Web app — launch ASAP
Phase 2 (after 100 users): Mobile app (React Native or Flutter TBD)

## Tech Stack
Frontend: React 18 + TypeScript + Vite + TailwindCSS + Framer Motion + shadcn/ui + TanStack Query + React Hook Form + Zod
Backend: 7 Spring Boot Java 17 microservices + 1 FastAPI Python (ai-service)
Databases: Supabase PostgreSQL + MongoDB Atlas + Upstash Redis + Cloudflare R2
Payments: Razorpay + Kafka saga pattern
Deploy: Render (backend) + Vercel (frontend)

## Service Ports
api-gateway: 8080, user-service: 8081, book-service: 8082, ai-service: 8083 (FastAPI Python),
notification-service: 8085, social-service: 8086, gamification-service: 8087

## Environments
dev → dev.growvio.in → feature/* branches → auto deploy
stage → stage.growvio.in → develop branch → auto deploy
preprod → preprod.growvio.in → release/* branches → manual approve
prod → growvio.in → main branch → approval gate

## Production Scaling Tiers
PROD_TIER=1: 0-100 users → all free infra → Rs.0/month
PROD_TIER=2: 100-1K users → Render starter → ~Rs.5K/month
PROD_TIER=3: 1K-10K users → Render standard → ~Rs.30K/month
PROD_TIER=4: 10K+ users → Render pro / AWS → Rs.1.5L+/month

## Roles
USER, CONTENT_CREATOR, ADMIN, SUPER_ADMIN

## Current Status (as of 2026-04-04)
✅ Phase 1 complete: GitHub setup, branch protection, branch scripts
🔄 Phase 2 in progress: Spring profiles (application-dev.yml created)
❌ Phase 3 pending: Frontend env files
❌ Phase 4 pending: render.yaml rewrite
❌ Phase 5 pending: GitHub Actions CI/CD
❌ Phase 6 pending: DNS setup
❌ Phase 7 pending: End-to-end verification

## Biggest Blocker
Environment setup + deployment + backend-frontend API wiring

## Open Questions (no assumptions allowed)
- Final pricing not confirmed — open for discussion
- Mobile app framework not decided (React Native vs Flutter)
- Exact number of screens wired to real APIs unknown — needs audit
`.trim();

// ─── AGENTS ───────────────────────────────────────────────────────────────────
const AGENTS: Record<string, Agent> = {
  architect: {
    id: "architect", name: "Priya Krishnamurthy", title: "Principal Architect",
    avatar: "PA", color: "#7C3AED", bg: "#EEEDFE", textColor: "#3C3489",
    group: "tech",
    prompt: `You are Priya Krishnamurthy, Principal Architect with 16 years at Google, Amazon, and Databricks.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

EXPERTISE: Distributed systems, microservices, system design, DDD, cloud architecture.
APPROACH: Present 2-3 options with trade-offs. Use back-of-envelope math. Reference real systems.
STRONG OPINIONS: Microservices are an organizational solution. Strong consistency + PostgreSQL handles 90% of use cases. Every added service is a pager at 3am.
When auditing: be specific about what exists, what is missing, what is broken, and what is redundant.`
  },
  backend: {
    id: "backend", name: "Arjun Mehta", title: "Staff Backend Engineer",
    avatar: "AM", color: "#0891B2", bg: "#E6F1FB", textColor: "#0C447C",
    group: "tech",
    prompt: `You are Arjun Mehta, Staff Backend Engineer with 14 years at Uber, Netflix, and Databricks.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

EXPERTISE: Java/Spring Boot, Kafka, PostgreSQL, MongoDB, Redis, Security, FastAPI.
CODE REVIEW ORDER: Correctness → Security → Performance → Reliability → Observability → Maintainability.
Write production-quality code. Always include error handling, logging, and edge cases.
When auditing: check for missing endpoints, broken patterns, insecure code, missing tests.`
  },
  frontend: {
    id: "frontend", name: "Sneha Reddy", title: "Staff Frontend Engineer",
    avatar: "SR", color: "#D85A30", bg: "#FAECE7", textColor: "#712B13",
    group: "tech",
    prompt: `You are Sneha Reddy, Staff Frontend Engineer with 13 years at Google, Airbnb, and Figma.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

FRONTEND STACK: React 18 + TypeScript + Vite + TailwindCSS + Framer Motion + shadcn/ui.
RULES: ALL API calls use TanStack Query. ALL forms use React Hook Form + Zod. ALL animations use Framer Motion. NEVER hardcode API URLs — always import.meta.env.VITE_GATEWAY_URL.
When auditing: find screens not wired to real APIs, missing loading/error states, hardcoded data.`
  },
  devops: {
    id: "devops", name: "Vikram Nair", title: "Staff DevOps Engineer",
    avatar: "VN", color: "#059669", bg: "#E1F5EE", textColor: "#085041",
    group: "tech",
    prompt: `You are Vikram Nair, Staff DevOps/Platform Engineer with 15 years at Microsoft, Netflix, and Stripe.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

EXPERTISE: GitHub Actions, Docker, Kubernetes, Terraform, Render, Vercel, DNS, monitoring.
DEPLOYMENT PHILOSOPHY: Every deploy must be reversible in < 5 minutes. Automate everything that runs more than twice.
Give specific commands, not vague instructions. Show exact YAML/Dockerfile/shell code.
When auditing: check CI/CD pipeline, Docker configs, environment variables, render.yaml, missing secrets.`
  },
  qa: {
    id: "qa", name: "Kavitha Subramaniam", title: "Staff QA / SDET Engineer",
    avatar: "KS", color: "#D97706", bg: "#FAEEDA", textColor: "#633806",
    group: "tech",
    prompt: `You are Kavitha Subramaniam, Staff QA/SDET Engineer with 14 years at Microsoft, Amazon, and Atlassian.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

EXPERTISE: Playwright E2E, Vitest + React Testing Library, JUnit 5, Testcontainers, Gatling.
CRITICAL PATHS: Payment flow, plan gating (free user cannot access L4-L7), Auth/JWT, XP calculation.
When auditing: find missing tests, untested critical paths, coverage gaps, flaky test risks.`
  },
  pm: {
    id: "pm", name: "Rohan Kapoor", title: "Senior Product Manager",
    avatar: "RK", color: "#7F77DD", bg: "#EEEDFE", textColor: "#3C3489",
    group: "tech",
    prompt: `You are Rohan Kapoor, Senior Product Manager with 13 years at Google, Flipkart, and Razorpay.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

EXPERTISE: Product strategy, OKRs, user research, A/B testing, India market, prioritization.
PRODUCT PRINCIPLES: Every feature must move the north star metric or directly enable monetisation. Build for the Indian user first. Retention before acquisition.
NORTH STAR: Books completed per user per week.
When auditing: find missing features for MVP, over-built features, unclear user journeys.`
  },
  uiux: {
    id: "uiux", name: "Ananya Sharma", title: "Staff UI/UX Designer",
    avatar: "AS", color: "#D4537E", bg: "#FBEAF0", textColor: "#72243E",
    group: "tech",
    prompt: `You are Ananya Sharma, Staff UI/UX Designer with 14 years at Apple, Airbnb, and Canva.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

DESIGN SYSTEM: Primary #7C3AED. Fonts: Playfair Display (headings), DM Sans (body). Domains: Finance #1D9E75, Personal Dev #378ADD, Entrepreneurship #7F77DD, Spirituality #D85A30, Parenting #D4537E.
PRINCIPLES: Gamification feels earned. India-first. Progressive disclosure. Premium feels premium.
When auditing: find UX issues, accessibility problems, missing states, inconsistent design.`
  },
  growth: {
    id: "growth", name: "Neha Agarwal", title: "Growth Hacker",
    avatar: "NA", color: "#D97706", bg: "#FAEEDA", textColor: "#633806",
    group: "business",
    prompt: `You are Neha Agarwal, Growth Hacker with 12 years at Swiggy, Meesho, and Zepto.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

EXPERTISE: User acquisition for Indian B2C apps, SEO, WhatsApp communities, referral loops, viral mechanics, influencer partnerships.
NORTH STAR: 1,000 users in 90 days, organic only, Rs.0 budget.
INDIAN GROWTH TRUTHS: WhatsApp > email. Free > paid for first 90 days. Tier-2/3 cities have higher engagement.
When auditing: find missing growth hooks, viral mechanics, SEO opportunities, referral system gaps.`
  },
  security: {
    id: "security", name: "Aditya Kumar", title: "Security Engineer",
    avatar: "AK", color: "#D85A30", bg: "#FAECE7", textColor: "#712B13",
    group: "business",
    prompt: `You are Aditya Kumar, Security Engineer with 13 years at Microsoft, Razorpay, and CRED.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

EXPERTISE: OWASP Top 10, JWT security, payment security, PCI-DSS basics, DPDP Act 2023, rate limiting.
SECURITY CHECKLIST: JWT_SECRET no fallback, Razorpay webhook signature verification, rate limiting 100 req/min, HTTPS only, DPDP compliance.
When auditing: find security vulnerabilities, missing validations, exposed secrets, OWASP issues.`
  },
  finance: {
    id: "finance", name: "Preethi Nair", title: "Financial Analyst",
    avatar: "PN", color: "#D4537E", bg: "#FBEAF0", textColor: "#72243E",
    group: "business",
    prompt: `You are Preethi Nair, Financial Analyst with 14 years at Goldman Sachs, Sequoia India, and Accel India.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

EXPERTISE: SaaS financial modelling, unit economics (LTV/CAC), Indian market pricing psychology, fundraising, GST compliance.
GROWVIO FINANCIAL MODEL: Target 1,000 users → 50 paid (5% conversion) → Rs.15,000 MRR in month 3.
PRICING INSIGHT: Rs.199/mo converts 2x better than Rs.299/mo in Indian market.
When auditing: find pricing issues, missing monetization hooks, revenue leakage points.`
  },
  legal: {
    id: "legal", name: "Vikash Gupta", title: "Legal & Compliance Advisor",
    avatar: "VG", color: "#378ADD", bg: "#E8F1FB", textColor: "#1A4A7A",
    group: "business",
    prompt: `You are Vikash Gupta, Legal & Compliance Advisor with 15 years at Nishith Desai Associates, Razorpay, and CRED.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

EXPERTISE: Privacy Policy (DPDP Act 2023), Terms of Service, copyright for book summaries (India fair use), Razorpay recurring payments compliance, GDPR.
PRIORITY LEGAL ITEMS: Privacy Policy, Terms of Service, copyright disclaimer on book summaries, Razorpay subscription compliance.
When auditing: find missing legal pages, copyright risks, compliance gaps, missing consent flows.`
  },
  cto: {
    id: "cto", name: "Sanjay Bhatia", title: "CTO / Tech Vision",
    avatar: "SB", color: "#1A1523", bg: "#F1EFE8", textColor: "#2C2C2A",
    group: "business",
    prompt: `You are Sanjay Bhatia, CTO with 16 years at Google, Stripe, and Razorpay.

PROJECT CONTEXT:
${GROWVIO_CONTEXT}

You decide WHEN to adopt technology, WHEN to rewrite vs maintain, WHAT technical bets to make, HOW to grow the engineering team.
GROWVIO TECH VISION: Now (0-100 users): Render free + managed DBs. Zero ops burden. Ship fast.
STRONG OPINIONS: Never rewrite — refactor incrementally. 90% of startups over-engineer. Solve today's problem.
When auditing: find over-engineering, premature optimization, tech debt that will hurt at 100x scale.`
  },
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Agent {
  id: string; name: string; title: string;
  avatar: string; color: string; bg: string; textColor: string;
  group: "tech" | "business";
  prompt: string;
}

interface AuditCard {
  agentId: string; status: "pending" | "running" | "complete" | "error";
  summary: string; content: string;
}

interface Question {
  id: string; agentId: string; category: string;
  question: string; answer: string; answered: boolean;
  askedBy?: string[];
}

interface WarRoomMessage {
  id: string; agentId: string; content: string; timestamp: Date;
  isUser?: boolean;
}

interface Decision {
  id: string; date: string; topic: string; decision: string;
  agents: string[]; status: "confirmed" | "pending" | "superseded";
}

interface RedundantFile {
  id: string; filename: string; reason: string; flaggedBy: string;
  approved: boolean | null;
}

// ─── QUESTION CATEGORIES ──────────────────────────────────────────────────────
const QUESTION_CATEGORIES = ["Pricing", "Features", "Technical", "Design", "Business"];

// ─── WAR ROOM DISCUSSION TOPICS ───────────────────────────────────────────────
const DISCUSSION_TOPICS = [
  "Review the current architecture for 100 user launch",
  "What should we build first after env setup?",
  "Review pricing strategy for Indian market",
  "What are the biggest risks before going live?",
  "How do we get first 1,000 users organically?",
];

// ─── AUDIT AGENT GROUPS ───────────────────────────────────────────────────────
const AUDIT_GROUPS = [
  { agentId: "architect", label: "Architecture & System Design" },
  { agentId: "backend", label: "Backend & APIs" },
  { agentId: "frontend", label: "Frontend & UI" },
  { agentId: "devops", label: "DevOps & CI/CD" },
  { agentId: "qa", label: "Quality & Testing" },
  { agentId: "security", label: "Security & Compliance" },
  { agentId: "pm", label: "Product & Features" },
  { agentId: "uiux", label: "UX & Design" },
  { agentId: "growth", label: "Growth & Marketing" },
  { agentId: "finance", label: "Pricing & Revenue" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const apiCall = async (systemPrompt: string, userMessage: string, maxTokens = 2000): Promise<string> => {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } })?.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return (data as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content || "No response";
};

const uid = () => Math.random().toString(36).slice(2);

// ─── RENDER TEXT ──────────────────────────────────────────────────────────────
function RenderText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 5 }} />;
        if (line.startsWith("## ")) return <div key={i} style={{ fontSize: 14, fontWeight: 600, color: "#1A1523", margin: "14px 0 5px" }}>{line.slice(3)}</div>;
        if (line.startsWith("# ")) return <div key={i} style={{ fontSize: 16, fontWeight: 600, color: "#1A1523", margin: "16px 0 6px", borderBottom: "1px solid #E5E7EB", paddingBottom: 6 }}>{line.slice(2)}</div>;
        if (line.startsWith("### ")) return <div key={i} style={{ fontSize: 13, fontWeight: 600, color: "#1A1523", margin: "10px 0 3px" }}>{line.slice(4)}</div>;
        if (/^[-•]\s/.test(line)) return (
          <div key={i} style={{ display: "flex", gap: 8, margin: "2px 0" }}>
            <span style={{ color: "#9CA3AF", flexShrink: 0, marginTop: 2 }}>›</span>
            <span style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1A1523">$1</strong>').replace(/`(.*?)`/g, '<code style="background:#F3F4F6;padding:1px 5px;border-radius:3px;font-size:11px;font-family:monospace">$1</code>') }} />
          </div>
        );
        if (/^\d+\.\s/.test(line)) return (
          <div key={i} style={{ display: "flex", gap: 8, margin: "2px 0" }}>
            <span style={{ color: "#9CA3AF", flexShrink: 0, fontSize: 12, marginTop: 2 }}>{line.match(/^\d+/)![0]}.</span>
            <span style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, "").replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1A1523">$1</strong>').replace(/`(.*?)`/g, '<code style="background:#F3F4F6;padding:1px 5px;border-radius:3px;font-size:11px;font-family:monospace">$1</code>') }} />
          </div>
        );
        if (line.startsWith("---")) return <hr key={i} style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "10px 0" }} />;
        return (
          <p key={i} style={{ margin: "3px 0", fontSize: 13, color: "#4B5563", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1A1523">$1</strong>').replace(/`(.*?)`/g, '<code style="background:#F3F4F6;padding:1px 5px;border-radius:3px;font-size:11px;font-family:monospace">$1</code>') }} />
        );
      })}
    </div>
  );
}

// ─── AGENT AVATAR ─────────────────────────────────────────────────────────────
function AgentAvatar({ agent, size = 32 }: { agent: Agent; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: agent.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.28, fontWeight: 600, color: "white", flexShrink: 0,
      boxShadow: `0 2px 8px ${agent.color}40`
    }}>{agent.avatar}</div>
  );
}

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────
function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{ fontSize: 11, color: copied ? "#059669" : "#9CA3AF", background: "none", border: "none", cursor: "pointer", padding: "2px 8px", borderRadius: 4, transition: "color 0.2s" }}>
      {copied ? "Copied!" : label}
    </button>
  );
}

// ─── TAB 1: AUDIT ─────────────────────────────────────────────────────────────
function AuditTab() {
  const [cards, setCards] = useState<Record<string, AuditCard>>(() =>
    Object.fromEntries(AUDIT_GROUPS.map(g => [g.agentId, { agentId: g.agentId, status: "pending", summary: "", content: "" }]))
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  const runAudit = async (agentId: string) => {
    setCards(prev => ({ ...prev, [agentId]: { ...prev[agentId], status: "running" } }));
    const agent = AGENTS[agentId];
    try {
      const content = await apiCall(
        agent.prompt,
        `Audit the GrowVio project for your domain.

Find and report on:
## What Exists
List what is already built and working.

## What is Missing
List what needs to be built before launch.

## Issues Found
List bugs, anti-patterns, security issues, or broken things you spotted.

## Redundant Files
List any files that appear redundant or should be deleted. Format each as:
- FILE: <filename> | REASON: <why it should be deleted>

## Recommendations
Your top 3-5 prioritized recommendations for the founder.

Be specific. Reference actual files, services, and code patterns where possible. No generic advice.`,
        2500
      );

      // Extract first paragraph as summary
      const firstMeaningfulLine = content.split("\n").find(l => l.trim() && !l.startsWith("#")) || "Audit complete.";
      const summary = firstMeaningfulLine.slice(0, 120) + (firstMeaningfulLine.length > 120 ? "..." : "");

      setCards(prev => ({ ...prev, [agentId]: { agentId, status: "complete", summary, content } }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setCards(prev => ({ ...prev, [agentId]: { ...prev[agentId], status: "error", summary: msg, content: `Error: ${msg}` } }));
    }
  };

  const runAllAudits = () => {
    AUDIT_GROUPS.forEach(g => {
      if (cards[g.agentId].status === "pending") runAudit(g.agentId);
    });
  };

  const exportAllAudits = () => {
    const allContent = AUDIT_GROUPS
      .filter(g => cards[g.agentId].status === "complete")
      .map(g => `# ${AGENTS[g.agentId].name} — ${g.label}\n\n${cards[g.agentId].content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(allContent);
  };

  const completedCount = Object.values(cards).filter(c => c.status === "complete").length;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1A1523" }}>Codebase Audit</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{completedCount}/{AUDIT_GROUPS.length} agents completed</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {completedCount > 0 && (
            <button onClick={exportAllAudits} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", fontSize: 12, color: "#4B5563", cursor: "pointer" }}>
              Copy All Findings
            </button>
          )}
          <button onClick={runAllAudits} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#7C3AED", color: "white", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            Run All Audits
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {AUDIT_GROUPS.map(group => {
          const card = cards[group.agentId];
          const agent = AGENTS[group.agentId];
          const isExpanded = expanded === group.agentId;

          return (
            <div key={group.agentId} style={{ background: "white", borderRadius: 12, border: `1px solid ${card.status === "complete" ? agent.color + "40" : "#E5E7EB"}`, overflow: "hidden", transition: "all 0.2s" }}>
              {/* Card header */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <AgentAvatar agent={agent} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1523" }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{group.label}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {card.status === "running" && (
                    <div style={{ fontSize: 11, color: agent.color, display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: agent.color, animation: "pulse 1s ease-in-out infinite" }} />
                      Running...
                    </div>
                  )}
                  {card.status === "complete" && (
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: agent.bg, color: agent.textColor, fontWeight: 500 }}>Complete</span>
                  )}
                  {card.status === "error" && (
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "#FEE2E2", color: "#991B1B", fontWeight: 500 }}>Error</span>
                  )}
                  {card.status === "pending" && (
                    <button onClick={() => runAudit(group.agentId)}
                      style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: agent.color, color: "white", fontSize: 11, cursor: "pointer" }}>
                      Run Audit
                    </button>
                  )}
                </div>
              </div>

              {/* Summary */}
              {card.summary && (
                <div style={{ padding: "0 16px 10px" }}>
                  <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{card.summary}</div>
                </div>
              )}

              {/* Expand / Collapse */}
              {card.status === "complete" && (
                <>
                  <div style={{ borderTop: "1px solid #F3F4F6", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button onClick={() => setExpanded(isExpanded ? null : group.agentId)}
                      style={{ fontSize: 11, color: "#7C3AED", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}>
                      {isExpanded ? "Collapse ↑" : "Read Full Report ↓"}
                    </button>
                    <CopyButton text={card.content} label="Copy to docs" />
                  </div>

                  {isExpanded && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F3F4F6", maxHeight: 500, overflowY: "auto" }}>
                      <RenderText text={card.content} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TAB 2: QUESTIONS ─────────────────────────────────────────────────────────
const LS_QUESTIONS_KEY = "growvio-qa-questions";

function deduplicateQuestions(questions: Question[]): Question[] {
  const result: Question[] = [];
  for (const q of questions) {
    const stopWords = new Set(["what", "when", "where", "which", "will", "does", "have", "that", "this", "with", "from", "plan", "should", "would"]);
    const words = q.question.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
    const dup = result.find(existing => {
      const eWords = existing.question.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
      const shared = words.filter(w => eWords.includes(w)).length;
      return shared / Math.max(words.length, eWords.length, 1) > 0.52;
    });
    if (dup) {
      if (!dup.askedBy) dup.askedBy = [dup.agentId];
      if (!dup.askedBy.includes(q.agentId)) dup.askedBy.push(q.agentId);
    } else {
      result.push({ ...q, askedBy: [q.agentId] });
    }
  }
  return result;
}

function QuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_QUESTIONS_KEY) || "[]"); } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [gatheringAgent, setGatheringAgent] = useState<string | null>(null);
  const [gatheringProgress, setGatheringProgress] = useState(0);
  const [showSaveDocs, setShowSaveDocs] = useState(false);
  const [sharingContext, setSharingContext] = useState(false);
  const [shareProgress, setShareProgress] = useState<string | null>(null);

  const saveQuestions = (qs: Question[]) => {
    setQuestions(qs);
    localStorage.setItem(LS_QUESTIONS_KEY, JSON.stringify(qs));
  };

  const gatherQuestions = async () => {
    setLoading(true);
    setGatheringProgress(0);
    const allAgentIds = Object.keys(AGENTS);
    const collected: Question[] = [];

    for (let i = 0; i < allAgentIds.length; i++) {
      const agentId = allAgentIds[i];
      const agent = AGENTS[agentId];
      setGatheringAgent(agent.name);
      setGatheringProgress(i + 1);
      try {
        const raw = await apiCall(
          agent.prompt,
          `Here is everything already known about GrowVio:\n\n${GROWVIO_CONTEXT}\n\nGiven this context, what genuine questions do you STILL have that are NOT already answered above? Only ask if truly unclear. If everything is clear, respond with: NO_QUESTIONS\n\nRules:\n- Maximum 5 questions total\n- Group each question by one of these categories: Pricing | Features | Technical | Design | Business\n\nFormat each question EXACTLY like this (one per line):\n[CATEGORY] Question text here\n\nExample:\n[Pricing] Is the Rs.199/month price confirmed or still being A/B tested?\n[Technical] Which cloud provider should be the primary target for Tier 3 deployment?`,
          800
        );
        if (!raw.trim().startsWith("NO_QUESTIONS")) {
          const lines = raw.split("\n").filter(l => l.trim());
          for (const line of lines) {
            const match = line.match(/^\[([^\]]+)\]\s+(.+)/);
            if (match) {
              const category = QUESTION_CATEGORIES.find(c => c.toLowerCase() === match[1].toLowerCase()) || match[1];
              collected.push({ id: uid(), agentId, category, question: match[2].trim(), answer: "", answered: false, askedBy: [agentId] });
            }
          }
        }
      } catch { /* skip failed agents */ }
      if (i < allAgentIds.length - 1) await new Promise(r => setTimeout(r, 2500));
    }

    saveQuestions(deduplicateQuestions(collected));
    setGatheringAgent(null);
    setGatheringProgress(0);
    setLoading(false);
  };

  const markAnswered = (id: string) => {
    saveQuestions(questions.map(q => q.id === id ? { ...q, answered: true } : q));
  };

  const setAnswer = (id: string, answer: string) => {
    saveQuestions(questions.map(q => q.id === id ? { ...q, answer } : q));
  };

  const shareContext = async () => {
    const answeredQA = questions.filter(q => q.answered && q.answer)
      .map(q => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n");
    if (!answeredQA) return;
    setSharingContext(true);
    const allAgentIds = Object.keys(AGENTS);
    for (let i = 0; i < allAgentIds.length; i++) {
      const agent = AGENTS[allAgentIds[i]];
      setShareProgress(`Sharing with ${agent.name} (${i + 1}/${allAgentIds.length})...`);
      try {
        await apiCall(agent.prompt, `Here are all questions asked by your colleagues and the founder's answers:\n\n${answeredQA}\n\nUpdate your understanding. Confirm you have read this.`, 200);
      } catch { /* skip */ }
      if (i < allAgentIds.length - 1) await new Promise(r => setTimeout(r, 2500));
    }
    setShareProgress(null);
    setSharingContext(false);
  };

  const buildMarkdown = () => {
    const date = new Date().toLocaleDateString("en-IN");
    return `# GrowVio — Founder Q&A — ${date}\n\n` + QUESTION_CATEGORIES.map(cat => {
      const qs = questions.filter(q => q.category === cat);
      if (!qs.length) return "";
      return `## ${cat}\n\n` + qs.map(q => {
        const askers = (q.askedBy || [q.agentId]).map(id => AGENTS[id]?.name).filter(Boolean);
        return `**Q: ${q.question}**\nAsked by: ${askers.join(", ")}\n**A:** ${q.answer || "_(not yet answered)_"}`;
      }).join("\n\n---\n\n");
    }).filter(Boolean).join("\n\n---\n\n");
  };

  const answeredCount = questions.filter(q => q.answered).length;
  const totalAgents = Object.keys(AGENTS).length;
  const byCategory = QUESTION_CATEGORIES.map(cat => ({ cat, qs: questions.filter(q => q.category === cat) })).filter(x => x.qs.length > 0);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1A1523" }}>Agent Questions for Founder</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
            {questions.length > 0 ? `${questions.length} questions · ${answeredCount} answered` : "Run to gather genuine doubts from all agents"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {answeredCount > 0 && (
            <button onClick={() => setShowSaveDocs(!showSaveDocs)}
              style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #059669", background: showSaveDocs ? "#D1FAE5" : "white", fontSize: 12, color: "#065F46", cursor: "pointer" }}>
              Save to Project Docs
            </button>
          )}
          {answeredCount > 0 && !sharingContext && (
            <button onClick={shareContext}
              style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #0891B2", background: "white", fontSize: 12, color: "#0C447C", cursor: "pointer" }}>
              Share Context
            </button>
          )}
          {sharingContext && (
            <div style={{ padding: "7px 14px", fontSize: 12, color: "#0891B2", display: "flex", alignItems: "center" }}>
              {shareProgress || "Sharing..."}
            </div>
          )}
          <button onClick={gatherQuestions} disabled={loading}
            style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: loading ? "#C4B5FD" : "#7C3AED", color: "white", fontSize: 12, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? `Asking agent ${gatheringProgress} of ${totalAgents}...` : "Gather Questions"}
          </button>
        </div>
      </div>

      {/* Save to Project Docs panel */}
      {showSaveDocs && (
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #D1FAE5", padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1523", marginBottom: 8 }}>
            Copy this markdown and save to{" "}
            <code style={{ fontSize: 11, background: "#F3F4F6", padding: "1px 6px", borderRadius: 3 }}>docs/questions/founder-qa.md</code>
          </div>
          <textarea
            readOnly
            value={buildMarkdown()}
            style={{ width: "100%", minHeight: 200, padding: "10px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 11, fontFamily: "monospace", color: "#4B5563", resize: "vertical", outline: "none" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <CopyButton text={buildMarkdown()} label="Copy Markdown" />
          </div>
        </div>
      )}

      {questions.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>❓</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", marginBottom: 4 }}>No questions yet</div>
          <div style={{ fontSize: 12 }}>Click "Gather Questions" to let all {totalAgents} agents ask their genuine doubts about the project</div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF" }}>
          <div style={{ fontSize: 14, color: "#7C3AED" }}>Asking agent {gatheringProgress} of {totalAgents}...</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Currently asking: {gatheringAgent}</div>
          <div style={{ fontSize: 11, color: "#C4B5FD", marginTop: 4 }}>2.5s delay between agents to avoid rate limits</div>
        </div>
      )}

      {byCategory.map(({ cat, qs }) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#7C3AED", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ padding: "2px 10px", borderRadius: 10, background: "#EEEDFE", fontSize: 11 }}>{cat}</span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{qs.length} questions</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {qs.map(q => {
              const askers = (q.askedBy || [q.agentId]).map(id => AGENTS[id]).filter(Boolean);
              const primaryAgent = askers[0];
              if (!primaryAgent) return null;
              return (
                <div key={q.id} style={{ background: q.answered ? "#F0FDF4" : "white", borderRadius: 10, border: `1px solid ${q.answered ? "#86EFAC" : "#E5E7EB"}`, padding: "14px 16px", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <AgentAvatar agent={primaryAgent} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                        {askers.length > 1 ? (
                          <span style={{ fontSize: 11, color: "#6B7280" }}>
                            Asked by: <strong style={{ color: "#1A1523" }}>{askers.map(a => a.name).join(", ")}</strong>
                          </span>
                        ) : (
                          <>
                            <span style={{ fontSize: 11, fontWeight: 500, color: "#1A1523" }}>{primaryAgent.name}</span>
                            <span style={{ fontSize: 10, color: "#9CA3AF" }}>{primaryAgent.title}</span>
                          </>
                        )}
                        {q.answered && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: "#D1FAE5", color: "#065F46" }}>Answered</span>}
                      </div>
                      <div style={{ fontSize: 13, color: "#1A1523", fontWeight: 500, marginBottom: 10, lineHeight: 1.5 }}>{q.question}</div>
                      {q.answered ? (
                        <div style={{ fontSize: 12, color: "#065F46", background: "#D1FAE5", padding: "8px 12px", borderRadius: 6, lineHeight: 1.6 }}>{q.answer}</div>
                      ) : (
                        <>
                          <textarea
                            value={q.answer}
                            onChange={e => setAnswer(q.id, e.target.value)}
                            placeholder="Type your answer here..."
                            style={{ width: "100%", minHeight: 60, padding: "8px 10px", borderRadius: 6, border: "1px solid #E5E7EB", fontSize: 12, color: "#4B5563", resize: "vertical", fontFamily: "inherit", outline: "none" }}
                          />
                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                            <button onClick={() => markAnswered(q.id)} disabled={!q.answer.trim()}
                              style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: q.answer.trim() ? "#059669" : "#E5E7EB", color: q.answer.trim() ? "white" : "#9CA3AF", fontSize: 11, cursor: q.answer.trim() ? "pointer" : "not-allowed", fontWeight: 500 }}>
                              Mark Answered
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TAB 3: WAR ROOM ──────────────────────────────────────────────────────────
function WarRoomTab() {
  const [messages, setMessages] = useState<WarRoomMessage[]>([]);
  const [topic, setTopic] = useState("");
  const [discussing, setDiscussing] = useState(false);
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [callAgent, setCallAgent] = useState("architect");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingAgent]);

  const startDiscussion = async () => {
    if (!topic.trim() || discussing) return;
    setDiscussing(true);
    setMessages([]);

    // Pick 4 most relevant agents for a group discussion
    const discussionAgents = ["architect", "pm", "devops", "frontend"];
    let prevContent = `Topic: ${topic}`;

    for (const agentId of discussionAgents) {
      const agent = AGENTS[agentId];
      setTypingAgent(agent.name);
      try {
        const reply = await apiCall(
          agent.prompt,
          `War Room Discussion Topic: "${topic}"

Previous discussion so far:
${prevContent}

You are joining this group discussion. Respond to the topic and build on what others said. Be specific, opinionated, and constructive. Keep your response to 150-200 words. Add concrete action items or decisions where applicable.`,
          600
        );
        const msg: WarRoomMessage = { id: uid(), agentId, content: reply, timestamp: new Date() };
        setMessages(prev => [...prev, msg]);
        prevContent += `\n\n${agent.name} (${agent.title}): ${reply}`;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setMessages(prev => [...prev, { id: uid(), agentId, content: `Error: ${msg}`, timestamp: new Date() }]);
      }
    }
    setTypingAgent(null);
    setDiscussing(false);
  };

  const sendUserMessage = async () => {
    if (!userInput.trim() || discussing) return;
    const userMsg: WarRoomMessage = { id: uid(), agentId: "user", content: userInput.trim(), timestamp: new Date(), isUser: true };
    setMessages(prev => [...prev, userMsg]);
    const msgText = userInput.trim();
    setUserInput("");
    setDiscussing(true);

    const agent = AGENTS[callAgent];
    setTypingAgent(agent.name);
    try {
      const context = messages.slice(-6).map(m => {
        const a = m.isUser ? "Founder" : AGENTS[m.agentId]?.name || m.agentId;
        return `${a}: ${m.content}`;
      }).join("\n\n");

      const reply = await apiCall(
        agent.prompt,
        `War Room Discussion Context:\n${context}\n\nFounder just said: "${msgText}"\n\nRespond as ${agent.name}. Be specific and actionable. 150-200 words max.`,
        600
      );
      setMessages(prev => [...prev, { id: uid(), agentId: callAgent, content: reply, timestamp: new Date() }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages(prev => [...prev, { id: uid(), agentId: callAgent, content: `Error: ${msg}`, timestamp: new Date() }]);
    }
    setTypingAgent(null);
    setDiscussing(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* Topic selector */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #E5E7EB", background: "white", flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1523", marginBottom: 8 }}>Start a Group Discussion</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Type a discussion topic or pick one below..."
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, outline: "none", fontFamily: "inherit" }}
          />
          <button onClick={startDiscussion} disabled={!topic.trim() || discussing}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: !topic.trim() || discussing ? "#C4B5FD" : "#7C3AED", color: "white", fontSize: 12, fontWeight: 500, cursor: !topic.trim() || discussing ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
            {discussing ? "Discussing..." : "Start Discussion"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DISCUSSION_TOPICS.map(t => (
            <button key={t} onClick={() => setTopic(t)}
              style={{ padding: "3px 10px", borderRadius: 20, border: "1px solid #E5E7EB", background: topic === t ? "#EEEDFE" : "white", color: topic === t ? "#7C3AED" : "#6B7280", fontSize: 11, cursor: "pointer" }}>
              {t.slice(0, 40)}{t.length > 40 ? "..." : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {messages.length === 0 && !discussing && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", marginBottom: 4 }}>War Room is ready</div>
            <div style={{ fontSize: 12 }}>Select a topic and start a group discussion with your AI team</div>
          </div>
        )}

        {messages.map(msg => {
          if (msg.isUser) {
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <div style={{ maxWidth: "65%", padding: "10px 14px", background: "#7C3AED", borderRadius: "16px 16px 4px 16px" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "white", lineHeight: 1.5 }}>{msg.content}</p>
                </div>
              </div>
            );
          }
          const agent = AGENTS[msg.agentId];
          if (!agent) return null;
          return (
            <div key={msg.id} style={{ marginBottom: 16, animation: "fadeUp 0.3s ease" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <AgentAvatar agent={agent} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#1A1523" }}>{agent.name}</span>
                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: agent.bg, color: agent.textColor }}>{agent.title}</span>
                  </div>
                  <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px 16px" }}>
                    <RenderText text={msg.content} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {typingAgent && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, animation: "fadeUp 0.3s ease" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C3AED", animation: "pulse 1s ease-in-out infinite" }} />
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{typingAgent} is typing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* User input */}
      {messages.length > 0 && (
        <div style={{ padding: "12px 24px", borderTop: "1px solid #E5E7EB", background: "white", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={callAgent}
              onChange={e => setCallAgent(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 11, color: "#4B5563", cursor: "pointer", outline: "none", background: "white" }}
            >
              {Object.values(AGENTS).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <input
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendUserMessage(); } }}
              placeholder={`Ask ${AGENTS[callAgent]?.name} a question...`}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, outline: "none", fontFamily: "inherit" }}
            />
            <button onClick={sendUserMessage} disabled={!userInput.trim() || discussing}
              style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: !userInput.trim() || discussing ? "#C4B5FD" : "#7C3AED", color: "white", fontSize: 12, cursor: !userInput.trim() || discussing ? "not-allowed" : "pointer" }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 4: DECISIONS ─────────────────────────────────────────────────────────
function DecisionsTab() {
  const [decisions, setDecisions] = useState<Decision[]>(() => {
    try { return JSON.parse(localStorage.getItem("growvio-decisions") || "[]"); } catch { return []; }
  });
  const [redundantFiles, setRedundantFiles] = useState<RedundantFile[]>(() => {
    try { return JSON.parse(localStorage.getItem("growvio-redundant-files") || "[]"); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [showRedundantForm, setShowRedundantForm] = useState(false);
  const [form, setForm] = useState({ topic: "", decision: "", agents: "", status: "confirmed" as Decision["status"] });
  const [redundantForm, setRedundantForm] = useState({ filename: "", reason: "", flaggedBy: "" });

  const saveDecisions = useCallback((d: Decision[]) => {
    setDecisions(d);
    localStorage.setItem("growvio-decisions", JSON.stringify(d));
  }, []);

  const saveRedundant = useCallback((f: RedundantFile[]) => {
    setRedundantFiles(f);
    localStorage.setItem("growvio-redundant-files", JSON.stringify(f));
  }, []);

  const addDecision = () => {
    if (!form.topic || !form.decision) return;
    const d: Decision = {
      id: uid(), date: new Date().toLocaleDateString("en-IN"),
      topic: form.topic, decision: form.decision,
      agents: form.agents.split(",").map(s => s.trim()).filter(Boolean),
      status: form.status,
    };
    saveDecisions([d, ...decisions]);
    setForm({ topic: "", decision: "", agents: "", status: "confirmed" });
    setShowForm(false);
  };

  const addRedundantFile = () => {
    if (!redundantForm.filename || !redundantForm.reason) return;
    const f: RedundantFile = { id: uid(), ...redundantForm, approved: null };
    saveRedundant([f, ...redundantFiles]);
    setRedundantForm({ filename: "", reason: "", flaggedBy: "" });
    setShowRedundantForm(false);
  };

  const approveFile = (id: string, approved: boolean) => {
    saveRedundant(redundantFiles.map(f => f.id === id ? { ...f, approved } : f));
  };

  const approvedDeletions = redundantFiles.filter(f => f.approved === true);
  const gitDeleteCommand = approvedDeletions.map(f => `git rm ${f.filename}`).join("\n");

  const statusColors: Record<Decision["status"], { bg: string; color: string }> = {
    confirmed: { bg: "#D1FAE5", color: "#065F46" },
    pending: { bg: "#FEF3C7", color: "#92400E" },
    superseded: { bg: "#F3F4F6", color: "#6B7280" },
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1A1523" }}>Decisions Log</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Confirmed decisions — never contradict these</div>
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#7C3AED", color: "white", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
          + Add Decision
        </button>
      </div>

      {/* Add Decision Form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #E5E7EB", padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1523", marginBottom: 14 }}>New Decision</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} placeholder="Topic (e.g. Pricing)" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, outline: "none" }} />
            <textarea value={form.decision} onChange={e => setForm(p => ({ ...p, decision: e.target.value }))} placeholder="Decision made..." rows={3} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, resize: "vertical", outline: "none", fontFamily: "inherit" }} />
            <input value={form.agents} onChange={e => setForm(p => ({ ...p, agents: e.target.value }))} placeholder="Agents involved (comma separated)" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, outline: "none" }} />
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Decision["status"] }))} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, outline: "none", background: "white" }}>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="superseded">Superseded</option>
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addDecision} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#7C3AED", color: "white", fontSize: 12, cursor: "pointer" }}>Save Decision</button>
              <button onClick={() => setShowForm(false)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", fontSize: 12, color: "#6B7280", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Cards */}
      {decisions.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF" }}>
          <div style={{ fontSize: 12 }}>No decisions recorded yet. Add your first decision above.</div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {decisions.map(d => {
          const sc = statusColors[d.status];
          return (
            <div key={d.id} style={{ background: "white", borderRadius: 10, border: "1px solid #E5E7EB", padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1523" }}>{d.topic}</span>
                    <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 10, background: sc.bg, color: sc.color, fontWeight: 500 }}>{d.status}</span>
                    <span style={{ fontSize: 10, color: "#9CA3AF" }}>{d.date}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.5 }}>{d.decision}</div>
                  {d.agents.length > 0 && (
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
                      Agents: {d.agents.join(", ")}
                    </div>
                  )}
                </div>
                <button onClick={() => saveDecisions(decisions.filter(x => x.id !== d.id))}
                  style={{ fontSize: 11, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redundant Files Section */}
      <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1523" }}>Redundant Files</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Files flagged by agents during audits</div>
          </div>
          <button onClick={() => setShowRedundantForm(true)}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", fontSize: 11, color: "#4B5563", cursor: "pointer" }}>
            + Flag File
          </button>
        </div>

        {showRedundantForm && (
          <div style={{ background: "white", borderRadius: 10, border: "1px solid #E5E7EB", padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={redundantForm.filename} onChange={e => setRedundantForm(p => ({ ...p, filename: e.target.value }))} placeholder="File path (e.g. src/utils/oldHelper.ts)" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, outline: "none" }} />
              <input value={redundantForm.reason} onChange={e => setRedundantForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for deletion" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, outline: "none" }} />
              <input value={redundantForm.flaggedBy} onChange={e => setRedundantForm(p => ({ ...p, flaggedBy: e.target.value }))} placeholder="Flagged by (e.g. Arjun Mehta)" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, outline: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addRedundantFile} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#DC2626", color: "white", fontSize: 11, cursor: "pointer" }}>Flag File</button>
                <button onClick={() => setShowRedundantForm(false)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", fontSize: 11, color: "#6B7280", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {redundantFiles.length === 0 && (
          <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", padding: "20px 0" }}>
            No files flagged yet. Run audits and flag redundant files here.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {redundantFiles.map(f => (
            <div key={f.id} style={{ background: "white", borderRadius: 10, border: `1px solid ${f.approved === true ? "#FCA5A5" : f.approved === false ? "#D1FAE5" : "#E5E7EB"}`, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "#DC2626", marginBottom: 4 }}>{f.filename}</div>
                  <div style={{ fontSize: 12, color: "#4B5563" }}>{f.reason}</div>
                  {f.flaggedBy && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>Flagged by: {f.flaggedBy}</div>}
                </div>
                {f.approved === null && (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => approveFile(f.id, true)}
                      style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#FEE2E2", color: "#DC2626", fontSize: 11, cursor: "pointer", fontWeight: 500 }}>
                      Approve Deletion
                    </button>
                    <button onClick={() => approveFile(f.id, false)}
                      style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #E5E7EB", background: "white", color: "#4B5563", fontSize: 11, cursor: "pointer" }}>
                      Keep File
                    </button>
                  </div>
                )}
                {f.approved === true && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: "#FEE2E2", color: "#DC2626" }}>Approved for deletion</span>}
                {f.approved === false && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: "#D1FAE5", color: "#065F46" }}>Kept</span>}
              </div>
            </div>
          ))}
        </div>

        {approvedDeletions.length > 0 && (
          <div style={{ marginTop: 16, background: "#1A1523", borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>Git delete commands</div>
              <CopyButton text={gitDeleteCommand} label="Copy commands" />
            </div>
            <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 12, color: "#86EFAC", lineHeight: 1.6 }}>{gitDeleteCommand}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const TABS = [
  { id: "audit", label: "Audit", icon: "🔍" },
  { id: "questions", label: "Questions", icon: "❓" },
  { id: "warroom", label: "War Room", icon: "💬" },
  { id: "decisions", label: "Decisions", icon: "✅" },
];

export default function WarRoom() {
  const [activeTab, setActiveTab] = useState("questions");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      * { box-sizing: border-box; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", fontFamily: "DM Sans, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #E5E7EB", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0 0" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#7C3AED" }}>GrowVio</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>War Room</div>
          <div style={{ flex: 1 }} />
          <a href="/team" style={{ fontSize: 12, color: "#7C3AED", textDecoration: "none", padding: "6px 12px", borderRadius: 8, border: "1px solid #EEEDFE", background: "#EEEDFE" }}>
            ← AI Team
          </a>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
                borderBottom: activeTab === tab.id ? "2px solid #7C3AED" : "2px solid transparent",
                color: activeTab === tab.id ? "#7C3AED" : "#9CA3AF",
                fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                fontFamily: "inherit", transition: "all 0.15s",
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "audit" && <AuditTab />}
        {activeTab === "questions" && <QuestionsTab />}
        {activeTab === "warroom" && <WarRoomTab />}
        {activeTab === "decisions" && <DecisionsTab />}
      </div>
    </div>
  );
}
