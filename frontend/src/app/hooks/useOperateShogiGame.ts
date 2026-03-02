import { useCallback } from "react";

import { useUtilitiesShogiGame } from "./useUtilitiesShogiGame";

import { ShogiAPI } from "../shogiAPI/shogiAPI";

import { GameEngine } from "../game/gameEngine";
import { User } from "../user/user";

import { Blank, piecesData } from "../const/piecesData";

import { PieceInstance } from "../const/initialBoard";
import { capturedPieces } from "../types/gameType";
import { movePieceInfoType, promotedPieceInfoType, resignedPieceInfoType } from "../types/gameType";

export function useOperateShogiGame(setCurrentBoard : (currentBoard : ReadonlyArray<ReadonlyArray<PieceInstance>>) => void, 
                                    setMyselfCapturedPiece : (myselfCapturedPiece : ReadonlyArray<capturedPieces>) => void,
                                    setOpponentCapturedPiece : (opponentCapturedPiece : ReadonlyArray<capturedPieces>) => void, 
                                    setCurrentTurnState : (currentTurnState : "Sente" | "Gote") => void) {                
    const gameEngine = GameEngine.getInstance();
    const user = User.getInstance();

    const { sendGameEvent } = ShogiAPI();
    const { reload, reloadWithTurnChange } = useUtilitiesShogiGame(setCurrentBoard,setMyselfCapturedPiece,setOpponentCapturedPiece,setCurrentTurnState);

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
            userCode : user.getUserCode(),
            pieceData : capturedPieceData,
            from : movePieceInfo.to,
            owner : user.getUserTeban() 
            }).then(reload);
        }

        // 移動
        gameEngine.movePiece(movePieceInfo);

        // サーバーへの通信
        sendGameEvent({
            type:"move",
            userCode: user.getUserCode(),
            owner : user.getUserTeban(),
            pieceData : movePieceInfo.pieceData,
            from : movePieceInfo.from,
            to : movePieceInfo.to,
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
            userCode: user.getUserCode(),
            pieceData : Blank,
            owner : user.getUserTeban(),
            isPromoted : false,
        }).then(reloadWithTurnChange);
        return;
        };
        
        gameEngine.promotedPiece(promotedPieceInfo);

        // Boardを更新するか
        if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());

        // サーバーへの通信
        sendGameEvent({
        type : "promoted",
        userCode : user.getUserCode(),
        pieceData : promotedPieceInfo.pieceData,
        to : promotedPieceInfo.at,
        owner: user.getUserTeban()
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
        userCode: user.getUserCode() ,
        pieceData : resignedPieceInfo.pieceData,
        to: resignedPieceInfo.at,
        owner: user.getUserTeban()
        }).then(reloadWithTurnChange);
    },[]);

    return { movePiece, promotedPiece, resignedPiece };
}