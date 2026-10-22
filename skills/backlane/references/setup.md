# Setting up the Backlane MCP server

MCP server URL: `https://app.getbacklane.com/mcp`

Sign-in happens in the browser (OAuth). There is no API key to copy.

| Client | How |
|---|---|
| Claude Code | `claude mcp add --transport http backlane https://app.getbacklane.com/mcp`, then `/mcp` and sign in |
| Claude (web & desktop) | Settings → Connectors → Add custom connector → paste the URL → Connect |
| ChatGPT | Settings → Plugins → Add custom MCP server → paste the URL → sign in |
| Cursor | Add the server to `~/.cursor/mcp.json`, then sign in from the MCP settings |
| VS Code | Add the server to `.vscode/mcp.json`, then click "Start" |

Full guides: https://github.com/pschlieker/getbacklane/tree/main/docs/setup

After setup, the user may need to restart the client. Then call
`list_integrations` to confirm it works.
