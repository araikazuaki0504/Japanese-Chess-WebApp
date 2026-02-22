import ShogiBoard from "./ShogiBoard";
import ShogiTable from "./ShogiTable";
import BoardControls from "./BoardControls";
import PiecesPallet from "./PiecesPallet";

import { useRef, useState } from "react";

import { useShogiGame } from "./hooks/useShogiGame";

import { User } from "./user/user";

import { PiecesType } from "./types/piecesInfoType";


import "./css/ShogiWindow.css";

export default function ShogiWindow() {
  const { currentBoard, currentTurn, myselfCapturedPiece, opponentCapturedPiece, movePiece, promotedPiece, resignedPiece, resetAll, undoPiece, addPiece } = useShogiGame();
  const user = User.getInstance();
  const resignedPieceData = useRef<PiecesType | null>(null);
  const addPieceData = useRef<PiecesType | null>(null);
  const pieceState = useRef<"Sente" | "Gote" | undefined>("Gote");
  const clickHistory = useRef<[Number,Number]>([9,9]);
 
  const handleResignedPiece = (x : number, y : number) => {
    if (!resignedPieceData.current) return;
    
    resignedPiece({
      pieceData: resignedPieceData.current,
      owner: "Myself",
      at: [x,y]
    });

    resignedPieceData.current = null;
  }

  const handleAddPiece_left = (x : number, y : number) => {
    if (!addPieceData.current) return;
    if (addPieceData == null) return;

    addPiece({
      pieceData: addPieceData.current,
      owner: undefined,
      at: [x,y]
    });

    switch (pieceState.current) {
      case "Sente" : 
        pieceState.current = "Gote";
        break;
      case "Gote" :
        pieceState.current = undefined;
        break;
      case undefined :
        pieceState.current = "Sente";
        break;
    }
  }

  const handleAddPiece_right = (x : number, y : number) => {
    if (!addPieceData.current) return;

    if (!(clickHistory.current[0] === x && clickHistory.current[1] === y)) {
      pieceState.current = "Gote";
    }

    clickHistory.current = [x,y];

    addPiece({
      pieceData: addPieceData.current,
      owner: pieceState.current,
      at: [x,y]
    });

    switch (pieceState.current) {
      case "Sente" : 
        pieceState.current = undefined;
        break;
      case "Gote" :
        pieceState.current = "Sente";
        break;
      case undefined :
        pieceState.current = "Gote";
        break;
    }
  }

  return (
    <div className="shogi-root">
        <div className="left-column">
          <ShogiTable owner="opponent" capturedPiecesList={opponentCapturedPiece} resignedPieceData={resignedPieceData} />
          {user.getUserType() === "Spectator" && <PiecesPallet addPiece={addPieceData} />}
        </div>

        <div className="board-wrapper">
          <div className="board-controls-overlay">
            <BoardControls currentTurn={currentTurn} onReset={resetAll} onUndo={undoPiece} />
          </div>
          <ShogiBoard board={currentBoard} movePiece={movePiece} promotedPiece={promotedPiece} resignedPieceData={resignedPieceData} handleResignedPiece={handleResignedPiece} handleAddPiece_left={handleAddPiece_left} handleAddPiece_right={handleAddPiece_right} />
        </div>
        
        <div className="right-column">
          <ShogiTable owner="myself" capturedPiecesList={myselfCapturedPiece} resignedPieceData={resignedPieceData} />
        </div>
    </div>
  );
}