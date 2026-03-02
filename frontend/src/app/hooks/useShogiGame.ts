import { useState, useCallback, useEffect } from "react";

import { useOperateShogiGame } from "./useOperateShogiGame";
import { useEditShogiGame } from "./useEditShogiGame";

import { GameEngine } from "../game/gameEngine";
import { useUtilitiesShogiGame } from "./useUtilitiesShogiGame";

export function useShogiGame() {
  const gameEngine = GameEngine.getInstance();
  const initBoard = gameEngine.getBoard();
  const initMyselfCapturedList = gameEngine.getMyselfCapturedList();
  const initOpponentCapturedList = gameEngine.getOpponentCapturedList();

  const [ currentBoard, setCurrentBoard ] = useState(initBoard);
  const [ myselfCapturedPiece, setMyselfCapturedPiece ] = useState(initMyselfCapturedList);
  const [ opponentCapturedPiece, setOpponentCapturedPiece ] = useState(initOpponentCapturedList);
  const [ currentTurn, setCurrentTurn ] = useState<"Sente" | "Gote">(gameEngine.getCurrentTurn());

  const { movePiece, promotedPiece, resignedPiece } = useOperateShogiGame(setCurrentBoard,setMyselfCapturedPiece,setOpponentCapturedPiece,setCurrentTurn);
  const { resetAll, undoPiece, editPiece } = useEditShogiGame(setCurrentBoard,setMyselfCapturedPiece,setOpponentCapturedPiece,setCurrentTurn);
  const { initalizeShogiGame } = useUtilitiesShogiGame(setCurrentBoard,setMyselfCapturedPiece,setOpponentCapturedPiece,setCurrentTurn);

  // ゲームの初期化
  useEffect(() => {
    initalizeShogiGame();
  }, []);

  return { currentBoard, myselfCapturedPiece, opponentCapturedPiece, currentTurn, movePiece, promotedPiece, resignedPiece, resetAll, undoPiece, editPiece };
}