# Shared site motion

The public layout now loads a single motion controller. Visual direction: the fluid pacing of https://riyas-portfolio-phi.vercel.app/, while preserving EPUBTRANS layouts, colors, content and existing diagrams.

## Scroll behavior

Lenis 1.3.26 eases wheel scrolling over 1.6 seconds using a bounded exponential curve and `lerp: 0`. Its standard window scroller preserves document geometry, fixed navigation and browser scroll restoration. Touch uses native momentum. Keyboard input and link clicks stop pending inertia so anchor destinations and focus remain predictable. Browser anchors retain native URL, focus and scroll-margin behavior. Hidden tabs destroy the scrolling instance and recreate it when visible, avoiding a background animation loop.

Body scroll locks and native modal dialogs pause the background controller. Dialogs, mega menus, the assistant, readers, textareas, selects and nested scrolling regions keep native scroll handling. Route changes destroy the old instance and observers before creating the next; admin routes do not mount this controller.

## Animation

A shared visibility observer reveals headings, introductory copy and editorial/catalog cards with 1000ms transform-only entrances (700ms and a shorter travel distance on mobile) and short capped staggering. Complete text stays visible at full contrast. Eligible photographic frames get a restrained 1150ms crop-and-scale reveal. Existing home, service, company, blog and transformation sequences keep their own animation ownership, avoiding duplicate animation ownership. Focus cancels an entrance on its containing card. Pointer devices also receive a small 3px lift on eligible cards.

Selected clipped photographic images use CSS view-timeline movement where supported, with static fallback elsewhere. Buttons and arrow links share the existing easing curve. Service motion tokens now match the slower cadence. Layout dimensions and typography are unchanged.

Reduced motion disables scroll interpolation, cancels pending/running entrances and suppresses photographic movement. Preference changes are handled live. Server-rendered content remains usable without JavaScript.

## Verification

The browser suite includes actual wheel interpolation and settling, hash destinations, route changes, quote navigation, live reduced-motion switching, no-JavaScript content, and scrolling inside a zoomed sample viewer while the background remains locked. Broader checks cover public route layouts, mobile menus, service controls, portfolio readers and automated accessibility. Performance varies by device; no universal frame-rate guarantee is implied.

Dependency reference: https://github.com/darkroomengineering/lenis

## October 15 reference refinement

Reviewed https://shalomconstructions.in/ in a browser and inspected its public animation initializer. Its Lenis configuration uses a 1.8-second exponential easing curve alongside GSAP and scroll reveals. EPUBTRANS retains its existing Lenis dependency and native Web Animations controller; no GSAP, copied site code, extra scroll wrapper or new dependency was added. The reference informed pacing rather than content or visual design.

Four motion browser tests passed: wheel progression and settling, cross-route hash navigation, quote navigation, reduced-motion changes, content without JavaScript, modal scrolling and photographic reveals at desktop/tablet/mobile widths. A 600px wheel input settled at 600px without overshoot in the local browser sample. No universal performance or frame-rate guarantee is implied. Layouts, colors, typography, navbar structure, approved copy and existing illustration animations are preserved.

Final checks: production build passed; 22 integration files / 100 tests passed; 20 production browser tests passed. Responsive coverage included 60 public URLs at 10 viewport widths (unpublished URLs retain their responsive 404). The modal check confirms zoomed preview scrolling while the background stays locked.

