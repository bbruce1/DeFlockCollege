# Skin families

One file per family. Each exports a `skins` array, and the loader in
`../skins.ts` collects every file in this directory automatically — nothing
shared needs editing to add one.

```ts
import type { Skin } from '../skins';

export const skins: Skin[] = [ /* ... */ ];
```

Rules that keep the set coherent:

- **`id` must be unique across every file**, and stable forever. A chapter is
  assigned its look by hashing its slug against the sorted set, so renaming an
  id silently redecorates somebody's page.
- **`signal` is reserved for the cameras.** It is never a decorative accent.
- Contrast `ink` against `bg`, and `accentInk` against `accent`, at 4.5:1 for
  body text and 3:1 for large text and buttons. A school's own colours may
  replace `accent` at render time, so `accentInk` has to hold up against a
  colour you did not choose.
- Every skin renders the same sections in the same order. Only the look varies.
