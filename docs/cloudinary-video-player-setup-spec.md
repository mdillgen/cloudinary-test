# Spec: Cloudinary Video Player setup that survives client-side navigation

> Portable spec for standing up a fresh Cloudinary **Video player** in a Next.js
> (App Router) app without the blank-player-on-return bug. Distilled from fixing
> the same issue in the `cloudinary-test` app (see ADR-0009).

## Problem Statement

A developer drops `next-cloudinary`'s `CldVideoPlayer` onto a page in a Next.js
App Router app. On first load the video plays fine. But after the user
client-navigates away to another route and then back to the page with the
player, the video area renders as a blank dark box and never plays again — only
a hard refresh recovers it. In some configurations, returning to the page throws
`TypeError: this.videojs.pctLoadedDevices is not a function` and crashes the
route entirely.

This is the **client-side navigation quirk**: the player is broken by
client-side navigation, not by first load.

## Solution

From the developer's perspective: set up the Cloudinary Video Player as an
**App shell player** — load the player's script and CSS **once** at the layout
(app shell) level, and let each page that shows video own a thin wrapper that
initializes the player on mount and fully disposes it on unmount. The wrapper
talks to `window.cloudinary.videoPlayer()` directly instead of relying on
`CldVideoPlayer`'s internal script-load state.

The result: the video plays on first load, and continues to play every time the
user client-navigates back to the page — no hard refresh, no crash.

## User Stories

1. As a developer, I want to add a Cloudinary video to a page, so that visitors see the video content on first load.
2. As a developer, I want the video to keep working after the user navigates away and back, so that I don't ship a visibly broken page.
3. As a developer, I want the player script loaded once at the app shell, so that navigating between pages does not re-download or re-race the script.
4. As a developer, I want the player CSS available on every route that might show video, so that the controls and layout render correctly without a flash of unstyled player.
5. As a developer, I want the player to initialize only after the Cloudinary global is available, so that I never call `videoPlayer()` before the script has loaded.
6. As a developer, I want the player fully disposed when the component unmounts, so that stale video.js instances do not accumulate or collide on re-entry.
7. As a developer, I want a fresh `<video>` element created on each mount, so that a disposed element is never reused and the `pctLoadedDevices` crash cannot occur.
8. As a developer, I want the cloud name read from an environment variable, so that the same code works across demo and production Cloudinary accounts.
9. As a developer, I want a clear error when the cloud name is missing, so that a misconfigured environment fails loudly instead of rendering a blank box.
10. As a developer, I want player options (autoplay, loop, muted, controls, transformations) declared in one place, so that I can tune playback without touching lifecycle code.
11. As a visitor, I want the video to autoplay muted and loop, so that the page feels alive without unexpected sound.
12. As a visitor, I want to click a link to another page and come back, so that the video is still playing when I return.
13. As a visitor on a route with no video, I want that route to load independently of Cloudinary, so that a video/config problem never breaks unrelated pages.
14. As a developer, I want a single browser-level test covering the navigate-away-and-back flow, so that this regression is caught before release.
15. As a developer porting this into another app, I want the setup to be framework-idiomatic (App Router, `next/script`), so that it composes with the rest of the app.
16. As a developer, I want the placeholder box to keep its dimensions while the player initializes, so that layout does not shift when the video appears.

## Implementation Decisions

### Modules

- **App shell (root layout).** Loads the Cloudinary Video Player script and CSS exactly once for the whole app.
  - CSS via a `<link rel="stylesheet">` in `<head>`.
  - Script via `next/script` with `strategy="afterInteractive"`, rendered once in the layout body. A single, stable script `id` lets Next dedupe it.
