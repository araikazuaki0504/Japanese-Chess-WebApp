import { useState ,useEffect, useCallback } from "react";

import { moveType } from "../types/piecesInfoType";
import { movePieceInfoType, promotedPieceInfoType } from "../types/gameType";
import { ReturnSSEMessageType, SSEMessageType  } from "../types/APIType";

import { BoardManager, useBoardUpdater } from "../game/boardManeger";
import { Blank, piecesData } from "../const/piecesData";
import { ShogiAPI } from "../shogiService/shogiAPI";

export function useShogiGame() {
  const { initEvent } = ShogiAPI();
  const boardManeger = BoardManager.getInstance();
  const initBoard = boardManeger.getBoard();
  const BOARD_SIZE = boardManeger.getBoardSize();
  const [ currentBoard, setCurrentBoard ] = useState(initBoard);

  useEffect(() => {
    const init = async() => {
        const initData = await initEvent();
        boardManeger.setBoard(initData.boardData);
        setCurrentBoard([...initData.boardData]);
    }
    
    init();
    const es = new EventSource("http://localhost:3000/sse");

    es.onmessage = (e) => {
      const event: ReturnSSEMessageType = JSON.parse(e.data);
      //console.log("Received SSE:", event);
    };

    return () => es.close();
  }, []);

    const movePiece = (movePieceInfo: movePieceInfoType) : boolean => {
        const [fromX, fromY] = movePieceInfo.from;
        const [toX, toY] = movePieceInfo.to;
        const movePieceData = movePieceInfo.pieceData;
        const board = boardManeger.getBoard();
            
        // 移動可能判定
        const canMove = movePieceData.move.some((move: moveType) => {
              if (move.type === "step") return move.moveRange.some(([dx, dy]) => {
                const targetX = fromX + dx;
                const targetY = fromY + dy;

                if (targetX < 0 || targetX >= BOARD_SIZE || targetY < 0 || targetY >= BOARD_SIZE) return false; // ボード外
                if (board[targetY][targetX].owner === "Myself") return false; // 自分の駒がある場合は移動できない
        
                return targetX === toX && targetY === toY
            });
            
            if (move.type === "slide") return move.moveRange.some(([dx, dy]) => {
                for (let i = 1; i < BOARD_SIZE; i++) {
                  const targetX = fromX + dx * i;
                  const targetY = fromY + dy * i;
        
                  if (targetX < 0 || targetX >= BOARD_SIZE || targetY < 0 || targetY >= BOARD_SIZE) break; // ボード外
                  if (board[targetY][targetX].owner === "Myself") break; // 自分の駒がある場合は進めない
                  // 相手の駒がある場合はそこまで進めるがそれ以上は進めない
                  if (board[targetY][targetX].owner === "Opponent") {
                    if (targetX === toX && targetY === toY) return true;
                    break;
                  } 
                  if (targetX === toX && targetY === toY) return true;
                }
                return false;
            });
        });

        
        if (!canMove) {
          return false;
        }
        
        // 相手の駒がある場合は取る
        if (board[toY][toX].owner === "Opponent") {
          
        }
        
        // 成り判定
        if ( toY <= 2 && movePieceData.toPromotedPieceCode ) {

        }
        
        // 移動
        board[toY][toX] = { def: movePieceData, owner: "Myself" };
        board[fromY][fromX] = { def: Blank, owner: "None" };

        boardManeger.setBoard(board);
        setCurrentBoard([...board]);

        return true;
    };

    const promotedPiece = (promotedPieceInfo: promotedPieceInfoType) => {
      if (!promotedPieceInfo.isPromoted) return;

        const [x, y] = promotedPieceInfo.at;
        const promotedPieceData = promotedPieceInfo.pieceData;
        const board = boardManeger.getBoard();

        const promotedPieceCode = promotedPieceData.toPromotedPieceCode!;
        const promotedPieceDef = piecesData.find(piece => piece.piecesCode === promotedPieceCode);
        
        board[y][x] = { def: promotedPieceDef!, owner: "Myself" };

        boardManeger.setBoard(board);
        setCurrentBoard([...board]);
    };

    return { currentBoard, movePiece, promotedPiece };
}