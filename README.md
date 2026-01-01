# Checklist (Standalone Backup Repo)

This repository is intentionally focused: it tracks the checklist/ folder (core code) alongside 	ools/ (helpers) and docs/ (design specs), isolated from a larger workspace.

## What this is

- A standalone HTML/CSS/JS "Cleaning Checklist" UI.
- Frontend-only development (no server coupling yet).
- Backed up here so it can evolve independently before integration into a larger system.

## What's tracked (on purpose)

- checklist/** — Core code: HTML, CSS, JS, worker logic
- 	ools/** — Helpers: eaper.ps1 (checkpoint script)
- docs/** — Design specs: ARCHITECTURE, PROGRESS, DATA-REFERENCE, etc.
- .gitignore, README.md, index.html

## How to run

- Open checklist/checklist-modern.html in a browser.
- Admin-only features (Custom Items editor, Internal notes) are enabled by adding ?admin=1 to the URL.

## Checkpointing

For sweeping changes, use the reaper checkpoint helper:

`powershell
pwsh tools/reaper.ps1 -Message "my change description" -Push
`

This stages, commits, and pushes everything in one go. For small edits, just commit normally.

## Future direction

The long-term intent is that this checklist becomes an integrated module in a larger system (e.g., WordPress plugin). This repo keeps it isolated and stable until that integration work is ready.
