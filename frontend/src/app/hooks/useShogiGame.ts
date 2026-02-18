import { useState ,useEffect, useCallback, useRef } from "react";

import { initEventType, movePieceInfoType, promotedPieceInfoType } from "../types/gameType";

import { RuleEngine } from "../game/ruleEngine";
import { ShogiAPI } from "../shogiAPI/shogiAPI";

export function useShogiGame() {
  const { sendInitEvent, sendMoveEvent } = ShogiAPI();
  const esRef = useRef<EventSource | null>(null);
  const scheduledRef = useRef(false);
  const ruleEngine = RuleEngine.getInstance();
  const initBoard = ruleEngine.getBoard();
  const [ currentBoard, setCurrentBoard ] = useState(initBoard);

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
    let mounted = true;

    // init は 1 回だけ
    initShogiService().then((initData) => {
      if (!mounted) return;

      setCurrentBoard(
        RuleEngine.ligthBoardToBoard(initData.boardData)
      );
      ruleEngine.initSetBoard(initData.boardData);
      ruleEngine.playerCode = initData.playerCode;
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (esRef.current) return; // ★ 二重防止

    const es = new EventSource(
      "http://localhost:3001/sse",
      { withCredentials: true }
    );

    es.onmessage = SSE_Handler;
    es.onerror = SEE_ErrorHandler;

    esRef.current = es;

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

    const movePiece = useCallback((movePieceInfo: movePieceInfoType) : boolean => {
        const canMove = ruleEngine.canMove(movePieceInfo);

        if (!canMove) {
          return false;
        }
        
        // 相手の駒がある場合は取る
        if (ruleEngine.canTakePiece(movePieceInfo)) {
          
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
    },[]);

    return { currentBoard, movePiece, promotedPiece };
}