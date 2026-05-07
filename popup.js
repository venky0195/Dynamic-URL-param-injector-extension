const DEFAULT_CONFIG = {
  params: [],
  hosts: []
};

const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const chipsContainer = document.getElementById("params-chips");
const hostsContainer = document.getElementById("hosts-chips");

function updateStatus(enabled) {
  status.textContent = enabled ? "Active — params will be appended" : "Disabled — no changes to URLs";
  status.className = enabled ? "status active" : "status";
}

function renderChips(params) {
  chipsContainer.innerHTML = "";
  if (!params.length) {
    chipsContainer.innerHTML = '<span style="color:#555;font-size:12px">No params configured — <a href="#" id="setup-link" style="color:#4A90D9;text-decoration:none">click to setup</a></span>';
    // Add click handler for setup link
    setTimeout(() => {
      const setupLink = document.getElementById("setup-link");
      if (setupLink) {
        setupLink.addEventListener("click", (e) => {
          e.preventDefault();
          showSetupDialog();
        });
      }
    }, 0);
    return;
  }
  params.forEach((p) => {
    const chip = document.createElement("span");
    chip.className = "param-chip";
    chip.textContent = `${p.key}=${p.value}`;
    chipsContainer.appendChild(chip);
  });
}

function renderHosts(hosts) {
  hostsContainer.innerHTML = "";
  if (!hosts.length) {
    hostsContainer.innerHTML = '<span style="color:#555;font-size:12px">No hosts configured</span>';
    return;
  }
  hosts.forEach((h) => {
    const chip = document.createElement("span");
    chip.className = "param-chip";
    chip.style.background = h.routing === "hash" ? "#4A90D922" : "#2ecc7122";
    chip.style.color = h.routing === "hash" ? "#4A90D9" : "#2ecc71";
    chip.textContent = `${h.pattern} (${h.routing})`;
    hostsContainer.appendChild(chip);
  });
}

// Check if this is first run and show setup if needed
function checkFirstRun() {
  chrome.storage.local.get({ 
    enabled: true, 
    config: DEFAULT_CONFIG,
    firstRun: true 
  }, (data) => {
    if (data.firstRun || (data.config.params.length === 0 && data.config.hosts.length === 0)) {
      showSetupDialog();
    } else {
      toggle.checked = data.enabled;
      updateStatus(data.enabled);
      renderChips(data.config.params);
      renderHosts(data.config.hosts);
    }
  });
}

// Load saved state
checkFirstRun();

// Save on toggle
toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ enabled }, () => {
    updateStatus(enabled);
  });
});

