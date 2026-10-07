# Cop-Caching Proxy

A CLI tool that starts a caching proxy server. It forwards requests to a configured origin server, caches the responses, and serves cached responses on repeat requests instead of hitting the origin again.

## Setup

1. Clone the repo and install dependencies:
   ```
   npm install
   ```

2. Start the proxy, pointing it at an origin server:
   ```
   npx ts-node-dev src/app.ts --port 3000 --origin http://dummyjson.com
   ```

## Usage

### Start the proxy

```
caching-proxy --port <number> --origin <url>
```

Example:
```
npx ts-node-dev src/app.ts --port 3000 --origin http://dummyjson.com
```

Any request to `http://localhost:3000/<path>` is forwarded to `http://dummyjson.com/<path>`, cached, and returned. Repeat requests for the same path + query string are served from the cache instead of hitting the origin again.

### Check cache status

Every response includes an `X-Cache` header:
- `X-Cache: MISS` — the request was forwarded to the origin and freshly cached
- `X-Cache: HIT` — the response was served from the cache

### Clear the cache

```
caching-proxy --clear-cache --port <number>
```

Example:
```
npx ts-node-dev src/app.ts --clear-cache --port 3000
```

This sends a request to the already-running proxy's internal `/__clear-cache` endpoint, so it clears the live server's cache without needing a restart. `--port` must match the port the proxy is currently running on.

## How it works

- **Cache key**: `METHOD:path+querystring` (e.g. `GET:/products?limit=5`). Different query strings are cached separately.
- **TTL**: cached entries expire after 60 seconds. After expiry, the next request for that path is treated as a fresh miss and re-fetched from the origin.
- **Storage**: in-memory (a `Map`), cleared automatically if the server restarts.
- **Headers**: origin response headers are forwarded as-is, except `content-encoding` and `content-length`, which are stripped since the response body is already decompressed by the time it's cached and re-sent.
