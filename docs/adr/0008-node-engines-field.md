# Enforce Node.js 20.9+ via engines field

`package.json` will include `"engines": { "node": ">=20.9.0" }` to document and enforce Next.js 16's minimum Node requirement for CI and other developers.

**Considered options**: Rely on Next.js documentation only, with no engines constraint in the repo.
