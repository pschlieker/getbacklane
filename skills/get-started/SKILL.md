---
name: get-started
description: >-
  Use right after Backlane is installed, or when the user asks how to set up
  Backlane, connect a marketplace account, or check that Backlane works.
  Verifies the MCP connection and walks the user through connecting OTTO
  Market, Kaufland or Mirakl accounts.
---

# Get started with Backlane

Goal: the user leaves with a working connection and at least one marketplace
account connected.

## 1. Check the connection

Call `list_integrations` with `{}`.

- If the tool is missing or the call fails with an authentication error, ask
  the user to sign in to Backlane from the plugin's connection prompt, then
  try again. Do not ask for passwords or API keys in the chat.
- If the call succeeds, continue.

## 2. Show what is connected

Summarize the result in a short list: each marketplace and whether it is
connected.

## 3. Connect missing accounts

For each marketplace the user wants that is not connected yet, give them the
setup link from the `list_integrations` result. Marketplace credentials are
entered in the Backlane app only.

When the user says they are done, call `list_integrations` again and confirm.

## 4. Suggest a first task

Offer two or three things to try, based on what is connected, for example:

- "Show my open orders from the last 7 days."
- "Which of my offers are out of stock?"
- "What changed in my prices this week?"
