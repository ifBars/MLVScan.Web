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

## Editable starting posts

The initial posts are examples to review and adapt in this PR. They are registered so they can be read in staging; merging and deploying the PR will publish them. All use October 30 as the article date rather than backdating publication to the underlying release or commit.

| File | Example format | Source material |
| --- | --- | --- |
| `welcome-to-the-mlvscan-blog.mdx` | Maintainer introduction and expectations | The blog request, existing documentation/advisory split, and the ecosystem's public tools. Keep this slug stable even if the title changes. |
| `october-update-core-1-9-1-loader-2-1-7.mdx` | Release roundup with a version table | Published October 28 releases: [Core 1.9.1](https://github.com/ifBars/MLVScan.Core/releases/tag/v1.9.1), [loader 2.1.7](https://github.com/ifBars/MLVScan/releases/tag/v2.1.7), and [DevCLI 1.3.1](https://github.com/ifBars/MLVScan.DevCLI/releases/tag/v1.3.1). Implementation: Core `d511e13`, loader `0935948`, DevCLI `8a71779`; deep mode originated in Core `105b420`. |
| `why-a-suspicious-api-is-not-a-verdict.mdx` | Engineering explanation grounded in a real change | Core [contextual Base64 change](https://github.com/ifBars/MLVScan.Core/commit/52dd6ad), [disposition model](https://github.com/ifBars/MLVScan.Core/commit/5d9f5bc), and the 1.9.1 restart behavior. No historical test count is presented as a current quality metric. |
| `scan-your-mod-before-the-release.mdx` | Practical workflow with a code sample | Public [release guard](https://github.com/ifBars/MLVScan.Action/tree/5f82ae8), its inputs and privacy behavior, the DevCLI 1.3.1 README, and `/docs/ci-attestations`. The sample explicitly selects CLI 1.3.1; the action's default remains separately pinned. |
| `_drafts/opt-in-telemetry.mdx` | Unpublished outline | Confirm collection, consent, retention, and supported versions before moving it into the published set. |

The editorial pass also checked remote histories for the API, website, bot, admin app, inspector, and experimental Unreal scanner. Those histories supplied context rather than announcements: internal operations and partner discussions aren't public commitments, and experimental projects aren't presented as general availability. Workspace-only inspector/MCP projects have no independent release history here; the local Cecil checkout is a dependency, and the video repository isn't a product release source.

The MDX pipeline supports standard Markdown, not GFM tables. Use a native `<table>` inside a focusable, horizontally scrollable region (as in the release roundup) for tabular post content. Keep scrolling and the rounded border on the wrapper so the table retains its native layout and the header fills its width. Code fences, ordinary lists, and links need no additional dependency.
