# Next.js App - WKND Adventures

An example Next.js application that highlights Adobe Experience Manager's GraphQL APIs and the [AEM Headless Client for JavaScript](https://github.com/adobe/aem-headless-client-js).

This application is loosely based on the [Adobe Next.js Template](https://github.com/adobe/aem-nextjs-template/) but has been trimmed to focus on the AEM Headless GraphQL use case.

![Next.js App Screenshot](./docs/next-js.png)

## How to use

Open the [demo landing page](../.github/pages/index.html) on the hosted site, enter your AEM Author URL and temporary access token, and select **Save settings**. The proxy URL and GraphQL namespace (`wknd-shared`) are read-only. Open the Next.js app card in the same tab.

The app fetches content in the browser using only the saved session settings. No AEM environment files or repository variables are required. Without saved settings, it displays a configuration error instead of making AEM requests.

To build locally:

```shell
cd next-js
npm ci
npm run export
```


## System Requirements

 AEM as a Cloud Service | AEM 6.5 | Sample Content | Node   | npm | 
------------------------|---------|--------------------|---------|-----|
Continual               | 6.5.13+ |  [WKND Shared 2.0+](https://github.com/adobe/aem-guides-wknd-shared/releases/latest) or [WKND Site 2.0+](https://github.com/adobe/aem-guides-wknd/releases/latest)| 10+  | 6+

## Notes

Adventure detail pages show a **Related adventures** section for `AdventureModel` entries in the `adventure-by-slug` response's `_references`, linking to each adventure and displaying its price when available. Each related card makes an additional `adventure-by-slug` request to load its `primaryImage._path`, served from AEM Publish. Cards remain usable while images load; missing images and request errors are shown on the card. No AEM query changes are required. The section is hidden when no other adventures with slugs are referenced.

For a local combined preview, serve the landing page, shared settings script, and built apps on the same origin, with paths matching the build. Separate development-server ports do not share session settings. The Pages workflow derives the static base path from the repository name; this is a hosting setting, not an AEM connection setting.

GraphQL requests always go through the saved demo proxy. Tokens are sent as Bearer headers, not URL parameters. The proxy must allow CORS requests from the demo origin and forward `Authorization` to AEM.

## Documentation

* [AEM Headless Tutorials](https://experienceleague.adobe.com/docs/experience-manager-learn/getting-started-with-aem-headless/overview.html)
* [AEM Headless Developer Journey](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/headless-journey/developer/overview.html)
* [AEM Headless Client for JavaScript](https://github.com/adobe/aem-headless-client-js)
