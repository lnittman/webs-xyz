# Testing Patterns and Utilities

This document collects effective patterns and utilities discovered while expanding test coverage.

## Effective Patterns
- **Factory Functions**: Use test data builders to reduce duplication.
- **Custom Matchers**: Encapsulate domain specific assertions for clarity.

## Testing Utilities
- **Mock Setup Helpers**: Simplify mocking of third-party services like Sentry or Svix.

## Coverage Strategies
- **Edge Case Focus**: Prioritize boundary conditions such as missing environment variables.
- **Isolation**: Each test resets environment state to avoid coupling.
