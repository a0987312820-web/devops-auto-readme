# devops-auto-readme

[![Update README](https://github.com/a0987312820-web/devops-auto-readme/actions/workflows/update-readme.yml/badge.svg)](https://github.com/a0987312820-web/devops-auto-readme/actions/workflows/update-readme.yml)
[![Validate README Markers](https://github.com/a0987312820-web/devops-auto-readme/actions/workflows/validate-markers.yml/badge.svg)](https://github.com/a0987312820-web/devops-auto-readme/actions/workflows/validate-markers.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

> **Assignment 3 — DevOps:** A CI pipeline that automatically keeps a README section
> in sync with recent repository activity, with the work tracked in GitHub Projects (Issue #1).

A GitHub Actions workflow runs on a schedule (and on demand). It pulls the latest
repository activity through the GitHub REST API — with rate-limit backoff and a
`git log` fallback — and rewrites the **Recent Activity** section below, in place,
between machine-readable markers. The commit only happens when the content actually
changes, so the pipeline is **idempotent** and never creates empty-diff noise.

---

## How it works

```
schedule / workflow_dispatch / push
            │
            ▼
   actions/checkout  ──►  node scripts/update-readme.mjs
            │                     │
            │        GitHub REST API (commits, issues, PRs)
            │        + exponential backoff on 403/rate-limit
            │        + git log fallback if the API is unavailable
            │                     │
            │        rewrite content between <!-- ACTIVITY:START/END -->
            ▼                     ▼
   commit only if README changed  ──►  push with [skip ci]
```

- **Markers** — the script replaces *only* the text between the HTML comment
  markers, so the rest of the README is untouched and hand-edits are safe.
- **Least privilege** — the workflow requests `contents: write` and nothing else.
- **Secret** — pushes use `REPO_TOKEN`, a fine-scoped PAT stored in repo secrets.
- **Idempotent** — `git diff --quiet` guards the commit; unchanged runs are no-ops.

<!-- ACTIVITY:START -->
<!-- This section is generated automatically. Do not edit by hand. -->

### 📊 Recent Activity

**Open issues:** 2 · **Open PRs:** 0

| Commit | Message | Author | Date |
| --- | --- | --- | --- |
| [`735b9f4`](https://github.com/a0987312820-web/devops-auto-readme/commit/735b9f4ffd6854dd73757c6ee4c59e2cb9088aea) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-16 |
| [`30389f9`](https://github.com/a0987312820-web/devops-auto-readme/commit/30389f9481f40399554387048d92b115de686fc7) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-15 |
| [`84eff3e`](https://github.com/a0987312820-web/devops-auto-readme/commit/84eff3ef7d6a7d8d1bf0101fa426858e9a9c3955) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-14 |
| [`ee8305e`](https://github.com/a0987312820-web/devops-auto-readme/commit/ee8305edd58fceec1fa61f2e1acca007856be3b3) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-13 |
| [`e6bff4f`](https://github.com/a0987312820-web/devops-auto-readme/commit/e6bff4fccba8794616731e088a3609d8318ff8a6) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-12 |
| [`6ac3930`](https://github.com/a0987312820-web/devops-auto-readme/commit/6ac3930f9c532284554c5f0c180e1b1f0ee7cc34) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-11 |
| [`04be814`](https://github.com/a0987312820-web/devops-auto-readme/commit/04be814c1c80aa39ae21cbd251fc721f338f0524) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-10 |

_Last synced to [`735b9f4`] (2026-10-16) · Source: GitHub REST API_
<!-- ACTIVITY:END -->

---

## Repository layout

| Path | Purpose |
| --- | --- |
| `scripts/update-readme.mjs` | Generates the activity block and injects it between the markers. |
| `.github/workflows/update-readme.yml` | Scheduled/dispatch pipeline that runs the script and commits. |
| `.github/workflows/validate-markers.yml` | CI guard — fails if the README markers are missing/malformed. |
| `.github/workflows/preview-readme.yml` | On PRs, posts a preview of the generated activity block as a comment. |
| `docs/ISSUE.md` | Scope / Acceptance Criteria / DoD / WBS for the tracking issue. |
| `docs/SLIDES_OUTLINE.md` | 10+ slide outline for the landscape PDF report. |
| `docs/SETUP_CHECKLIST.md` | Manual GitHub steps (secret, issue, PR) to finish the assignment. |

## Running locally

```bash
# Dry run — prints the block without writing the file
node scripts/update-readme.mjs --dry-run

# Write the block into README.md between the markers
node scripts/update-readme.mjs
```

The script needs no dependencies (Node 18+ built-in `fetch`). Set `GITHUB_TOKEN`
or `REPO_TOKEN` in the environment to use the authenticated API and raise the
rate limit; without a token it falls back to `git log`.

## Project management

Work is tracked in **GitHub Projects**, with each task captured as a GitHub Issue
on the board (e.g. "設定 README 自動更新", "研究 GitHub Actions 腳本").
Every feature branch references its issue, and each PR body contains a
`Closes #<issue>` keyword so the linked issue closes — and its board card moves to
**Done** — automatically when the PR merges.

## License

[MIT](./LICENSE)
