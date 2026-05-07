const DEFAULT_CONFIG = {
  params: [],
  hosts: []
};

const paramsList = document.getElementById("params-list");
const hostsList = document.getElementById("hosts-list");

// ---- Render Params ----

function renderParam(param, index) {
  const row = document.createElement("div");
  row.className = "param-row";
  row.innerHTML = `
    <input type="text" placeholder="key (e.g. enableRollbacks)" value="${param.key}" data-type="param-key" data-index="${index}">
    <input type="text" placeholder="value (e.g. true)" value="${param.value}" data-type="param-value" data-index="${index}">
    <button class="btn-remove" data-type="remove-param" data-index="${index}">&times;</button>
  `;
  paramsList.appendChild(row);
}

function renderParams(params) {
  paramsList.innerHTML = "";
  params.forEach((p, i) => renderParam(p, i));
}

// ---- Render Hosts ----

function renderHost(host, index) {
  const row = document.createElement("div");
  row.className = "host-row";
  row.innerHTML = `
    <input type="text" placeholder="host pattern (e.g. *.csnonprod.com)" value="${host.pattern}" data-type="host-pattern" data-index="${index}">
    <select data-type="host-routing" data-index="${index}">
      <option value="hash" ${host.routing === "hash" ? "selected" : ""}>Hash-based (#!)</option>
      <option value="path" ${host.routing === "path" ? "selected" : ""}>Path-based</option>
    </select>
    <button class="btn-remove" data-type="remove-host" data-index="${index}">&times;</button>
  `;
  hostsList.appendChild(row);
}

function renderHosts(hosts) {
  hostsList.innerHTML = "";
  hosts.forEach((h, i) => renderHost(h, i));
}

// ---- Collect current state from DOM ----

function collectParams() {
  const params = [];
  const keys = document.querySelectorAll('[data-type="param-key"]');
  const values = document.querySelectorAll('[data-type="param-value"]');
  keys.forEach((el, i) => {
    const key = el.value.trim();
    const value = values[i].value.trim();
    if (key) params.push({ key, value });
  });
  return params;
}

function collectHosts() {
  const hosts = [];
  const patterns = document.querySelectorAll('[data-type="host-pattern"]');
  const routings = document.querySelectorAll('[data-type="host-routing"]');
  patterns.forEach((el, i) => {
    const pattern = el.value.trim();
    const routing = routings[i].value;
    if (pattern) hosts.push({ pattern, routing });
  });
  return hosts;
}

// ---- Event Listeners ----

document.getElementById("add-param").addEventListener("click", () => {
  const params = collectParams();
  params.push({ key: "", value: "" });
  renderParams(params);
});

document.getElementById("add-host").addEventListener("click", () => {
  const hosts = collectHosts();
  hosts.push({ pattern: "", routing: "path" });
  renderHosts(hosts);
});

// Delegate remove clicks
document.addEventListener("click", (e) => {
  if (e.target.dataset.type === "remove-param") {
    const params = collectParams();
    params.splice(parseInt(e.target.dataset.index), 1);
    renderParams(params);
  }
  if (e.target.dataset.type === "remove-host") {
    const hosts = collectHosts();
    hosts.splice(parseInt(e.target.dataset.index), 1);
    renderHosts(hosts);
  }
});

// Save
document.getElementById("save").addEventListener("click", () => {
  const config = {
    params: collectParams(),
    hosts: collectHosts()
  };
  chrome.storage.local.set({ config }, () => {
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  });
});

// ---- Load on startup ----

chrome.storage.local.get({ config: DEFAULT_CONFIG }, (data) => {
  // If config is empty, provide some initial empty rows for better UX
  const params = data.config.params.length > 0 ? data.config.params : [{ key: "", value: "" }];
  const hosts = data.config.hosts.length > 0 ? data.config.hosts : [{ pattern: "", routing: "path" }];
  
  renderParams(params);
  renderHosts(hosts);
});
