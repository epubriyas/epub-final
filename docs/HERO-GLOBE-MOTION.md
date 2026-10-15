# Homepage Earth animation

The current hero is a real GPU-rendered, textured sphere. Continents rotate across its surface with fixed directional lighting, ocean highlights, a shaded hemisphere and a soft atmospheric rim. The surrounding mint/teal frame, caption and homepage content retain the site's branding. Mobile uses a taller local visual frame to keep the Earth legible.

Four service cards now connect the globe to EPUBTRANS's capabilities: Publishing, EPUB & XML, Localization and Accessibility. Each uses the existing service-directory category anchor, a consistent icon and restrained entrance/hover feedback. The cards remain keyboard-operable, readable over the image and available in the fallback view. They represent service categories, not office locations or live client activity. Verified links, no card collisions at 320/390/768/1440px, and mobile/desktop accessibility checks passed. Captures: `artifacts/clean-ui/earth-services-*.png`.

Reference: [Stripe's interactive globe engineering article](https://stripe.com/blog/globe). This is an independent implementation using native WebGL, not Stripe code or a claim of equivalent live network data. Connection paths are illustrative communication graphics, not client locations or operational activity.

## Rendering and controls

- `earth-renderer.ts` is dynamically imported after hydration. A full-screen shader projects a sphere and samples an equirectangular Earth texture; it does not rotate a flat photograph.
- One revolution takes approximately 55 seconds. Pointer movement gently adjusts the view; dragging and arrow keys rotate it directly.
- The caption contains a keyboard-accessible Pause/Resume control. It also pauses the decorative connection sweeps.
- Reduced motion renders a static Earth and stops automatic animation. Direct keyboard exploration remains available.
- IntersectionObserver and document visibility suspend animation when offscreen or in a hidden tab. ResizeObserver resizes the framebuffer, with device pixel ratio capped at 1.75.
- Cleanup releases shaders, texture, buffer, program, context, observers, event handlers and animation frames.
- JavaScript-disabled, missing-texture, unsupported-WebGL and context-loss cases retain the user's supplied translation image.

## Assets

Earth texture: `public/images/earth-daymap.jpg`, from [the three.js examples texture](https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg). The upstream project's license is retained at `public/images/earth-texture-LICENSE.txt`. No NASA attribution or asset ownership is inferred.

The user-supplied image remains `public/images/translation-globe.jpg`, unchanged, as the fallback. Its source and hash are preserved in the historical notes below.

## Verification

Production build, TypeScript and ESLint passed. Browser checks verified rendered rotation, mouse drag, keyboard exploration, pause/resume, offscreen suspension, live reduced-motion switching, accessibility, 320/390/768/1440/1920px layouts, WebGL/context-loss/texture-failure and JavaScript-disabled fallbacks. Headless GPU tests use SwiftShader explicitly; device frame rates depend on hardware. Final desktop and mobile captures are `artifacts/clean-ui/earth-3d-final-*.png`.

Regression checks: `tests/e2e/earth-hero.e2e.spec.ts`.

## Historical flat-image implementation

# Homepage translation globe

Replaces the previous editorial-workspace hero image at the user's request. All other homepage content, layout, brand colors and site-wide motion remain unchanged.

Asset: `public/images/translation-globe.jpg`, copied byte-for-byte from the user-supplied `D:/Epub V1 code/epub-old-file/public_html/assets/img/translation-services.jpg` (1500 × 799, 201870 bytes). Both SHA-256 hashes are `C2FFA18D40C755AF3006AC42E6110A243C06FA675EA9B6C9245DE885EB9AEC8D`. No image generation or modification was used. The image uses contain framing to preserve the wide composition.

Motion reference: [GSAP Demo Hub](https://demos.gsap.com/), particularly its scroll, cursor and SVG motion categories. The implementation uses native CSS and a throttled pointer handler, without an additional animation dependency.

- Masked reveal: 1600ms.
- Image settle: 2200ms, small scale/rotation settling into the final frame.
- Connection path: one 4400ms pass with a 300ms delay; no indefinite automatic animation.
- Pointer depth: mouse-only, at most 1.5°/2° rotation and 2.5px displacement, with requestAnimationFrame scheduling and a smooth reset on exit.
- Scroll drift: native view timeline where supported; static fallback elsewhere.
- Replay: keyboard-operable 44px control restarts the visual sequence.
- Reduced motion disables animation, transitions and pointer transforms, and hides replay. The image and caption remain visible without JavaScript.

Validation: TypeScript and ESLint; image loading, original asset hash, 320/390/1440/1920px overflow checks, mobile/desktop screenshot review, automated accessibility, pointer/reset, replay, live reduced-motion switching and JavaScript-disabled rendering. Screenshots are in `artifacts/clean-ui/translation-globe-*.png`.

Refresh fallback: the hero now uses earth-hero-poster.webp, a transparent still captured from the same renderer, instead of the historical translation-globe.jpg. The matching Earth appears before WebGL loads and remains available when JavaScript or the texture is unavailable.

## Connected network refinement — October 15, 2026

Audit: the existing implementation uses a dynamically imported native WebGL shader, a matching Earth poster, CSS motion and four localized service-directory anchors. No animation dependency was added. Previously, the two screen-space paths did not correspond to the cards. The current implementation gives each service its own projected globe point and curved connector. Geographic points are illustrative audience locations, not offices, coverage or live activity.

Interaction model: hover, keyboard focus and touch pointer-down select one service without intercepting navigation. Selection emphasizes its card, icon, connector and surface point, and gently adjusts the view and illumination. Paths on the far hemisphere fade to preserve depth. Selection changes immediately and CSS transitions remain interruptible. Existing labels, routes, colors and caption stay unchanged.

Timeline: staggered 700ms card arrival, independent 7s restrained card drift, 7–10.9s connection sweeps, continuous slow globe rotation. Pause freezes ambient CSS and WebGL motion. Hidden/offscreen scenes suspend motion. Reduced motion removes entrance, drift and sweeps and keeps a static globe. No per-frame React state updates; projection writes directly to four SVG groups. Mobile caps pixel ratio at 1.25, removes connector sweeps and places four readable links in a two-column grid below the globe.

Validation: production build and typecheck pass; repository lint passes with four existing unused-argument warnings in a migration. Three browser tests cover rotation, pause, keyboard exploration, visibility, reduced motion, accessibility, texture failure, JavaScript-disabled poster, service focus, navigation and mobile card bounds. Screenshots recorded at 320, 390, 768 and 1440px. Current fallback is earth-hero-poster.webp (supersedes older translation-image notes above).

Service labels refinement: the four globe cards now use the concrete service names Typesetting, eBook Creation, Translation and Accessibility, with layout, digital book, language and accessibility icons. Cards navigate directly to their corresponding canonical service pages. This supersedes the earlier category-anchor labels; globe rendering and interactions are retained.