// Show setup dialog for first-time users
function showSetupDialog() {
  document.body.innerHTML = `
    <div class="setup-container">
      <div class="setup-header">
        <span class="setup-title">Welcome to URL Param Injector!</span>
        <div class="setup-subtitle">Configure your query parameter and host patterns</div>
      </div>
      
      <div class="setup-form">
        <div class="input-group">
          <label for="param-key">Parameter Key</label>
          <input type="text" id="param-key" placeholder="e.g., enableRollbacks" />
        </div>
        
        <div class="input-group">
          <label for="param-value">Parameter Value</label>
          <input type="text" id="param-value" placeholder="e.g., true" />
        </div>
        
        <div class="input-group">
          <label>Host Patterns</label>
          <div id="current-page-suggestion" class="current-page-suggestion"></div>
          <div id="hosts-list" class="hosts-list"></div>
          <button type="button" id="add-host" class="btn-add-host">+ Add Host Pattern</button>
        </div>
        
        <div class="setup-buttons">
          <button id="setup-save" class="btn-primary">Save & Continue</button>
          <button id="setup-skip" class="btn-secondary">Settings</button>
        </div>
      </div>
    </div>
  `;
  
  // Add setup-specific styles
  const style = document.createElement('style');
  style.textContent = `
    .setup-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .setup-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      display: block;
      margin-bottom: 4px;
    }
    .setup-subtitle {
      font-size: 12px;
      color: #888;
    }
    .setup-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .input-group label {
      font-size: 11px;
      color: #ccc;
      font-weight: 500;
    }
    .input-group input, .input-group select {
      padding: 6px 10px;
      background: #16213e;
      border: 1px solid #333;
      border-radius: 5px;
      color: #eee;
      font-size: 12px;
      outline: none;
    }
    .input-group input:focus, .input-group select:focus {
      border-color: #4A90D9;
    }
    .input-group input::placeholder {
      color: #555;
    }
    .current-page-suggestion {
      background: #0f1419;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 6px 8px;
      margin-bottom: 6px;
      font-size: 10px;
      color: #888;
      display: none;
    }
    .suggestion-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }
    .suggestion-item:last-child {
      margin-bottom: 0;
    }
    .suggestion-text {
      color: #aaa;
      font-family: monospace;
    }
    .suggestion-btn {
      background: none;
      border: 1px solid #4A90D9;
      color: #4A90D9;
      border-radius: 3px;
      padding: 2px 6px;
      cursor: pointer;
      font-size: 9px;
      transition: 0.2s;
    }
    .suggestion-btn:hover {
      background: #4A90D922;
    }
    .hosts-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 6px;
    }
    .host-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .host-row input {
      flex: 1;
    }
    .host-row select {
      width: 90px;
      font-size: 11px;
    }
    .btn-remove-host {
      background: none;
      border: 1px solid #555;
      color: #e74c3c;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
    }
    .btn-remove-host:hover {
      background: #e74c3c22;
      border-color: #e74c3c;
    }
    .btn-add-host {
      background: none;
      border: 1px dashed #555;
      color: #4A90D9;
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 12px;
      transition: 0.2s;
      width: 100%;
    }
    .btn-add-host:hover {
      background: #4A90D922;
      border-color: #4A90D9;
    }
    .setup-buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-primary {
      background: #4A90D9;
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) {
      background: #3a7bc8;
    }
    .btn-primary:disabled {
      background: #444;
      color: #666;
      cursor: not-allowed !important;
    }
    .btn-secondary {
      background: transparent;
      color: #888;
      border: 1px solid #444;
    }
    .btn-secondary:hover {
      background: #444;
      color: #ccc;
    }
  `;
  document.head.appendChild(style);
  
  // Initialize with one host row
  let hostIndex = 0;
  
  // Get current tab URL and show suggestions
  async function showCurrentPageSuggestion() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0] && tabs[0].url) {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;
        
        // Skip chrome:// and extension pages
        if (hostname && !url.protocol.startsWith('chrome') && !url.protocol.startsWith('moz-extension')) {
          const suggestionContainer = document.getElementById("current-page-suggestion");
          
          // Generate suggestions
          const suggestions = [];
          
          // Exact hostname
          suggestions.push({
            pattern: hostname,
            label: `Current page: ${hostname}`
          });
          
          // Wildcard for subdomains (if hostname has multiple parts)
          const parts = hostname.split('.');
          if (parts.length > 2) {
            const wildcardDomain = '*.' + parts.slice(-2).join('.');
            suggestions.push({
              pattern: wildcardDomain,
              label: `All ${parts.slice(-2).join('.')} subdomains: ${wildcardDomain}`
            });
          }
          
          suggestionContainer.innerHTML = `
            <div style="font-weight: 500; margin-bottom: 4px; color: #ccc;">💡 Quick Add Current Site:</div>
            ${suggestions.map(s => `
              <div class="suggestion-item">
                <span class="suggestion-text">${s.pattern}</span>
                <button type="button" class="suggestion-btn" data-pattern="${s.pattern}">Add</button>
              </div>
            `).join('')}
          `;
          
          suggestionContainer.style.display = 'block';
          
          // Add click handlers for suggestion buttons
          suggestionContainer.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const pattern = btn.dataset.pattern;
              // Find first empty host input or add new row
              const emptyInput = document.querySelector('.host-pattern[value=""]');
              if (emptyInput) {
                emptyInput.value = pattern;
                emptyInput.dispatchEvent(new Event('input')); // Trigger validation
              } else {
                addHostRow(pattern);
              }
            });
          });
        }
      }
    } catch (error) {
      console.log('Could not get current tab URL:', error);
    }
  }
  
  function addHostRow(pattern = "", routing = "path") {
    const hostsList = document.getElementById("hosts-list");
    const hostRow = document.createElement("div");
    hostRow.className = "host-row";
    hostRow.dataset.index = hostIndex;
    
    hostRow.innerHTML = `
      <input type="text" placeholder="e.g., localhost" value="${pattern}" class="host-pattern" />
      <select class="host-routing">
        <option value="path" ${routing === "path" ? "selected" : ""}>Path</option>
        <option value="hash" ${routing === "hash" ? "selected" : ""}>Hash</option>
      </select>
      <button type="button" class="btn-remove-host" data-index="${hostIndex}">×</button>
    `;
    
    hostsList.appendChild(hostRow);
    
    // Add validation listener to the new input
    const newInput = hostRow.querySelector('.host-pattern');
    newInput.addEventListener("input", validateForm);
    
    hostIndex++;
    
    // Validate form after adding new row
    setTimeout(validateForm, 0);
  }
  
  // Handle host removal using event delegation
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-remove-host")) {
      const index = e.target.dataset.index;
      const hostRow = document.querySelector(`[data-index="${index}"]`);
      if (hostRow) {
        hostRow.remove();
      }
      // Ensure at least one host row remains
      const remainingRows = document.querySelectorAll('.host-row');
      if (remainingRows.length === 0) {
        addHostRow();
      }
      // Validate form after removal
      setTimeout(validateForm, 0);
    }
  });
  
  // Add initial host row
  addHostRow();
  
  // Show current page suggestions
  showCurrentPageSuggestion();
  
  // Initialize validation listeners
  addValidationListeners();
  
  // Initial validation check
  validateForm();
  
  // Handle add host button
  document.getElementById("add-host").addEventListener("click", () => {
    addHostRow();
  });
  
  // Validation function
  function validateForm() {
    const key = document.getElementById("param-key").value.trim();
    const value = document.getElementById("param-value").value.trim();
    
    // Check if all host patterns are filled
    const hostRows = document.querySelectorAll('.host-row');
    let allHostsFilled = hostRows.length > 0;
    
    hostRows.forEach(row => {
      const pattern = row.querySelector('.host-pattern').value.trim();
      if (!pattern) {
        allHostsFilled = false;
      }
    });
    
    const isValid = key && value && allHostsFilled;
    const saveBtn = document.getElementById("setup-save");
    
    if (isValid) {
      saveBtn.disabled = false;
      saveBtn.style.opacity = "1";
      saveBtn.style.cursor = "pointer";
    } else {
      saveBtn.disabled = true;
      saveBtn.style.opacity = "0.5";
      saveBtn.style.cursor = "not-allowed";
    }
    
    return isValid;
  }
  
  // Add event listeners for real-time validation
  function addValidationListeners() {
    document.getElementById("param-key").addEventListener("input", validateForm);
    document.getElementById("param-value").addEventListener("input", validateForm);
    
    // Add listeners to existing host inputs
    document.querySelectorAll('.host-pattern').forEach(input => {
      input.addEventListener("input", validateForm);
    });
  }
  
  // Handle save button
  document.getElementById("setup-save").addEventListener("click", () => {
    if (!validateForm()) {
      alert("Please fill in all fields:\n- Parameter Key\n- Parameter Value\n- At least one Host Pattern");
      return;
    }
    
    const key = document.getElementById("param-key").value.trim();
    const value = document.getElementById("param-value").value.trim();
    
    // Collect all host patterns
    const hostRows = document.querySelectorAll('.host-row');
    const hosts = [];
    
    hostRows.forEach(row => {
      const pattern = row.querySelector('.host-pattern').value.trim();
      const routing = row.querySelector('.host-routing').value;
      
      if (pattern) {
        hosts.push({ pattern, routing });
      }
    });
    
    const config = {
      params: [{ key, value }],
      hosts: hosts
    };
    
    chrome.storage.local.set({ 
      config,
      firstRun: false,
      enabled: true 
    }, () => {
      // Reload the normal popup
      location.reload();
    });
  });
  
  // Handle skip button
  document.getElementById("setup-skip").addEventListener("click", () => {
    chrome.storage.local.set({ firstRun: false }, () => {
      chrome.runtime.openOptionsPage();
    });
  });
}

// Open settings page
document.getElementById("open-settings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
