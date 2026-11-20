/** @jest-environment node */
import sessionConfig from "./sessionConfig";

test("proxy requests omit SDK cookie credentials while preserving the Bearer token and request options", async () => {
  const originalFetch = global.fetch;
  const originalHeaders = global.Headers;
  global.fetch = jest.fn().mockResolvedValue({ ok: true });
  global.Headers = jest.fn().mockImplementation((headers) => new Map(Object.entries(headers || {})));
  try {
    await sessionConfig.fetchRequest(
      "https://proxy.example/api/graphql/execute.json/demo/adventures-all?existing=value",
      { method: "GET", credentials: "include", headers: { Accept: "application/json" } },
      { aemHost: "https://author-demo.example/", authToken: "temporary-demo-token" },
    );
    const [url, options] = global.fetch.mock.calls[0];
    expect(new URL(url).searchParams.get("aemHost")).toBe("https://author-demo.example");
    expect(new URL(url).searchParams.get("existing")).toBe("value");
    expect(url).not.toContain("temporary-demo-token");
    expect(options.credentials).toBe("omit");
    expect(options.method).toBe("GET");
    expect(options.headers.get("Authorization")).toBe("Bearer temporary-demo-token");
    expect(options.headers.get("Accept")).toBe("application/json");
  } finally {
    global.fetch = originalFetch;
    if (originalHeaders === undefined) delete global.Headers;
    else global.Headers = originalHeaders;
  }
});
