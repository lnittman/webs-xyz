# WebGL Fluid Hero Animation

This document summarizes the fluid simulation used on the `www-internet-v2` home page hero and how to integrate a similar effect in other projects.

## Core Concepts
- **WebGL-based Fluid Solver**: The hero uses a WebGL 2 fluid simulation. It falls back to WebGL 1 when needed.
- **Half-Float Textures**: The solver relies on `OES_texture_float_linear` or equivalent WebGL 2 capabilities to store velocity and density using half-floating-point textures.
- **Multiple Framebuffers**: Separate framebuffers exist for velocity, density, curl, divergence and pressure. These are ping-ponged each frame.
- **Shader Passes**: Advection, divergence, curl and pressure passes run in sequence to evolve the fluid. "Splat" passes inject ink or velocity to keep the motion alive.
- **Configuration Parameters**: Dissipation rates, pressure iterations, curl strength and splat radius are controlled via a config object that is tuned for a smoky look.

## Replicating in Next.js / Tailwind
1. **Canvas Setup**
   - Create a full-screen `<canvas>` element positioned behind your content.
   - Initialize a WebGL 2 context and check for half-float texture support.
2. **Framebuffers and Shaders**
   - Allocate framebuffers for velocity and density with half-float textures.
   - Implement shader programs for advection, divergence, curl, vorticity and pressure steps.
   - Use ping-pong buffers so each pass writes to a new framebuffer.
3. **Interaction**
   - Add event listeners for pointer movements to generate "splats." Use the same radius and momentum as the reference hero for a soft fog effect.
4. **Performance Tuning**
   - Adjust resolution based on device pixel ratio.
   - Lower dissipation on desktop for longer trails; increase on mobile for speed.

Using Tailwind, you can size and position the canvas with utility classes. The logic lives inside a custom React hook or component.

## SwiftUI Approach (iOS)
For iOS, you can recreate the effect using two strategies:

1. **WKWebView with WebGL**
   - Embed a WKWebView running the same WebGL code. This is the quickest path and keeps parity with the web implementation.
   - Disable user interaction on the view so touches pass through if the hero is purely decorative.

2. **Metal Port**
   - Re-implement the solver using Metal compute shaders. Each shader pass (advection, divergence, curl, pressure) becomes a `MTLComputePipelineState`.
   - Metal provides better performance on iOS and gives you direct control over textures and framebuffers.
   - Use `MTKView` inside SwiftUI via `UIViewRepresentable` to render the simulation.

### SwiftUI Code Sketch
```swift
struct FluidHeroView: UIViewRepresentable {
    func makeUIView(context: Context) -> MTKView {
        let view = MTKView()
        // configure device, pipeline and framebuffers here
        return view
    }

    func updateUIView(_ uiView: MTKView, context: Context) {
        // run simulation step and draw
    }
}
```
This wrapper lets you integrate the Metal-based solver into any SwiftUI layout.

## Developer Kit Checklist
- [ ] WebGL/Metal shader code implementing the fluid solver
- [ ] Configuration file exposing resolution, dissipation and splat parameters
- [ ] Component or view wrapper for Next.js and SwiftUI
- [ ] Example of injecting random splats each frame to mimic fog
- [ ] README with build instructions for both platforms

With these pieces, you can achieve a hero animation that matches the quality of `www-internet-v2` while maintaining cross-platform flexibility.

