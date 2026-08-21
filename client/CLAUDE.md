# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ
from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before
writing any Next-specific code. Heed deprecation notices.

Confirmed examples in this codebase:

- `params` in a page is a `Promise`. Server components `await` it; client components use
  `use(params)`. The Next 14 synchronous signature is wrong here.
