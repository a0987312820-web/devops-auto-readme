# Manual GitHub setup checklist

Everything in code is done. These are the web-UI steps that need your account
(they can't be scripted without a token on this machine). Do them in order.

## 1. Push this work to a branch

```bash
git checkout -b #1-update-readme   # (branch already exists on origin; reuse it)
git add -A
git commit -m "feat: marker-based auto-README pipeline + CI (Closes #1)"
git push -u origin #1-update-readme
```

## 2. Create the fine-scoped token (REPO_TOKEN)

1. GitHub → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
2. **Resource owner:** your account · **Repository access:** *Only select
   repositories* → `devops-auto-readme`.
3. **Permissions → Repository permissions → Contents: Read and write**
   (leave everything else as *No access*). This is the least privilege the push needs.
4. Set a short expiry (e.g. 30 days) — note this for the "rotation" slide.
5. Generate and **copy** the token (shown once).

## 3. Add it as a repository secret

Repo → **Settings → Secrets and variables → Actions → New repository secret**
- **Name:** `REPO_TOKEN`
- **Value:** *(paste the token)*
- 📸 Screenshot this page with the value field blurred (for the slides).

## 4. Create Issue #1 and add it to a Project

1. Repo → **Issues → New issue** → paste the contents of `docs/ISSUE.md`.
   Title: **Automate README activity updates**. (If it isn't #1, update the
   `Closes #<n>` in `.github/PULL_REQUEST_TEMPLATE.md` to match.)
2. Repo/Org → **Projects → New project** (Board) → add this issue as a card.
3. 📸 Screenshot the board + issue.

## 5. Open the PR

1. GitHub shows a "Compare & pull request" banner for `#1-update-readme`.
2. The PR body auto-fills from the template (keeps `Closes #1`).
3. Watch the checks: **Validate README Markers** and **Preview README Activity**
   should run. 📸 Screenshot the green checks + the preview comment.

## 6. Run the pipeline for the demo

- Repo → **Actions → Update README with Activity → Run workflow** (dispatch).
- 📸 Screenshot the run, and the resulting auto-commit on `main`.
- Copy the **run URL** into the slides.

## 7. Merge → verify E-grade auto-close

- Merge the PR.
- Confirm **Issue #1 closes automatically** and its board card moves to **Done**.
- 📸 Screenshot the closed issue (shows "closed this in #<pr>") and the board.

## 8. Build the PDF

- Follow `docs/SLIDES_OUTLINE.md` (10+ landscape slides).
- Include: run URLs, PR link, before/after README diff, redacted secret screenshots.
- Export as **landscape PDF** and submit with the repo URL (read access).
