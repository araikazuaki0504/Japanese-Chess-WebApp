import ShogiBoard from "./ShogiBoard";
import ShogiTable from "./ShogiTable";

import { useShogiGame } from "./hooks/useShogiGame";

import "./css/ShogiWindow.css";

export default function ShogiWindow() {
  const { currentBoard, movePiece, promotedPiece } = useShogiGame();

  return (
    <div className="shogi-root">
        <ShogiTable owner="opponent" />
        <ShogiBoard board={currentBoard} movePiece={movePiece} promotedPiece={promotedPiece} />
        <ShogiTable owner="myself" />
    </div>
  );
}