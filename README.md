<img width="2816" height="1536" alt="Gemini_Generated_Image_l2j0iml2j0iml2j0" src="https://github.com/user-attachments/assets/203aebde-6211-401b-9234-8b6ea9e4a7c3" />

# URL Param Injector (Chrome)

A Chrome extension (Manifest V3) that **automatically adds query parameters** to URLs on sites you choose. It supports **hash-based** routing (for SPAs) and **path-based** routing, and can react when you navigate inside single-page apps.

Features include guided setup, smart current page suggestions, multiple host pattern support, and real-time form validation for a seamless configuration experience.

Use cases include enabling feature flags or rollback modes on staging or internal hosts without editing every bookmark or link.

---

## What you need

- **Google Chrome** (or another Chromium browser that supports unpacked extensions: Brave, Edge, Arc, etc.). These instructions use Chrome's menu names.
- The extension folder on your machine (this repository), including `manifest.json`, `content.js`, `popup.html`, `popup.js`, `options.html`, `options.js`, and extension icons.

> **Icon files:** `manifest.json` references `icon.png` for the toolbar and extension management UI. If `icon.png` is missing, Chrome may still load the extension but show a generic puzzle-piece icon. Add a `48×48` and `128×128` PNG (or a single file used for both sizes) named `icon.png` in the extension root if you want a custom icon.

---

## Install the extension in Chrome (load unpacked)

1. **Open Chrome** and go to the extensions page:
   - Paste `chrome://extensions` in the address bar and press **Enter**,  
   - or use the menu: **⋮** → **Extensions** → **Manage Extensions**.

2. **Turn on Developer mode** (toggle in the **top-right** of the `chrome://extensions` page).

3. Click **Load unpacked**.

4. In the file picker, select the **folder** that contains `manifest.json` (the root of this project), not a single file inside it.

5. The extension should appear in the list as **URL Param Injector**. If Chrome shows an error, read the message (often a missing file or JSON typo in `manifest.json`) and fix it, then click **Reload** on the extension card.

6. **Pin the extension** (optional but recommended): click the **puzzle piece** icon in the Chrome toolbar → find **URL Param Injector** → click the **pin** so the icon stays visible.

You only need to **Load unpacked** once. After that, use **Reload** on `chrome://extensions` whenever you change extension files on disk.

---

## Getting started

### First-Time Setup
1. **Click the extension icon** → A **welcome dialog** appears automatically
2. **Configure your parameter:**
   - **Parameter Key** (e.g., `enableRollbacks`)
   - **Parameter Value** (e.g., `true`)
3. **Add host patterns:**
   - Use smart suggestions from your current page (e.g., `*.csnonprod.com`)
   - Click "Add" next to suggested patterns or type manually
   - Use "+ Add Host Pattern" to configure multiple sites
   - Choose routing type for each host (Hash-based or Path-based)
4. **Save & Continue** → Extension is ready to use!

### If Already Configured
1. **Open the extension popup** by clicking the icon
2. Use the **Injection toggle** to enable/disable parameter injection
3. View your **Active Params** and **Target Hosts** in the popup
4. Click **⚙ Settings** for advanced configuration

---

## Using the toolbar popup

| Element | What it does |
|--------|----------------|
| **Injection** toggle | **On:** append configured params on matching hosts. **Off:** no URL changes; disabling can also remove injected params where possible. |
| **Active Params** chips | Read-only preview of key=value pairs from saved settings. Shows "click to setup" link if empty. |
| **Target Hosts** chips | Shows configured host patterns with color-coded routing types (blue=hash, green=path). |
| **⚙ Settings** | Opens the options page to edit params and hosts. |
| Status line | Confirms whether injection is active or disabled. |

Key features:
- **Smart suggestions** during setup based on your current page
- **Real-time validation** ensures complete configuration before saving
- **Multiple host support** with individual routing types per host
- **Compact design** optimized for extension popup constraints (280px width)

Changes to the toggle are saved immediately. Parameter and host **edits** happen in **Settings** after you click **Save Settings**.

---

## Using the Settings page

### Query parameters

- Each row is one **key** and **value** (for example `enableRollbacks` = `true`).
- Empty **key** rows are ignored when saving.
- Use **+ Add parameter** for more pairs; **×** removes a row.
- After editing, click **Save Settings**. A short "Settings saved!" confirmation appears.

### Host rules

For each rule you set:

