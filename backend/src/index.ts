import express from "express";
import cors from "cors";

import { SSEMessage } from "./types/SSEType";

import { ShogiGame } from "./gameLogic";
import { SSEManager } from "./SSE/SSEManager";
import { mapBoardToClient } from "./gameLogic_lib"

const app = express();
const game = new ShogiGame();
const sseManager = SSEManager.getInstance();
const cookieParser = require('cookie-parser')

app.use(cors({
  origin: "http://localhost:5173", // クライアントのURL
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

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


/** 移動 */
app.post("/move", (req: express.Request, res: express.Response) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const requestData : SSEMessage = req.body;

  // const result = game.movePiece(requestData.SSEPayload);
  
  // if (!result) {
  //   return res.status(400).json({ error: "invalid move" });
  // }

  sseManager.notifyOthers(requestData.playerCode,requestData);

  return res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Shogi server listening on :3000");
});