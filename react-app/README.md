# React App - WKND Adventures

An example React application that highlights Adobe Experience Manager's GraphQL APIs and the [AEM Headless Client for JavaScript](https://github.com/adobe/aem-headless-client-js).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

![React App Screenshot](./docs/react-screenshot.png)

## Tutorial

A corresponding [tutorial](https://experienceleague.adobe.com/docs/experience-manager-learn/getting-started-with-aem-headless/graphql/multi-step/setup.html) is available where you can learn how to setup and run the application to query data from an AEM environment using GraphQL.

## How to use

1. On the target AEM environment install the `aem-guides-wknd-shared.ui.content-x.x.x.zip` from the [latest release of the WKND Shared Content](https://github.com/adobe/aem-guides-wknd-shared/releases/latest) using [Package Manager](http://localhost:4502/crx/packmgr/index.jsp).
1. Open the [demo landing page](../.github/pages/index.html) on the hosted site.
1. Enter your AEM Author URL and temporary access token, then select **Save settings**. The demo proxy URL and GraphQL namespace (`wknd-shared`) are read-only.
1. Open the React app card in the same tab.

To build the app locally, install [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/), then run:

    ```shell
    $ cd aem-guides-wknd-graphql/react-app
    $ npm ci
    $ npm run build
    ```

> On local environments it may be easier to simply install the full [WKND Site 2.0+](https://github.com/adobe/aem-guides-wknd/releases/latest) which will include the WKND Shared content and additional CORS configurations.

## System Requirements

 AEM as a Cloud Service | AEM 6.5 | Sample Content | Node   | npm | 
------------------------|---------|--------------------|---------|-----|
Continual               | 6.5.13+ |  [WKND Shared 2.0+](https://github.com/adobe/aem-guides-wknd-shared/releases/latest) or [WKND Site 2.0+](https://github.com/adobe/aem-guides-wknd/releases/latest)| 10+  | 6+

## Notes

### Browser Session Settings

All AEM connection settings come from the browser's `sessionStorage`, not environment files or repository variables. Without saved settings, the app shows a configuration error rather than making AEM requests. Clearing settings requires configuring the connection again.

For a local combined preview, serve the landing page, shared settings script, and built apps on the same origin, with paths matching the build. Opening standalone development servers on separate ports does not share session settings.

### Proxy API Requests

GraphQL requests always use the saved demo proxy URL. The selected AEM host is sent as `aemHost`, and the temporary token is sent in the `Authorization: Bearer` header. The proxy must allow requests from the demo origin and forward this header to AEM. Tokens are not placed in query strings.

### CORS - Cross Origin Resource Sharing

The browser connects to the CORS-enabled demo proxy, which requests AEM content server-side. No local environment-based proxy setup is required. Images are served directly from the corresponding AEM Publish host.

## Documentation

* [AEM Headless Tutorials](https://experienceleague.adobe.com/docs/experience-manager-learn/getting-started-with-aem-headless/overview.html)
* [AEM Headless Developer Journey](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/headless-journey/developer/overview.html)
* [AEM Headless Client for JavaScript](https://github.com/adobe/aem-headless-client-js)


