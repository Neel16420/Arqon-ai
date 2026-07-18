# ARQON Animation Context

## Philosophy
ARQON's animation system is built around three core principles:
1. **Meaningful Motion**: Animations are not just decorative. They explain the core value proposition — how traffic routes through the system.
2. **Performance First**: Zero React state updates per frame. All hot-path animations use a single `requestAnimationFrame` loop writing directly to SVG element DOM attributes for 60 FPS, GPU-accelerated motion without layout thrash.
3. **Accessibility**: Every animation conditionally bails out early if `(prefers-reduced-motion: reduce)` is set on the OS level, keeping the system compliant.

## Folder Structure
All animation-related code lives in `src/motion/`:
- `motionTokens.ts` - Single source of truth for all duration and easing presets.
- `useReducedMotion.ts` - Hook to listen for OS reduced-motion preferences.
- `usePacketAnimation.ts` - The core rAF-driven request/response packet engine.
- `useEngineBreath.ts` - The rAF-driven heartbeat animation for the central engine.

## Files Modified
- `src/motion/*` (Created)
- `src/components/RoutingDiagram.tsx` (Created)
- `src/pages/Overview.tsx` (Updated to mount `<RoutingDiagram />`)

## Architecture & Performance Decisions
- **`requestAnimationFrame` vs `setInterval`**: `requestAnimationFrame` synchronizes directly with the browser's display refresh rate (typically 60hz) and pauses automatically when the tab is in the background. This saves CPU and battery.
- **Direct DOM Manipulation**: React's reconciliation cycle is too heavy for 60 FPS continuous interpolation. The custom animation hooks (`usePacketAnimation` and `useEngineBreath`) receive a React `useRef` to an SVG element, but bypass React entirely by writing to `element.setAttribute()` and `element.style.transform` manually. This yields true zero-overhead GPU animations.
- **SVG Pathing**: The packet pathing is solved purely with math using a two-leg parametric lerp function (`evalPath`). This avoids relying on heavy SVG path-length DOM calculations.

## How Packet Animation Works
`usePacketAnimation` drives two packets:
- **Request Packet**: Starts at the Application node, travels to the central Engine, then curves to the selected Provider node.
- **Response Packet**: Follows the exact reverse path, staggered by a slight delay.

It evaluates their position along this path by normalizing the current time elapsed into a `0..1` progress value, pushing it through a cubic-bezier easing function (`easeInOut`), and directly updating the SVG `<circle>`'s `cx` and `cy`.

## How to Extend
To add new animated components:
1. Reference timing values from `src/motion/motionTokens.ts`. Do not hardcode magic animation numbers in components.
2. If you need continuous animation (spinners, pulses), use the `useRef` + `requestAnimationFrame` pattern seen in `useEngineBreath.ts`.
3. Wrap your hook logic with `const reduced = useReducedMotion(); if (reduced) return;` so it fails gracefully for users who prefer reduced motion.
