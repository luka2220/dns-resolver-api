import express, { Express, Request, Response } from 'express';
import { testGoogle, testCloudFlare } from './dns';

const server: Express = express();
const PORT = 3000;

server.get('/test/dns/cloudflare', async (req: Request, res: Response) => {
    res.status(200).json({ message: 'cloudflare DNS test running' });
    await testCloudFlare();
});

server.get('/test/dns/google', async (req: Request, res: Response) => {
    res.status(200).json({ message: 'google DNS test running' });
    await testGoogle();
});

server.listen(PORT, () => {
    console.log(`[server]: Server running at http://localhost:${PORT}`);
});
