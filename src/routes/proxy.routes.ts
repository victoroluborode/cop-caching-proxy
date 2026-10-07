import { Router, Request, Response } from "express";

interface CacheEntry {
    status: number;
    headers: Record<string, string>;
    body: any;
    expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 60 * 1000;


function createProxyRouter(origin: string):Router {
    const router = Router();

    router.post("/__clear-cache", (req: Request, res: Response) => {
      cache.clear();
      res.status(200).json({ message: "Cache cleared" });
    });

    router.get('/*splat', async (req: Request, res: Response) => {
        const cacheKey = `GET:${req.originalUrl}`;

        const cached = cache.get(cacheKey);
        const isExpired = cached && cached.expiresAt < Date.now();

        if (cached && !isExpired) {
            res.set(cached.headers);
            res.set('X-Cache', 'HIT');
            return res.status(cached.status).send(cached.body);
        }

        try {
            const originUrl = `${origin}${req.originalUrl}`;
            const originResponse = await fetch(originUrl);
            const body = await originResponse.text();
            const headers: Record<string, string> = {};
            originResponse.headers.forEach((value, key) => {
                if (
                  key.toLowerCase() !== "content-encoding" &&
                  key.toLowerCase() !== "content-length"
                ) {
                  headers[key] = value;
                }
            });

            cache.set(cacheKey, {
                status: originResponse.status,
                headers,
                body,
                expiresAt: Date.now() + TTL_MS,
            });

            res.set(headers);
            res.set('X-Cache', 'MISS');
            res.status(originResponse.status).send(body);
        } catch (error) {
            console.error(`Error forwarding request`, error);
            return res.status(502).json({ error: 'Failed to reach origin server' });
        }
    });

    return router;
}

export { createProxyRouter, cache };