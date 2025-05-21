# Apps/AI Mastra Extension Plan

This document outlines a set of enhancements for the `apps/ai` project. The goal is to grow beyond the existing chat agent and simple workflow by introducing new tools, scalable workflows and better data handling.

## 1. New Custom Tools

- **Transfermarkt Scraper Tool** – Fetches and cleans player and match data directly from Transfermarkt. Will be used by workflows to populate the database.
- **News Summarizer Tool** – Uses the Mastra `generate` API with a summarization prompt. Takes raw articles and returns structured summaries using the template in `docs/news/summary_template.md`.
- **Translation Tool** – Wraps a translation model on OpenRouter so content can be localized. Accepts target language and text.
- **Vector Query Tool** – Provides semantic search over stored articles or match data using Mastra's `createVectorQueryTool`.
- **Schedule Fetch Tool** – Enqueues jobs for periodic updates. Intended to be called from workflows so large updates can run asynchronously.

## 2. Workflow Improvements

- **Data Update Workflow**
  1. Triggered with a list of URLs or identifiers.
  2. Fetch each page using the Scraper Tool.
  3. Parse with LLM to extract structured fields.
  4. Store results in the database.
  5. Optionally summarize articles and store vectors for retrieval.

- **Concurrency & Retries** – Use vNext workflow features like `foreach()` with the `concurrency` option to process many pages in parallel. Include retry logic when tools fail.

- **Suspend & Resume** – Allow long‑running updates to pause if manual review is required. Operators can inspect parsed data and resume the workflow with corrections.

- **Incremental Updates** – Maintain timestamps of the last successful run and use them to fetch only new content.

## 3. Processing Data at Scale with LLMs

- **Chunking & Embedding** – Break large articles into chunks and embed them using OpenRouter or other models. Store vectors in PostgreSQL (via `@mastra/pg`) for semantic recall.
- **Batch Generation** – For efficiency, batch multiple summarization or translation requests when possible.
- **Queue Based Execution** – Long running LLM calls should be queued. The Schedule Fetch Tool can push jobs to a worker queue processed by dedicated workers.

## 4. Missing Pieces

- **Observability** – Add tracing and logging via Mastra telemetry to debug multi‑step workflows.
- **Automated Evals** – Define evaluation metrics to track summary quality and translation accuracy.
- **Comprehensive Memory** – Current chat agent memory is minimal. Implement semantic recall with a vector store so conversations can reference older matches and news items.

## 5. What Works Well Today

- **Clear Separation of Agents and Workflows** – The existing code cleanly separates the chat agent from the Transfermarkt workflow.
- **Use of OpenRouter Models** – Leveraging OpenRouter allows quick access to a variety of models.
- **Simple Prompt Loading Utilities** – The `loadPrompt` helper keeps agent instructions externalized and easy to modify.

By implementing the tools and workflow changes above, the `apps/ai` project will evolve into a richer system capable of keeping its football data fresh, providing summarized news, and supporting multilingual interactions.
