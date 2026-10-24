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
| `skills/mirakl-product-data/` | Validate and fix product data on Mirakl marketplaces (e.g. Home24) |
| `skills/otto-ads/` | OTTO Sponsored Product Ads: campaigns, bids, keywords and reports |
| `skills/listing-health/` | Check whether products are live on OTTO, Kaufland and Mirakl, and why not |
| `skills/customer-service/` | Answer buyer tickets and messages, resolve incidents and handle returns on Kaufland, Mirakl and OTTO |
| `docs/setup/` | Setup guides per AI client |
| `packages/setup-guide/` | Shared DE/EN instructions and config generators used by the app and website |
| `.claude-plugin/`, `.mcp.json` | Claude Code plugin and marketplace |
| `.cursor-plugin/` | Cursor plugin |
| `gemini-extension.json` | Gemini CLI extension |

## Supported marketplaces

- OTTO Market
- Kaufland
- Mirakl-based marketplaces

## Maintaining the setup guide

Edit `packages/setup-guide/content.js` and its configuration generators. Run
`npm test` and `npm run docs:generate`; `npm run docs:check` detects stale Markdown.
The app and website install this repo's main branch directly and pick up changes on
their next deploy; see [the package README](packages/setup-guide/README.md).
