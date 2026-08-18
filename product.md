# Verquo — Product Context

> This document exists so any tool, IDE agent, or contributor can understand **what Verquo actually is** and **how it works**, without needing to read the full spec doc or reverse-engineer it from code. It reflects the real, currently-implemented route structure of this repo (`feat-candidate` branch), not just the idea.

---

## 1. What Verquo Is

Verquo is an **AI interview marketplace**. It sits between candidates and recruiters as a screening and discovery layer — it does **not** replace human hiring decisions.

**The core idea:** a candidate takes an AI-conducted interview *once*, gets a detailed AI-generated assessment report, and that report becomes a reusable, time-boxed "verified interview profile." Recruiters then search/filter candidates, watch the interview, read the report, and contact promising candidates directly (email/phone/LinkedIn) — all further hiring steps happen outside the platform.

Mental model: **"The GitHub of interviews."** Just like a GitHub profile is reusable proof of coding ability, a Verquo interview profile is reusable proof of interview performance.

### Problem it solves
- Candidates repeat near-identical screening interviews for every company they apply to.
- Recruiters manually screen large volumes of resumes with no efficient way to judge communication or depth before a live call.
- Hiring cycles are slow because early-stage screening is repeated, unstructured, and manual.

### What it explicitly does NOT do
- It does not say "hire this candidate" or produce a hire/no-hire verdict.
- It does not produce a global leaderboard/ranking of candidates ("Candidate Rank #12"). Instead recruiters filter by their own priorities (skills, experience, communication, etc.) and read strengths/weaknesses per candidate.
- It does not conduct the final hiring interviews — contact and next steps happen off-platform.

---

## 2. The Three Portals (User Types)

### Candidate
Builds a profile, connects GitHub/LinkedIn, takes AI interviews, receives a report, manages interview history, and controls whether their profile is visible to recruiters.

### Recruiter / HR
Searches and filters the candidate pool, opens candidate detail pages (profile / interview recording & transcript / AI assessment), compares candidates side-by-side, and contacts candidates externally.

### Admin
Manages platform users, moderates content, configures AI interview prompts/templates, views analytics, and manages subscriptions/plans.

Auth is role-aware: a person can hold multiple roles simultaneously (e.g. be a candidate and later be invited as a recruiter), so sessions are tracked **per role**, not per user, at the cookie layer.

---

## 3. Candidate Flow (end to end)

1. **Registration** — Email + OTP based signup/login (Google OAuth also supported). Optional identity/skill verification via LinkedIn, GitHub, LeetCode.
2. **Build Profile** — Name, photo, resume, skills, work experience, education, current company, salary expectation, notice period, preferred locations, portfolio/GitHub/LinkedIn links. Profile completeness gates interview eligibility (a candidate with missing required fields cannot start an interview yet).
3. **Select Interview** — Candidate picks:
   - **Domain**: Frontend / Backend / Full Stack / DevOps / Data Science / ML / Mobile
   - **Technology**: e.g. React, Node.js, Python, Docker, AWS
   - **Experience level**: Fresher / Junior / Mid / Senior
   - **Difficulty**: Easy / Medium / Hard
4. **AI Prepares Interview** — The AI reads the candidate's resume, GitHub projects, LinkedIn, and selected domain/tech/level, then generates a tailored question set (technical, follow-up, project-based, domain-specific).
5. **AI Interview Session** — A conversational, voice-based AI interviewer conducts a dynamic, context-aware interview: it asks follow-ups based on answers, discusses the candidate's actual projects, and probes technical depth + communication. It behaves like a human interviewer but never makes a hiring call.
6. **Data Captured** — Video, audio, transcript, interview timeline, AI notes, raw responses, and interview metadata/settings are stored against that interview attempt.
7. **AI Analysis** — The AI scores/analyzes:
   - Technical skills (domain expertise, framework depth, architecture understanding, problem-solving)
   - Communication (fluency, clarity, explanation quality)
   - Project knowledge (GitHub understanding, real-world decision-making)
   - Strengths and weaknesses (explicit lists, e.g. "Strong React fundamentals" / "Limited system design knowledge")
8. **Report Generated** — A structured assessment report is produced per interview: candidate + role + experience + difficulty + date, a technical skill breakdown (e.g. React: Advanced, System Design: Beginner), a communication breakdown, strengths, weaknesses, timestamped evidence clips ("08:14 — explained JWT clearly"), an overall AI narrative assessment, and a suggested salary range. The AI report is observational/advisory language only — never a hire/reject verdict.
9. **Interview Validity** — Each completed interview gets a validity window (roughly 3–6 months), shown as "Verified Until: <date>." After it lapses (or after a cooldown period), the candidate can retake the interview. Recruiters always see the candidate's latest verified interview, not stale ones.
10. **History & Dashboard** — Candidates can view stats, profile completion status, active/past interview reports, and a cooldown notice if they're not yet eligible to retake an interview.

---

## 4. Recruiter Flow (end to end)

1. **Search Candidates** — Filter by domain, technology, experience, location, salary expectation, notice period, interview difficulty, interview validity, communication score, and availability.
2. **Candidate Discovery** — Results shown as candidate cards (grid or list view): photo, title/experience, skills, interview status, salary expectation, AI summary, strengths, weaknesses, overall/technical/communication scores.
3. **Candidate Detail** — A candidate detail page with tabs:
   - **Profile tab** — resume, experience, education, GitHub, LinkedIn
   - **Interview tab** — recording, transcript, timeline
   - **Assessment tab** — technical profile, communication breakdown, strengths/weaknesses, evidence
