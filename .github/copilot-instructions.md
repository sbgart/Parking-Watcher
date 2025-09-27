# Copilot Instructions for parking-watcher

## Project Overview

This is a Node.js project for monitoring parking spot availability and notifying users via Telegram. The architecture is modular, with each major feature in its own file. Data is persisted in SQLite (`data/parking.db`) and user state in JSON files.

## Key Components

- `api-client.js`: Fetches parking data from external sources.
- `database.js` / `db.js`: Manages user settings and parking spot assignments, using SQLite and JSON for persistence.
- `notification-manager.js`: Formats and sends notifications to Telegram chats. Defines message templates and handles main chat ID logic.
- `parking-monitor.js`: Main monitoring loop. Periodically checks parking status, detects changes, and triggers notifications for all users.
- `telegram-bot.js`: Handles incoming Telegram messages, parses commands, and updates user settings.
- `state-manager.js`: Loads and saves monitoring state (e.g., last known spot status).

## Data Flow

1. `parking-monitor.js` calls `api-client.js` to get parking data.
2. State is loaded/saved via `state-manager.js`.
3. User settings are fetched from `database.js`.
4. Notifications are sent using `notification-manager.js`.
5. User commands are processed in `telegram-bot.js` and update settings in `database.js`.

## Developer Workflows

- **Install dependencies:** `npm install`
- **Run main monitor:** `node index.js` (or specify another entry point if needed)
- **No explicit build step** (plain JS)
- **No test suite detected**
- **Debugging:** Use console logging; main logic is in `parking-monitor.js` and `telegram-bot.js`.

## Project-Specific Patterns

- Telegram bot commands are parsed in `telegram-bot.js` with Russian-language responses and HTML formatting.
- User parking spot tracking is per-chat, with settings stored in SQLite and/or JSON.
- Main chat ID (`CHAT_ID`) is used to avoid duplicate notifications.
- All notification templates are centralized in `notification-manager.js`.
- State persistence uses both JSON and SQLite for redundancy.

## Integration Points

- Telegram Bot API (via HTTP requests, not a library)
- External parking data source (see `api-client.js`)
- SQLite database (`data/parking.db`)

## Conventions

- Russian language for all user-facing messages
- HTML formatting for Telegram messages
- Modular file structure: one feature per file
- Data files in `data/` directory

## Examples

- To send a notification to a user: use `sendTelegram(text, silent, chat_id)` from `notification-manager.js`.
- To update a user's parking spot: use `updateUserSettings(chatId, spotNumber)` from `database.js`.

## Key Files

- `parking-monitor.js`, `telegram-bot.js`, `notification-manager.js`, `database.js`, `api-client.js`, `state-manager.js`
- Data: `data/parking.db`, `data/state.json`, `data/last_update_id.json`

---

For questions or unclear patterns, ask the user for clarification or examples from their workflow.
