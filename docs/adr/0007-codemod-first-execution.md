# Codemod-first upgrade execution

The upgrade will be executed by running `npx @next/codemod@canary upgrade latest` as the primary step, followed by `pnpm install`, manual fixes for anything the codemod misses, and verification per ADR-0006. Manual `package.json` version bumps or a fresh scaffold are not the starting point.

**Considered options**: Manual version bumps with targeted ESLint codemod only; regenerate from `create-next-app`.
