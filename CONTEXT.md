# Cloudinary Video Demo

A minimal Next.js app that plays a Cloudinary sample video on the home page, with a separate static route for navigation testing.

## Language

**Full stack upgrade**:
Moving Next.js, React, and framework-tied dependencies to their latest major versions in a single initiative, rather than staging across multiple majors.
_Avoid_: Big bang (too vague), dependency refresh (too broad)

**Companion dependencies**:
Packages that must move in lockstep with the framework upgrade — e.g. `eslint-config-next`, `@types/react`, and `react-dom`.
_Avoid_: Dev dependencies (too generic), peer deps (implementation detail)

**Video player**:
The Cloudinary-hosted `samples/dance-2` asset rendered on the home page.
_Avoid_: Player component (implementation), media widget

**App shell player**:
The Cloudinary player script and styles loaded once at the layout level; the home page owns player initialization and disposal when it mounts and unmounts.
_Avoid_: Global player, persistent video

**Static route**:
A page with no Cloudinary dependency, used to verify routing works independently of the video player (e.g. `/12`).
_Avoid_: Fallback page, secondary page

**Upgrade initiative**:
A bounded piece of work with an explicit in-scope and out-of-scope list, distinct from open-ended maintenance.
_Avoid_: Migration (too generic), refactor

**Client-side navigation quirk** _(historical)_:
The behavior where the video player rendered a blank dark box after client-navigating back to `/` until a hard refresh. Fixed by the app shell player pattern (see ADR-0009).
_Avoid_: Video bug (too vague), player regression
