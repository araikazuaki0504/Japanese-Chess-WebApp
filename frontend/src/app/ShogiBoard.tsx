import { useState, useRef } from "react";

import { movePieceInfoType, promotedPieceInfoType } from "./types/gameType";

import { Blank } from "./const/piecesData";
import { PieceInstance } from "./const/initialBoard";
import { PiecesType } from "./types/piecesInfoType";
import { IsPromotedPopUp } from "./IsPromotedPopOut";

import "./css/ShogiBoard.css";

export default function ShogiBoard({ board, movePiece, resignedPieceData, promotedPiece, handleResignedPiece } : 
{ board: ReadonlyArray<ReadonlyArray<PieceInstance>>, movePiece: (movePieceInfo: movePieceInfoType) => Promise<boolean>, resignedPieceData: React.MutableRefObject<PiecesType | null>, promotedPiece: (promotedPieceInfo: promotedPieceInfoType) => void, handleResignedPiece: (x : number, y : number) => void }) {
  const [canPromoted, setCanPromoted] = useState<boolean>(false);

  const PromotedCandidate = useRef<promotedPieceInfoType | null>(null);

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
        resignedPieceData.current = null;
      } else if (cell && cell.owner === "None" && cell.def.name === "blank") {
        handleResignedPiece(x,y);
      }
      return;
    } else {
      if (x === selected.x && y === selected.y) {
        setSelected(null);
        return;
      } else if (cell && cell.owner === "Myself") {
        setSelected({ x, y, piece: cell });
        resignedPieceData.current = null;
        return;
      }
    }
    
    // 選択解除
    if (selected.x === x && selected.y === y) {
      setSelected(null);
      return;
    }

    // 駒の移動
    movePiece({
      pieceData: selected.piece.def,
      owner: "Myself",
      from: [selected.x, selected.y],
      to: [x, y]
    }).then((canMove) => {
      if (!canMove) return;

      // 成り判定
      if ( y <= 2 && selected.piece.def.toPromotedPieceCode) {
        setCanPromoted(true);
        PromotedCandidate.current = {
          pieceData: selected.piece.def,
          owner: "Myself",
          at: [x, y],
          isPromoted: false
        };
      }　else {
        setCanPromoted(false);
        PromotedCandidate.current = null;

        promotedPiece({
          pieceData: selected.piece.def,
          owner: "Myself",
          at: [x, y],
          isPromoted: false
        });
      }

      setSelected(null);
      });
  };

  const handlePromotion = (isPromoted: boolean) => {
    if (!canPromoted) {
      setCanPromoted(false);
      return;
    }

    if (PromotedCandidate.current) {
      promotedPiece({
        ...PromotedCandidate.current,
        isPromoted: isPromoted
      });
    }

    setCanPromoted(false);
    PromotedCandidate.current = null;
  };

  return (      
      <div className="board">
        {board.map((row, y) =>
          row.map((cell : PieceInstance, x) => {
            
            const isSelected = selected && selected.x === x && selected.y === y;

            return (
              <div key={`${x}-${y}`} className={`cell ${isSelected ? "selected" : ""}`} onClick={() => handleCellClick(x, y)}>
                {cell.def.name != Blank.name && (
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
