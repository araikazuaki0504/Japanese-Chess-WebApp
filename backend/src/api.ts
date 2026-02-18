import express from "express";
import cors from "cors";

import { ShogiGame } from "./gameLogic";
import { SSEManager } from "./SSE/SSEManager";
import { mapBoardToClient } from "./gameLogic_lib"
import { SSEMessage } from "./types/SSEType";

const app = express();
const game = new ShogiGame();
const sseManager = SSEManager.getInstance();
const cookieParser = require('cookie-parser')

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", // クライアントのURL
  credentials: true
}));

// CORS preflight
app.options("/move", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});

// 初期情報の取得
app.post("/init", (req: express.Request, res: express.Response) => {
  res.setHeader("Content-Type", "application/json");

  let playerID = req.cookies.playerID;

  if (!playerID) {
    // Cookie が無ければ新規生成
    playerID = sseManager.generatePlayerId();
    res.cookie("playerID", playerID, {
      maxAge: 1000 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
      secure: false
    });
    console.log("Init: new playerID set:", playerID);
  } else {
    res.cookie("playerID", playerID, {
      maxAge: 1000 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
      secure: false
    });
    console.log("Init: existing playerID:", playerID);
  }

  const clientBoard = mapBoardToClient(game.getBoard(),true);// いったんtrue

  res.json({
    type: "init",
    playerCode: playerID,
    boardData: clientBoard,
  });
    
});

/** 移動 */
app.post("/move", async (req: express.Request, res: express.Response) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const requestData : SSEMessage = req.body;

  // const result = game.movePiece(requestData.SSEPayload);
  
  // if (!result) {
  //   return res.status(400).json({ error: "invalid move" });
  // }

  // ② SSE サーバーに差分を送る
  await fetch("http://localhost:3001/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  });

  return res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("API server listening on 3000");
});