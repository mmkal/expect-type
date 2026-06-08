---
status: in-progress
size: small
---

# Fix TypeScript native-preview 7 compile errors

Status summary: task is just starting. The task file and branch/worktree setup are being committed first; the compile failure has not been reproduced or fixed yet.

- [ ] Reproduce the compile errors on `renovate/typescript-native-preview-7.x`.
- [ ] Update the library or test code so the branch compiles with `@typescript/native-preview@7.0.0-dev.20260608.1`.
- [ ] Run the relevant verification commands.
- [ ] Push the fix directly to `renovate/typescript-native-preview-7.x`.

## Assumptions

- The intended base branch is the existing remote branch `origin/renovate/typescript-native-preview-7.x`.
- This work should be pushed directly to that renovate branch after the fix, not to a new stacked branch.
- The compile failures are expected to be from TypeScript/native-preview behavior changes rather than an unrelated runtime feature request.

## Implementation Notes

- Worktree: `/Users/mmkal/src/worktrees/expect-type/renovate-typescript-native-preview-7.x`
