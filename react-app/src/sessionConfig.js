(function () {
  const defaultProxyURL = "https://102588-424goldmagpie.adobeio-static.net/api/v1/web/aem/aem-cors-proxy";

  function storageKey(rootPath) {
    return "wknd:aem-settings:" + (rootPath.replace(/\/+$/, "") || "/");
  }

  function validate(config) {
    if (!config || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("Invalid saved AEM settings. Clear settings on the demo landing page.");
    }
    const result = {};
    for (const field of ["aemHost", "proxyURL", "graphqlEndpoint", "authToken"]) {
      if (typeof config[field] !== "string") {
        throw new Error("Invalid AEM setting: " + field + ".");
      }
      result[field] = config[field].trim();
    }
    for (const field of ["aemHost", "proxyURL"]) {
      let url;
      try {
        url = new URL(result[field]);
      } catch {
        throw new Error(field === "aemHost" ? "Enter a valid AEM Author URL." : "Enter a valid proxy URL.");
      }
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error("URLs must use HTTP or HTTPS without credentials, query parameters, or fragments.");
      }
      if (field === "aemHost" && url.pathname !== "/") {
        throw new Error("The AEM Author URL must contain only the host, without a path.");
      }
      result[field] = url.toString().replace(/\/+$/, "");
    }
    if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(result.graphqlEndpoint)) {
      throw new Error("Enter a GraphQL namespace, such as wknd-shared.");
    }
    if (!result.authToken) {
      throw new Error("Enter a temporary access token.");
    }
    if (/[\r\n]/.test(result.authToken)) {
      throw new Error("The token must be a single line.");
    }
    return result;
  }

  function appRootPath(appName) {
    if (typeof window === "undefined") return "/";
    const pathname = window.location.pathname;
    const segment = "/" + appName;
    const index = pathname.endsWith(segment)
      ? pathname.length - segment.length
      : pathname.lastIndexOf(segment + "/");
    return index < 0 ? "/" : pathname.slice(0, index) + "/";
  }

  function read(rootPath) {
    if (typeof window === "undefined") return null;
    const imported = importFromUrl(rootPath);
    if (imported) return imported;
    let saved;
    try {
      saved = window.sessionStorage.getItem(storageKey(rootPath));
    } catch {
      throw new Error("Browser session storage is unavailable. Allow storage for this site.");
    }
    if (saved === null) return null;
    let config;
    try {
      config = JSON.parse(saved);
    } catch {
      throw new Error("Invalid saved AEM settings. Clear settings on the demo landing page.");
    }
    return validate(config);
  }

  function importFromUrl(rootPath) {
    const url = new URL(window.location.href);
    const hosts = url.searchParams.getAll("aemHost");
    const tokens = url.searchParams.getAll("imsToken");
    if (!hosts.length && !tokens.length) return null;

    url.searchParams.delete("aemHost");
    url.searchParams.delete("imsToken");
    try {
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    } catch {
      throw new Error("Could not remove connection parameters from the URL. Close this tab and reopen without a token in the URL.");
    }

    if (hosts.length !== 1 || tokens.length !== 1 || !hosts[0].trim() || !tokens[0].trim()) {
      throw new Error("The connection URL requires exactly one aemHost and one imsToken.");
    }
    const aemHost = hosts[0].trim();
    return save({
      aemHost: /^https?:\/\//i.test(aemHost) ? aemHost : "https://" + aemHost,
      authToken: tokens[0],
      proxyURL: defaultProxyURL,
      graphqlEndpoint: "wknd-shared",
    }, rootPath);
  }

  function requireConfig(rootPath) {
    const config = read(rootPath);
    if (!config) {
      throw new Error("Configure and save your AEM connection on the demo landing page first.");
    }
    return config;
  }

  function save(config, rootPath) {
    const validated = validate(config);
    try {
      window.sessionStorage.setItem(storageKey(rootPath), JSON.stringify(validated));
    } catch {
      throw new Error("Could not save settings. Allow browser session storage for this site.");
    }
    return validated;
  }

  function clear(rootPath) {
    try {
      window.sessionStorage.removeItem(storageKey(rootPath));
    } catch {
      throw new Error("Could not clear settings. Allow browser session storage for this site.");
    }
  }

  function fetchRequest(url, options, config) {
    const params = new URLSearchParams();
    params.set("aemHost", config.aemHost.replace(/\/+$/, ""));
    const requestURL = `${url}${String(url).includes("?") ? "&" : "?"}${params}`;
    const headers = new Headers(options && options.headers);
    headers.set("Authorization", `Bearer ${config.authToken}`);
    // The SDK enables cookies for auth; the proxy uses only the explicit Bearer header.
    return fetch(requestURL, Object.assign({}, options, { headers, credentials: "omit" }));
  }

  const api = { defaultProxyURL, storageKey, appRootPath, validate, read, requireConfig, save, clear, fetchRequest };
  // The same source is bundled by both apps and served directly by the landing page.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    window.WkndSessionConfig = api;
  }
})();
