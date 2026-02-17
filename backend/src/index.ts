import express from "express";
import cors from "cors";
import { addClient, broadcast } from "./SSE";

import { ShogiGame } from "./gameLogic";
import { mapBoardToClient } from "./gameLogic_lib"
import { SSEMessage } from "./types/SSEType";

const app = express();
const game = new ShogiGame();

app.use(cors());
app.use(express.json());

// 初期盤面の取得
app.post("/init", (req: express.Request, res: express.Response) => {
  res.setHeader("Content-Type", "application/json");

  const playerCode = Math.floor(Math.random() * 100) + 1;
  const clientBoard = mapBoardToClient(game.getBoard(),true);// いったんtrue

  res.json({
    type: "init",
    playerCode: playerCode,
    boardData: clientBoard,
  });
    
});

/** SSE */
app.get("/clientAuth", (req: express.Request, res: express.Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  addClient(res);
});

/** 移動 */
app.post("/move", (req: express.Request, res: express.Response) => {
  const requestData : SSEMessage = req.body;

  console.log(requestData);
  // const result = game.movePiece(requestData.SSEPayload);
  
  // if (!result) {
  //   return res.status(400).json({ error: "invalid move" });
  // }

  broadcast(requestData);
});

app.listen(3000, () => {
  console.log("Shogi server listening on :3000");
});