import express from "express";
import cors from "cors";

import { SSEManager } from "./SSE/SSEManager";

const app = express();
const cookieParser = require('cookie-parser')
const sseManager = SSEManager.getInstance();

app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", // クライアントのURL
  credentials: true
}));

/** SSE */
app.get("/sse", (req: express.Request, res: express.Response) => {
  const playerID = req.cookies.playerID;
  console.log("Client Auth connect", playerID);

  if (!playerID) {
    res.sendStatus(401);
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // playerID を使って登録
  sseManager.addClient(playerID, res);

  res.write("data: connected\n\n");

  // クライアントが切断したら clients から削除
  req.on("close", () => {
    sseManager.removeClient(playerID);
    console.log("Client disconnected, removed from clients");
  });
  
});

app.post("/broadcast", express.json(), (req, res) => {
  const gameEvent = req.body;
  console.log(gameEvent)

  sseManager.notifyAll(gameEvent);

  res.sendStatus(200);
});

app.listen(3001, () => {
  console.log("SSE server listening on 3001");
});
