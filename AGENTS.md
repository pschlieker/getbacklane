# AGENTS.md

Guidance for coding agents working in this repo. `.claude/CLAUDE.md` points here.

## What this repo is

The public, agent-side half of Backlane: skills, setup guides and plugin
manifests. The MCP server itself lives in a separate private repo and runs at
`https://app.getbacklane.com/mcp` (tools: `list_integrations`, `search`,
`execute`).

## Conventions

- One skill per folder under `skills/<name>/SKILL.md`, with longer material in
  `references/`.
- The MCP URL appears in `.mcp.json`, `.cursor-plugin/plugin.json`,
  `gemini-extension.json`, `skills/backlane/references/setup.md` and
  `docs/setup/`. Change all of them together.
- Keep the version in `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`,
  `.codex-plugin/plugin.json`, `gemini-extension.json` and
  `skills/backlane/SKILL.md` in sync.
- `.codex-plugin/plugin.json` is the ChatGPT/Codex manifest: listing copy,
  review test cases and the `skills/get-started` onboarding skill. Build the
  portal upload with `npm run package:openai` (writes `dist/`). Raise the version
  for every new upload.
- Never put credentials or customer data in this repo. It is public.
- Setup instructions are maintained in `packages/setup-guide/`. The Markdown in
  `docs/setup/` and `skills/backlane/references/setup.md` is generated; run
  `npm run docs:generate` after editing the shared source, then `npm test` and
  `npm run docs:check`. The app and website install this repo's main branch as
  `@backlane/setup-guide` and pick up changes on their next deploy, so keep the
  exported API in `index.d.ts` backwards compatible.

## Testing a local edit

```bash
claude --plugin-dir .
claude plugin validate .
```

For Codex, add this repo as a local marketplace
(`.agents/plugins/marketplace.json`):

```bash
codex plugin marketplace add .
```
