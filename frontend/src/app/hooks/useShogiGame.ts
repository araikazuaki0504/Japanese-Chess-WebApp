import { useState ,useEffect, useCallback, useRef } from "react";

import { movePieceInfoType, promotedPieceInfoType, resignedPieceInfoType } from "../types/gameType";
import { ReturnGameEventMessageType, ReturnReloadMessageType, RetutrnInitMessageType } from "../types/APIType";

import { GameEngine } from "../game/gameEngine";
import { ShogiAPI } from "../shogiAPI/shogiAPI";
import { Blank, piecesData } from "../const/piecesData";

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

  const reload = (returnGameEventMessage : ReturnGameEventMessageType) : void => {
    const result = returnGameEventMessage.result;
          
    // 通信成功時
    if (result) return;

    // 通信非成功時
    // 盤面・手番再読み込み
    sendReloadEvent().then((returnReloadMessage : ReturnReloadMessageType) => {
      gameEngine.initSetBoard(returnReloadMessage.boardData);
      gameEngine.initMyselfCapturedList(returnReloadMessage.myselfCapturedList);
      gameEngine.initOpponentCapturedList(returnReloadMessage.opponentCapturedList);

      if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());
      if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList());
      if (gameEngine.didUpdateOpponentCapturedList()) setOpponentCapturedPiece(gameEngine.getOpponentCapturedList());
    });
  };

  const reloadWithTurnChange = (returnGameEventMessage : ReturnGameEventMessageType) => {
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
      gameEngine.initMyselfCapturedList(returnReloadMessage.myselfCapturedList);
      gameEngine.initOpponentCapturedList(returnReloadMessage.opponentCapturedList);

      if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());
      if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList());
      if (gameEngine.didUpdateOpponentCapturedList()) setOpponentCapturedPiece(gameEngine.getOpponentCapturedList());
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
      if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList());
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

      console.log(initData)

      gameEngine.initMyselfCapturedList(initData.myselfCapturedList);
      gameEngine.initOpponentCapturedList(initData.opponentCapturedList);

      if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());
      if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList());
      if (gameEngine.didUpdateOpponentCapturedList()) setOpponentCapturedPiece(gameEngine.getOpponentCapturedList());

      es.onmessage = SSE_Handler;
      es.onerror = SEE_ErrorHandler;

      return () => {
        es.close();
        esRef.current = null;
      };
    });
  }, []);

  const movePiece = useCallback((movePieceInfo: movePieceInfoType) : Promise<boolean> => {
      if (!gameEngine.isMyTurn()) return Promise.resolve(false);
      const canMove = gameEngine.canMove(movePieceInfo);

      if (!canMove) {
        return Promise.resolve(false);
      }
        
      // 相手の駒がある場合は取る
      if (gameEngine.canCapturedPiece(movePieceInfo)) {
        var capturedPieceData = gameEngine.getCapturedPieceData(movePieceInfo.to);
        
        if (capturedPieceData.fromPromotedPieceCode) {
          const fromPromotedPieceCode = capturedPieceData.fromPromotedPieceCode;
          capturedPieceData = piecesData[fromPromotedPieceCode];
        }

        gameEngine.myselfCapturedPiece({
            pieceData : capturedPieceData,
            owner : "Myself",
            at : movePieceInfo.from
        });

        sendGameEvent({
          type : "captured",
          userCode : gameEngine.userCode,
          pieceData : capturedPieceData,
          from : movePieceInfo.to
        }).then(reload);
      }

      // 移動
      gameEngine.movePiece(movePieceInfo);

      // サーバーへの通信
      sendGameEvent({
        type:"move",
        userCode: gameEngine.userCode ,
        ...movePieceInfo
      }).then(reload);
      
      // Boardを更新するか
      if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());

      // 自分の持ち駒を更新するか
      if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList());

    return Promise.resolve(true);
  },[]);

  const promotedPiece = useCallback((promotedPieceInfo: promotedPieceInfoType) : void => {
    if (!gameEngine.isMyTurn()) return;
    // 成れるかor成らないかの判定
    if (!promotedPieceInfo.isPromoted || promotedPieceInfo.isPromoted === undefined) {
      sendGameEvent({
        type: "promoted",
        userCode: gameEngine.userCode,
        pieceData : Blank,
        isPromoted : false
      }).then(reloadWithTurnChange);
      return;
    };
    
    gameEngine.promotedPiece(promotedPieceInfo);

    // Boardを更新するか
    if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());

    // サーバーへの通信
    sendGameEvent({
      type : "promoted",
      userCode : gameEngine.userCode,
      pieceData : promotedPieceInfo.pieceData,
      to : promotedPieceInfo.at
    }).then(reloadWithTurnChange);

  },[]);

  const resignedPiece = useCallback((resignedPieceInfo : resignedPieceInfoType) : void => {
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
    }).then(reloadWithTurnChange);
  },[]);

    return { currentBoard, myselfCapturedPiece, opponentCapturedPiece, movePiece, promotedPiece, resignedPiece };
}