# Database — Firebase Realtime Database

The cloud database lives in Firebase; this folder holds its **rules, schema, and
seed data** — there is no DB engine in the repo.

| File                   | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `schema.md`            | The Realtime Database tree and how it maps to the app.   |
| `database.rules.json`  | Security rules (public reads, admin-only writes, etc.).  |
| `seed-data.json`       | Sample data to bootstrap an empty database.              |

## Seed an empty database

```bash
firebase database:set / database/seed-data.json --config backend/firebase.json
```

The full sample dataset used by the running UI today lives in
[`../frontend/src/data/mock.ts`](../frontend/src/data/mock.ts); once Firebase is
wired, those reads are replaced by realtime subscriptions.
