# AEM Guides WKND - GraphQL

This project includes React and Next.js demos that highlight Adobe Experience Manager's GraphQL APIs.

## Demo applications

| Framework | Location | Description |
|--------|-----------|-------------|
| [React example](./react-app) | [`/react-app`](./react-app) | A React application using the [AEM Headless Client for JavaScript](https://github.com/adobe/aem-headless-client-js) |
| [Next.js example](./next-js) | [`/next-js`](./next-js) | A Next.js application using the [AEM Headless Client for JavaScript](https://github.com/adobe/aem-headless-client-js) |

## System Requirements

The sample applications in this repository are designed to connect to AEM environments with the GraphQL feature enabled.

 AEM as a Cloud Service | AEM 6.5 | Sample Content |
------------------------|---------|--------------------|
Continual               | Not supported |  [WKND Shared 3.0.0+](https://github.com/adobe/aem-guides-wknd-shared/releases/latest) |

## Tutorial

Looking for a hands on guide? Checkout [Getting Started with AEM Headless - GraphQL](https://experienceleague.adobe.com/docs/experience-manager-learn/getting-started-with-aem-headless/graphql/overview.html). An end-to-end tutorial illustrating how to build-out and expose content using AEM's GraphQL APIs and consumed by an external app, in a headless CMS scenario. The React App in this repository is used as part of the tutorial. Additional resources can be found on the  [AEM Headless Developer Portal](https://experienceleague.adobe.com/landing/experience-manager/headless/developer.html).

## Documentation

* [AEM Headless Developer Portal](https://experienceleague.adobe.com/landing/experience-manager/headless/developer.html)

## GitHub Pages deployment

The [Pages workflow](./.github/workflows/nextjs.yml) builds and deploys the Next.js and React examples. Each build attempt uploads a uniquely named Pages artifact, and the deploy job uses the name supplied by that build. This avoids duplicate artifact errors on full workflow reruns and preserves the correct artifact when retrying only the deploy job.

If an older workflow run fails with `Multiple artifacts named "github-pages"`, start a new run using **Run workflow** rather than rerunning that old run. Existing runs retain their original workflow definition.

### Browser session settings

On the [demo landing page](./.github/pages/index.html), enter your AEM Author URL and required temporary access token. The proxy URL (`https://102588-424goldmagpie.adobeio-static.net/api/v1/web/aem/aem-cors-proxy`) and GraphQL namespace (`wknd-shared`) are read-only. Select **Save settings**, then open either app in the same tab. Both apps use that connection for queries, image hosts, and Universal Editor metadata without rebuilding.

Settings are stored in `sessionStorage` under a repository-path-specific key. They survive reloads and same-tab navigation, but are not shared across separate tabs or origins. Forks inherit the form and code, not a visitor's saved settings. **Clear settings** removes the connection and resets the form. Direct app visits without saved settings show a configuration error and do not send AEM requests.

A CF Console extension can also launch the landing page with URL-encoded `aemHost` and `imsToken` query parameters. On the first settings read, the shared module imports them as `aemHost` and `authToken`, using the standard proxy URL and `wknd-shared` namespace. A hostname without a scheme is normalized to HTTPS. This also works for direct React or Next.js visits. Both parameters must be supplied exactly once; invalid or incomplete imports show an error without overwriting an existing saved connection. Connection parameters are removed from the app URL with `history.replaceState` before validation or storage; unrelated query parameters and fragments are preserved.

**Demo-only URL handoff:** A bearer token in a URL can leak through the initial request, server logs, browser history, or analytics. Importing and clearing it does not undo that exposure. For Universal Editor, the connection parameters must be on the embedded app URL after `/aem/editor/canvas/`; the app can clean its own URL, not Universal Editor's outer route. Do not copy, bookmark, log, or share these links. Use short-lived demo tokens only. The landing page uses a no-referrer policy, and no real tokens are needed for testing.

AEM connection settings are supplied at runtime through the form or demo connection URL, then kept in the browser session: neither app reads them from `.env` files or GitHub repository variables. The Pages workflow needs no AEM configuration and only supplies static asset/base paths derived from the repository name. For local previews, serve the landing page, its shared settings script, and both built apps on the same origin; separate development-server ports do not share session settings.

Browser storage is accessible to scripts on the same origin, so use only short-lived demo tokens. AEM API requests send tokens in the `Authorization: Bearer` header, not query strings; a proxy must allow and forward this header to AEM. Proxies that only accept an `aemToken` query parameter must be updated. AEM or the trusted proxy must allow CORS requests from the hosted site. The Pages workflow no longer embeds `AEM_AUTH_TOKEN` in public builds.

If the browser reports a preflight CORS failure, the proxy's `OPTIONS` response must include `Access-Control-Allow-Origin` for the demo origin, `Access-Control-Allow-Methods` including `GET`, and `Access-Control-Allow-Headers` including `Authorization`. Actual responses, including errors, must also include the allowed origin. A `204` response without these headers is not sufficient. Adobe I/O Runtime custom preflight handlers require the `web-custom-options` annotation; see [Adobe's CORS guidance](https://developer.adobe.com/app-builder/docs/guides/runtime_guides/creating-rest-apis). This must be fixed on the proxy, not by disabling browser CORS or using `no-cors`.

The shared browser transport omits cookies even when the AEM SDK enables them for authentication. Only the explicitly supplied Bearer header authenticates requests, so the proxy does not need credentialed-cookie CORS permission.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.
