import { useState ,useEffect, useCallback, useRef } from "react";

import { movePieceInfoType, promotedPieceInfoType, resignedPieceInfoType } from "../types/gameType";
import { ReturnGameEventMessageType, ReturnReloadMessageType, RetutrnInitMessageType } from "../types/APIType";

import { GameEngine } from "../game/gameEngine";
import { ShogiAPI } from "../shogiAPI/shogiAPI";

export function useShogiGame() {
  const { sendInitEvent, sendGameEvent, sendReloadEvent } = ShogiAPI();

  const esRef = useRef<EventSource | null>(null);
  const scheduledRef = useRef(false);

  const gameEngine = GameEngine.getInstance();
  const initBoard = gameEngine.getBoard();
  const initMyselfCapturedList = gameEngine.getMyselfCapturedList();
  const initOpponentCapturedList = gameEngine.getOpponentCapturedList();

  const [ currentBoard, setCurrentBoard ] = useState(initBoard);
  const [ myselfCapturedPiece, setMyselfCapturedPiece ] = useState(initMyselfCapturedList);
  const [ opponentCapturedPiece, setOpponentCapturedPiece ] = useState(initOpponentCapturedList);

  // gameの初期化
  const initShogiService = async () : Promise<RetutrnInitMessageType> => {
        return await sendInitEvent({
          type : "init",
          userType : gameEngine.getuserType()
        });
  }

  // SSEハンドラ
  const SSE_Handler = (message: MessageEvent) => {
    const gameEvent = JSON.parse(message.data);
    gameEngine.ApplyReducer(gameEvent);

    if (scheduledRef.current) return;

    scheduledRef.current = true;
    requestAnimationFrame(() => {
      scheduledRef.current = false;

      if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());
      if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList);
      if (gameEngine.didUpdateOpponentCapturedList()) setOpponentCapturedPiece(gameEngine.getOpponentCapturedList());
    });
  };

  // SSEのエラーハンドル
  const SEE_ErrorHandler = (erroMessage : Event) => {
    console.log(erroMessage);
  }

  useEffect(() => {
    // 初期化
    initShogiService().then((initData) => {
      const es = new EventSource("http://localhost:3000/sse", { withCredentials: true });

      setCurrentBoard(GameEngine.ligthBoardToBoard(initData.boardData));
      gameEngine.initSetBoard(initData.boardData);
      gameEngine.userCode = initData.userCode;
      gameEngine.setCurrentTurn(initData.currentTurn);

      es.onmessage = SSE_Handler;
      es.onerror = SEE_ErrorHandler;

      return () => {
        es.close();
        esRef.current = null;
      };
    });
  }, []);

  const movePiece = useCallback((movePieceInfo: movePieceInfoType) : boolean => {
      if (!gameEngine.isMyTurn()) return false;
      const canMove = gameEngine.canMove(movePieceInfo);

      if (!canMove) {
        return false;
      }
        
      // 相手の駒がある場合は取る
      if (gameEngine.canCapturedPiece(movePieceInfo)) {
        const capturedPieceData = gameEngine.getCapturedPieceData(movePieceInfo.to);
        gameEngine.myselfCapturedPiece({
            pieceData : capturedPieceData,
            owner : "Myself",
            at : movePieceInfo.to
        });

        sendGameEvent({
          type : "captured",
          userCode : gameEngine.userCode,
          pieceData : capturedPieceData,
          from : movePieceInfo.to
        }).then((returnGameEventMessage : ReturnGameEventMessageType) => {
          const result = returnGameEventMessage.result;
          
          // 通信成功時
          if (result) {
            gameEngine.turnChange();
            return;
          };

          // 通信非成功時
          // 盤面・手番再読み込み
          sendReloadEvent().then((returnReloadMessage : ReturnReloadMessageType) => {
            gameEngine.initSetBoard(returnReloadMessage.boardData);
            gameEngine.setCurrentTurn(returnReloadMessage.currentTurn);
          });
        });
      }

      // 移動
      gameEngine.movePiece(movePieceInfo);

      // サーバーへの通信
      sendGameEvent({
        type:"move",
        userCode: gameEngine.userCode ,
        ...movePieceInfo
      }).then((returnGameEventMessage : ReturnGameEventMessageType) => {
        const result = returnGameEventMessage.result;
          
        // 通信成功時
        if (result) {
          gameEngine.turnChange();
          return;
        };

        // 通信非成功時
        // 盤面・手番再読み込み
        sendReloadEvent().then((returnReloadMessage : ReturnReloadMessageType) => {
          gameEngine.initSetBoard(returnReloadMessage.boardData);
          gameEngine.setCurrentTurn(returnReloadMessage.currentTurn);
        });
      });
      
      // Boardを更新するか
      if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());

      // 自分の持ち駒を更新するか
      if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList());

    return true;
  },[]);

  const promotedPiece = useCallback((promotedPieceInfo: promotedPieceInfoType) : void => {
    if (!gameEngine.isMyTurn()) return;
    // 成れるかの判定
    if (!promotedPieceInfo.isPromoted) return;

    gameEngine.promotedPiece(promotedPieceInfo);

    // Boardを更新するか
    if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());

    // サーバーへの通信
    sendGameEvent({
      type : "promoted",
      userCode : gameEngine.userCode,
      pieceData : promotedPieceInfo.pieceData,
      to : promotedPieceInfo.at
    }).then((returnGameEventMessage : ReturnGameEventMessageType) => {
        const result = returnGameEventMessage.result;
          
        // 通信成功時
        if (result) {
          gameEngine.turnChange();
          return;
        };

        // 通信非成功時
        // 盤面・手番再読み込み
        sendReloadEvent().then((returnReloadMessage : ReturnReloadMessageType) => {
          gameEngine.initSetBoard(returnReloadMessage.boardData);
          gameEngine.setCurrentTurn(returnReloadMessage.currentTurn);
        });
      });

  },[]);

  const resignedPiece = (resignedPieceInfo : resignedPieceInfoType) : void => {
    if (!gameEngine.isMyTurn()) return;
    // 置けるか
    if (!gameEngine.canResignedPiece(resignedPieceInfo)) return;

    gameEngine.resignedPiece(resignedPieceInfo);

    // 諸々の更新
    if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());
    if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList());
  

    // サーバーへの通信
    sendGameEvent({
      type: "resign",
      userCode: gameEngine.userCode ,
      pieceData : resignedPieceInfo.pieceData,
      to: resignedPieceInfo.at
    }).then((returnGameEventMessage : ReturnGameEventMessageType) => {
        const result = returnGameEventMessage.result;
          
        // 通信成功時
        if (result) {
          gameEngine.turnChange();
          return;
        };

        // 通信非成功時
        // 盤面・手番再読み込み
        sendReloadEvent().then((returnReloadMessage : ReturnReloadMessageType) => {
          gameEngine.initSetBoard(returnReloadMessage.boardData);
          gameEngine.setCurrentTurn(returnReloadMessage.currentTurn);
        });
      });
  }

    return { currentBoard, myselfCapturedPiece, opponentCapturedPiece, movePiece, promotedPiece, resignedPiece };
}