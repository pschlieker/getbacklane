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

## How consumers install it

The repository root is the npm package (see the root `package.json`), so the app and
website depend on the main branch directly:

```json
"@backlane/setup-guide": "github:pschlieker/getbacklane#main"
```

Their lockfiles pin the commit for `npm ci`. Each consumer runs
`npm update @backlane/setup-guide` before deploying, so every deploy ships the latest
main. Anything merged to main therefore reaches the app and website on their next
deploy: run `npm test`, `npm run docs:generate` and `npm run docs:check` before merging,
and keep changes backwards compatible with the exported API in `index.d.ts`.

The package is private to prevent accidental npm publication. Never edit the
installed or generated copies.
