# Slide report outline (landscape PDF, 10+ slides)

Maps 1:1 to the assignment's required structure. Each bullet = one slide's content.
Grab the screenshots listed in `docs/SETUP_CHECKLIST.md` as you go.

---

### Slide 1 — Title
- Assignment 3 — DevOps: Auto-Updating README via GitHub Actions
- Name: **Wang, Yun-Xuan** · course / date: **2026-10-02**
- Repo URL: `https://github.com/a0987312820-web/devops-auto-readme`

### Slide 2 — Problem statement & objectives
- READMEs go stale; manual activity updates are error-prone.
- Objective: a secure, idempotent CI pipeline that self-updates a README section
  and is tracked as real project-management work.
- Learning outcomes (least privilege, secrets, automated pipeline, PM linkage).

### Slide 3 — Project management setup
- Tool: **GitHub Projects** (board) + **Issues**.
- Screenshot: board with Issue #1 card; branch name `#1-update-readme`.
- Linkage: branch + PR reference the issue; PR body has `Closes #1`.

### Slide 4 — Issue definition (scope / AC / DoD / WBS)
- Screenshot of Issue #1 (content from `docs/ISSUE.md`).
- Call out acceptance criteria and the 7-item WBS.

### Slide 5 — Repo & README markers
- Screenshot of README showing `ACTIVITY:START/END` + the generated table.
- Rationale: marker-scoped edits keep the rest of the README safe & reviewable.

### Slide 6 — Secrets setup (redacted)
- Screenshots: fine-grained PAT scopes (Contents: R/W only) + the `REPO_TOKEN`
  secret page **with the value blurred**.
- Note the short expiry → rotation story.

### Slide 7 — Workflow YAML walk-through
- Paste key parts of `update-readme.yml`.
- Explain: triggers (schedule/dispatch/push), `permissions: contents: write`,
  checkout with `REPO_TOKEN`, idempotent `git diff --quiet` guard, `[skip ci]`.

### Slide 8 — Demo of auto-update
- Workflow **run URL** + screenshot of a green run.
- Before/after README diff (the auto-commit `docs: auto-update README activity`).
- Commit history showing the bot commits.

### Slide 9 — Security considerations
- Least privilege (single `contents: write` scope; fine-grained PAT to one repo).
- Token never printed; API bodies not echoed.
- Rotation / expiry; `GITHUB_TOKEN` used read-only where sufficient (preview job).

### Slide 10 — Reflection
- What worked; pain points (e.g. metrics action overwrote the whole README →
  switched to a marker-based script); improvements (tests, org aggregation).

---

### E-grade slides (add)
- **Slide 11 — Auto-close on merge:** PR with `Closes #1`; screenshots of the
  merged PR, the auto-closed Issue #1, and the board card moving to Done.

### O-grade slides (add)
- **Slide 12 — Marker validation CI:** `validate-markers.yml`; screenshot of a
  failing check when a marker is removed, passing when restored.
- **Slide 13 — PR preview automation:** screenshot of the sticky "README activity
  preview" comment posted by `preview-readme.yml`.
- **Slide 14 — Resilience & badges:** API rate-limit backoff + `git log` fallback
  in `update-readme.mjs`; status badges in the README header.
- **Slide 15 — Design choices & impact:** idempotency (no empty commits),
  least-privilege token, measurable: N auto-commits, 0 manual README edits.
