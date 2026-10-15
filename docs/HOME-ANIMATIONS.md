# Homepage animation

The homepage uses the supplied connected workflow reference and editable CMS workflow titles and descriptions. No project durations or additional service claims were added.

- Hero: masked typography and a shaded, textured 3D Earth with continuous rotation, drag/keyboard exploration, atmospheric lighting, illustrative connection sweeps and pause/resume controls; the supplied globe image remains the fallback. See `HERO-GLOBE-MOTION.md`.
- Services: sequential horizontal row entrances and restrained hover feedback.
- Workflow: a measured SVG curve follows the actual card positions, including after resizing or CMS copy changes. A light traces the route once over three seconds, coordinated with checkpoint pulses, icon entrances and staggered card reveals. Desktop retains the connected 01–04 layout and teal palette; pointer movement adds restrained perspective and a soft local highlight. Mobile uses a vertical ordered list and individually reveals cards on entry. Reduced motion disables these effects.
- Portfolio artwork: restrained color transition.
- Company heading: warm text-edge emphasis.

One visibility observer triggers each element once. Reduced motion stops animation immediately; base HTML/CSS provides complete content without JavaScript. Existing CMS block layouts retain their own rendering. No animation dependency was added.

Validation: TypeScript, targeted ESLint, production build, and homepage browser checks. Browser checks cover 320–1920px layouts, reduced motion, static content without JavaScript, and automated accessibility checks for the process section in light/dark themes.
