# Fix video player client navigation

ADR-0003 deferred fixing the client-side navigation quirk until post-upgrade verification. We now fix it proactively: hoist the Cloudinary Video Player script and CSS to the app shell (`layout.tsx`) and replace `CldVideoPlayer` with a thin custom wrapper that calls `window.cloudinary.videoPlayer()` directly on the home page. `CldVideoPlayer` resets its script-loaded state on remount while the cached script never fires `onLoad` again, leaving a blank player after client-navigating back to `/`.

**Considered options**: Minimal workaround keeping `CldVideoPlayer`; fork `next-cloudinary` with a `skipScript` prop.
