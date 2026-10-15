# Service page presentation update

The shared presentation for individual service pages has been tightened while keeping the EPUBTRANS teal, mint, and ivory palette, existing content, URLs, and quote actions.

## Page design

- Applied the exact warm ivory `#F4F2EB` from the visual reference as the full service-page canvas. Existing teal actions, white content cards, and mint call-to-action areas provide contrast for important company information and quote requests.
- Reduced service hero padding and capped its heading scale; widened the hero visual proportion for a more balanced text-and-image composition.
- Standardized service section spacing and constrained long-form copy to a more readable line length, while keeping comfortable type sizes.
- Gave capability, scope, quality, and related-service content a consistent hierarchy and compact card treatment.
- Added subtle borders, calmer rounded corners, and clear hover/focus states.
- Moved service photography between the short service summary and longer introduction on small screens so visitors see both the page purpose and its visual early.
- Reworked grouped introduction sections such as “Source Files and Deliverables” so the heading sits above the content, groups use the available desktop width in balanced columns, and mobile stacks them into one readable column. This removes the formerly empty left-side area without changing the approved copy.
- Reflowed capabilities into full-width editorial rows with aligned numbers, service names, and descriptions; detail lists use compact columns, quiet separators, and teal check markers instead of dot bullets. Intro and FAQ sections also place their headings above the content to avoid a tall, empty heading column.
- Tightened shared section padding and changed source-file, material, and scope lists from long single-column rows into compact two-column checklists, retaining one-column stacking on phones.
- Retained each service's full approved copy, workflows, FAQ, links, and existing illustration in its source-to-deliverable section.

## Images

Service-specific, photorealistic illustrative hero images live in `public/images/services/hero-*.webp`. Each public service route has a unique image mapped in `service-design.ts`, and those first-party assets take priority over repeated CMS uploads. The scenes are illustrative and do not claim to show EPUBTRANS staff or client work.

## Files

- `src/styles/services-polish.css` holds shared spacing, image, card, responsive, and dark-theme refinements.
- `src/styles/index.css` includes the stylesheet after the established service and motion rules.
- `src/components/services/ServiceHero.tsx` presents the summary, hero photo, and longer introduction in the intended responsive order.
- `src/config/service-design.ts` maps photographs and meaningful alternative text to service types.
- `next.config.ts` allows the new first-party service image path through the image optimizer.

## Verification

- Reviewed all 15 service routes at 1440, 1280, 1024, 768, 390, and 360px (90 viewport checks); no route overflowed or clipped its hero heading, visual, or CTA.
- Verified a service FAQ opens, quote actions retain their destination, and the quote-request route responds with its forms and controls in the local preview (no submission was made).
- `npm run typecheck` and `npm run build` passed. `npm run lint` passed with four existing warnings in the untouched `20261012_054530_vercel_private_storage.ts` migration.
