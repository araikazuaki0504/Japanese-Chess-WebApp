import { useState, useEffect } from "react";

import { moveType } from "./types/piecesInfoType";
import { SSEMessage, ReturnSSEMessage } from "./types/SSEType";

import { Blank, piecesData } from "./const/piecesData";
import { initialBoard, PieceInstance } from "./const/initialBoard";
import { IsPromotedPopUp } from "./IsPromotedPopOut";

import "../css/ShogiBoard.css";

const BOARD_SIZE = 9;
const mySide = "SENTE"; // 仮の自分のターン。後で状態管理する際に変更する必要あり

export default function ShogiBoard() {
  const [board, setBoard] = useState(initialBoard);
    
  const [isPromoted, setIsPromoted] = useState<boolean>(false);

  const [PromotedCandidate, setPromotedCandidate] = useState<number[]>([0, 0]);

  const [selected, setSelected] = useState<{
      x: number;
      y: number;
      piece: PieceInstance;
    } | null>(null);
    
    useEffect(() => {
      useEffect(() => {
      const es = new EventSource("/sse");

      es.onmessage = (e) => {
        const event: ReturnSSEMessage = JSON.parse(e.data);
        console.log("Received SSE:", event);
    };

    return () => es.close();
  }, []);
    }, []);

  const handleCellClick = async (x: number, y: number) => {
    setIsPromoted(false);

    const cell = board[y][x];
    
    // ① 未選択 → 自分の駒なら選択
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
    
    // ② 選択中 → 同じマスをクリック → 選択解除
    if (selected.x === x && selected.y === y) {
      setSelected(null);
      return;
    }

    // ③ 選択中 → 別マスをクリック → 移動可能判定
    const canMove = selected.piece.def.move.some((move: moveType) => {
      if (move.type === "step") return move.moveRange.some(([dx, dy]) => {
        const targetX = selected.x + dx;
        const targetY = selected.y + dy;

        if (targetX < 0 || targetX >= BOARD_SIZE || targetY < 0 || targetY >= BOARD_SIZE) return false; // ボード外
        if (board[targetY][targetX].owner === "Myself") return false; // 自分の駒がある場合は移動できない

        return targetX === x && targetY === y
      });

      if (move.type === "slide") return move.moveRange.some(([dx, dy]) => {
        for (let i = 1; i < BOARD_SIZE; i++) {
          const targetX = selected.x + dx * i;
          const targetY = selected.y + dy * i;

          if (targetX < 0 || targetX >= BOARD_SIZE || targetY < 0 || targetY >= BOARD_SIZE) break; // ボード外
          if (board[targetY][targetX].owner === "Myself") break; // 自分の駒がある場合は進めない
          // 相手の駒がある場合はそこまで進めるがそれ以上は進めない
          if (board[targetY][targetX].owner === "Opponent") {
            if (targetX === x && targetY === y) return true;
            break;
          } 
          if (targetX === x && targetY === y) return true;
        }
        return false;
      })    
    });

    if (!canMove) {
      return;
    }

    // ④ 選択中 → 別マス → 相手の駒がある場合は取る
    if (board[y][x].owner === "Opponent") {
      
    }

    // ⑤ 選択中 → 別マス → 成り判定
    if ( y <= 2 && selected.piece.def.toPromotedPieceCode ) {
       setIsPromoted(true);
        setPromotedCandidate([x, y]);
    }

    // ⑥ 選択中 → 別マス → 移動
    setBoard(prev => {
      const next = prev.map(row => [...row]);

      next[y][x] = selected.piece;
      next[selected.y][selected.x] = { def: Blank, owner: "None" };

      return next;
    });

    const moveSSEMessage : SSEMessage = {
      type: "move",
      SSEPayload: {
        piecesCode: selected.piece.def.piecesCode,
        owner: mySide === "SENTE" ? "Sente" : "Gote",
        from: [selected.x, selected.y],
        to: [x, y]
      }
    };
    
    setSelected(null);
    
    await fetch("http://localhost:3000/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(moveSSEMessage)
    });
  };
  
  const handlePromotion = (isPromoted : Boolean) => {
    if (!isPromoted) {
      setIsPromoted(false);
      return;
    }
    if (!board[PromotedCandidate[1]][PromotedCandidate[0]].def.toPromotedPieceCode) return;

    const promotedPieceCode = board[PromotedCandidate[1]][PromotedCandidate[0]].def.toPromotedPieceCode!;
    const promotedPieceDef = piecesData.find(piece => piece.piecesCode === promotedPieceCode);

    console.log(promotedPieceDef);

    setBoard(prev => {
      const next = prev.map(row => [...row]);
      const piece = next[PromotedCandidate[1]][PromotedCandidate[0]];
      next[PromotedCandidate[1]][PromotedCandidate[0]] = {
        def: promotedPieceDef!,
        owner: piece.owner
      };
      return next;
    });
    setIsPromoted(false);
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
        {isPromoted && <IsPromotedPopUp promoted={handlePromotion}/>}
    </div>
  );
}
