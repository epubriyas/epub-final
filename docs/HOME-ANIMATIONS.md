# Homepage animation

The default homepage uses the supplied process-board reference with EPUBTRANS's existing Prepare, Transform, Review and Deliver workflow. No project durations or additional service claims were added.

- Hero: masked typography and a staggered opening of the existing editorial paper artwork.
- Services: sequential horizontal row entrances and restrained hover feedback.
- Workflow: curved SVG route drawing, stage checkpoints and staggered teal cards on a pale background. Reading order follows 01–04; desktop placement follows the curved route, and mobile uses a vertical ordered list. Mobile cards animate individually on entry.
- Portfolio artwork: restrained color transition.
- Company heading: warm text-edge emphasis.

One visibility observer triggers each element once. Reduced motion stops animation immediately; base HTML/CSS provides complete content without JavaScript. Existing CMS block layouts retain their own rendering. No animation dependency was added.

Validation: TypeScript, targeted ESLint, production build, and homepage browser checks. Browser checks cover 320–1920px layouts, reduced motion, static content without JavaScript, and automated accessibility checks for the process section in light/dark themes.
