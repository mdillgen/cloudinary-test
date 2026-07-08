# Skip Cache Components for now

We will not enable `cacheComponents: true` or add `'use cache'` directives as part of this upgrade. The app has no data fetching, no server actions, and fully static routes — explicit caching adds configuration surface with no current benefit. Cache Components can be adopted when real data-fetching requirements appear.

**Considered options**: Enable `cacheComponents` in config without directives; enable and add directives proactively.
