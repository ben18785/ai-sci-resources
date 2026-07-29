# AI in Science — community learning resources

**Live site: [ben18785.github.io/ai-sci-resources](https://ben18785.github.io/ai-sci-resources/)**

A community-ranked guide to learning AI for science. Browse freely; sign in
with GitHub or Google to vote, add resources, build a personal learning path,
ask for materials in Requests, and (optionally) set up a public profile.
Rankings are personalised: votes from people with an academic background
similar to yours count for more.

The starting list is based on the curated *Learning Resources for AI in
Science* document from the [Schmidt AI in Science Postdoctoral
Fellowship](https://www.schmidtsciences.org/schmidt-ai-in-science-postdocs/)
community.

## How it works

A single static page (`index.html`, hosted on GitHub Pages) backed by a free
[Supabase](https://supabase.com) project for auth, votes, comments, requests,
paths, and profiles. No server to run, nothing to pay for.

## Repository layout

| Path | What it is |
|---|---|
| `index.html` | The entire app (HTML + CSS + JS, deliberately one file) |
| `widget.html` | Embeddable top-resources widget (see below) |
| `seed-data.js` | Demo-mode data (used when no backend keys are configured) |
| `sql/supabase-setup.sql` | Full schema for a fresh install (cumulative) |
| `sql/seed-resources.sql` | The 60 starting resources |
| `sql/migrations/` | Incremental migrations, in the order they were applied |
| `tests/` | End-to-end regression suite (see `tests/README.md`) |
| `.github/workflows/` | Daily rank snapshots, weekly backup, weekly link-rot check |
| `snapshots/` | Daily public vote-count snapshots (written by the Action) |
| `SETUP.md` | From-scratch deployment guide (Supabase + OAuth + Pages) |

## Embedding the widget

Show the community's top resources on any web page:

```html
<iframe src="https://ben18785.github.io/ai-sci-resources/widget.html?topic=Machine%20learning&n=10"
        width="100%" height="480" style="border:0"></iframe>
```

Parameters: `topic` (omit for all topics), `n` (rows, default 10),
`theme=light` for light mode.

## Automations

- **Rank history** (`rank-history.yml`) — daily snapshot of public vote counts
  into `snapshots/`. No secrets needed; public data only.
- **Backup** (`backup.yml`) — weekly full-database export to a separate
  **private** repo (raw tables contain private data and must never land in
  this public repo). Requires three Action secrets — setup steps are in the
  workflow file's header comment. Skips gracefully until configured.
- **Link rot** (`linkrot.yml`) — weekly URL health check; opens/updates a
  "Link rot report" issue when resources look dead.

Found a problem, or want a resource corrected? Open an issue or use the
report (⚑) button on the site.
