# Checklist (Standalone Backup Repo)

This repository is intentionally small: it tracks only the `checklist/` folder from a larger local workspace.

## What this is

- A standalone HTML/CSS/JS “Cleaning Checklist” UI.
- Stored here so it can evolve independently (and be safely backed up) before it’s integrated into the wider system.

## What’s tracked (on purpose)

- `checklist/**`
- `.gitignore`
- `README.md`

Everything else in the original workspace is ignored because it’s experimental / scratch work.

## How to run

- Open `checklist/checklist-modern.html` in a browser.

Admin-only features (e.g., Custom Items editor + Internal notes) are enabled by adding `?admin=1` to the URL once; it will persist in localStorage after that.

## Future direction

The long-term intent is that this checklist becomes an add-on/module for the main plugin/system (e.g., AYS). This repo keeps it isolated until that integration work is ready.
