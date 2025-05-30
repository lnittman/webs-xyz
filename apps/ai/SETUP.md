# AI App Setup Guide

## Environment Variables

To run the AI app properly, you need to set up the following environment variables:

### Required Variables

```bash
# OpenRouter API Key for AI model access
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Database configuration for Mastra storage and memory
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webs_memory
```

### Optional Variables

```bash
# Jina API Key for enhanced web scraping (optional)
JINA_API_KEY=your_jina_api_key_here

# PostgreSQL connection details (alternative to DATABASE_URL)
PGHOST=localhost
PGUSER=postgres
PGDATABASE=webs_memory
PGPASSWORD=postgres
PGPORT=5432
```

## Common Issues and Solutions

### 1. "Invalid JSON response" Error

This error occurs when the web-analyzer agent doesn't return valid JSON. The workflow now handles this gracefully and will return error information instead of crashing.

### 2. OpenRouter API Key Missing

If you see warnings about missing OPENROUTER_API_KEY, make sure to:
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Set it in your environment variables

### 3. Database Connection Issues

Make sure your PostgreSQL database is running and accessible with the provided connection string.

### 4. Memory Deprecation Warnings

The memory configuration has been updated to use shared storage and explicit options to resolve deprecation warnings.

## Getting Started

1. Copy the environment variables above to your `.env` file
2. Replace the placeholder values with your actual API keys
3. Ensure your PostgreSQL database is running
4. Run `npm run dev` to start the development server

## Troubleshooting

If you continue to experience crashes:

1. Check that all environment variables are properly set
2. Verify your database connection
3. Ensure your OpenRouter API key is valid
4. Check the console for specific error messages 