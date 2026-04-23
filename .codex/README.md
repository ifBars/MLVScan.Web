# Local Codex Worktree Environment

This folder is local-only and is ignored by git.

## Bootstrap

Codex setup runs:

```powershell
.\.codex\scripts\setup-worktree.ps1
```

That script:

- enters `$CODEX_WORKTREE_PATH`
- verifies `bun` is available
- runs `bun install` only when dependencies look stale or missing

## Helpers

```powershell
.\.codex\scripts\doctor-worktree.ps1
.\.codex\scripts\cleanup-worktree.ps1
.\.codex\scripts\cleanup-worktree.ps1 -IncludeDependencies
```

- `doctor-worktree.ps1` checks the basic local setup and shows `git worktree list`
- `cleanup-worktree.ps1` removes local build artifacts and temporary logs
- `cleanup-worktree.ps1 -IncludeDependencies` also removes `node_modules`
