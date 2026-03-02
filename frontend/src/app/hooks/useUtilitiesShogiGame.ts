import { useRef } from "react";

import { ShogiAPI } from "../shogiAPI/shogiAPI";

import { User } from "../user/user";
import { GameEngine } from "../game/gameEngine";

import { PieceInstance } from "../const/initialBoard";
import { capturedPieces, gameEventType } from "../types/gameType";
import { RetutrnInitMessageType } from "../types/APIType";
import { SSEMessageType } from "../types/SSE";
import { ReturnGameEventMessageType, ReturnReloadMessageType } from "../types/APIType";
import { ReturnEditEventMessageType } from "../types/APIType";
import { editEventType } from "../types/editType";

export function useUtilitiesShogiGame(setCurrentBoard : (currentBoard : ReadonlyArray<ReadonlyArray<PieceInstance>>) => void, 
                                         setMyselfCapturedPiece : (myselfCapturedPiece : ReadonlyArray<capturedPieces>) => void, 
                                         setOpponentCapturedPiece : (opponentCapturedPiece : ReadonlyArray<capturedPieces>) => void, 
                                         setCurrentTurnState : (currentTurnState : "Sente" | "Gote") => void) {
    const { sendInitEvent, sendReloadEvent } = ShogiAPI();

    const user = User.getInstance();
    const gameEngine = GameEngine.getInstance();

    const esRef = useRef<EventSource | null>(null);
    const scheduledRef = useRef(false);

    // gameの初期化
    const initShogiService = async () : Promise<RetutrnInitMessageType> => {
        return await sendInitEvent({
          type : "init",
          userType : user.getUserType()
        });
    }

    // SSEハンドラ
    const SSE_Handler = (message: MessageEvent) => {
        const sseEvent : SSEMessageType = JSON.parse(message.data);
        if (sseEvent.eventType === "operateEvent")gameEngine.ApplyReducer(sseEvent.event as gameEventType);
        else gameEngine.ApplyEditReducer(sseEvent.event as editEventType[]);

        if (scheduledRef.current) return;

        scheduledRef.current = true;
        requestAnimationFrame(() => {
            scheduledRef.current = false;

            if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());
            if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList());
            if (gameEngine.didUpdateOpponentCapturedList()) setOpponentCapturedPiece(gameEngine.getOpponentCapturedList());
            setCurrentTurnState(gameEngine.getCurrentTurn());
        
        });
    };

    // SSEのエラーハンドル
    const SEE_ErrorHandler = (erroMessage : Event) => {
        console.log(erroMessage);
    }

    const initalizeShogiGame = () => {
        // 初期化
        initShogiService().then((initData) => {
          const es = new EventSource("/api/sse", { withCredentials: true });
    
          setCurrentBoard(GameEngine.ligthBoardToBoard(initData.boardData));
          gameEngine.initSetBoard(initData.boardData);
          user.setUserCode(initData.userCode);
          gameEngine.setCurrentTurn(initData.currentTurn);
    
          console.log(initData)
    
          gameEngine.initMyselfCapturedList(initData.myselfCapturedList);
          gameEngine.initOpponentCapturedList(initData.opponentCapturedList);
    
          if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());
          if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList());
          if (gameEngine.didUpdateOpponentCapturedList()) setOpponentCapturedPiece(gameEngine.getOpponentCapturedList());
          if (gameEngine.didUpdateTurn()) setCurrentTurnState(gameEngine.getCurrentTurn());
    
          es.onmessage = SSE_Handler;
          es.onerror = SEE_ErrorHandler;
    
          return () => {
            es.close();
            esRef.current = null;
          };
        });
    }
    const reload = (returnGameEventMessage : ReturnGameEventMessageType | ReturnEditEventMessageType) : void => {
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
        if (gameEngine.didUpdateTurn()) setCurrentTurnState(gameEngine.getCurrentTurn());
        });
        };

    const reloadWithTurnChange = (returnGameEventMessage : ReturnGameEventMessageType | ReturnEditEventMessageType) => {
        const result = returnGameEventMessage.result;
                
        // 通信成功時
        if (result) {
            gameEngine.turnChange();

            // UIの更新
            if (gameEngine.didUpdateTurn()) setCurrentTurnState(gameEngine.getCurrentTurn());
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

    return { initalizeShogiGame, reload, reloadWithTurnChange};
}