# Advisories System

## Overview

The advisories section is a blog-style platform for publishing security advisories about MLVScan, including malware analysis, scanner bypass incidents, false positives, and security updates.

## Architecture

**Blog-style layout:**
- Latest advisory featured at the top with full preview
- Older advisories in reverse chronological list below
- Search functionality to filter advisories
- Direct linking to specific advisories via `/advisories/:slug`

**No sidebar** - Clean, focused reading experience with centered content (max-width: 4xl)

## Directory Structure

```
src/
├── advisories/
│   ├── types.ts           # TypeScript type definitions
│   └── registry.ts        # Central advisory registry
├── components/advisories/
│   ├── AdvisoriesLayout.tsx  # Main layout wrapper
│   ├── AdvisoryHeader.tsx    # Advisory metadata display
│   ├── AdvisoryCard.tsx      # Card component for list view
│   ├── AdvisorySearch.tsx    # Search input component
│   ├── SeverityBadge.tsx     # Color-coded severity badges
│   └── TypeBadge.tsx         # Type indicator with icons
├── content/advisories/
│   ├── TEMPLATE.mdx          # Template for new advisories
│   └── *.mdx                 # Individual advisory posts
└── pages/
    └── AdvisoriesPage.tsx    # Main page (list + detail views)
```

## Creating a New Advisory

### 1. Copy the Template

```bash
cp src/content/advisories/TEMPLATE.mdx src/content/advisories/YYYY-MM-slug.mdx
```

**Naming convention:** `YYYY-MM-descriptive-slug.mdx` (e.g., `2025-02-false-positive-lethallizard-modmanager.mdx`)

### 2. Edit the MDX Content

Fill in the template sections:
- **Summary** - Brief 2-3 sentence overview
- **Technical Details** - In-depth analysis with code snippets
- **Detection** - How MLVScan detected (or didn't detect) the issue
- **Recommendations** - Actionable guidance for users and developers
- **Timeline** - Key dates in the discovery/resolution process
- **References** - Links to related resources

### 3. Add to Registry

Edit `src/advisories/registry.ts` and add a new entry to the `advisories` array:

```typescript
{
  id: 'unique-identifier',
  title: 'Your Advisory Title',
  slug: '2025-MM-your-slug',
  type: 'malware-analysis', // or 'bypass-incident', 'false-positive', 'security-update'
  severity: 'medium', // critical | high | medium | low | info
  publishedDate: '2025-03-15',
  updatedDate: '2025-03-20', // optional
  affectedVersions: ['MLVScan.Core 1.1.6 and below'], // optional
  description: 'Brief summary for the card view (150-200 chars)',
  contentPath: '2025-MM-your-slug.mdx',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
}
```

### 4. Test Locally

```bash
bun run dev
# Navigate to http://localhost:5173/advisories
```

## Advisory Types

| Type | Icon | Description |
|------|------|-------------|
| `malware-analysis` | Shield | Deep-dive analysis of malicious mods |
| `bypass-incident` | AlertTriangle | Scanner bypass/evasion techniques |
| `false-positive` | Info | Legitimate patterns incorrectly flagged |
| `security-update` | Lock | MLVScan security patches or rule updates |

## Severity Levels

| Severity | Color | Use Case |
|----------|-------|----------|
| `critical` | Red | Actively exploited vulnerabilities, complete bypass |
| `high` | Orange | Serious security issues, major false positives |
| `medium` | Yellow | Moderate issues, common false positives |
| `low` | Blue | Minor issues, edge case false positives |
| `info` | Gray | Informational advisories, announcements |

## Search Functionality

The search filters advisories by:
- Title
- Description
- Keywords
- Advisory type
- Severity

Search is case-insensitive and updates results in real-time.

## Direct Linking

Each advisory has a permanent URL:
```
/advisories/YYYY-MM-slug
```

Example:
```
/advisories/2025-02-false-positive-lethallizard-modmanager
```

## Testing

Run the test suite to verify registry functions:

```bash
bun run test src/advisories/registry.test.ts
```

Tests cover:
- Advisory retrieval by slug
- Filtering by type and severity
- Date sorting (descending/ascending)
- Year-based grouping

## Best Practices

1. **Be transparent** - Clearly explain what happened and why
2. **Be actionable** - Provide specific steps for users and developers
3. **Be timely** - Publish advisories as soon as issues are resolved
4. **Use code examples** - Show actual patterns that triggered detection
5. **Include timeline** - Document discovery → analysis → fix → disclosure
6. **Link to fixes** - Reference GitHub commits, releases, or PRs

## Example Advisory Structure

```markdown
## Summary
Brief 2-3 sentence overview accessible to non-technical users.

## Technical Details
Deep technical analysis with code snippets, IL patterns, etc.

### Sub-sections
Break down complex topics into digestible parts.

## Detection
How MLVScan detected (or failed to detect) the pattern.

## Resolution
What was fixed and in which version.

## Recommendations
### For Users
- Actionable steps for end users

### For Developers
- Best practices to avoid similar issues

## Timeline
- Date: Event description

## References
- Links to related resources
```

## Styling

- Uses Tailwind CSS v4
- Color scheme: Teal accents on dark gray background
- Responsive design (mobile-first)
- Prose styling for MDX content via `prose prose-invert prose-teal`

## Routes

| Route | Description |
|-------|-------------|
| `/advisories` | Blog-style list view (latest featured + search) |
| `/advisories/:slug` | Individual advisory detail view |

## Future Enhancements

Potential improvements for later:
- RSS/Atom feed generation
- JSON API endpoint (`/advisories.json`)
- Email subscription for new advisories
- Advisory tagging system
- Related advisories suggestions
- Advisory versioning (updates/amendments)
