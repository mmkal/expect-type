---
status: complete
size: small
---

# Fix TypeScript native-preview 7 compile errors

Status summary: done. The native-preview compiler failure was reproduced with `pnpm tsgo`, fixed by explicitly including Node ambient types in `tsconfig.json`, and verified with the local package checks.

- [x] Reproduce the compile errors on `renovate/typescript-native-preview-7.x`. _Reproduced with `pnpm tsgo`; tsgo could not resolve `node:*` imports or `__dirname`._
- [x] Update the library or test code so the branch compiles with `@typescript/native-preview@7.0.0-dev.20260608.1`. _Added `compilerOptions.types: ["node"]` in `tsconfig.json` so tsgo loads the same Node ambient types that the tests rely on._
- [x] Run the relevant verification commands. _Ran `pnpm type-check`, `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm arethetypeswrong`, and `pnpm tsgo`._
- [x] Push the fix directly to `renovate/typescript-native-preview-7.x`. _Pushed with the implementation commit on the renovate branch._

## Assumptions

- The intended base branch is the existing remote branch `origin/renovate/typescript-native-preview-7.x`.
- This work should be pushed directly to that renovate branch after the fix, not to a new stacked branch.
- The compile failures are expected to be from TypeScript/native-preview behavior changes rather than an unrelated runtime feature request.

## Implementation Notes

- Worktree: `/Users/mmkal/src/worktrees/expect-type/renovate-typescript-native-preview-7.x`
- Root cause: `@typescript/native-preview@7.0.0-dev.20260608.1` does not auto-load the Node ambient declarations in this project the way the current `tsc` path does. The error output explicitly requested adding `node` to the `types` field.
- Fix: set `compilerOptions.types` to `["node"]` in the shared config. Vitest imports still resolve through normal module resolution, so no Vitest ambient type entry was needed.
