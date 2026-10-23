import test from 'node:test';
import assert from 'node:assert/strict';
import { createSetupGuide, renderSetupMarkdown } from '../index.js';

test('both locales cover every client, OAuth and a read-only verification', () => {
  for (const lang of ['de', 'en']) {
    const guide = createSetupGuide({ lang });
    assert.deepEqual(guide.clients.map(c => c.id), ['chatgpt', 'claude', 'claudeCode', 'cursor', 'vscode']);
    for (const client of guide.clients) {
      assert.ok(client.steps.length >= 2);
      for (const step of client.steps) assert.ok(step.every(text => text.trim()));
      assert.ok(renderSetupMarkdown({ lang }).includes(`## ${client.name}`));
    }
    assert.match(guide.copy.details.verifyText, /list_integrations/);
    assert.match(guide.copy.details.endpointNote, /OAuth/);
  }
});

test('all executable configuration uses the supplied environment without tokens', () => {
  const mcpUrl = 'https://staging.example.test/mcp?mode=preview&version=2';
  const guide = createSetupGuide({ lang: 'de', mcpUrl });
  const byId = Object.fromEntries(guide.clients.map(c => [c.id, c]));
  assert.deepEqual(JSON.parse(byId.cursor.snippet.code), { mcpServers: { backlane: { url: mcpUrl } } });
  assert.deepEqual(JSON.parse(byId.vscode.snippet.code), { servers: { backlane: { type: 'http', url: mcpUrl } } });
  assert.equal(byId.claudeCode.snippet.code, `claude mcp add --transport http backlane '${mcpUrl}'`);
  assert.match(byId.chatgpt.snippet.code, /Authentifizierung: OAuth/);
  for (const client of guide.clients.filter(c => c.snippet)) {
    assert.ok(client.snippet.code.includes(mcpUrl));
    assert.ok(!client.snippet.code.includes('https://app.getbacklane.com/mcp'));
  }
});

test('rejects credentials and unsafe values before creating shell snippets', () => {
  for (const mcpUrl of ['http://example.test/mcp', 'https://user:secret@example.test/mcp', "https://example.test/a'", 'https://example.test/$(id)', 'https://example.test/mcp\nnext']) {
    assert.throws(() => createSetupGuide({ mcpUrl }));
  }
  assert.throws(() => createSetupGuide({ lang: 'fr' }));
});

test('consumer changes do not leak to another request or locale', () => {
  const first = createSetupGuide({ lang: 'en' });
  first.clients[0].steps[0][1] = 'changed';
  const next = createSetupGuide({ lang: 'en' });
  assert.notEqual(next.clients[0].steps[0][1], 'changed');
  assert.equal(createSetupGuide({ lang: 'de' }).copy.ui.language, 'de');
});
