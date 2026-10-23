export type Language = 'de' | 'en';
export type ClientId = 'chatgpt' | 'claude' | 'claudeCode' | 'cursor' | 'vscode';
export type Step = [title: string, text: string];
export interface SetupDetails {
  checked: string; guidanceTitle: string; prerequisitesTitle: string; prerequisites: string;
  connectionTitle: string; endpointNote: string; stepsTitle: string; docsLabel: string;
  verifyTitle: string; verifyPrompt: string; verifyText: string;
  troubleshootingTitle: string; troubleshooting: string[]; nextTitle: string; nextText: string;
  repositoryTitle: string; repositoryIntro: string; repositorySetupLabel: string; repositorySkillLabel: string;
  pricingTitle: string; contactLabel: string; permissionsTitle: string; permissions: string[];
  marketplaces: string; examplesTitle: string; examples: { title: string; prompt: string; result: string }[];
}
export interface SetupCopy {
  steps: Step[]; guideTitle: string; guideIntro: string; serverUrlLabel: string;
  copyUrl: string; copyConfig: string; copyCommand: string; setupCopyFailed: string;
  clientLabel: string; configNote: string; claudeCodeTitle: string; claudeCodeIntro: string;
  clientSteps: Record<ClientId, Step[]>; guideNote: string; agentInstructions: string;
  details: SetupDetails;
  ui: { language: Language; hintTitle: string; intro: string; url: string; copy: string; copied: string;
    guide: string; fullGuide: string; docs: string; plugin: string; connectionFields: string; configuration: string };
}
export interface ClientGuide {
  id: ClientId; name: string; logo: string; docs: string; setupLink?: string;
  steps: Step[]; snippet?: { label: string; language: 'json' | 'sh' | 'text'; code: string };
}
export interface SetupGuide {
  lang: Language; mcpUrl: string; appUrl: string; docsUrl: string; copy: SetupCopy;
  pluginCommand: string; clients: ClientGuide[];
}
export interface GuideOptions { lang?: Language; mcpUrl?: string; appUrl?: string }
export const setupContent: Record<Language, SetupCopy>;
export const defaults: { mcpUrl: string; appUrl: string; websiteUrl: string; repositoryUrl: string };
export function createSetupGuide(options?: GuideOptions): SetupGuide;
export function renderClientMarkdown(guide: SetupGuide, client: ClientGuide): string;
export function renderSetupMarkdown(options?: GuideOptions): string;
