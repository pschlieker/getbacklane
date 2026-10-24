// Builds the ZIP uploaded to the OpenAI plugin portal (ChatGPT and Codex).
// Usage: npm run package:openai   (writes dist/backlane-openai-<version>.zip)

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
if ((cases.positive ?? []).length < 5) warnings.push("fewer than 5 positive review test cases");
if ((cases.negative ?? []).length < 3) warnings.push("fewer than 3 negative review test cases");
if (!openai.review?.demo_recording_url) warnings.push("review.demo_recording_url is not set (required for MCP review)");
if (!openai.publication?.countries) warnings.push("publication.countries is not set");

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}

const out = join(root, "dist", `backlane-openai-${manifest.version}.zip`);
mkdirSync(dirname(out), { recursive: true });
rmSync(out, { force: true });
execFileSync("zip", ["-qr", "-X", out, ".codex-plugin", ".mcp.json", "skills", "assets", "LICENSE", "README.md", "-x", "*.DS_Store"], {
  cwd: root,
  stdio: "inherit",
});
console.log(`Wrote ${out}`);
