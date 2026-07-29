# Tests

An end-to-end regression suite (~60 checks) that runs the real `index.html`
against a mocked Supabase client in a headless browser. It covers sign-in
gating, profiles, voting and weighting, comments and comment votes, topics,
languages, pathways, My path, requests, public profiles, reports, duplicate
detection, the digest, the map, the constellation, and more.

## Running

```bash
npm install playwright        # once (downloads a browser)
node tests/build-test-page.mjs
node tests/test-live.cjs
```

Every line should print `... : true` (or show expected values). The two
`ERR_TUNNEL_CONNECTION_FAILED` console errors are the Google Fonts CDN being
unreachable in sandboxed environments — harmless.

Note: the test page fabricates its own data; nothing touches the real
database. Run it before pushing any change to `index.html`.
