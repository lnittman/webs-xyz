# WebGL Animations

This guide outlines how to reproduce the fluid hero effect from `www-internet-v2` in a Next.js/Tailwind project.

## Key Components
- Fluid solver implemented with WebGL 2 and half-float textures
- Ping-pong framebuffers for velocity, density, divergence, curl and pressure
- Shader passes for advection, divergence, curl, vorticity and pressure
- Splat injection each frame to maintain motion

See [../../architecture/webgl-fluid-hero.md](../../architecture/webgl-fluid-hero.md) for a deep dive into these techniques.

## System Prompt
Copy the prompt below into your AI agent. Follow with a user prompt describing the desired effect.

```prompt
<task>
  <description>Create or modify a WebGL animation in a Next.js/Tailwind app</description>
  <requirements>
    <requirement>Use the fluid solver from the sacred animations docs</requirement>
    <requirement>Expose parameters such as resolution, curl strength and splat radius</requirement>
    <requirement>Provide clean TypeScript components and hooks</requirement>
  </requirements>
</task>
```

This system prompt ensures the agent sets up the full simulation with configurable parameters. Combine it with a concise user prompt like **"make the smoke swirl faster"** or **"use a purple color palette"**.
