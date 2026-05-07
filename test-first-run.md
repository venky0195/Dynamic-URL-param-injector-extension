# Testing the First-Run Experience

## How to Test the Modified Extension

### 1. Load the Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select this folder
4. The extension should load successfully

### 2. Test First-Run Experience
1. Click on the extension icon in the toolbar
2. You should see the setup dialog asking for:
   - Parameter Key (e.g., "enableRollbacks")
   - Parameter Value (e.g., "true")
   - Multiple Host Patterns with individual routing types:
     - Host Pattern (e.g., "localhost", "*.example.com", "*.csnonprod.com")
     - Routing Type (Path-based or Hash-based) for each host
   - Use "+ Add Host Pattern" to configure multiple hosts

### 3. Test Setup Flow
1. Fill in the form with your desired parameters
2. Click "Save & Continue" - this should save the config and reload to normal popup
3. OR click "Skip for now" - this should open the full settings page

### 4. Test Normal Operation
1. After setup, the popup should show:
   - Your configured parameters in the "Active Params" section
   - Your configured host patterns in the "Target Hosts" section (with routing type indicators)
2. The toggle switch should control injection on/off
3. If no parameters are configured, you should see a link to set them up

### 5. Test Settings Page
1. Click the "⚙ Settings" button in the popup
2. You should be able to add/remove parameters and hosts
3. Save settings and verify they appear in the popup

### 6. Reset for Re-testing
To test the first-run experience again:
1. Open Chrome DevTools
2. Go to Application → Storage → Local Storage
3. Find the extension's storage and clear it
4. Or run this in the extension's console:
   ```javascript
   chrome.storage.local.clear()
   ```

## Expected Behavior
- **First time**: Setup dialog appears
- **With config**: Normal popup with parameter chips
- **Empty config**: Popup shows "click to setup" link
- **Settings page**: Always available for advanced configuration

## Key Improvements Made
1. ✅ No hardcoded parameters - starts with empty config
2. ✅ First-run detection and setup dialog
3. ✅ **Multiple host patterns support in setup dialog**
4. ✅ Individual routing type selection per host pattern
5. ✅ Visual host pattern display in popup with routing indicators
6. ✅ Graceful handling of empty configuration
7. ✅ Easy access to setup from popup when needed
8. ✅ Maintains all existing functionality for configured extensions