# Backlane

**Let your AI assistant run your OTTO Market, Kaufland and Mirakl accounts.**

Backlane is a remote MCP server. Connect your marketplace accounts once in the
[Backlane app](https://app.getbacklane.com/app), add one URL to your AI client,
and ask about orders, offers, prices and inventory in plain language.

This repo holds the agent side: setup guides, skills and plugin manifests.

## Quick start

MCP server URL:

```
https://app.getbacklane.com/mcp
```

**Claude Code** (plugin with skills):

```bash
/plugin marketplace add pschlieker/getbacklane
/plugin install backlane@backlane
```

Other clients: see [docs/setup](docs/setup/README.md) for Claude, ChatGPT,
Cursor and VS Code.

Then ask:

> *"Is Backlane working? Which marketplaces are connected?"*

## What's in here

| Path | What |
|---|---|
| `skills/backlane/` | The Backlane skill: how the agent uses the MCP tools |
| `docs/setup/` | Setup guides per AI client |
| `.claude-plugin/`, `.mcp.json` | Claude Code plugin and marketplace |
| `.cursor-plugin/` | Cursor plugin |
| `gemini-extension.json` | Gemini CLI extension |

## Supported marketplaces

- OTTO Market
- Kaufland
- Mirakl-based marketplaces