4. **Compare** — Recruiters can select multiple candidates and compare them side-by-side on technical knowledge, communication, strengths/weaknesses, and salary expectations. No platform-wide ranking is ever shown — comparison is always scoped to the recruiter's own shortlist.
5. **Contact** — A contact action (modal) surfaces the candidate's email/phone/LinkedIn so the recruiter can reach out directly. Everything past this point happens off-platform.

---

## 5. Admin Flow

- **Dashboard** — Platform-wide analytics (interview volume, domain breakdown, usage trends).
- **Users** — Manage candidate/recruiter/admin accounts.
- **Templates** — Configure interview templates and AI prompt behavior per domain/technology/difficulty.
- **Subscriptions** — Manage recruiter-side plans/billing tiers.

---

## 6. Data Model Snapshot (what a "Candidate" record looks like)

A candidate record (as surfaced to recruiters) roughly contains:

```
id, name, photo, title, experience, location,
skills[], domain, technology, level,
salaryExpectation, noticePeriod,
interviewDate, validUntil, difficulty,
overallScore, communicationScore, technicalScore,
availability,
summary, strengths[], weaknesses[],
github, linkedin, email, phone
```

This is the shape recruiter-facing search, cards, detail, and compare views are built against.

---

## 7. Route Map (as actually implemented in this repo)

```
/                                        → Landing page
/continue                                → Unified auth (signup/login) via ?role&step&email

/candidate/dashboard                     → Stats, profile completion, active report snapshot
/candidate/profile/build                 → Multi-step profile builder
/candidate/interview-setup               → Domain/tech/level/difficulty selection
/candidate/interview                     → Live AI interview session
/candidate/processing                    → Post-interview "AI is analyzing" state
/candidate/report                        → Full AI assessment report
/candidate/history                       → Past interview attempts

/recruiter/search                        → Filterable candidate discovery (grid/list)
/recruiter/candidate/[id]                → Candidate detail (Profile / Interview / Assessment tabs)
/recruiter/compare                       → Side-by-side candidate comparison

/admin/dashboard                         → Platform analytics
/admin/users                             → User management
/admin/templates                         → Interview template / prompt config
/admin/subscriptions                     → Plan/billing management
```

Auth-related API routes (Next.js Route Handlers acting as a BFF): `send-otp`, `verify-otp`, `google`, `logout`, `me`. These set/clear **httpOnly, per-role cookies** (`candidate_token`, `recruiter_token`, `admin_token`) rather than using `localStorage`, so a single browser session can hold multiple role sessions at once.

---

## 8. Current Build Status (frontend)

- All three portals are scaffolded with real routes and layouts.
- Auth flow (email+OTP, Google OAuth, role-based BFF cookie sessions) is implemented.
- Candidate profile builder (5-step form: Basic Info, Skills & Experience, Education, Preferences, Connect Profiles) is implemented with shared UI primitives (Select, Checkbox, DatePicker, TagInput, EditableSelect) matching a consistent form API.
- Candidate dashboard, interview setup, interview session, processing, report, and history pages exist as routed pages.
- Recruiter search, candidate detail (tabbed), and compare pages exist.
- Admin dashboard, users, templates, subscriptions pages exist.
- **All data is currently mocked** (`data/mock.ts`) — there is no live backend integration yet; a separate backend developer owns the real API, and the frontend will swap mocked data for real API calls as that matures.
- Redux is wired up (`storeProvider`, `lib/store.ts`) primarily for auth state so far; broader state management adoption is planned, not yet complete.
- Video/audio capture, real-time AI voice interaction (WebRTC/Socket.io), and actual AI analysis are backend/infra concerns not yet built into the frontend — current interview/processing/report pages work against mocked report data.

---

## 9. Design Language (for consistency)

- **Stack**: Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/Radix primitives, react-hook-form + Zod, Sonner for toasts.
- **Tokens**: Primary teal `#1F5C52`, accent copper `#C07A3A`, cream background `#F5F3EF`. Display font Fraunces, mono font JetBrains Mono.
- Avoids generic "AI product" visual clichés (no gradients, glassmorphism, glowing blobs, spin/ping effects).
- Component conventions: new form primitives match `Input.tsx`'s prop API (`label`/`error`/`hint`, shared error styling); inline field errors (not toasts); component state derived from meaningful domain props (e.g. `missingFields`, `interviewTaken`) rather than arbitrary status enums.

---

## 10. Roadmap (not yet started, in rough priority order)

1. Wire candidate/recruiter/admin pages to the real backend API (replacing `data/mock.ts`).
2. Expand Redux usage beyond auth.
3. AI resume verification (detect fake projects/experience/keyword stuffing).
4. Deeper GitHub analysis (repos, commits, project quality).
5. Live/machine coding interviews with sandbox execution.
6. Private unlimited-attempt AI mock interview mode.
7. Interview replay with jump-to-timestamp chapters.
8. JD (job description) matching — recruiter uploads a JD, AI returns match % and missing skills.
9. Richer candidate comparison tooling.
10. Logo/brand mark for Verquo (currently shelved, no visual direction decided).

---

## 11. One-line Summary

**Verquo turns a single AI-conducted interview into a reusable, time-boxed, evidence-backed credential — so candidates prove themselves once, and recruiters discover and filter real interview performance instead of guessing from a resume.**
