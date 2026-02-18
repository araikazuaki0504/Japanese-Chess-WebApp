import { useState ,useEffect, useCallback, useRef } from "react";

import { initEventType, movePieceInfoType, promotedPieceInfoType } from "../types/gameType";
import { PiecesType } from "../types/piecesInfoType";

import { RuleEngine } from "../game/ruleEngine";
import { ShogiAPI } from "../shogiAPI/shogiAPI";

export function useShogiGame() {
  const { sendInitEvent, sendMoveEvent, sendPromotedEvent } = ShogiAPI();

  const esRef = useRef<EventSource | null>(null);
  const scheduledRef = useRef(false);

  const ruleEngine = RuleEngine.getInstance();
  const initBoard = ruleEngine.getBoard();

  const [ currentBoard, setCurrentBoard ] = useState(initBoard);
  const [ capturedPiece, setCapturedPiece ] = 
  useState<Map<Number,{pieceData : PiecesType, pieceCount : Number}>>(
    new Map<Number,{pieceData : PiecesType, pieceCount : Number}>()
  );

  // gameの初期化
  const initShogiService = async () : Promise<initEventType> => {
        return await sendInitEvent();
  }

  const SSE_Handler = (message: MessageEvent) => {
    const gameEvent = JSON.parse(message.data);
    ruleEngine.ApplyReducer(gameEvent);

    if (scheduledRef.current) return;

    scheduledRef.current = true;
    requestAnimationFrame(() => {
      scheduledRef.current = false;
      if (ruleEngine.didUpdateBoard()) {
        setCurrentBoard(ruleEngine.getBoard());
      }
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

      setCurrentBoard(RuleEngine.ligthBoardToBoard(initData.boardData));
      ruleEngine.initSetBoard(initData.boardData);
      ruleEngine.playerCode = initData.playerCode;

      es.onmessage = SSE_Handler;
      es.onerror = SEE_ErrorHandler;

      return () => {
        es.close();
        esRef.current = null;
      };
    });
  }, []);

  const movePiece = useCallback((movePieceInfo: movePieceInfoType) : boolean => {
      const canMove = ruleEngine.canMove(movePieceInfo);

      if (!canMove) {
        return false;
      }
        
      // 相手の駒がある場合は取る
      if (ruleEngine.canCapturedPiece(movePieceInfo)) {
          
      }

      // 移動
      ruleEngine.movePiece(movePieceInfo);

      // Boardを更新するか
      if (ruleEngine.didUpdateBoard()) setCurrentBoard(ruleEngine.getBoard());

      // サーバーへの通信
      sendMoveEvent({
        ...movePieceInfo,
        type:"move",
        playerCode: ruleEngine.playerCode 
      });

    return true;
  },[]);

  const promotedPiece = useCallback((promotedPieceInfo: promotedPieceInfoType) : void => {
    // 成れるかの判定
    if (!promotedPieceInfo.isPromoted) return;

    ruleEngine.promotedPiece(promotedPieceInfo);

    // Boardを更新するか
    if (ruleEngine.didUpdateBoard()) setCurrentBoard(ruleEngine.getBoard());

    // サーバーへの通信
    sendPromotedEvent({
      type : "promoted",
      playerCode : ruleEngine.playerCode,
      pieceData : promotedPieceInfo.pieceData,
      to : promotedPieceInfo.at
    });
  },[]);

    return { currentBoard, capturedPiece, movePiece, promotedPiece };
}