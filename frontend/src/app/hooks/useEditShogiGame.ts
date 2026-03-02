import { useCallback } from "react";

import { ShogiAPI } from "../shogiAPI/shogiAPI";

import { useUtilitiesShogiGame } from "./useUtilitiesShogiGame";

import { GameEngine } from "../game/gameEngine";
import { User } from "../user/user";

import { addPieceInfoType, editPieceInfoType, removePieceInfoType } from "../types/editType";
import { PieceInstance } from "../const/initialBoard";
import { capturedPieces } from "../types/gameType";

export function useEditShogiGame(setCurrentBoard : (currentBoard : ReadonlyArray<ReadonlyArray<PieceInstance>>) => void, 
                                 setMyselfCapturedPiece : (myselfCapturedPiece : ReadonlyArray<capturedPieces>) => void,
                                 setOpponentCapturedPiece : (opponentCapturedPiece : ReadonlyArray<capturedPieces>) => void, 
                                 setCurrentTurnState : (currentTurnState : "Sente" | "Gote") => void) {                

    const gameEngine = GameEngine.getInstance();
    const user = User.getInstance();

    const { sendEditEvent } = ShogiAPI();
    const { reload, reloadWithTurnChange } = useUtilitiesShogiGame(setCurrentBoard,setMyselfCapturedPiece,setOpponentCapturedPiece,setCurrentTurnState);

    const resetAll = useCallback(() : void => {
    // 確認ダイアログ
    if (window.confirm("本当にリセットしますか？")) {
      // 盤面と持ち駒リストを初期化
      gameEngine.resetAll();

      sendEditEvent({
        type: "resetAll",
        userCode: user.getUserCode(),
        owner: user.getUserTeban()
      }).then(reload);

      // Boardを更新するか
      if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());
      if (gameEngine.didUpdateMyselfCapturedList()) setMyselfCapturedPiece(gameEngine.getMyselfCapturedList());
      if (gameEngine.didUpdateOpponentCapturedList()) setOpponentCapturedPiece(gameEngine.getOpponentCapturedList());
      setCurrentTurnState(gameEngine.getCurrentTurn());
    }
  },[]);

    const undoPiece = useCallback(() : void => {
        sendEditEvent({
            type: "undo",
            userCode: user.getUserCode(),
            owner: user.getUserTeban()
        });
    },[]);

    const editPiece = useCallback((editPieceInfo : editPieceInfoType) => {
        if (user.getUserType() !== "Spectator") return;

        if (editPieceInfo.type === "add") {
            gameEngine.addPiece({
                ...editPieceInfo.info
            });
        } else {
            gameEngine.removePiece({
                ...editPieceInfo.info
            });
        }
        
        // 諸々の更新
        if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());

        if (editPieceInfo.type === "add") {
            const addPieceInfo = editPieceInfo.info as addPieceInfoType;
            sendEditEvent({
                type: "edit-add",
                userCode: user.getUserCode(),
                owner: addPieceInfo.owner,
                pieceData: addPieceInfo.pieceData,
                to: editPieceInfo.info.at
            }).then(reload);
        } else if (editPieceInfo.type === "remove") {
            const removePieceInfo = editPieceInfo.info as removePieceInfoType;
            sendEditEvent({
                type: "edit-remove",
                userCode: user.getUserCode(),
                pieceData: removePieceInfo.pieceData,
                from: removePieceInfo.at
            }).then(reload);
        }

    },[]);

    return { resetAll, undoPiece, editPiece };
}