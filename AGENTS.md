# AGENTS.md

## Cursor Cloud specific instructions

This is a small Next.js 15 (App Router, Turbopack) app that plays a Cloudinary
sample video. Package manager is **pnpm** (`pnpm-lock.yaml`). Standard commands
live in `package.json`: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`.

Non-obvious caveats:

- **Cloudinary cloud name is required to load the home page.** `src/app/video.tsx`
  uses `next-cloudinary`'s `CldVideoPlayer`, which throws
  `A Cloudinary Cloud name is required ...` and makes `/` return HTTP 500 unless
  `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set. The `samples/dance-2` asset is a
  public sample on Cloudinary's shared `demo` cloud, so a local `.env.local` with
  `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=demo` makes the app run with no account.
  `.env.local` is gitignored; the update script recreates it if missing.
- The `/[id]` route (e.g. `/12`) is static and has no Cloudinary dependency, so it
  loads even without the env var.
- Known pre-existing app quirk (not an environment problem): when navigating
  back to `/` via client-side nav, the video player can render a blank dark box
  until a hard refresh. Do not "fix" this as part of environment setup.
