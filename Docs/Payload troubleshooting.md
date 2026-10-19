# Troubleshooting Guide: Next.js + Payload CMS + Bun

Problems we hit while setting up Payload in this project (Next.js 16, Payload 3.91, MongoDB, Bun), and how each one was fixed.

---

## 1. Two pages resolve to the same path

**Error**

```
You cannot have two parallel pages that resolve to the same path.
Please check /(app)/(home) and /(frontend).
```

**Cause:** The Payload installer created `src/app/(frontend)/page.tsx`, but the project already had `src/app/(app)/(home)/page.tsx`. Both resolve to `/`.

**Fix (choose one):**

- Delete the Payload default frontend (if it has nothing you need):
  ```bash
  rm -rf "src/app/(frontend)"
  ```
- Or move your real page into `(frontend)` and delete Payload's page.

Then clear the cache:

```bash
rm -rf .next
bun run dev
```

**Expected structure** (each route group needs its own root `layout.tsx` with `<html>` and `<body>`):

```
src/app/
├── (app)/
│   ├── layout.tsx
│   └── (home)/page.tsx
└── (payload)/
    ├── admin/[[...segments]]/page.tsx
    ├── api/[...slug]/route.ts
    └── layout.tsx
```

---

## 2. TypeScript: `"categories"` is not assignable to type `"users" | "media" | ...`

**Cause:** `src/payload-types.ts` is stale. It only knows the collections that existed the last time types were generated. The config was fine.

**Fix:** regenerate the types (see section 3 for the command that actually works here).

After generating:

```bash
grep -n "categories" src/payload-types.ts
```

You should see `categories: Category;` inside `Config`. Then in VS Code run **`TypeScript: Restart TS Server`**.

> Run the generator again every time you add a collection or change fields.

---

## 3. `payload generate:types` crashes with `Illegal constructor`

**Error**

```
TypeError: Illegal constructor
    at new CacheStorage (node_modules/undici/lib/web/cache/cachestorage.js)
    at ... node_modules/tsx/dist/require-...mjs
```

Variants we also saw:

- `bunx --bun payload generate:types` → `Cannot find module 'tsx://...'`
- `bun --bun node_modules/payload/bin.js generate:types` → same `tsx://` error

**What we tried that did NOT help**

- Switching Node 26 → Node 22 (same error)
- `npx` / `node node_modules/payload/bin.js` (same error)
- Reinstalling `node_modules` and `bun.lock`
- Overriding `undici` (Payload already ships a current version, 7.29.1; `tsx` was also current at 4.23.15)

**What it seems to be:** the Payload CLI loads `tsx`, and `tsx` loading `undici` crashes. Running the CLI under Bun fails because `tsx` doesn't work under Bun. We did not pin down the exact root cause, but we didn't need to.

**Fix that works:** skip the CLI and call Payload's `generateTypes` function from our own script, run with Bun.

1. Create `scripts/generate-types.ts`:

   ```ts
   import { generateTypes } from 'payload/node'
   import config from '../src/payload.config'

   await generateTypes(await config, { log: true })
   process.exit(0)
   ```

2. Add to `package.json`:

   ```json
   "scripts": {
     "generate:types": "bun --env-file=.env scripts/generate-types.ts"
   }
   ```

3. Run:

   ```bash
   bun run generate:types
   ```

   Expected output:

   ```
   INFO: Compiling TS types for Collections and Globals...
   INFO: Types written to .../src/payload-types.ts
   ```

**Optional:** regenerate on every dev start:

```json
"dev": "bun run generate:types && next dev"
```

---

## 4. Custom route returns nothing useful

A route that calls `payload.find(...)` but never returns the result only returns a placeholder message.

```ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const GET = async () => {
  const payload = await getPayload({ config: configPromise })

  const data = await payload.find({
    collection: 'categories',
  })

  return Response.json(data)
}
```

With query params:

```ts
export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit')) || 10

  const payload = await getPayload({ config: configPromise })
  const data = await payload.find({ collection: 'categories', limit })

  return Response.json(data)
}
```

---

## 5. `Cannot find module '@payloadcms/next/withPayload'`

**Cause:** dependencies missing from `node_modules` at that moment.

**Fix:**

```bash
bun install
```

Also make sure `next.config.ts` wraps the config with `withPayload`.

---

## 6. Random characters in `payload.config.ts`

Stray keystrokes saved into the config produced errors like:

```
Module not found: Can't resolve ''          (import {} from "")
ReferenceError: C is not defined            (collections: [Users, Media, C])
ReferenceError: a is not defined            (...import.meta.url);a)
```

**Fix:** open the file at the line from the stack trace and remove the stray text. If a collection is missing, make sure it's both imported and listed:

```ts
import { Categories } from "./collections/Categories"

collections: [Users, Media, Categories],
```

---

## 7. Notes

- Types are auto-generated in dev when Payload initializes (`typescript.autoGenerate` defaults to `true`), but it's not reliable enough to depend on. Use `bun run generate:types`.
- The `.env` file must contain `DATABASE_URL` and `PAYLOAD_SECRET`.
- Typos in terminal commands cost us time (`generate:types~`, `payload-types.ts~`). If a command says "No such file", check the end of the line.
- Stale browser/dev-server state can cause errors like `Module ... was instantiated because it was required from module ... but the module factory is not available`. Fix with `rm -rf .next`, restart the dev server, and hard-reload the browser.

---

## Quick checklist after adding a collection

1. Create `src/collections/YourCollection.ts` with a `slug`.
2. Import it and add it to `collections` in `src/payload.config.ts`.
3. `bun run generate:types`
4. Restart the TS server in VS Code.
5. `bun run dev`