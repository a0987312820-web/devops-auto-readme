#!/usr/bin/env node
// Auto-update the "Recent Activity" section of README.md.
//
// Data source (in order of preference):
//   1. GitHub REST API (authenticated with REPO_TOKEN / GITHUB_TOKEN) with
//      exponential backoff that respects X-RateLimit-Reset and Retry-After.
//   2. Local `git log` fallback if the API is unavailable or unauthenticated.
//
// The script is idempotent: it only rewrites the text BETWEEN the markers, and
// the caller (workflow) commits only when the file actually changed.
//
// Usage:
//   node scripts/update-readme.mjs [--dry-run]
//
// Security: the token is read from the environment and is never printed. API
// responses are summarised to fields we display; raw bodies are not logged.

import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const START = "<!-- ACTIVITY:START -->";
const END = "<!-- ACTIVITY:END -->";
const README = new URL("../README.md", import.meta.url);
const COMMIT_COUNT = 7;
const DRY_RUN = process.argv.includes("--dry-run");

const TOKEN = process.env.REPO_TOKEN || process.env.GITHUB_TOKEN || "";
const REPO =
  process.env.GITHUB_REPOSITORY || (await detectRepoFromGit()) || "";

function log(...args) {
  // Never interpolate the token into logs.
  console.log("[update-readme]", ...args);
}

async function detectRepoFromGit() {
  try {
    const { stdout } = await execFileAsync("git", [
      "config",
      "--get",
      "remote.origin.url",
    ]);
    const m = stdout
      .trim()
      .match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/i);
    return m ? m[1] : "";
  } catch {
    return "";
  }
}

// Fetch with exponential backoff + rate-limit awareness.
async function apiFetch(path, { retries = 4 } = {}) {
  const url = `https://api.github.com${path}`;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "devops-auto-readme-bot",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers });
    if (res.ok) return res.json();

    const remaining = res.headers.get("x-ratelimit-remaining");
    const isRateLimited =
      res.status === 403 && remaining === "0";
    const retryAfter = Number(res.headers.get("retry-after"));
    const reset = Number(res.headers.get("x-ratelimit-reset"));

    if ((isRateLimited || res.status === 403 || res.status >= 500) &&
        attempt < retries) {
      let waitMs;
      if (retryAfter) {
        waitMs = retryAfter * 1000;
      } else if (isRateLimited && reset) {
        waitMs = Math.max(0, reset * 1000 - Date.now()) + 1000;
      } else {
        // Exponential backoff with jitter: 1s, 2s, 4s, 8s (+/- jitter).
        waitMs = 2 ** attempt * 1000 + Math.floor(Math.random() * 500);
      }
      // Cap the wait so CI never hangs for long.
      waitMs = Math.min(waitMs, 60_000);
      log(
        `API ${res.status} for ${path}; backing off ${Math.round(
          waitMs / 1000
        )}s (attempt ${attempt + 1}/${retries}).`
      );
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    throw new Error(`GitHub API ${res.status} for ${path}`);
  }
  throw new Error(`GitHub API retries exhausted for ${path}`);
}

function esc(s) {
  return String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

async function fromApi() {
  if (!REPO) throw new Error("No repository detected for API mode.");
  log(`Fetching activity for ${REPO} via GitHub API${TOKEN ? " (authenticated)" : " (anonymous)"}.`);

  const commits = await apiFetch(
    `/repos/${REPO}/commits?per_page=${COMMIT_COUNT}`
  );

  // Open issues count excludes PRs by filtering pull_request field.
  let openIssues = 0;
  let openPrs = 0;
  try {
    const issues = await apiFetch(
      `/repos/${REPO}/issues?state=open&per_page=100`
    );
    for (const it of issues) {
      if (it.pull_request) openPrs++;
      else openIssues++;
    }
  } catch (e) {
    log("Issue/PR counts unavailable:", e.message);
  }

  const rows = commits.map((c) => {
    const sha = c.sha.slice(0, 7);
    const url = c.html_url;
    const msg = esc((c.commit.message || "").split("\n")[0]).slice(0, 72);
    const author =
      c.author?.login || esc(c.commit.author?.name || "unknown");
    const date = (c.commit.author?.date || "").slice(0, 10);
    return `| [\`${sha}\`](${url}) | ${msg} | ${author} | ${date} |`;
  });

  const head = commits[0]
    ? { sha: commits[0].sha.slice(0, 7), date: (commits[0].commit.author?.date || "").slice(0, 10) }
    : null;

  return render({ rows, openIssues, openPrs, head, source: "GitHub REST API" });
}

async function fromGit() {
  log("Falling back to local git log.");
  const fmt = "%h%x1f%s%x1f%an%x1f%ad";
  const { stdout } = await execFileAsync("git", [
    "log",
    `-n${COMMIT_COUNT}`,
    "--date=short",
    `--pretty=format:${fmt}`,
  ]);
  const entries = stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("\x1f"));
  const rows = entries.map(([sha, subject, author, date]) => {
    const url = REPO ? `https://github.com/${REPO}/commit/${sha}` : "#";
    return `| [\`${sha}\`](${url}) | ${esc(subject).slice(
      0,
      72
    )} | ${esc(author)} | ${date} |`;
  });
  const head = entries[0] ? { sha: entries[0][0], date: entries[0][3] } : null;
  return render({ rows, head, source: "git log (API unavailable)" });
}

function render({ rows, openIssues, openPrs, head, source }) {
  // Freshness is tied to the latest commit (not wall-clock), so an unchanged
  // repository produces a byte-identical block => no commit noise.
  const freshness = head
    ? `synced to [\`${head.sha}\`] (${head.date})`
    : "no commits";
  const lines = [
    START,
    "<!-- This section is generated automatically. Do not edit by hand. -->",
    "",
    "### 📊 Recent Activity",
    "",
  ];
  if (openIssues !== undefined || openPrs !== undefined) {
    lines.push(
      `**Open issues:** ${openIssues ?? "n/a"} · **Open PRs:** ${
        openPrs ?? "n/a"
      }`,
      ""
    );
  }
  lines.push(
    "| Commit | Message | Author | Date |",
    "| --- | --- | --- | --- |",
    ...(rows.length ? rows : ["| — | _No commits found_ | — | — |"]),
    "",
    `_Last ${freshness} · Source: ${source}_`,
    END
  );
  return lines.join("\n");
}

async function main() {
  let block;
  try {
    block = await fromApi();
  } catch (e) {
    log("API path failed:", e.message);
    block = await fromGit();
  }

  if (DRY_RUN) {
    log("--dry-run: generated block below\n");
    console.log(block);
    return;
  }

  const readme = await readFile(README, "utf8");
  const startIdx = readme.indexOf(START);
  const endIdx = readme.indexOf(END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `README markers not found or malformed. Expected "${START}" ... "${END}".`
    );
  }

  const before = readme.slice(0, startIdx);
  const after = readme.slice(endIdx + END.length);
  const updated = before + block + after;

  if (updated === readme) {
    log("No change — README already up to date.");
    return;
  }
  await writeFile(README, updated);
  log("README updated.");
}

main().catch((e) => {
  console.error("[update-readme] FATAL:", e.message);
  process.exit(1);
});
