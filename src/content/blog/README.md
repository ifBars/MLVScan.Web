# Publishing blog posts

Posts use the site's existing MDX pipeline. No CMS account or new service is needed.

1. Write a draft under `_drafts/`. This folder is excluded from the blog's MDX glob and production chunks.
2. When ready, move the file to this directory with a lowercase, hyphenated filename, e.g. `scanner-update.mdx`.
3. Add its metadata to `src/blog/registry.ts`. The `slug` must match the filename without `.mdx`. Use a real publication date in `YYYY-MM-DD` format, an author, a short description, tags, and one of the existing categories.
4. Start the body at heading level two; the page supplies the title, description, author, and dates. Standard Markdown links, lists, quotes, images, and code blocks work. MDX is trusted source code: review contributions as code.
5. Run `bun run lint`, `bun run test`, and `bun run build`, then review `/blog` and `/blog/<slug>` in preview.
6. Submit the change through the normal PR workflow. Merge/deployment publishes the post, adds it to `/blog/feed.xml` and the sitemap, and generates social metadata.

Posts sort newest first. Set `updatedDate` when revising a published article. Keep published slugs stable so links and RSS identifiers continue to work.

Dates are editorial metadata, not a scheduler. Do not register a future post until it is ready to publish. Drafts are never linked or included in RSS/sitemap; keep them in `_drafts/` until publication. The telemetry draft is an outline to finish and review, not a feature announcement.
