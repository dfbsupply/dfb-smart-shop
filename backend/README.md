# Backend — Firebase (Backend-as-a-Service)

DFB Smart Shop has **no custom backend server**. Per the manuscript, the backend
is **Firebase**: Authentication + Realtime Database, hosted in Google's cloud.
This folder therefore holds **configuration and deployment**, not server code.

| File              | Purpose                                                        |
| ----------------- | ------------------------------------------------------------- |
| `firebase.json`   | Firebase project config — Realtime DB rules + Hosting.        |
| `.firebaserc`     | Maps the local project alias to your Firebase project ID.     |
| `functions/`      | (Optional) Cloud Functions, only if server-side logic is added.|

Database **rules and schema** live in [`../database`](../database).
The frontend's Firebase integration code lives in
[`../frontend/src/services/firebase`](../frontend/src/services/firebase).

## Deploy

```bash
npm i -g firebase-tools
firebase login
# from the repo root:
firebase deploy --only database,hosting --config backend/firebase.json
```

Hosting serves the built frontend (`frontend/dist`), so run `yarn build` in
`frontend/` first.
