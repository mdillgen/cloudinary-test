# Target Next.js 16 with React 19 stable

We will upgrade to the full latest stack — Next.js 16, React 19 stable, and matching companion dependencies — rather than stopping at the latest Next.js 15 patch. The codebase is small (two routes, one client component), already on React 19 RC and Turbopack, so the incremental risk of a major bump is low while the cost of deferring Next 16 (async API removals, ESLint flat config, `next lint` removal) would mean revisiting the same work soon.

**Considered options**: Stay on Next 15 latest patch with React 19 stable only.
