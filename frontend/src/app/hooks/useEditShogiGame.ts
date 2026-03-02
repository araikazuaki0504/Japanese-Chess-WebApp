import { useCallback } from "react";

import { ShogiAPI } from "../shogiAPI/shogiAPI";

import { useUtilitiesShogiGame } from "./useUtilitiesShogiGame";

import { GameEngine } from "../game/gameEngine";
import { User } from "../user/user";

import { addPieceInfoType } from "../types/editType";
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

    const editPiece = useCallback((addPieceInfo : addPieceInfoType) => {
        if (user.getUserType() !== "Spectator") return;

        if (addPieceInfo.owner) {
        gameEngine.resignedPiece({
            pieceData: addPieceInfo.pieceData,
            owner: user.changeOwner(addPieceInfo.owner),
            at: addPieceInfo.at
        });
        } else {
        gameEngine.removePiece({
            at: addPieceInfo.at
        });
        }
        
        // 諸々の更新
        if (gameEngine.didUpdateBoard()) setCurrentBoard(gameEngine.getBoard());

        sendEditEvent({
        type: "add",
        userCode: user.getUserCode(),
        pieceData: addPieceInfo.pieceData,
        to: addPieceInfo.at
        }).then(reload);

    },[]);

    return { resetAll, undoPiece, editPiece };
}