// SSE.ts
import { Response } from "express";

const clients = new Set<Response>();

const addClient = (res: Response) => {
  clients.add(res);
  res.on("close", () => clients.delete(res));
};

const broadcast = (data: any) => {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(res => res.write(msg));
};

export {
  addClient,
  broadcast
};