- **Host pattern** — Which site(s) this applies to.
  - Exact host: `localhost`, `app.example.com`
  - **Wildcard subdomains:** patterns starting with `*.` match that domain and any subdomain (for example `*.contentstack.com` matches `foo.contentstack.com` and `contentstack.com`).
- **Routing type:**
  - **Hash-based (`#!`)** — Params are appended **inside the URL hash** (after `?` within the fragment). Use this when the app uses hash routing (common on SPAs).
  - **Path-based** — Params go in the normal **query string** (`?key=value&…`). The page may reload when they change.

Use **+ Add host** and **×** to add or remove rules. Only hosts that match a saved rule get injection.

### Configuration approach

The extension starts with empty configuration and guides users through setup:
- **First-run detection** shows setup dialog automatically
- **Smart current page suggestions** make configuration easier
- **Multiple host patterns** can be configured with individual routing types
- **Form validation** prevents incomplete configurations

**Current Page Suggestions Example:**
```
💡 Quick Add Current Site:
*.csnonprod.com     [Add]  ← All csnonprod.com subdomains
localhost           [Add]  ← Exact hostname
```

---

## How injection behaves

1. **Host must match** — If the current page's hostname does not match any **Host rule**, nothing is injected.
2. **Injection toggle** — If **Injection** is off in the popup, params are not added (and removal logic may run where applicable).
3. **Hash routing** — Params are merged into the **hash** fragment (e.g. `#/path?existing=1` becomes `#/path?existing=1&yourKey=yourValue`).
4. **Path routing** — Params are set via the URL **search** parameters; the implementation may navigate to update the URL.
5. **SPAs** — The content script listens for **hashchange**, **popstate**, and patched **history.pushState** / **replaceState** so navigation inside the app can trigger re-injection.
6. **Live updates** — If you change settings or the enabled flag while a tab is open, storage listeners attempt to add or remove params according to the new configuration.

---

## Permissions (why Chrome asks)

| Permission | Purpose |
|------------|---------|
| **storage** | Saves your toggle, params, and host rules locally in the browser (`chrome.storage.local`). |
| **scripting** | Declared in the manifest for MV3; used with the extension's architecture. |
| **activeTab** | Enables smart current page suggestions during setup. Only reads the current tab's URL to suggest host patterns. |
| **host_permissions: `<all_urls>`** | Lets the **content script** run on pages so it can read the URL and adjust hash or search params. The extension still only *modifies* URLs when your **host rules** match. |

---

## Updating the extension after you edit files

1. Change files in the extension folder (for example after `git pull`).
2. Open `chrome://extensions`.
3. Find **URL Param Injector** and click **Reload** (circular arrow).

Reload affected tabs or navigate again if changes do not appear immediately.

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| Extension does not load | Confirm **Developer mode** is on; select the correct **folder**; check **Errors** on the extension card for details. |
| Params never appear | Turn **Injection** **ON**; confirm **hostname** matches a **Host rule** (including `*` subdomain patterns); click **Save Settings** after edits. |
| Wrong routing (hash vs path) | Open **Settings** and set the host's **Routing** to **Hash-based** or **Path-based** to match how the site builds URLs. |
| Changes after Save not visible in popup | Close and reopen the popup, or click **Reload** on the extension once. |
| Setup dialog not appearing | Clear extension storage: DevTools → Application → Storage → Local Storage → Clear, then reload extension. |
| Current page suggestions not showing | Ensure you're on a valid website (not chrome:// pages) and the extension has activeTab permission. |
| Remove host button (×) not working | Reload the extension to ensure you have the latest version with fixed event handlers. |
| Save button stays disabled | Ensure all fields are filled: Parameter Key, Parameter Value, and at least one complete Host Pattern. |
| Icon missing or generic | Add `icon.png` to the extension root as referenced in `manifest.json`. |

To **remove** the extension: `chrome://extensions` → **Remove** on **URL Param Injector**.

---

## Privacy and data

Settings and the on/off state are stored **locally** in your browser via Chrome's extension storage. This project does not define a backend; data stays on your machine unless you use browser sync features that include extension data (depends on Chrome / account settings).

---

## Development notes

- **Manifest:** Version 3 (`manifest_version: 3`).
- **Entry points:** `content.js` (all URLs at `document_start`), `popup.html` / `popup.js`, `options.html` / `options.js`.
- No build step is required for the current layout: load the folder as unpacked after ensuring all referenced files exist.
- **Features:** First-run setup, smart suggestions, multiple host patterns, real-time validation, CSP-compliant event handling.

For questions about behavior, refer to `content.js` for injection and routing logic, and `options.js` / `popup.js` for UI and storage.
