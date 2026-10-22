# Claude Code

## Option A: plugin (MCP server + skills)

```bash
/plugin marketplace add pschlieker/getbacklane
/plugin install backlane@backlane
```

## Option B: MCP server only

```bash
claude mcp add --transport http backlane https://app.getbacklane.com/mcp
```

Then open `/mcp` in Claude Code, pick `backlane` and sign in.

## Check

Ask: *"Is Backlane working? Which marketplaces are connected?"*
