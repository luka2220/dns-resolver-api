import express, { Express, Request, Response } from "express";

export const server: Express = express();
export const PORT = 3000;

server.get("/test", (req: Request, res: Response) => {
    res.send("API test running");
});
