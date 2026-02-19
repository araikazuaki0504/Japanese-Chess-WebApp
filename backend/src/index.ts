import express from "express";
import cors from "cors";

import { gameEventMessage, ReturngameEventMessage } from "./types/APIType";
import { InitMessageType } from "./types/APIType";

import { GameEngine } from "./game/gameEngine";
import { SSEManager } from "./SSE/SSEManager";
import { UserManager } from "./game/UserManager";
import { mapBoardToClient } from "./game/gameLogic"

const app = express();
const gameEngine = new GameEngine();
const sseManager = SSEManager.getInstance();
const userManager = UserManager.getInstance();
const cookieParser = require('cookie-parser')

app.use(cors({
  origin: "http://localhost:5173", // クライアントのURL
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// 初期情報の取得
app.post("/init", (req: express.Request, res: express.Response) => {
  res.setHeader("Content-Type", "application/json");

  let userID = req.cookies.userID;

  if (!userID) {
    // Cookie が無ければ新規生成
    userID = sseManager.generateuserId();
    res.cookie("userID", userID, {
      maxAge: 1000 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
      secure: false
    });
    console.log("Init: new userID set:", userID);
  } else {
    res.cookie("userID", userID, {
      maxAge: 1000 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
      secure: false
    });
    console.log("Init: existing userID:", userID);
  }

  const initMessage : InitMessageType = req.body;
  const isRotation : boolean = initMessage.userType === "Sente";

  const clientBoard = mapBoardToClient(gameEngine.getBoard(),isRotation);

  userManager.addUser(initMessage.userType,userID);

  return res.json({
    type: "init",
    userCode: userID,
    boardData: clientBoard,
    currentTurn: gameEngine.getcurrentTurn()
  });
    
});

// リロード(再読み込み)
app.get("/reload", (req: express.Request, res: express.Response) => {
  res.setHeader("Content-Type", "application/json");

  const userID = req.cookies.userID;

  if (!userID) return res.json({});

  const userType = userManager.getUserType(userID);
  const isRotation : boolean = userType === "Sente";
  const clientBoard = mapBoardToClient(gameEngine.getBoard(),isRotation);

  return res.json({
    type: "reload",
    boardData: clientBoard,
    currentTurn: gameEngine.getcurrentTurn()
  });
});

/** SSE */
app.get("/sse", (req: express.Request, res: express.Response) => {
  const userID = req.cookies.userID;
  console.log("Client Auth connect", userID);

  if (!userID) {
    res.sendStatus(401);
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // userID を使って登録
  sseManager.addClient(userID, res);

  res.write("data: connected\n\n");

  // クライアントが切断したら clients から削除
  req.on("close", () => {
    sseManager.removeClient(userID);
    userManager.removeUserWithUserID(userID);
    console.log("Client disconnected, removed from clients");
  });
  
});

app.post("/gameEvent", (req: express.Request, res: express.Response) => {
  const gameEvent : gameEventMessage = req.body;

  const UserType = userManager.getUserType(gameEvent.userCode);
  const convertedGameEvent = GameEngine.convertServerCoordinate(gameEvent,UserType as "Sente" | "Gote");

  const result = gameEngine.validation(convertedGameEvent);

  console.log("gameEvent");
  console.log("result:",result);
  console.log("userType:",UserType);
  console.log("currentTurn",gameEngine.getcurrentTurn());
  console.log(convertedGameEvent);

  if (result) { 
    sseManager.notifyOthers(convertedGameEvent.userCode,convertedGameEvent);
    gameEngine.ApplyReducer(convertedGameEvent);
  };

  const returnGameEventMessage : ReturngameEventMessage = {
    ...convertedGameEvent,
    currentTurn : gameEngine.getcurrentTurn(),
    result : result
  }

  return res.json(returnGameEventMessage);
});

app.listen(3000, () => {
  console.log("Shogi server listening on :3000");
});