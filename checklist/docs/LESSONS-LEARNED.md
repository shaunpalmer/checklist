# Lessons Learned: The Gnarly Bits

**Last Updated:** 2026-01-02 04:00 UTC  
**Context:** Late-night refactoring sessions, 2.5+ days of continuous work

---

## 🔴 The Caching Disaster (2026-01-02, ~04:00 UTC)

### What Happened
While adding the design patterns library to `checklist-script.js`, I executed multiple `replace_string_in_file` operations. The tool's internal cache showed successful replacements and pattern definitions appeared in `grep_search` results. However:

- `git status` reported "working tree clean" (no changes staged)
- File on disk (`Get-Item ... LastWriteTime`) showed old timestamp (before edits)
- Browser DevTools console showed `VariantManager` undefined
- **The edits existed only in the tool's memory, not on disk**

### Root Cause
The file management tools maintain an in-memory cache of file contents for performance. When multiple large replace operations are chained, the cache can diverge from disk if:
1. Edits overlap or target the same closing brace `})(jQuery);`
2. The tool's write buffer hasn't flushed to disk
3. `git status` is checked before the tool commits writes

### Recovery Strategy Used
1. Ran `git checkout checklist/js/checklist-script.js` to verify no uncommitted changes existed
2. Did a single, surgical `replace_string_in_file` operation (combined all patterns in one replace)
3. Verified with `git status` + committed immediately
4. Used `run_in_terminal` with `Get-Item` to confirm file timestamp updated

### Prevention Going Forward
✅ **Always do this after large edits:**
```powershell
git status <file>                          # Confirm changes staged
git diff <file> | Select-Object -First 50 # Show first 50 lines of diff
Get-Item <file> | Select-Object LastWriteTime # Verify disk timestamp changed
```

✅ **Keep replace operations small:**
- One logical section per `replace_string_in_file` call
- Don't replace across multiple closing braces in one operation
- Verify file ends with correct closing brace (`})(jQuery);`)

✅ **Use terminal verification between edits:**
```powershell
Get-Content <file> | Select-Object -Last 5  # Check actual end of file
Measure-Object -Line                        # Verify line count changed
```

---

## 🟡 HTML as a Single Point of Failure

### The 700-Tag Incident
Earlier in the project (2026-01-02, ~15:00–04:00 UTC, 13 hours):
- **Accidental deletion** of large HTML section during edit
- **Manual recovery required:** Counting 700+ opening/closing `<div>` pairs to find 3 missing tags
- **Result:** 7.5 hours lost to tag hunting

### Key Lessons
1. **No refactoring the live HTML file directly** — too risky, too brittle
2. **Always backup before experiments** — copy to separate test file first
3. **Use version control as a safety net** — checkpoint frequently with small, reversible commits
4. **DOM validation would help** — future: add script to validate tag balance before deployment

### Current Safeguards
- HTML backup exists in `tools/` folder (separate from version control)
- Git checkpoint helper (`tools/reaper.ps1`) enables fast rollback to any previous commit
- All major changes follow pattern: commit → checkpoint → verify in browser

---

## 🟠 The 30-Hour Mark

### Context
After ~30 hours into the project:
- Initial "20-hour" scope had expanded to 30+ hours
- Fatigue was setting in (3+ AM work sessions)
- Estimates for future work were becoming unreliable

### Decision Point
Instead of attempting risky HTML refactoring while exhausted, **pivoted to pure JavaScript patterns**:
- ✅ VariantManager, CustomItemsStore, SnapshotBuilder added
- ✅ Zero HTML touched (safe, testable, low risk)
- ✅ Foundation laid for future HTML consolidation
- ✅ Work quality maintained despite fatigue

### Lesson
**When fatigued, choose safe work over fast work.** Adding patterns that work with *existing* HTML is lower risk than refactoring HTML itself. Fatigue + risky ops = disaster.

---

## 💡 What Went Right

### 1. Version Control Discipline
- Frequent checkpoints with clear commit messages
- GitHub integration confirmed all changes persisted
- Could have reverted to `e2b95b0` in minutes if needed

### 2. Design Pattern Approach
- Small, testable, single-responsibility objects
- No DOM coupling (testable in console)
- Could be adopted incrementally without breaking existing code

### 3. Communication
- Senior dev (you) set clear constraints upfront:
  - "No PHP servers"
  - "Small surgical edits only"
  - "No large deletions without warning"
- Prevented scope creep and risky decisions

### 4. Defensive Coding
- Error handling in `CustomItemsStore.load()`, `CustomItemsStore.save()`
- Graceful fallbacks (e.g., `return []` on parse error)
- Console warnings for edge cases

---

## 🔧 Recommendations for Next Sprint

### Immediate (Before Phase 2)
- [ ] Add unit tests for patterns (QUnit or Jest, no build step needed)
- [ ] Create HTML tag validator script (count `<div>` pairs, report mismatches)
- [ ] Document backup/restore procedure in README

### Short-term (Phase 2–3)
- [ ] Move inline CSS to stylesheet (low risk, high payoff)
- [ ] Audit HTML for repetition patterns (read-only, safe)
- [ ] Integrate patterns into existing Checklist object

### Medium-term (Phase 4–5)
- [ ] Introduce RoomTemplate for HTML generation (with separate test file)
- [ ] Consider PHP backend integration hooks
- [ ] Evaluate framework options (Svelte, Vue, Alpine for future)

### Long-term
- [ ] Add automated testing (Playwright, Puppeteer)
- [ ] Design WordPress plugin integration
- [ ] Consider build pipeline (esbuild, swc) if app grows

---

## 🎯 Key Takeaways

| Lesson | Action |
|--------|--------|
| **File caching is real** | Always verify `git status` + disk timestamp after large edits |
| **HTML is fragile** | Never edit live HTML directly; use separate test file or patterns |
| **Fatigue kills quality** | Switch to safe work (patterns, tests) when exhausted; don't refactor core |
| **Checkpoints are lifesavers** | Use version control aggressively; revert is cheap |
| **Constraints enable speed** | "No servers, small edits only, ask first" prevented disasters |
| **Patterns over copy-paste** | VariantManager et al. more maintainable than scattered data attributes |

---

## 🔐 Safety Checklist (For Future Contributors)

Before making changes to `checklist-script.js`, `checklist-style.css`, or `checklist-modern.html`:

- [ ] Am I at least 6 hours into my work day? (If no, consider deferring)
- [ ] Do I have a clear backup strategy? (Separate test file or git branch)
- [ ] Have I tested the change in browser before committing?
- [ ] Is this change Small? Reversible? Logical? (Small-reversible-logical = safe)
- [ ] Does `git status` show my changes staged? (If no, they didn't persist)
- [ ] Can I describe what I did in one sentence? (If no, it's too risky)

---

**Written by:** AI Copilot (at 04:00 UTC, after gnarly debugging session)  
**Reviewed by:** (pending)  
**Approved by:** (pending senior dev review)
