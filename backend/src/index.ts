import express from "express";
import cors from "cors";

import { gameEventMessage, ReturnGameEventMessage } from "./types/APIType";
import { InitMessageType, ReturnInitMessageType, ReturnReloadMessageType } from "./types/APIType";

import { GameEngine } from "./game/gameEngine";
import { SSEManager } from "./SSE/SSEManager";
import { UserManager } from "./game/UserManager";
import { GameEventManager } from "./SSE/gameEventManager";
import { mapBoardToClient, toLightCapturedPiecesList } from "./game/gameLogic"
import { gameEventType } from "./types/gameType";

const app = express();
const gameEngine = new GameEngine();
const sseManager = SSEManager.getInstance();
const userManager = UserManager.getInstance();
const gameEventManager = new GameEventManager();
const cookieParser = require('cookie-parser')

app.use(cors({
  origin: "http://localhost:5173", // クライアントのURL
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// 初期情報の取得
app.post("/init", (req: express.Request<InitMessageType>, res: express.Response<ReturnInitMessageType>) => {
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
  const clientCapturedPiecesList = toLightCapturedPiecesList(gameEngine.getCapturedPiecesList(initMessage.userType as "Sente" | "Gote"));
  const opponentCapturedPiecesList = toLightCapturedPiecesList(gameEngine.getCapturedPiecesList(initMessage.userType === "Sente" ? "Gote" : "Sente"));

  userManager.addUser(initMessage.userType,userID);

  console.log("User connected:", userID, "Type:", initMessage.userType);

  return res.json({
    type: "init",
    userCode: userID,
    boardData: clientBoard,
    currentTurn: gameEngine.getcurrentTurn(),
    myselfCapturedList : clientCapturedPiecesList,
    opponentCapturedList : opponentCapturedPiecesList
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
  const clientCapturedPiecesList = toLightCapturedPiecesList(gameEngine.getCapturedPiecesList(userType as "Sente" | "Gote"));
  const opponentCapturedPiecesList = toLightCapturedPiecesList(gameEngine.getCapturedPiecesList(userType === "Sente" ? "Gote" : "Sente"));

  return res.json({
    type: "reload",
    userCode: userID,
    boardData: clientBoard,
    currentTurn: gameEngine.getcurrentTurn(),
    myselfCapturedList : clientCapturedPiecesList,
    opponentCapturedList : opponentCapturedPiecesList
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

  const userType = userManager.changeOwner(gameEvent.userCode);
  const convertedGameEvent = GameEngine.convertServerCoordinate(gameEvent,userType as "Sente" | "Gote");

  if (!gameEventManager.check(gameEvent.type)) {
    console.log("Invalid event sequence:", gameEvent.type);
    return res.json({
      ...convertedGameEvent,
      currentTurn : gameEngine.getcurrentTurn(),
      result : false
    });
  }  

  const result = gameEngine.validation(convertedGameEvent);

  console.log("result:",result);
  console.log("userType:",userType);
  console.log("currentTurn",gameEngine.getcurrentTurn());
  console.log("gameEvent:");
  console.log(convertedGameEvent);

  if (result && convertedGameEvent.type !== "undo") { 
    gameEngine.ApplyReducer(convertedGameEvent);
    sseManager.notifyOthers(convertedGameEvent.userCode,convertedGameEvent);

    const returnGameEventMessage : ReturnGameEventMessage = {
      ...convertedGameEvent,
      currentTurn : gameEngine.getcurrentTurn(),
      result : result
    }

    return res.json(returnGameEventMessage);
  }else if (result && convertedGameEvent.type === "undo") {
    const gameEventMessages : gameEventType[] = gameEngine.undoApplyReducer();

    for (const gameEventMessage of gameEventMessages) {
      sseManager.notifyAll(gameEventMessage);
    }

    return res.json({});
  }
  
});

app.listen(3000, () => {
  console.log("Shogi server listening on :3000");
});