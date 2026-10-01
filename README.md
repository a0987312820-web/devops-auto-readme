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
_No activity recorded yet. The next scheduled run of the workflow will populate this section._
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

Work is tracked in **GitHub Projects**, linked to **Issue #1 — "Automate README activity updates"**.
The feature branch `#1-update-readme` and its PR reference the issue so the board
moves automatically, and the PR body contains `Closes #1` to auto-close on merge.

## License

[MIT](./LICENSE)
