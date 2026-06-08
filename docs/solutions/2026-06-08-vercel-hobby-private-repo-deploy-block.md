---
title: "Vercel Hobby blocks deploys from non-owner commit authors on private repos"
date: 2026-06-08
tags: [deployment, vercel, git]
category: gotcha
module: deployment
symptoms:
  - "Deployment Blocked: the commit author did not have contributing access to the project on Vercel"
  - "The Hobby Plan does not support collaboration for private repositories. Please upgrade to Pro"
  - "merge to main does not deploy / production shows old design"
---

# Vercel Hobby blocks deploys from non-owner commit authors on private repos

## Problem
The repo's Git integration pointed at a `deal-flow` Vercel project on a **Hobby (personal)** account.
Merges to `main` authored by a collaborator (not the Vercel account owner) were **blocked** with
"the commit author did not have contributing access to the project on Vercel." Clicking **Redeploy**
didn't help either, because Redeploy rebuilds the *same old commit's* code, never the newer `main`.

## Solution
Two reliable fixes (no Pro upgrade needed):

1. **Make the GitHub repo public.** Hobby only enforces the author-access check for *private* repos.
   On a public repo, Vercel deploys commits regardless of author, so collaborator merges to the
   connected branch deploy normally.
2. **Deploy from a Vercel project you own.** If the project lives under *your* team, your own commit
   authorship is never blocked. We mirrored the site to `anna-c-projects/dealflow-redesign` via
   `vercel link --scope <team> --project <name>` + `vercel deploy`, which deployed instantly.

To actually fire a deploy after connecting Git **post-merge**: Vercel does NOT retroactively build
existing commits. You need a *new push event* to the production branch (a fresh merged PR), or a
manual redeploy of the latest commit in the dashboard. A merge that happened *before* the integration
was connected will sit un-built.

## Why It Works
The block is a Hobby-plan collaboration limit scoped to private repositories. Public repos and
owner-authored commits both fall outside it. The "Redeploy" button re-runs a specific past
deployment's commit, so it can never surface code from a newer commit.

## Related
- [[2026-06-08-deploy-pipeline-multi-session-worktrees]] — isolating design work so deploys don't
  entangle a shared branch.
- Verify a deploy fired via GitHub commit status: `gh api repos/<owner>/<repo>/commits/main/status`.
