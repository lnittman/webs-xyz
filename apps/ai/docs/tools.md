# Tools

Mastra tools extend agent capabilities. To add a new tool such as a news summariser or data fetcher:

1. Create a file under `src/mastra/tools/` exporting the tool with `createTool`.
2. Update the agent or workflow to import and register the tool.
3. If the tool requires prompts, store them in `src/mastra/prompts` or `docs/`.
4. Redeploy the AI service so the new tool is available.

The news summariser uses the template in `docs/news/summary_template.md`. Data fetchers can call external APIs or scraping utilities.
