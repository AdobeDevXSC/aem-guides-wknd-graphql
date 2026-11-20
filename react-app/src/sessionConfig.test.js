import sessionConfig from "./sessionConfig";

const config = {
  aemHost: "https://author-demo.example",
  proxyURL: "https://proxy.example/api",
  graphqlEndpoint: "custom-namespace",
  authToken: "temporary-demo-token",
};
const rootPath = "/forked-repo/";

beforeEach(() => {
  sessionStorage.clear();
});

test("saved settings override all defaults and survive subsequent reads", () => {
  const saved = sessionConfig.save({ ...config, aemHost: config.aemHost + "/" }, rootPath);
  expect(saved.aemHost).toBe(config.aemHost);
  expect(sessionConfig.read(rootPath)).toEqual(config);
  expect(sessionConfig.read("/forked-repo")).toEqual(config);
});

test("settings are isolated by repository path and clearing removes the connection", () => {
  sessionConfig.save(config, rootPath);
  expect(sessionConfig.read("/another-repo/")).toBeNull();
  sessionStorage.setItem("unrelated-setting", "keep");
  sessionConfig.clear(rootPath);
  expect(sessionConfig.read(rootPath)).toBeNull();
  expect(() => sessionConfig.requireConfig(rootPath)).toThrow(/Configure and save/);
  expect(sessionStorage.getItem("unrelated-setting")).toBe("keep");
});

test.each([
  [{ aemHost: "javascript:alert(1)" }, /HTTP or HTTPS/],
  [{ aemHost: "https://author.example/content" }, /without a path/],
  [{ proxyURL: "" }, /valid proxy URL/],
  [{ proxyURL: "https://proxy.example/api?token=secret" }, /query parameters/],
  [{ graphqlEndpoint: "https://example/graphql" }, /GraphQL namespace/],
  [{ authToken: "" }, /Enter a temporary access token/],
  [{ authToken: "   " }, /Enter a temporary access token/],
  [{ authToken: "token\nanother-line" }, /single line/],
])("invalid settings are rejected without overwriting the saved connection", (override, message) => {
  sessionConfig.save(config, rootPath);
  expect(() => sessionConfig.save({ ...config, ...override }, rootPath)).toThrow(message);
  expect(sessionConfig.read(rootPath)).toEqual(config);
});

test("a missing session cannot supply an AEM connection", () => {
  expect(sessionConfig.read(rootPath)).toBeNull();
  expect(() => sessionConfig.requireConfig(rootPath)).toThrow(/demo landing page/);
});

test("both app routes resolve the same repository scope without build configuration", () => {
  try {
    window.history.replaceState(null, "", "/forked-repo/next-js/adventure/");
    expect(sessionConfig.appRootPath("next-js")).toBe(rootPath);
    window.history.replaceState(null, "", "/forked-repo/react-app/");
    expect(sessionConfig.appRootPath("react-app")).toBe(rootPath);
  } finally {
    window.history.replaceState(null, "", "/");
  }
});

test("malformed saved settings are reported rather than silently falling back", () => {
  sessionStorage.setItem(sessionConfig.storageKey(rootPath), "{broken");
  expect(() => sessionConfig.read(rootPath)).toThrow(/Clear settings/);
  sessionStorage.setItem(sessionConfig.storageKey(rootPath), JSON.stringify({ aemHost: config.aemHost }));
  expect(() => sessionConfig.read(rootPath)).toThrow(/Invalid AEM setting/);
});

test("blocked browser storage reports an actionable error", () => {
  const getItem = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("Blocked", "SecurityError");
  });
  try {
    expect(() => sessionConfig.read(rootPath)).toThrow(/Allow storage/);
  } finally {
    getItem.mockRestore();
  }
});
