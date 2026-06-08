---
title: "Isolating one effort in a git worktree while other sessions share the branch"
date: 2026-06-08
tags: [git, workflow, deployment]
category: pattern
module: deployment
symptoms:
  - "uncommitted changes mixed with another session's work on the same branch"
  - "want to commit/push/PR one effort without disturbing concurrent work"
  - "git branch shows feature/X but my edits are unrelated"
---

# Isolating one effort in a git worktree while other sessions share the branch

## Problem
Multiple agents/sessions were working in the *same* checkout (the design effort and a deal-sourcing
effort both landing on `feature/buybox-sourcing`, with another `.claude/worktrees/` session active).
We needed to commit, push, and PR the design work **without** touching the sourcing session's
in-flight changes in the shared working directory.

## Solution
Move just the target effort's changes into a dedicated worktree on its own branch, then commit there:

```bash
# 1. Stash ONLY this effort's files (leaves the other session's untracked files in place)
git stash push -m "design polish" -- src/app/page.tsx src/components/nautical/illustrations.tsx ...

# 2. Add a worktree on the design branch (sibling dir, NOT nested in the repo)
git worktree add ../buybox-design redesign-epicurrence

# 3. Pop the stash inside the worktree (stashes are repo-global; applies cleanly at same base)
cd ../buybox-design && git stash pop
```

From then on, do all design commits/pushes/PRs from `../buybox-design`. The original checkout stays
on its branch with the other session's work untouched.

Gotchas learned:
- **Don't symlink `node_modules`** into the worktree — Turbopack rejects symlinks pointing outside the
  project root ("Symlink [project]/node_modules is invalid"). Run `npm ci`/`npm install` in the worktree.
- After a PR merges, that branch is closed; further commits need a **new branch + new PR**, not more
  pushes to the merged branch.
- On a fast-moving shared `main`, expect to **rebase to resolve** when your edits touch the same lines
  as a concurrently-merged PR. `git rebase origin/main`, resolve, then `push --force-with-lease`.
- Direct pushes to the default branch may be blocked by the harness's safety classifier — go through a
  PR (`gh pr create` / `gh pr merge`), which is the intended path anyway.

## Why It Works
Git worktrees share one object store but give each branch its own working directory, so two efforts
can progress in parallel without stepping on each other's files. Stash-with-pathspec is the clean way
to carry just one subset of changes across.

## Related
- [[2026-06-08-vercel-hobby-private-repo-deploy-block]] — the deploy side of getting the isolated
  branch live.
