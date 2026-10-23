import { setupContent } from './content.js';
export { setupContent };

export const defaults = {
  mcpUrl: 'https://app.getbacklane.com/mcp',
  appUrl: 'https://app.getbacklane.com',
  websiteUrl: 'https://getbacklane.com',
  repositoryUrl: 'https://github.com/pschlieker/getbacklane',
};

const clients = [
  { id: 'chatgpt', name: 'ChatGPT', logo: 'openai', docs: 'https://developers.openai.com/api/docs/guides/custom-mcp-server', setupLink: 'https://chatgpt.com/plugins' },
  { id: 'claude', name: 'Claude', logo: 'claude', docs: 'https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp' },
  { id: 'claudeCode', name: 'Claude Code', logo: 'claude', docs: 'https://code.claude.com/docs/en/mcp' },
  { id: 'cursor', name: 'Cursor', logo: 'cursor', docs: 'https://cursor.com/docs/mcp' },
  { id: 'vscode', name: 'VS Code', logo: 'vscode', docs: 'https://code.visualstudio.com/docs/agents/reference/mcp-configuration' },
];

function httpsUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || /[\s'"`$\\]/.test(value)) {
    throw new Error('Setup URLs must be HTTPS URLs without credentials or shell metacharacters.');
  }
  return value;
}

/** Framework-free view model. Each caller owns its copy and its presentation. */
export function createSetupGuide(options = {}) {
  const lang = options.lang ?? 'en';
  if (!(lang in setupContent)) throw new Error(`Unsupported guide language: ${lang}`);
  const mcpUrl = httpsUrl(options.mcpUrl ?? defaults.mcpUrl);
  const appUrl = httpsUrl(options.appUrl ?? defaults.appUrl);
  const copy = structuredClone(setupContent[lang]);
  const command = `claude mcp add --transport http backlane '${mcpUrl}'`;
  const snippets = {
    chatgpt: { label: copy.ui.connectionFields, language: 'text', code: lang === 'de'
      ? `Name: backlane\nBeschreibung: Marktplatz-APIs (Bestellungen, Angebote, Bestand)\nVerbindung (Server-URL): ${mcpUrl}\nAuthentifizierung: OAuth`
      : `Name: backlane\nDescription: Marketplace APIs (orders, offers, inventory)\nConnection (Server URL): ${mcpUrl}\nAuthentication: OAuth` },
    claudeCode: { label: 'Terminal', language: 'sh', code: command },
    cursor: { label: '~/.cursor/mcp.json', language: 'json', code: JSON.stringify({ mcpServers: { backlane: { url: mcpUrl } } }, null, 2) },
    vscode: { label: '.vscode/mcp.json', language: 'json', code: JSON.stringify({ servers: { backlane: { type: 'http', url: mcpUrl } } }, null, 2) },
  };
  return {
    lang, mcpUrl, appUrl, copy,
    docsUrl: `${defaults.websiteUrl}${lang === 'de' ? '/docs/' : '/en/docs/'}`,
    pluginCommand: '/plugin marketplace add pschlieker/getbacklane\n/plugin install backlane@backlane',
    clients: clients.map(client => ({ ...client, steps: copy.clientSteps[client.id], snippet: snippets[client.id] })),
  };
}

export function renderClientMarkdown(guide, client) {
  const t = guide.copy;
  return [
    `## ${client.name}`,
    ...(client.setupLink ? [`[${client.name}](${client.setupLink})`] : []),
    client.steps.map(([title, text], i) => `${i + 1}. **${title}** — ${text}`).join('\n'),
    ...(client.snippet ? [`**${client.snippet.label}**\n\n\`\`\`${client.snippet.language}\n${client.snippet.code}\n\`\`\``, ...(client.snippet.language === 'json' ? [t.configNote] : [])] : []),
    ...(client.id === 'claudeCode' ? [`### ${t.ui.plugin}\n\n\`\`\`text\n${guide.pluginCommand}\n\`\`\``] : []),
    `[${t.details.docsLabel}](${client.docs})`,
  ].join('\n\n');
}

export function renderSetupMarkdown(options = {}) {
  const guide = createSetupGuide(options);
  const { copy: t } = guide;
  const d = t.details;
  return [
    `# ${t.guideTitle}`, `> ${t.guideIntro}`, d.checked,
    `[${t.ui.fullGuide}](${guide.docsUrl})`,
    `## ${d.prerequisitesTitle}`, d.prerequisites, t.guideNote, d.marketplaces,
    `## ${d.connectionTitle}`, `[Backlane](${guide.appUrl})`, `MCP: ${guide.mcpUrl}`, d.endpointNote,
    `## ${d.stepsTitle}`, t.steps.map(([title, text], i) => `${i + 1}. **${title}** — ${text}`).join('\n'),
    ...guide.clients.map(client => renderClientMarkdown(guide, client)),
    `## ${d.verifyTitle}`, `> ${d.verifyPrompt}`, d.verifyText,
    `## ${d.examplesTitle}`, ...d.examples.map(item => `### ${item.title}\n\n> ${item.prompt}\n\n${item.result}`),
    `## ${d.permissionsTitle}`, d.permissions.map(text => `- ${text}`).join('\n'),
    `## ${d.troubleshootingTitle}`, d.troubleshooting.map(text => `- ${text}`).join('\n'),
    `## ${d.guidanceTitle}`, t.agentInstructions, d.nextText,
    `## ${d.repositoryTitle}`, d.repositoryIntro,
    `- [GitHub](${defaults.repositoryUrl})\n- [${d.repositorySkillLabel}](${defaults.repositoryUrl}/blob/main/skills/backlane/SKILL.md)`,
    `${d.contactLabel}: hello@shop-vibes.de`,
  ].join('\n\n') + '\n';
}
