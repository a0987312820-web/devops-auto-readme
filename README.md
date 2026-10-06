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
| [`8759d0b`](https://github.com/a0987312820-web/devops-auto-readme/commit/8759d0b427b7c63c069f0d1d97e4fe9ad3d39dbf) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-05 |
| [`9c72db4`](https://github.com/a0987312820-web/devops-auto-readme/commit/9c72db491aa606b6caacbcc30605f320aa6909d0) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-04 |
| [`b658301`](https://github.com/a0987312820-web/devops-auto-readme/commit/b658301fed2647f9138759c2765584837467bcdb) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-03 |
| [`e6cdee0`](https://github.com/a0987312820-web/devops-auto-readme/commit/e6cdee026cef76fa42b28527f35655d27e3d9eed) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-02 |
| [`427d5dd`](https://github.com/a0987312820-web/devops-auto-readme/commit/427d5dd3c946f4117b4a3e7104570edb6e77437d) | docs: auto-update README activity [skip ci] | github-actions[bot] | 2026-10-01 |
| [`56effe9`](https://github.com/a0987312820-web/devops-auto-readme/commit/56effe9511d5eff17ded20f355c789d5fa509e84) | Merge pull request #9 from a0987312820-web/#8-verify-auto-close | a0987312820-web | 2026-10-01 |
| [`9e7ac9f`](https://github.com/a0987312820-web/devops-auto-readme/commit/9e7ac9ff9853dd1e1614c9447956bb178a0eaf02) | docs: generalize project-management section to real board issues | a0987312820-web | 2026-10-01 |

_Last synced to [`8759d0b`] (2026-10-05) · Source: GitHub REST API_
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
