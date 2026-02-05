---
name: Query Gate
description: No raw SQL floating loose. All paths end in one place.
triggers:
  - query
  - run sql
  - db
  - execute
  - fetch
---

# LAWS

1. Every SQL string lives in `./queries/<name>.sql` — nothing inline.
2. Execute via `QueryRunner.run('name', params)` → returns promise.
3. No new connections. No one-offs. No "let me just SELECT here".
4. Interface is: `string name` + `object params` → `Result`.
5. If it's new logic — write the `.sql` first, then call it. Never both at once.

# STRUCTURE

```
queries/
├── user-list.sql
├── draft-by-id.sql
├── drafts-by-status.sql
└── update-sync-status.sql
```

# USAGE

```javascript
// ✅ Correct
const users = await QueryRunner.run('user-list', { status: 'active' });
const draft = await QueryRunner.run('draft-by-id', { id: draftId });

// ❌ Forbidden
const users = await db.query("SELECT * FROM users WHERE status = ?", [status]);
const draft = await db.query(`SELECT * FROM drafts WHERE id = '${id}'`);
```

# VIOLATIONS

| Bad | Response |
|-----|----------|
| Inline SQL string | "Move to queries/name.sql" |
| Copy-pasted query | Replace with `QueryRunner.run('name')` |
| New db.query() call | "Write the .sql file first" |
| String interpolation in SQL | "Use params object" |

# WORKFLOW

```
Need new query?
      │
      ▼
1. Create queries/new-thing.sql
      │
      ▼
2. Write the SQL with :param placeholders
      │
      ▼
3. Call QueryRunner.run('new-thing', { param: value })
      │
      ▼
Done. One place. One truth.
```

SQL is data. Treat it like one.
