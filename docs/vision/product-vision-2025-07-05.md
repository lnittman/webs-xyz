# Product Vision - 2025-07-05

## Current Functionality Snapshot

The **Webs** project acts as an AI-native research companion. Users paste a URL (or many) on the home page and a background job creates a "web" with analysis powered by the `ai` service. Recent state analysis (`repo-status-5.md`) shows an overall health score of **86/100**, with documentation around **82%** and client bundles under **500KB** thanks to dynamic imports.

Key features already live:

- **URL prompt submission** from the main `app` interface kicks off async web creation.
- **Mastra agents** in `apps/ai` fetch and summarize the provided pages.
- **REST API** in `apps/api` persists webs and exposes them back to the frontend.
- **Authentication & design system** packages keep the experience consistent across apps.

## Ideation Framework

### Spark Phase – Concept Fragments
- URL-native prompting that feels like pasting links into a chat
- Async processing workflow (Mastra) returning structured results
- Chat thread per web with context preserved
- Visual dashboard of webs, needs improved readability
- Entities & additional URLs extracted – maybe too noisy
- AI summaries, tags, and suggestions for follow-up
- Public/private webs, ability to fork and share
- Configurable refresh intervals for re-analysis
- Mobile-friendly interaction
- Potential for networked knowledge graphs

### Shape Phase – Short-Form Concepts
1. **Focused Summaries & Tags**
   - Filter noisy entity extraction into concise summaries with recommended next links or actions. Provide tag chips for quick filtering.
2. **Enhanced Web Page UI**
   - Combine the chat thread and analysis results into a single, scrollable view. Emphasize readability with cards for each analysis section.
3. **Forkable & Shareable Webs**
   - Allow users to duplicate a web and keep it public or private. Shared webs become collaborative research nuggets.
4. **Timed Re-analysis**
   - Users can schedule a refresh of any web, letting the Mastra workflow update summaries or collect new links.
5. **Knowledge Graph Visualization**
   - Display connections between webs and extracted entities to reveal topic clusters.

### Plan Phase – Milestones & Questions
**Milestone 1 – Better Web Pages (1–2 weeks)**
- Implement new layout showing chat alongside AI summaries and tags.
- Reduce entity noise by adjusting the Mastra workflow output.
- **Open question:** What structured fields are most valuable to display first?

**Milestone 2 – Sharing & Forking (1 month)**
- Add ability to mark webs public and generate shareable links.
- Allow users to duplicate a web into their own workspace.
- **Open question:** How do permissions work across public forks?

**Milestone 3 – Knowledge Graph & Refresh Scheduling (2–3 months)**
- Visualize relationships between webs and recurring topics.
- Enable optional re-processing intervals for updated summaries.
- **Open question:** What infra is required for periodic jobs in Mastra?

## Vision Notes & Open Questions
- How do we balance simple UI with advanced AI options?
- Should webs support multiple prompts over time or only one per URL?
- What metrics confirm that the new UI/UX makes the data more digestible?

