// Builds the ZIP uploaded to the OpenAI plugin portal (ChatGPT and Codex).
// Usage: npm run package:openai   (writes dist/backlane-openai-<version>.zip)

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createSetupGuide } from "../packages/setup-guide/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, ".codex-plugin/plugin.json"), "utf8"));
const mcp = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8"));
const ui = manifest.interface;
const openai = manifest.extensions?.["com.openai"] ?? {};

const errors = [];
const warnings = [];
const maxLength = (label, value, max) => {
  if (value && value.length > max) errors.push(`${label} is ${value.length} characters (max ${max})`);
};

maxLength("interface.displayName", ui.displayName, 30);
maxLength("interface.shortDescription", ui.shortDescription, 30);
maxLength("interface.longDescription", ui.longDescription, 4000);
maxLength("description", manifest.description, 4000);
if ((ui.defaultPrompt ?? []).length > 3) errors.push("interface.defaultPrompt has more than 3 prompts");
for (const prompt of ui.defaultPrompt ?? []) maxLength(`defaultPrompt "${prompt}"`, prompt, 128);

const paths = [ui.composerIcon, ui.composerIconDark, ui.logo, ui.logoDark, ...(ui.screenshots ?? []), openai.onboardingSkill];
for (const path of paths.filter(Boolean)) {
  if (!path.startsWith("./")) errors.push(`${path} must start with ./`);
  if (!existsSync(join(root, path))) errors.push(`${path} is referenced but missing`);
}

const servers = Object.values(mcp.mcpServers ?? {});
if (servers.length !== 1) errors.push(`.mcp.json must declare exactly one server, found ${servers.length}`);
if (servers.some((server) => server.headers && Object.keys(server.headers).length)) errors.push(".mcp.json must not set headers");

// Required for MCP review; these are entered in the portal if missing here.
for (const field of ["supportURL", "termsOfServiceURL"]) {
  if (!ui[field]) warnings.push(`interface.${field} is not set (required for MCP review)`);
}
const cases = openai.review?.test_cases ?? {};
if ((cases.positive ?? []).length !== 5) errors.push(`expected exactly 5 positive review test cases, found ${(cases.positive ?? []).length}`);
if ((cases.negative ?? []).length !== 3) errors.push(`expected exactly 3 negative review test cases, found ${(cases.negative ?? []).length}`);
if (!openai.review?.demo_recording_url) warnings.push("review.demo_recording_url is not set (required for MCP review)");
if (!openai.publication?.countries) warnings.push("publication.countries is not set");

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}

// Stage the package so the ZIP can carry plugin-specific files without changing the repo.
const included = [".codex-plugin", ".mcp.json", "skills", "assets", "LICENSE", "README.md"];
const stage = join(root, "dist", "openai-stage");
rmSync(stage, { recursive: true, force: true });
for (const path of included) cpSync(join(root, path), join(stage, path), { recursive: true });

// The repo's setup.md covers every AI client, including install commands that pull code
// from the unpinned GitHub repo. Inside ChatGPT and Codex the plugin already ships the MCP
// server, so the packaged copy only explains signing in.
writeFileSync(join(stage, "skills/backlane/references/setup.md"), renderPluginSetup(mcp));

// The OpenAI skill scan flags instructions that install or load code from mutable sources.
const forbidden = [
  /\/plugin (marketplace add|install)/,
  /\bclaude mcp add\b/,
  /\bnpx\b/,
  /\b(curl|wget)\b/,
  /\bgit clone\b/,
  /\b(npm|pip|uv|brew) (i|install|add)\b/,
  /\/blob\/main\//,
  /@latest\b/,
];
const findings = [];
for (const file of listFiles(join(stage, "skills"))) {
  const text = readFileSync(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(text)) findings.push(`${relative(stage, file)} matches ${pattern}`);
  }
}
if (findings.length) {
  for (const finding of findings) console.error(`error: ${finding} (install from a mutable source)`);
  process.exit(1);
}

const out = join(root, "dist", `backlane-openai-${manifest.version}.zip`);
mkdirSync(dirname(out), { recursive: true });
rmSync(out, { force: true });
execFileSync("zip", ["-qr", "-X", out, ...included, "-x", "*.DS_Store"], {
  cwd: stage,
  stdio: "inherit",
});
rmSync(stage, { recursive: true, force: true });
console.log(`Wrote ${out}`);

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

function renderPluginSetup(mcpConfig) {
  const guide = createSetupGuide({ lang: "en", mcpUrl: Object.values(mcpConfig.mcpServers)[0].url });
  const t = guide.copy;
  const d = t.details;
  const [accountStep, marketplaceStep] = t.steps;
  const steps = [
    accountStep,
    marketplaceStep,
    ["Sign in from the plugin", "Backlane is already installed as a plugin. Complete the Backlane sign-in from the plugin's connection prompt in ChatGPT or Codex, then start a new chat."],
  ];
  return [
    "<!-- Generated by npm run package:openai from packages/setup-guide for the ChatGPT/Codex plugin. Do not edit directly. -->",
    "# Set up Backlane in ChatGPT and Codex",
    "> Backlane is installed as a plugin, which already includes the Backlane MCP server. Setup only means signing in and connecting a marketplace. Do not install other software or add the server manually.",
    `[${t.ui.fullGuide}](${guide.docsUrl})`,
    `## ${d.prerequisitesTitle}`, d.prerequisites, t.guideNote, d.marketplaces,
    `## ${d.connectionTitle}`, `[Backlane](${guide.appUrl})`, `MCP: ${guide.mcpUrl}`, d.endpointNote,
    `## ${d.stepsTitle}`, steps.map(([title, text], i) => `${i + 1}. **${title}** — ${text}`).join("\n"),
    `## ${d.verifyTitle}`, `> ${d.verifyPrompt}`, d.verifyText,
    `## ${d.examplesTitle}`, ...d.examples.map((item) => `### ${item.title}\n\n> ${item.prompt}\n\n${item.result}`),
    `## ${d.permissionsTitle}`, d.permissions.map((text) => `- ${text}`).join("\n"),
    `## ${d.troubleshootingTitle}`, d.troubleshooting.map((text) => `- ${text}`).join("\n"),
    `## ${d.guidanceTitle}`,
    "First ask whether I already have a Backlane account. Then guide me step by step: create an account or sign in, connect a marketplace in Backlane, and complete the Backlane sign-in from the plugin's connection prompt. Never ask for marketplace credentials, API keys or passwords in chat. After setup, ask me to list my connected marketplaces through Backlane to check the connection.",
    d.nextText,
    `${d.contactLabel}: hello@shop-vibes.de`,
  ].join("\n\n") + "\n";
}
