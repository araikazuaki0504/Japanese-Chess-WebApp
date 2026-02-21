import ShogiBoard from "./ShogiBoard";
import ShogiTable from "./ShogiTable";

import { useRef, useState } from "react";

import { piecesData } from "./const/piecesData";
import { PiecesType } from "./types/piecesInfoType";

import { useShogiGame } from "./hooks/useShogiGame";

import "./css/ShogiWindow.css";

export default function ShogiWindow() {
  const { currentBoard, myselfCapturedPiece, opponentCapturedPiece, movePiece, promotedPiece, resignedPiece } = useShogiGame();
  const resignedPieceData = useRef<PiecesType | null>(null);

  const handleResignedPiece = (x : number, y : number) => {
    if (!resignedPieceData.current) return;
    
    resignedPiece({
      pieceData: resignedPieceData.current,
      owner: "Myself",
      at: [x,y]
    });

    resignedPieceData.current = null;
  }

  return (
    <div className="shogi-root">
        <ShogiTable owner="opponent" capturedPiecesList={opponentCapturedPiece} resignedPieceData={resignedPieceData} />
        <ShogiBoard board={currentBoard} movePiece={movePiece} promotedPiece={promotedPiece} resignedPieceData={resignedPieceData} handleResignedPiece={handleResignedPiece} />
        <ShogiTable owner="myself" capturedPiecesList={myselfCapturedPiece} resignedPieceData={resignedPieceData} />
    </div>
  );
}