import express from "express";
import { createProxyRouter } from "./routes/proxy.routes";
const app = express();

interface Options {
    port?: string;
    origin?: string;
    clearCache?: boolean;
}

const startServer = (options: Options) => {
    if (!options.port) {
        console.error('Port is required');
        return;
    }

    const port = Number(options.port);

    if (!options.origin) {
        console.error('Origin is required')
        return;
    }

    const router = createProxyRouter(options.origin);
    app.use(router);

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export { startServer };
