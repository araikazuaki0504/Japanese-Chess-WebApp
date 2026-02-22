import { useState, useEffect } from "react";

import { PiecesType } from "./types/piecesInfoType";
import { piecesData } from "./const/piecesData";

import "./css/PiecesPallet.css";

export default function PiecesPallet({ addPiece } : { addPiece: React.MutableRefObject<PiecesType | null> }) {
    const [ selectPieceIndex, setSelectPieceIndex ] = useState<number | null>(null);

    const clickPiece = (pieceData : PiecesType, targetPieceIndex : number) => {
        if (selectPieceIndex === targetPieceIndex) {
          setSelectPieceIndex(null);
          addPiece.current = null;
          return;
        };

        addPiece.current = pieceData;
        setSelectPieceIndex(targetPieceIndex);
    }
    
    useEffect(() => {
      if (addPiece.current !== null)return;
      setSelectPieceIndex(null);
    },[addPiece.current]);

    return (
        <div className="pieces-palette">
            {piecesData.filter(p => p.piecesCode !== 0).map((p , index) => {
            const isSelected = selectPieceIndex === index;
                return(
                    <div key={p.piecesCode} className={`palette-piece ${isSelected ? "selected" : ""}`} onClick={() => clickPiece(p,index)} title={p.name}>
                        <img src={p.imagePath} alt={p.name} />
                        <div className="piece-name">{p.name}</div>
                    </div>
                );
            })}
        </div>
    );
};