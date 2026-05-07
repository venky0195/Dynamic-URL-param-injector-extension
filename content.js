(function () {
  const DEFAULT_CONFIG = {
    params: [],
    hosts: []
  };

  const currentHost = window.location.hostname;

  // Check if current host matches a pattern (supports * wildcard for subdomains)
  function hostMatches(pattern) {
    if (pattern === currentHost) return true;
    if (pattern.startsWith("*.")) {
      const domain = pattern.slice(2);
      return currentHost === domain || currentHost.endsWith("." + domain);
    }
    return false;
  }

  // Find the routing type for current host from config
  function getRoutingType(hosts) {
    for (const h of hosts) {
      if (hostMatches(h.pattern)) return h.routing;
    }
    return null;
  }

  // ---- HASH-BASED ----

  function addParamsToHash(params) {
    let hash = window.location.hash;
    if (!hash) return;

    let changed = false;
    for (const p of params) {
      const full = p.key + "=" + p.value;
      if (!hash.includes(full)) {
        const separator = hash.includes("?") ? "&" : "?";
        hash = hash + separator + full;
        changed = true;
      }
    }
    if (changed) window.location.hash = hash;
  }

  function removeParamsFromHash(params) {
    let hash = window.location.hash;
    if (!hash) return;

    let changed = false;
    for (const p of params) {
      const full = p.key + "=" + p.value;
      if (!hash.includes(full)) continue;

      let newHash = hash;
      newHash = newHash.replace("?" + full, "");
      newHash = newHash.replace(full + "&", "");
      newHash = newHash.replace("&" + full, "");

      if (newHash !== hash) {
        hash = newHash;
        changed = true;
      }
    }
    if (changed) window.location.hash = hash;
  }

  // ---- PATH-BASED ----

  function addParamsToSearch(params) {
    const url = new URL(window.location.href);
    let changed = false;

    for (const p of params) {
      if (url.searchParams.get(p.key) !== p.value) {
        url.searchParams.set(p.key, p.value);
        changed = true;
      }
    }
    if (changed) window.location.href = url.toString();
  }

  function removeParamsFromSearch(params) {
    const url = new URL(window.location.href);
    let changed = false;

    for (const p of params) {
      if (url.searchParams.has(p.key)) {
        url.searchParams.delete(p.key);
        changed = true;
      }
    }
    if (changed) window.location.href = url.toString();
  }

  // ---- UNIFIED ----

  function addParams() {
    chrome.storage.local.get({ enabled: true, config: DEFAULT_CONFIG }, (data) => {
      if (!data.enabled) return;

      const routing = getRoutingType(data.config.hosts);
      if (!routing) return; // current host not in config

      if (routing === "hash") {
        addParamsToHash(data.config.params);
      } else {
        addParamsToSearch(data.config.params);
      }
    });
  }

  function removeParams() {
    chrome.storage.local.get({ config: DEFAULT_CONFIG }, (data) => {
      const routing = getRoutingType(data.config.hosts);
      if (!routing) return;

      if (routing === "hash") {
        removeParamsFromHash(data.config.params);
      } else {
        removeParamsFromSearch(data.config.params);
      }
    });
  }

  // Run on initial load
  addParams();

  // Watch for SPA navigation
  window.addEventListener("hashchange", addParams);
  window.addEventListener("popstate", addParams);

  // Intercept pushState/replaceState for path-based routing
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    setTimeout(addParams, 0);
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    setTimeout(addParams, 0);
  };

  // Listen for enable/disable and config changes in real-time
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      if (changes.enabled.newValue === true) {
        addParams();
      } else {
        removeParams();
      }
    }
    if (changes.config) {
      chrome.storage.local.get({ enabled: true }, (data) => {
        if (data.enabled) addParams();
      });
    }
  });
})();
