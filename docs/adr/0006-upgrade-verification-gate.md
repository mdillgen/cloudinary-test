# Build, lint, and manual smoke test as upgrade gate

The upgrade is complete when `pnpm build` and `pnpm lint` both pass, and a manual smoke test confirms `/` plays the Cloudinary video, `/12` loads, and client-side navigation back to `/` is checked for regression per ADR-0003. No new automated e2e suite is required for this initiative.

**Considered options**: Build-only gate; add Playwright e2e before upgrading.
