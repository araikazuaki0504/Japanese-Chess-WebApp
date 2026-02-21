import { PiecesType } from "./types/piecesInfoType";
import { piecesData } from "./const/piecesData";

import "./css/PiecesPallet.css";

export default function PiecesPallet({ onSelectPiece } : { onSelectPiece: (piece: PiecesType) => void }) {
    return (
        <div className="pieces-palette">
            {piecesData.filter(p => p.piecesCode !== 0).map((p) => (
                <div key={p.piecesCode} className="palette-piece" onClick={() => onSelectPiece && onSelectPiece(p)} title={p.name}>
                <img src={p.imagePath} alt={p.name} />
                <div className="piece-name">{p.name}</div>
                </div>
            ))}
        </div>
    );
};