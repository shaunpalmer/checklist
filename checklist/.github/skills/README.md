# AYS Agent Skills System

This folder contains **VS Code Agent Skills** organized in three layers to teach GitHub Copilot (and other LLM agents) how to work correctly with this codebase.

## Three-Layer Architecture

```
skills/
  core/                       # Layer 1: Portable (cross-repo, reusable)
    repo-read-first/
    patch-discipline/
    debug-protocol/
    ui-state-contracts/

  ays/                        # Layer 2: Project-wide (AYS invariants)
    architecture-invariants/
    persistence-rules/
    drafts-lifecycle/
    mode-switching-contract/

  ays-checklist/              # Layer 3: Feature-specific (Checklist rules)
    drafts/
    hydration/
    room-composition/
    offline-first/
```

## Layer Definitions

### Layer 1: Core (Portable)

Skills that apply to **how the model behaves**, regardless of project.
These never mention AYS, quotes, or checklists.

- Stop drift, hallucination, spaghetti patches
- Can be reused across any repository

### Layer 2: AYS (Project-Wide)

Skills that define **project-wide invariants** across all AYS modules.
These know what AYS is, but not how specific features work.

- Shared concepts: offline-first, persistence rules, mode switching
- Apply to any future AYS module

### Layer 3: AYS-Checklist (Feature-Specific)

Skills specific to the **Checklist feature** of AYS.
These know about rooms, base_room composition, IndexedDB drafts, etc.

- Checklist-specific rules and data shapes
- Don't bleed into other AYS features

## Quick Reference

### Core Skills

| Skill | Purpose |
|-------|---------|
| `core.repo.read-first` | Read files before proposing changes |
| `core.patch-discipline` | One change at a time, add guards |
| `core.debug.protocol` | Repeatable debugging recipe |
| `core.ui-state.contracts` | UI reflects state, never defines it |

### AYS Skills

| Skill | Purpose |
|-------|---------|
| `ays.architecture.invariants` | Offline-first, single source of truth |
| `ays.persistence.rules` | When/how to save, lifecycle events |
| `ays.drafts.lifecycle` | Draft state machine and transitions |
| `ays.mode-switching.contract` | Structural vs cosmetic mode changes |

### AYS-Checklist Skills

| Skill | Purpose |
|-------|---------|
| `ays-checklist.drafts` | IndexedDB CRUD, list display |
| `ays-checklist.hydration` | Full form hydration contract |
| `ays-checklist.room-composition` | base_room + addons composition |
| `ays-checklist.offline-first` | PWA, sync queue, network handling |

## Adding New Skills

Each skill lives in its own folder with:

```
skill-name/
  SKILL.md          # Main skill definition (required)
  examples/         # Code examples (optional)
  scripts/          # Helper scripts (optional)
  tests/            # Validation tests (optional)
```

See the [VS Code Agent Skills docs](https://code.visualstudio.com/docs/copilot/customization/agent-skills) for more details.
