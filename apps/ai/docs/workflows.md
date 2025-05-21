# Workflows

Workflows orchestrate multiple steps to fetch and parse data. The existing `transfermarkt` workflow is defined in `src/mastra/workflows/transfermarkt.ts`:

```ts
export const transfermarktWorkflow = new Workflow({
  name: 'transfermarkt',
  triggerSchema: z.object({
    url: z.string(),
    prompt: z.string(),
    schema: z.any()
  })
})
  .step(fetchPage)
  .then(parsePage);
```

To create a new workflow for data updates:

1. Add a file under `src/mastra/workflows` exporting a `Workflow` instance.
2. Define individual `Step` objects to fetch data or call tools.
3. Register the workflow in `src/mastra/index.ts`.
4. Trigger it from cron jobs or background workers.

For large workloads consider using a queue or an Inngest function so jobs run asynchronously. Instrument each step with analytics from `@repo/analytics` to monitor execution.
