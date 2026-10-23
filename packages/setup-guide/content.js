// Canonical setup copy. Edit here; App, website and Markdown consume this data.
export const setupContent = {
  "de": {
    "steps": [
      [
        "Backlane-Account erstellen",
        "Erstelle deinen Backlane-Account oder melde dich an. Wähle die Organisation, deren Marktplätze du verbinden möchtest."
      ],
      [
        "Marktplatz verbinden",
        "Wähle deinen Marktplatz in Backlane und verbinde deinen Seller-Account."
      ],
      [
        "KI-Assistenten anbinden",
        "Verbinde Backlane mit ChatGPT, Claude, Cursor oder VS Code, melde dich an und starte deinen ersten Chat."
      ]
    ],
    "guideTitle": "Backlane als MCP-Server verbinden.",
    "guideIntro": "Kopiere die MCP-Server-URL und wähle deinen KI-Assistenten. Melde dich anschließend mit deinem Backlane-Account an.",
    "serverUrlLabel": "MCP-Server-URL",
    "copyUrl": "URL kopieren",
    "copyConfig": "Konfiguration kopieren",
    "copyCommand": "Befehl kopieren",
    "setupCopyFailed": "Automatisches Kopieren ist nicht möglich. Bitte markiere und kopiere den Text direkt.",
    "clientLabel": "KI-Assistent wählen",
    "configNote": "Schon eine Konfiguration vorhanden? Ergänze nur den backlane-Eintrag und behalte deine anderen Server bei.",
    "claudeCodeTitle": "Du nutzt Claude Code?",
    "claudeCodeIntro": "Führe diesen Befehl im Terminal aus. Öffne danach /mcp in Claude Code und melde dich bei Backlane an.",
    "clientSteps": {
      "chatgpt": [
        [
          "MCP-Plugin erstellen",
          "Öffne das Plugin-Verzeichnis → Hinzufügen → Eigenen MCP-Server hinzufügen. Trage die Verbindungsdaten unten ein. Die erweiterten OAuth-Einstellungen werden automatisch erkannt. Prüfe die Hinweise und wähle „Als Plugin erstellen“."
        ],
        [
          "Installieren & anmelden",
          "Installiere Backlane aus deinen persönlichen Plugins und schließe die Anmeldung mit deinem Backlane-Account ab."
        ],
        [
          "Im Chat auswählen",
          "Starte einen neuen Chat, wähle Backlane über @ aus und frage nach deinen verbundenen Marktplätzen."
        ]
      ],
      "claude": [
        [
          "Konnektor anlegen",
          "Öffne Customize → Connectors → + Add → Add custom connector. In Team-Workspaces muss ein berechtigtes Mitglied den Konnektor zuerst in den Organisationseinstellungen hinzufügen."
        ],
        [
          "Backlane hinzufügen",
          "Trage Backlane und die Server-URL ein. Prüfe die erkannten OAuth-Einstellungen und folge dem Verbindungsdialog zur Anmeldung."
        ],
        [
          "Im Chat aktivieren",
          "Aktiviere Backlane im Chat unter + → Connectors und frage nach deinen verbundenen Marktplätzen."
        ]
      ],
      "cursor": [
        [
          "Konfiguration öffnen",
          "Öffne die Datei ~/.cursor/mcp.json. Lege sie an, falls sie noch nicht existiert."
        ],
        [
          "Backlane eintragen",
          "Kopiere die Konfiguration und speichere sie in der Datei. Bei vorhandenen Servern ergänzt du den backlane-Eintrag."
        ],
        [
          "Anmelden & nutzen",
          "Öffne die MCP-Einstellungen in Cursor und melde dich für Backlane an. Danach kannst du Backlane im Agent-Chat nutzen."
        ]
      ],
      "vscode": [
        [
          "Server hinzufügen",
          "Öffne .vscode/mcp.json in deinem Projekt oder nutze den Befehl „MCP: Add Server“ und wähle HTTP."
        ],
        [
          "Konfiguration speichern",
          "Ergänze die Konfiguration in der Datei. Beim Einrichten per Befehl gibst du die Server-URL von oben und den Namen backlane an."
        ],
        [
          "Starten & anmelden",
          "Klicke beim Server auf „Start“ und melde dich bei Backlane an. Nutze die Verbindung anschließend in GitHub Copilot."
        ]
      ],
      "claudeCode": [
        [
          "Befehl ausführen",
          "Führe den Befehl unten im Terminal aus."
        ],
        [
          "Backlane anmelden",
          "Öffne /mcp in Claude Code, wähle backlane und schließe die Anmeldung im Browser ab."
        ],
        [
          "Verbindung prüfen",
          "Frage nach deinen verbundenen Marktplätzen."
        ]
      ]
    },
    "guideNote": "In Team-Workspaces kann eine Freigabe durch einen Administrator erforderlich sein. Menübezeichnungen und Verfügbarkeit hängen vom KI-Anbieter ab.",
    "agentInstructions": "Frage mich zuerst, welchen KI-Assistenten ich nutze und ob ich bereits einen Backlane-Account habe. Begleite mich dann Schritt für Schritt: Account erstellen oder anmelden, einen Marktplatz verbinden, Backlane als Remote-MCP-Server in meinem KI-Assistenten hinzufügen und die OAuth-Anmeldung abschließen. Die MCP-Server-URL unten gehört in die Verbindungseinstellungen; sie ist keine Webseite zum Öffnen. Das Einfügen dieses Prompts allein stellt noch keine Verbindung her. Bitte mich nach der Einrichtung, meine verbundenen Marktplätze über Backlane anzeigen zu lassen, um die Verbindung zu prüfen.",
    "details": {
      "checked": "Anleitungen geprüft: 23. Oktober 2026. Öffentlich zugänglich, ohne Anmeldung.",
      "guidanceTitle": "Hinweise für KI-Assistenten",
      "prerequisitesTitle": "Voraussetzungen",
      "prerequisites": "Du brauchst einen Backlane-Account und Zugriff auf den Seller-Account, den du verbinden möchtest. Dein KI-Client muss Remote-MCP mit OAuth unterstützen. Zugangsdaten werden im jeweiligen Anmelde- oder Verbindungsdialog eingegeben, nicht in den Chat kopiert.",
      "connectionTitle": "Verbindungsdaten",
      "endpointNote": "Transport: Streamable HTTP. Authentifizierung: OAuth. Die MCP-Server-URL ist ein technischer Endpunkt für die Client-Konfiguration. Ein 401 beim Öffnen im Browser ohne Anmeldung ist zu erwarten und kein Verbindungstest.",
      "stepsTitle": "Einrichtung",
      "docsLabel": "Offizielle Anleitung",
      "verifyTitle": "Verbindung prüfen",
      "verifyPrompt": "Welche Marktplätze habe ich mit Backlane verbunden?",
      "verifyText": "Lass deinen KI-Assistenten dafür das Backlane-Tool list_integrations aufrufen. Ein erfolgreicher Tool-Aufruf bestätigt die MCP-Verbindung. Eine leere Verbindungsliste bedeutet, dass noch ein Marktplatz verbunden werden muss; sie ist kein MCP-Verbindungsfehler.",
      "troubleshootingTitle": "Wenn etwas fehlt",
      "troubleshooting": [
        "Keine Backlane-Tools im Chat: Prüfe, ob das Plugin bzw. der Konnektor installiert, angemeldet und für diesen Chat aktiviert ist. Starte gegebenenfalls einen neuen Chat.",
        "Anmeldung fehlt oder ist abgelaufen: Starte die OAuth-Anmeldung in den Verbindungseinstellungen deines KI-Clients erneut. Ersetze sie nicht durch einen selbst eingetragenen Token.",
        "Ein Marktplatz fehlt: Prüfe die aktive Organisation und Verbindung in Backlane. list_integrations liefert Einrichtungs- oder Reparaturlinks. Nach der Einrichtung die Liste erneut abrufen.",
        "Die genannten Menüpunkte fehlen: Prüfe die offizielle Anleitung des Anbieters und die Workspace-Berechtigungen. Frage nach der tatsächlich sichtbaren Oberfläche, statt Menüpfade zu erfinden."
      ],
      "nextTitle": "Nach der Einrichtung",
      "nextText": "list_integrations zeigt Anbindungen und Einrichtungslinks. search erschließt die API-Spezifikation der aktiven Verbindungen. execute führt API-Aufrufe aus und kann Daten ändern. Für die Einrichtung reicht der lesende Verbindungstest.",
      "repositoryTitle": "Öffentliches Agenten-Repository",
      "repositoryIntro": "Das öffentliche Backlane-Repository enthält Setup-Anleitungen, Agenten-Skills und Plugin-Konfigurationen für den gehosteten MCP-Service.",
      "repositorySetupLabel": "Setup-Anleitungen nach KI-Client",
      "repositorySkillLabel": "Backlane-Skill für KI-Agenten",
      "pricingTitle": "Beta und Preis",
      "contactLabel": "Fragen zur Einrichtung",
      "permissionsTitle": "Zugriff und Kontrolle",
      "permissions": [
        "Verbinde nur Seller-Accounts, für die du die nötigen Berechtigungen hast. Dein KI-Assistent nutzt die aktiven Verbindungen deiner Organisation.",
        "Zugangsdaten gibst du ausschließlich in Backlane oder im Anmeldedialog des Anbieters ein. Kopiere keine API-Schlüssel oder Passwörter in den Chat.",
        "Schreibzugriffe lassen sich in den Backlane-Einstellungen für die Organisation deaktivieren. Schreibaktionen werden protokolliert.",
        "Du kannst Marktplatz-Verbindungen in Backlane trennen und den Backlane-Konnektor im KI-Client entfernen. Bei OTTO deinstallierst du zusätzlich die App in Partner Connect, um den Zugriff vollständig zu entziehen."
      ],
      "marketplaces": "Unterstützt werden OTTO Market, Kaufland und die in Backlane angebotenen Mirakl-Marktplätze. Amazon ist noch nicht verfügbar. Welche Daten und Aktionen möglich sind, hängt von deiner Anbindung und ihren Berechtigungen ab.",
      "examplesTitle": "Deine ersten Aufgaben",
      "examples": [
        {
          "title": "Verbindungen prüfen",
          "prompt": "Welche Marktplätze habe ich mit Backlane verbunden?",
          "result": "Deine aktiven Verbindungen und Hinweise, falls noch etwas fehlt."
        },
        {
          "title": "Offene Bestellungen überblicken",
          "prompt": "Zeige meine offenen Bestellungen auf OTTO Market und welche als Nächstes bearbeitet werden müssen. Ändere keine Daten.",
          "result": "Eine Übersicht auf Basis der verfügbaren Bestell- und Statusdaten."
        },
        {
          "title": "Produktdaten kontrollieren",
          "prompt": "Prüfe meine zuletzt angelegten Produkte auf Kaufland: Welche sind online, und wo meldet die API Fehler? Ändere keine Daten.",
          "result": "Verfügbare Produktstatus und Fehlerhinweise; fehlende Daten werden als solche benannt."
        }
      ]
    },
    "ui": {
      "language": "de",
      "hintTitle": "KI-Assistent verbinden",
      "intro": "Verbinde deinen KI-Assistenten mit dieser URL. Er sieht die aktiven Verbindungen deiner Organisation.",
      "url": "MCP-Server-URL",
      "copy": "Kopieren",
      "copied": "Kopiert",
      "guide": "Einrichtung für deinen KI-Assistenten",
      "fullGuide": "Ausführliche Dokumentation",
      "docs": "Offizielle Anleitung",
      "plugin": "Alternativ: Plugin mit Backlane-Skill",
      "connectionFields": "Verbindungsdaten",
      "configuration": "Konfiguration"
    }
  },
  "en": {
    "steps": [
      [
        "Create your Backlane account",
        "Create your Backlane account or sign in. Select the organisation whose marketplaces you want to connect."
      ],
      [
        "Connect your marketplace",
        "Choose your marketplace in Backlane and connect your seller account."
      ],
      [
        "Connect your AI assistant",
        "Connect Backlane to ChatGPT, Claude, Cursor or VS Code, sign in and start your first chat."
      ]
    ],
    "guideTitle": "Connect Backlane as an MCP server.",
    "guideIntro": "Copy the MCP server URL and choose your AI assistant. Then sign in with your Backlane account to connect.",
    "serverUrlLabel": "MCP server URL",
    "copyUrl": "Copy URL",
    "copyConfig": "Copy configuration",
    "copyCommand": "Copy command",
    "setupCopyFailed": "Automatic copying is unavailable. Please select and copy the text directly.",
    "clientLabel": "Choose your AI assistant",
    "configNote": "Already have a configuration? Add only the backlane entry and keep your existing servers.",
    "claudeCodeTitle": "Using Claude Code?",
    "claudeCodeIntro": "Run this command in your terminal. Then open /mcp in Claude Code and sign in to Backlane.",
    "clientSteps": {
      "chatgpt": [
        [
          "Create an MCP plugin",
          "Open the plugin directory → Add → Add custom MCP server. Enter the connection details below. Advanced OAuth settings are discovered automatically. Review the notices and choose “Create as a plugin”."
        ],
        [
          "Install & sign in",
          "Install Backlane from your personal plugins and complete sign-in with your Backlane account."
        ],
        [
          "Select it in chat",
          "Start a new chat, select Backlane with @ and ask which marketplaces you have connected."
        ]
      ],
      "claude": [
        [
          "Create a connector",
          "Open Customize → Connectors → + Add → Add custom connector. In team workspaces, an authorised member must first add the connector in organisation settings."
        ],
        [
          "Add Backlane",
          "Enter Backlane and the server URL. Review the detected OAuth settings and follow the connection dialog to sign in."
        ],
        [
          "Enable it in chat",
          "Enable Backlane under + → Connectors in chat and ask which marketplaces you have connected."
        ]
      ],
      "cursor": [
        [
          "Open the configuration",
          "Open ~/.cursor/mcp.json. Create the file if it does not exist yet."
        ],
        [
          "Add Backlane",
          "Copy the configuration and save it in the file. If you already have servers, add the backlane entry."
        ],
        [
          "Sign in & use it",
          "Open the MCP settings in Cursor and sign in to Backlane. You can then use Backlane in Agent chat."
        ]
      ],
      "vscode": [
        [
          "Add a server",
          "Open .vscode/mcp.json in your project, or run “MCP: Add Server” and choose HTTP."
        ],
        [
          "Save the configuration",
          "Add the configuration to the file. When using the command, enter the server URL above and the name backlane."
        ],
        [
          "Start & sign in",
          "Click “Start” for the server and sign in to Backlane. Then use the connection in GitHub Copilot."
        ]
      ],
      "claudeCode": [
        [
          "Run the command",
          "Run the command below in your terminal."
        ],
        [
          "Sign in to Backlane",
          "Open /mcp in Claude Code, select backlane and complete sign-in in your browser."
        ],
        [
          "Check the connection",
          "Ask which marketplaces are connected."
        ]
      ]
    },
    "guideNote": "Team workspaces may require administrator approval. Menu labels and availability depend on your AI provider.",
    "agentInstructions": "First ask which AI assistant I use and whether I already have a Backlane account. Then guide me step by step: create an account or sign in, connect a marketplace, add Backlane as a remote MCP server in my AI assistant and complete OAuth sign-in. The MCP server URL below belongs in the connection settings; it is not a web page to open. Pasting this prompt alone does not establish a connection. After setup, ask me to list my connected marketplaces through Backlane to check the connection.",
    "details": {
      "checked": "Instructions checked: 23 October 2026. Publicly accessible, no sign-in required.",
      "guidanceTitle": "Guidance for AI assistants",
      "prerequisitesTitle": "Prerequisites",
      "prerequisites": "You need a Backlane account and access to the seller account you want to connect. Your AI client must support remote MCP with OAuth. Enter credentials in the relevant sign-in or connection dialog, not in chat.",
      "connectionTitle": "Connection details",
      "endpointNote": "Transport: Streamable HTTP. Authentication: OAuth. The MCP server URL is a technical endpoint for client configuration. A 401 when opening it in a browser without signing in is expected and is not a connection test.",
      "stepsTitle": "Setup",
      "docsLabel": "Official instructions",
      "verifyTitle": "Check the connection",
      "verifyPrompt": "Which marketplaces have I connected to Backlane?",
      "verifyText": "Ask your AI assistant to call Backlane's list_integrations tool. A successful tool call confirms the MCP connection. An empty connection list means a marketplace still needs connecting; it is not an MCP connection failure.",
      "troubleshootingTitle": "If something is missing",
      "troubleshooting": [
        "No Backlane tools in chat: Check that the plugin or connector is installed, signed in and enabled for this chat. Start a new chat if needed.",
        "Missing or expired sign-in: Restart OAuth sign-in in your AI client's connection settings. Do not replace it with a manually entered token.",
        "A marketplace is missing: Check the active organisation and connection in Backlane. list_integrations provides setup or repair links. Fetch the list again after setup.",
        "Menu items are missing: Check the provider's official instructions and workspace permissions. Ask about the interface actually shown instead of inventing menu paths."
      ],
      "nextTitle": "After setup",
      "nextText": "list_integrations shows connections and setup links. search explores the API specification of active connections. execute performs API calls and can change data. The read-only connection check is sufficient for setup.",
      "repositoryTitle": "Public agent repository",
      "repositoryIntro": "The public Backlane repository contains setup guides, agent skills and plugin configurations for the hosted MCP service.",
      "repositorySetupLabel": "Setup guides by AI client",
      "repositorySkillLabel": "Backlane skill for AI agents",
      "pricingTitle": "Beta and pricing",
      "contactLabel": "Setup questions",
      "permissionsTitle": "Access and control",
      "permissions": [
        "Only connect seller accounts you are authorised to access. Your assistant uses the active connections of your organisation.",
        "Enter credentials only in Backlane or the provider’s sign-in dialog. Never copy API keys or passwords into chat.",
        "Write access can be disabled for the organisation in Backlane settings. Write actions are logged.",
        "Disconnect marketplace accounts in Backlane and remove the Backlane connector in your AI client. For OTTO, also uninstall the app in Partner Connect to fully revoke access."
      ],
      "marketplaces": "Backlane supports OTTO Market, Kaufland and the Mirakl marketplaces available in the app. Amazon is not available yet. Available data and actions depend on your connection and permissions.",
      "examplesTitle": "Your first tasks",
      "examples": [
        {
          "title": "Check your connections",
          "prompt": "Which marketplaces have I connected to Backlane?",
          "result": "Your active connections and guidance if anything is missing."
        },
        {
          "title": "Review open orders",
          "prompt": "Show my open orders on OTTO Market and which need attention next. Do not change any data.",
          "result": "An overview based on the available order and status data."
        },
        {
          "title": "Check product data",
          "prompt": "Check my most recently created products on Kaufland: which are online, and where does the API report errors? Do not change any data.",
          "result": "Available product statuses and errors, with missing data explicitly identified."
        }
      ]
    },
    "ui": {
      "language": "en",
      "hintTitle": "Connect your AI assistant",
      "intro": "Connect your AI assistant with this URL. It sees your organisation’s active connections.",
      "url": "MCP server URL",
      "copy": "Copy",
      "copied": "Copied",
      "guide": "Set up your AI assistant",
      "fullGuide": "Full documentation",
      "docs": "Official instructions",
      "plugin": "Alternative: plugin with the Backlane skill",
      "connectionFields": "Connection details",
      "configuration": "Configuration"
    }
  }
};
