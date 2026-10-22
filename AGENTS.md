# AGENTS.md

Guidance for coding agents working in this repo. `CLAUDE.md` points here.

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
  `gemini-extension.json` and `skills/backlane/SKILL.md` in sync.
- Never put credentials or customer data in this repo. It is public.

## Testing a local edit

```bash
claude --plugin-dir .
```
