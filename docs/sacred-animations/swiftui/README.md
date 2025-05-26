# SwiftUI Animations

This guide covers building the same hero effect on iOS using Metal and SwiftUI.

## Key Components
- Metal-based fluid solver mirroring the WebGL implementation
- Texture setup using `MTLTextureDescriptor` with half-float pixel formats
- Command buffers performing advection, divergence, curl and pressure passes
- `MTKViewRepresentable` wrapper to embed the Metal view in SwiftUI
- Parameter configuration struct for resolution, dissipation and splat behavior

## System Prompt
Use the prompt below to direct an AI agent when building a SwiftUI/Metal animation.

```prompt
<task>
  <description>Create or modify a Metal fluid animation for SwiftUI</description>
  <requirements>
    <requirement>Match the WebGL solver feature parity</requirement>
    <requirement>Expose parameters via a Swift struct</requirement>
    <requirement>Ensure the code is ready for integration into an iOS app</requirement>
  </requirements>
</task>
```

Provide a separate user prompt describing your visual goals, for example **"use soft blue ink"** or **"increase the turbulence"**.
