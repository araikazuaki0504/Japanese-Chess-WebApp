import ShogiBoard from "./ShogiBoard";
import ShogiTable from "./ShogiTable";
import BoardControls from "./BoardControls";
import PiecesPallet from "./PiecesPallet";

import { useRef } from "react";

import { useShogiGame } from "./hooks/useShogiGame";

import { User } from "./user/user";

import { PiecesType } from "./types/piecesInfoType";


import "./css/ShogiWindow.css";

export default function ShogiWindow() {
  const { currentBoard, currentTurn, myselfCapturedPiece, opponentCapturedPiece, movePiece, promotedPiece, resignedPiece, resetAll, undoPiece } = useShogiGame();
  const user = User.getInstance();
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
        <div className="left-column">
          <ShogiTable owner="opponent" capturedPiecesList={opponentCapturedPiece} resignedPieceData={resignedPieceData} />
          {user.getUserType() === "Spectator" && <PiecesPallet onSelectPiece={(piece) => resignedPieceData.current = piece} />}
        </div>

        <div className="board-wrapper">
          <div className="board-controls-overlay">
            <BoardControls currentTurn={currentTurn} onReset={resetAll} onUndo={undoPiece} />
          </div>
          <ShogiBoard board={currentBoard} movePiece={movePiece} promotedPiece={promotedPiece} resignedPieceData={resignedPieceData} handleResignedPiece={handleResignedPiece} />
        </div>
        
        <div className="right-column">
          <ShogiTable owner="myself" capturedPiecesList={myselfCapturedPiece} resignedPieceData={resignedPieceData} />
        </div>
    </div>
  );
}