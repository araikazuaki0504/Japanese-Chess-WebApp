import { MutableRefObject, useEffect, useState } from "react";

import "./css/ShogiTable.css";

import { PiecesType } from "./types/piecesInfoType";
import { capturedPieces } from "./types/gameType";

export default function ShogiTable({ owner, capturedPiecesList, resignedPieceData } :
{ owner: "myself" | "opponent", capturedPiecesList : ReadonlyArray<capturedPieces> ,resignedPieceData : MutableRefObject<PiecesType | null> }) {
  const [ selectPieceIndex, setSelectPieceIndex ] = useState<number | null>(null);

  const clickPiece = (pieceData : PiecesType, targetPieceIndex : number) => {
    if (selectPieceIndex === targetPieceIndex) setSelectPieceIndex(null);

    resignedPieceData.current = pieceData;
    setSelectPieceIndex(targetPieceIndex);
  }

  useEffect(() => {
    if (resignedPieceData.current !== null)return;
    setSelectPieceIndex(null);
  },[resignedPieceData.current]);

  return (
    <div className={`komadai ${owner}`}>
      { capturedPiecesList.map((capturedPiece : capturedPieces, index : number) => {
        const isSelected = selectPieceIndex === index;
        return(
          <div key={index} className={`piece ${isSelected ? "selected" : ""}`} data-count={capturedPiece.pieceCount} onClick={ owner === "myself" ? () => {clickPiece(capturedPiece.pieceData,index)} : () => {}}>
            <img src={capturedPiece.pieceData.imagePath} alt=""/>
          </div>
        );
      })}
    </div>
  );
}