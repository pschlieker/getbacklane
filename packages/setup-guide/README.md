# Shared Backlane setup guide

The source of truth for the app, marketing website and generated agent guides.
`content.js` holds German and English copy. `index.js` produces client steps,
configurations and Markdown. The package has no runtime dependencies, HTML,
framework, CSS, network calls or authentication requirements.

```js
import { createSetupGuide } from '@backlane/setup-guide';
const guide = createSetupGuide({ lang: 'de', mcpUrl: 'https://app.getbacklane.com/mcp' });
```

Render `guide.clients` and `guide.copy` in the consumer's own design. Pass the
configured environment URL in the app; never include credentials. Each call
returns an independent model. Existing JSON configs must be merged, not replaced.

## Update all consumers

1. Edit this package and bump its version for each release.
2. Run `npm test`, `npm run docs:generate`, then `npm run docs:check` at the repo root.
3. Run `npm run guide:sync -- /path/to/website /path/to/app`. Add `--offline` when dependencies are cached.
4. Test both consumers and commit their package lockfiles, `vendor/*.tgz` and
   `vendor/setup-guide.json`, together with this repo's source and generated docs.

Consumers use the same versioned npm tarball, checked into each repo for reproducible
builds without registry credentials or a dependency on unpublished Git commits.
The sync command refuses to replace an existing version with different contents.
Never edit the installed or generated copies. Updating both pinned versions is an
explicit release step, not a runtime fetch from GitHub.

The package is private to prevent accidental npm publication. Distribution is via
the committed tarball; the public repository's code and documentation are the source.
