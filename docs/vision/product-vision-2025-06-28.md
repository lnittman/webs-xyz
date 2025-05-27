# Product Vision - 2025-06-28

## Current Functionality Snapshot

The **Webs** platform is an AI-native research environment aiming to be a *Vercel-quality home for exploring the internet*. It accepts URLs as the primary input and layers AI-generated summaries and metadata to help users manage their reading queue. The repo is structured as a Turborepo containing four apps (`app`, `api`, `ai`, `email`) and a collection of shared packages (`design`, `auth`, `analytics`, etc.). Key features include:

- **URL submission & dashboard** – Users submit links in the `app` frontend. Processed URLs appear in a grid or list view grouped by domain.
- **AI summarization** – The `ai` app runs Mastra agents that fetch the URL, generate summaries, and store results.
- **Persistent storage & API** – The `api` app exposes REST/Next.js routes to create webs, save user settings, and trigger AI workflows.
- **Authentication** – Shared `auth` package wraps Clerk to manage user sessions across `app` and `api`.
- **Design system** – Components from `@repo/design` ensure UI consistency and dark-mode support.
- **Analytics** – Shared `analytics` package logs events via PostHog and Google Analytics.
- **Email templates** – The `email` app hosts React Email templates used by the API for notifications.

Recent state analysis (`repo-status-4.md`) reports an **85/100** health score with bundle optimizations completed and documentation coverage around **80%**. Dynamic imports like `BrowserTabsModal` keep client bundles under **500KB**. Remaining work focuses on feature improvements rather than performance tweaks.

## Ideation Framework

### Spark Phase – Concept Fragments
- Real-time collaborative annotation of saved webs
- Mobile-first micro UI with swipable cards
- Gamified learning streaks for daily reading
- AI agent marketplace for custom summarization styles
- Offline mode that caches top articles
- Visualization of knowledge graph connecting processed URLs
- Voice-driven URL submission
- Browser extension to clip pages directly into Webs
- Emotional tone: curiosity, playful exploration

### Shape Phase – Short-Form Concepts
1. **Collaborative Annotations**
   Users could highlight passages and leave comments on any processed web. Friends or teams see these notes in real time, encouraging shared research sessions.
2. **Swipeable Mobile UI**
   A compact card interface would let users swipe through webs on phones, marking them read or saving for later. This keeps interactions quick and thumb-friendly.
3. **Daily Reading Streaks**
   Introduce a streak counter and lightweight achievements to motivate regular use. Analytics hooks can track progress without being intrusive.
4. **Custom AI Agents Marketplace**
   Expose a catalog of AI agent presets. Users pick agents that suit their research style—concise summarizers, deep analyzers, or tone-adjusted summaries.
5. **Social Discovery Feed**
   Surface trending webs from the community so users can discover new content and follow what friends are reading.
6. **Knowledge Graph View**
   Display connections between processed URLs, revealing clusters and relationships. Helps users understand how topics intertwine.
7. **AI-Guided Browsing Sessions**
   Provide short interactive tutorials that walk users through curated reading paths using Mastra agents as guides.

### Plan Phase – Milestones & Questions
**Milestone 1 – Enhanced Dashboard (1–2 months)**
- Add swipeable card layout and social feed prototype.
- Begin building collaborative annotation backend via `api` and `ai` updates.
- Open questions: How will real-time updates scale? Which database changes are required?

**Milestone 2 – AI Marketplace & Streaks (3–4 months)**
- Introduce customizable agent presets surfaced in UI.
- Gamify reading with streak tracking and optional notifications.
- Open questions: What pricing or limits should apply to advanced agents? How to keep streak metrics privacy-friendly?

**Milestone 3 – Knowledge Graph & Guided Sessions (4–6 months)**
- Visualize connections between webs using graph libraries.
- Launch AI-guided browsing sessions as optional tutorials.
- Open questions: What data format best represents links between webs? How will guided sessions affect engagement?

### Vision Notes & Open Questions
- **User Roles**: Should teams and individual researchers use the same interface or have distinct permission models?
- **AI Capacity**: How will increased AI workload impact infrastructure? Mastra manages asynchronous agent execution, so monitor throughput rather than provisioning separate workers.
- **Privacy & Compliance**: Caching content offline and processing user data requires clear consent flows and data handling policies.
- **Monetization**: If advanced agents are paid features, the design system needs billing components and upgrade flows.
- **Community Sharing**: Could webs be published or embedded externally, turning them into shareable research nuggets?

The Webs project already delivers a lightweight AI-powered reading experience. By gradually layering collaborative tools, mobile-friendly interactions, and richer AI options, the platform can evolve into a comprehensive research companion while maintaining simplicity.