- **Player config module.** A small non-React module that centralizes:
  - The pinned player version and the derived script/CSS URLs.
  - An `isCloudinaryReady()` guard (`typeof window !== "undefined" && "cloudinary" in window`).
  - A `buildPlayerOptions()` factory that reads `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, throws a descriptive error if absent, and returns the player options object (publicId, transformations, autoplay/loop/muted/controls, aspect ratio, etc.).
- **Video player wrapper (client component).** A `"use client"` component that owns the player lifecycle:
  - Renders a container `<div>` (the sizing/placeholder box). It does **not** render the `<video>` element in JSX.
  - In a mount effect: waits for `isCloudinaryReady()` (poll on a short interval if the script hasn't loaded yet), then imperatively creates a fresh `<video>` element, appends it to the container, and calls `window.cloudinary.videoPlayer(el, options)`.
  - On unmount: runs a defensive dispose and removes the `<video>` element.

### The App shell player pattern (the core decision)

`CldVideoPlayer` couples script loading to component mount: it tracks
`isScriptLoaded` in component state and initializes the player from that
component's own `<Script onLoad>`. On a remount after client navigation, the
state resets to "not loaded", but the browser has the script cached and does not
fire `onLoad` again — so the player never re-initializes and the box stays
blank. Decoupling script loading (app shell, once) from player lifecycle (per
page mount) removes the race entirely.

### Defensive, layered disposal (prevents `pctLoadedDevices` crash)

The crash on return navigation comes from an incompletely torn-down video.js
instance being reused. Dispose must be layered and each layer wrapped so a
failure in one does not skip the others:

1. `player.videojs?.cloudinary?.dispose?.()`
2. `player.videojs?.dispose?.()`
3. `player.dispose?.()`

Combined with **creating a brand-new `<video>` element on every init** (never
reusing a disposed element), this guarantees each mount starts from a clean
DOM + player state.

### Init-time precondition checks

`videoPlayer()` must never be called when:
- the component has already been disposed (guard with a captured `disposed` flag), or
- the container ref is gone, or
- `window.cloudinary` is not present yet.

### Environment / config contract

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is **required** to build player options. Missing → throw with a clear message.
- The public sample `samples/dance-2` on Cloudinary's shared `demo` cloud lets the setup run with no account (set the env var to `demo`).
- Player version is **pinned** (e.g. `1.11.1`) so script and CSS URLs stay in lockstep.

### API contracts / types

- Augment the global `Window` type so `window.cloudinary.videoPlayer(element, options)` is typed.
- Player options are passed as a plain options object; keep it `Record<string, unknown>`-compatible to avoid fighting upstream types.

### Route independence

Any **static route** that does not show video must not depend on Cloudinary in
any way, so that a video/config failure can never break unrelated pages. The
shell only *loads* the script/CSS; it never *initializes* a player, so shell-level
inclusion is safe for video-free routes.

## Testing Decisions

### What makes a good test here

Test **external, user-observable behavior** through the highest possible seam —
the browser navigating between real routes — not the player's internal state or
private methods. A good test drives the same actions a user would and asserts on
what the user would see (a working video vs. a blank box / crash).

### The single seam

- **Seam:** browser-level client-side navigation across real routes.
- **Flow under test:**
  1. Load the route that contains the **Video player**; assert the player initialized and video is playing (e.g. a `.video-js`/`video` element is present and `currentTime` advances, or the player reports `readyState`/`playing`).
  2. Client-navigate (Next `<Link>`, not a full reload) to a **static route** with no video; assert it renders.
  3. Client-navigate back to the video route; assert the player re-initialized and video is playing again, and that **no** uncaught error (specifically `pctLoadedDevices is not a function`) occurred.

Prefer one end-to-end test at this seam over multiple unit tests of the wrapper's
internals. This is the exact regression that manual and automated testing must
cover.

### Modules tested

- Only the composed app through the browser seam. The player config module's
  `buildPlayerOptions()` error path (missing cloud name) may additionally get a
  tiny unit test, since it is pure and has a clear contract.

### Prior art

- In the origin app this was validated with a **manual smoke test** (`/` → other
  route → `/`, confirm playback resumes) per the app's verification-gate ADR.
  A Playwright test at the same seam is the natural automated equivalent if the
  target app already has (or wants) e2e infrastructure.

## Out of Scope

- **Persistent / continuous playback across routes** (a player that survives in the layout and keeps playing while the user is on other routes). This spec fixes re-initialization on return; it does not keep a single player alive across navigations.
- **Patching or forking `next-cloudinary`** to add a `skipScript` prop. The wrapper deliberately bypasses `CldVideoPlayer` instead.
- **Loading UX** beyond preserving the placeholder box (no spinner/skeleton is specified).
- **Multiple simultaneous players on one page.** The pattern supports it in principle (unique element ids, per-instance dispose) but it is not specified or tested here.
- **Non-App-Router (pages/) setups.**
- **Server-side rendering of the player.** The player is inherently client-only.

## Further Notes

- Upstream context: `next-cloudinary` shipped a fix for the route-change issue
  in **v6.16.2** (issue #572 / PR #602). If the target app can simply upgrade
  `next-cloudinary` to ≥ 6.16.2 and use `CldVideoPlayer` normally, that may be
  the lighter path. This spec's **App shell player** wrapper is the approach to
  take when you want explicit lifecycle control, are pinning to an older
  version, or hit the blank-box/crash behavior despite using the component.
- Keep the player version pinned and the script/CSS URLs derived from that
  single constant, so upgrades are a one-line change.
- The `afterInteractive` script strategy is sufficient because the wrapper polls
  `isCloudinaryReady()`; the player initializes as soon as the global appears,
  regardless of exact script-load timing.
