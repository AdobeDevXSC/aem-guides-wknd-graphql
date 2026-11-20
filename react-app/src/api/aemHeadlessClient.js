/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

// Use the AEM Headless SDK to make the GraphQL requests
import AEMHeadless from "@adobe/aem-headless-client-js";
import sessionConfig from "../sessionConfig";

export function getAemConfig() {
  return sessionConfig.requireConfig(sessionConfig.appRootPath("react-app"));
}

// Initialize the AEM Headless Client and export it for other files to use
const aemHeadlessClient = {
  runPersistedQuery(name, variables) {
    const config = getAemConfig();
    const client = new AEMHeadless({
      serviceURL: config.proxyURL,
      auth: config.authToken,
      fetch: (url, options) => sessionConfig.fetchRequest(url, options, config),
    });
    return client.runPersistedQuery(name, variables);
  },
};

// Prefix URLs with AEM Host
export function addAemHost(url) {  
  if (url.startsWith("/")) {
    // images always come from Publish, even when the AEM host is Author
    return new URL(url, getAemConfig().aemHost.replace("://author-", "://publish-")).toString();
  }
  return url;
}

// Picks the image URL for an AEM image reference.
// Prefers the Dynamic Media _dynamicUrl (resized, WebP), falling back to _path.
export function imageUrl(image) {
  const url = image?._dynamicUrl || image?._path;
  return url ? addAemHost(url) : undefined;
}

export default aemHeadlessClient;