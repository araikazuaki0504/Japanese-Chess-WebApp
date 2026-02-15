// index.ts
import express from "express";
import cors from "cors";

import { ShogiGame } from "./gameLogic";
import { SSEMessage } from "./types/SSEType";
import { addClient, broadcast } from "./SSE";

const app = express();
const game = new ShogiGame();

app.use(cors());
app.use(express.json());

/** SSE */
app.get("/sse", (req: express.Request, res: express.Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  addClient(res);

  // 初期盤面
  res.write(`data: ${JSON.stringify({
    type: "init",
    board: game.getBoard(),
    turn: game.getTurn()
  })}\n\n`);
});

/** 移動 */
app.post("/move", (req: express.Request, res: express.Response) => {
  const requestData : SSEMessage = req.body;

  const result = game.movePiece(requestData.SSEPayload);
  
  if (!result) {
    return res.status(400).json({ error: "invalid move" });
  }

  broadcast(result);
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Shogi server listening on :3000");
});