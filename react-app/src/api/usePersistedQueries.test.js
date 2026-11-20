import { renderHook, waitFor } from "@testing-library/react";
import sessionConfig from "../sessionConfig";
import AEMHeadless from "@adobe/aem-headless-client-js";
import { useAdventuresByActivity, useAdventureBySlug } from "./usePersistedQueries";

jest.mock("@adobe/aem-headless-client-js", () => jest.fn());

const runPersistedQuery = jest.fn();
const config = {
  aemHost: "https://author-demo.example",
  proxyURL: "https://proxy.example/api",
  graphqlEndpoint: "session-namespace",
  authToken: "temporary-demo-token",
};
const params = {};

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  sessionConfig.save(config, "/");
  AEMHeadless.mockImplementation(() => ({ runPersistedQuery }));
  runPersistedQuery.mockReset();
});

test("environment settings cannot replace a missing browser session", () => {
  sessionStorage.clear();
  const values = {
    REACT_APP_HOST_URI: "https://environment-demo.example",
    REACT_APP_PROXY_URL: "https://environment-proxy.example",
    REACT_APP_GRAPHQL_ENDPOINT: "environment-namespace",
    REACT_APP_AUTH_TOKEN: "environment-demo-token",
  };
  const original = {};
  for (const key of Object.keys(values)) {
    original[key] = process.env[key];
    process.env[key] = values[key];
  }
  try {
    let client;
    let isolatedSDK;
    jest.isolateModules(() => {
      isolatedSDK = require("@adobe/aem-headless-client-js");
      isolatedSDK.mockImplementation(() => ({ runPersistedQuery }));
      client = require("./aemHeadlessClient").default;
    });
    expect(() => client.runPersistedQuery("session-namespace/adventures-all", {}))
      .toThrow(/Configure and save/);
    expect(isolatedSDK).not.toHaveBeenCalled();
  } finally {
    for (const key of Object.keys(values)) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});

test("list queries use the session host, proxy, token, and namespace", async () => {
  runPersistedQuery.mockResolvedValue({ data: { adventureList: { items: [] } } });
  const { result } = renderHook(() => useAdventuresByActivity("Hiking", params));
  await waitFor(() => expect(result.current.adventures).toEqual([]));
  expect(AEMHeadless).toHaveBeenCalledWith(expect.objectContaining({
    serviceURL: config.proxyURL,
    auth: config.authToken,
  }));
  expect(runPersistedQuery).toHaveBeenCalledWith("session-namespace/adventures-by-activity", { activity: "Hiking" });
});

test("detail queries use the session namespace", async () => {
  const adventure = { slug: "demo" };
  runPersistedQuery.mockResolvedValue({ data: { adventureList: { items: [adventure] } } });
  const { result } = renderHook(() => useAdventureBySlug("demo", params));
  await waitFor(() => expect(result.current.adventure).toEqual(adventure));
  expect(runPersistedQuery).toHaveBeenCalledWith("session-namespace/adventure-by-slug", { slug: "demo" });
});

test("invalid stored configuration reaches the error state used by the UI", async () => {
  sessionStorage.setItem(sessionConfig.storageKey("/"), "{broken");
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    const { result } = renderHook(() => useAdventuresByActivity(null, params));
    await waitFor(() => expect(result.current.error).toMatch(/Clear settings/));
    expect(runPersistedQuery).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});

test("SDK network errors with object-shaped JSON reach the error state", async () => {
  const error = new Error("Failed to fetch");
  error.toJSON = () => ({ code: "REQUEST_ERROR", message: "General Request error: Failed to fetch." });
  runPersistedQuery.mockRejectedValue(error);
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    const { result } = renderHook(() => useAdventuresByActivity(null, params));
    await waitFor(() => expect(result.current.error).toBe("General Request error: Failed to fetch."));
    expect(log).toHaveBeenCalledWith(error);
  } finally {
    log.mockRestore();
  }
});
