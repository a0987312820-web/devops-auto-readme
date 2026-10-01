# Issue #1 — Automate README activity updates

> Paste this into the GitHub Issue body (Projects / Issues), then add the issue
> to your Project board. The branch `#1-update-readme` and the PR reference it.

## Scope

**In scope**
- A GitHub Actions pipeline that rewrites a dedicated README section with recent
  repository activity (latest commits + open issue/PR counts).
- Marker-based, in-place updates that never touch the rest of the README.
- Least-privilege permissions and a fine-scoped `REPO_TOKEN` secret for pushing.
- Idempotent commits (no empty-diff noise).

**Out of scope**
- Rendering activity as images/SVG badges from third-party services.
- Multi-repo org aggregation (listed as a possible future extension).

## Acceptance Criteria

- [ ] README contains `ACTIVITY:START` / `ACTIVITY:END` markers.
- [ ] A scheduled workflow (`update-readme.yml`) updates the section on a cron
      and via manual `workflow_dispatch`.
- [ ] Pushing uses `REPO_TOKEN` from repository secrets; no token is ever printed.
- [ ] Workflow declares `permissions: contents: write` only.
- [ ] Re-running with no new activity produces **no commit** (idempotent).
- [ ] A workflow run URL and a before/after README diff are captured for the report.

## Definition of Done (DoD)

- [ ] PR merged to `main`, closing this issue via `Closes #1`.
- [ ] `validate-markers` CI check is green on the PR.
- [ ] Project board card moved to **Done** automatically on merge.
- [ ] Slides include run URLs, diffs, and redacted secret screenshots.

## WBS / Tasks

1. **Repo & template** — create repo, add README with markers + badges.
2. **Pipeline** — Node script to pull activity (API + git fallback, backoff).
3. **Workflow** — schedule/dispatch/push triggers, least-privilege, idempotent commit.
4. **Secret** — generate fine-scoped PAT, add as `REPO_TOKEN`.
5. **Stretch (E)** — PR with `Closes #1`; verify auto-close + board move on merge.
6. **Stretch (O)** — marker-validation CI, PR preview comment, status badges,
   API rate-limit backoff.
7. **Report** — capture screenshots, run URLs, diffs; build landscape PDF.
