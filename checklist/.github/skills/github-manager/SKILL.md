---
name: github-manager
description: Use this skill to manage pull requests, issues, and repository workflows using the GitHub MCP server.
---

# GitHub Workflow Instructions

You have access to the GitHub MCP server. Use it to follow our team's workflow rules.

## Git Routine (Local)

Before any GitHub operations, ensure local changes are committed:

```powershell
# Standard commit + push
powershell -File tools/reaper.ps1 -Message "description" -Push
```

Never create a PR with uncommitted local changes.

## PR Creation

- **Branch**: Push current branch first via reaper, then create PR against `main`.
- **Naming**: Prefix PR titles: `[FE]` for frontend, `[BE]` for backend, `[INFRA]` for tooling/config.
- **Description**: Every PR must include:
  - What changed (brief summary)
  - Why (context/motivation)
  - Testing steps (how to verify)
- **Tools**: Use the `create_pull_request` tool from the GitHub MCP.
- **Size**: Keep PRs focused. One logical change per PR. If it touches 10+ files, explain why.

### PR Template

```markdown
## What Changed
- [brief description]

## Why
- [context/motivation]

## Testing Steps
1. [step 1]
2. [step 2]
3. [expected result]

## Checklist
- [ ] Syntax checks pass
- [ ] No console.log left in production code
- [ ] Cache version bumped if assets changed
```

## Issue Management

- If a user reports a bug in chat, use `create_issue` to log it.
- Always apply the `bug` label to bug reports.
- Always apply the `triage` label to new issues that need investigation.
- Include repro steps in the issue body when possible.
- Reference related files or line numbers.

## Common Triggers

| User Says | Action |
|-----------|--------|
| "Create a PR for my changes" | Reaper push, then `create_pull_request` |
| "What are my open issues?" | `list_issues` filtered by assignee |
| "Log this as a bug" | `create_issue` with `bug` + `triage` labels |
| "What PRs are open?" | `list_pull_requests` with state=open |
| "Merge that PR" | `merge_pull_request` (squash preferred) |
| "What changed recently?" | `list_commits` on current branch |

## Repository Info

- **Owner**: Check with `git remote -v` or ask user
- **Default branch**: `main`
- **Merge strategy**: Squash merge preferred (clean history)

## Rules

### DO
- Always push local changes before creating a PR
- Include testing steps in every PR description
- Label issues appropriately
- Reference issue numbers in PR descriptions when fixing bugs

### DON'T
- Create PRs with WIP or broken code
- Merge without review on shared branches
- Create duplicate issues (search first)
- Leave PRs open for more than 7 days without activity
