import { useState, useEffect } from "react";

import { movePieceInfoType, promotedPieceInfoType } from "./types/gameType";

import { Blank, piecesData } from "./const/piecesData";
import { PieceInstance } from "./const/initialBoard";
import { IsPromotedPopUp } from "./IsPromotedPopOut";

import "./css/ShogiBoard.css";

export default function ShogiBoard({ board, movePiece, promotedPiece } : { board: PieceInstance[][], movePiece: (movePieceInfo: movePieceInfoType) => void, promotedPiece: (promotedPieceInfo: promotedPieceInfoType) => void }) {
  const [canPromoted, setCanPromoted] = useState<boolean>(false);

  const [PromotedCandidate, setPromotedCandidate] = useState<promotedPieceInfoType | null>(null);

  const [selected, setSelected] = useState<{
      x: number;
      y: number;
      piece: PieceInstance;
    } | null>(null);

  const handleCellClick = (x: number, y: number) => {
    setCanPromoted(false);

    const cell = board[y][x];

    if (!selected) {
      if (cell && cell.owner === "Myself") {
        setSelected({ x, y, piece: cell });
      }
      return;
    } else {
      if (cell && cell.owner === "Myself") {
        setSelected({ x, y, piece: cell });
        return;
      }
    }
    
    // 選択解除
    if (selected.x === x && selected.y === y) {
      setSelected(null);
      return;
    }
    
    // 成り判定
    if ( y <= 2 && selected.piece.def.toPromotedPieceCode ) {
      setCanPromoted(true);
      setPromotedCandidate({
        pieceData: selected.piece.def,
        at: [x, y],
        isPromoted: false
       });
      return;
     }

    // 駒の移動
    movePiece({
      pieceData: selected.piece.def,
      from: [selected.x, selected.y],
      to: [x, y]
    });

    console.log(`Move piece from (${selected.x}, ${selected.y}) to (${x}, ${y})`);

    setSelected(null);
  };

  const handlePromotion = (isPromoted: boolean) => {
    if (!canPromoted) {
      setCanPromoted(false);
      return;
    }

    console.log(`promote_at:${PromotedCandidate?.at}`);
    
    if (PromotedCandidate) {
      promotedPiece({
        ...PromotedCandidate,
        isPromoted: isPromoted
      });
    }

    setCanPromoted(false);
    setPromotedCandidate(null);
  };

  return (      
      <div className="board">
        {board.map((row, y) =>
          row.map((cell : PieceInstance, x) => {
            
            const isSelected = selected && selected.x === x && selected.y === y;

            return (
              <div key={`${x}-${y}`} className={`cell ${isSelected ? "selected" : ""}`} onClick={() => handleCellClick(x, y)}>
                {cell.def != Blank && (
                  <img
                    src={cell.def.imagePath}
                    className={cell.owner == "Myself" ? "sente" : "gote"}
                    draggable={false}
                  />
                )}
              </div>
          )})
        )}
        {canPromoted && <IsPromotedPopUp promoted={handlePromotion}/>}
    </div>
  );
}
