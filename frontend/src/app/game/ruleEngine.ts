import { gameEventType, movePieceInfoType, promotedPieceInfoType }  from "../types/gameType";
import { moveType } from "../types/piecesInfoType";
import { PiecesType } from "../types/piecesInfoType";

import { initialBoard, PieceInstance, lightPieceInstance } from "../const/initialBoard";
import { Blank,piecesData } from "../const/piecesData";

export class RuleEngine {
    private static instance: RuleEngine;
    private board : ReadonlyArray<ReadonlyArray<PieceInstance>> = initialBoard;
    private BOARD_SIZE: number = 9;
    private didBoardUpdate = false;
    playerCode = 0;

    private constructor() {
        this.board = initialBoard;
    }

    static getInstance(): RuleEngine {
        if (!RuleEngine.instance) {
            RuleEngine.instance = new RuleEngine();
        }
        return RuleEngine.instance;
    }

    getBoardSize() : number {
        return this.BOARD_SIZE;
    }

    getBoard() : ReadonlyArray<ReadonlyArray<PieceInstance>> {
        return this.board;
    }

    initSetBoard(lightBoard : lightPieceInstance[][]) {
        this.board = lightBoard.map((row) =>
            row.map((lightPieceData : lightPieceInstance) => {
                return {
                def: piecesData[lightPieceData.pieceCode],
                owner: lightPieceData.owner
            }})
        );
    }

    static ligthBoardToBoard (lightBoard : lightPieceInstance[][]) : PieceInstance[][] {
        return lightBoard.map((row) =>
            row.map((lightPieceData : lightPieceInstance) => {
                return {
                def: piecesData[lightPieceData.pieceCode],
                owner: lightPieceData.owner
            }})
        );
    }

    setBoard(board: typeof initialBoard) : void {
        this.board = board;
    }

    didUpdateBoard() : boolean {
        const result = this.didBoardUpdate;
        this.didBoardUpdate = false;
        return result;
    }

    private updateBoard(board :PieceInstance[][]) : PieceInstance[][] {
        this.didBoardUpdate = true;
        return board.map(row => [...row]);
    }

    movePiece(movePieceInfo: movePieceInfoType) : void {
        this.board = this.movePiece_ApplyBoard(this.board as PieceInstance[][], movePieceInfo)
    }

    private movePiece_ApplyBoard(board :PieceInstance[][], movePieceInfo: movePieceInfoType) : PieceInstance[][]{
        const [fromX, fromY] = movePieceInfo.from;
        const [toX, toY] = movePieceInfo.to;
        const movePieceData = movePieceInfo.pieceData;

        const newBoard = this.updateBoard(board);
        
        // 移動
        newBoard[toY][toX] = { def: movePieceData, owner: "Myself" };
        newBoard[fromY][fromX] = { def: Blank, owner: "None" };

        return newBoard;
    }

    promotedPiece(promotedPieceInfo : promotedPieceInfoType) : void {
        this.board = this.promotedPiece_ApplyBoard(this.board as PieceInstance[][], promotedPieceInfo);
    }

    private promotedPiece_ApplyBoard(board :PieceInstance[][], promotedPieceInfo : promotedPieceInfoType) : PieceInstance[][] {
        const [x, y] = promotedPieceInfo.at;
        const promotedPieceData = promotedPieceInfo.pieceData;

        const promotedPieceCode = promotedPieceData.toPromotedPieceCode!;
        const promotedPieceDef = piecesData.find(piece => piece.piecesCode === promotedPieceCode);

        const newBoard = this.updateBoard(board);
        
        newBoard[y][x] = { def: promotedPieceDef!, owner: "Myself" };

        return newBoard;
    }

    canMove(movePieceInfo: movePieceInfoType) : boolean {
        const [fromX, fromY] = movePieceInfo.from;
        const [toX, toY] = movePieceInfo.to;
        const movePieceData = movePieceInfo.pieceData;
            
        // 移動可能判定
        const canMove = movePieceData.move.some((move: moveType) => {
              if (move.type === "step") return move.moveRange.some(([dx, dy]) => {
                const targetX = fromX + dx;
                const targetY = fromY + dy;

                if (targetX < 0 || targetX >= this.BOARD_SIZE || targetY < 0 || targetY >= this.BOARD_SIZE) return false; // ボード外
                if (this.board[targetY][targetX].owner === "Myself") return false; // 自分の駒がある場合は移動できない
        
                return targetX === toX && targetY === toY
            });
            
            if (move.type === "slide") return move.moveRange.some(([dx, dy]) => {
                for (let i = 1; i < this.BOARD_SIZE; i++) {
                  const targetX = fromX + dx * i;
                  const targetY = fromY + dy * i;
        
                  if (targetX < 0 || targetX >= this.BOARD_SIZE || targetY < 0 || targetY >= this.BOARD_SIZE) break; // ボード外
                  if (this.board[targetY][targetX].owner === "Myself") break; // 自分の駒がある場合は進めない
                  // 相手の駒がある場合はそこまで進めるがそれ以上は進めない
                  if (this.board[targetY][targetX].owner === "Opponent") {
                    if (targetX === toX && targetY === toY) return true;
                    break;
                  } 
                  if (targetX === toX && targetY === toY) return true;
                }
                return false;
            });
        });

        return canMove;
    }

    canPromoted(movePieceInfo: movePieceInfoType) : boolean {
        const toY = movePieceInfo.to[1];
        const movePieceData = movePieceInfo.pieceData;

        return toY <= 2 && movePieceData.toPromotedPieceCode !== undefined;
    }

    canTakePiece(movePieceInfo: movePieceInfoType) : boolean{
        const [toX, toY] = movePieceInfo.to;

        return this.board[toY][toX].owner === "Opponent";
    }

    ApplyReducer(reducer: gameEventType) : void {
        if (reducer.playerCode === this.playerCode) return;

        if (reducer.type === "error") return;

        if (reducer.type === "move") {
            const [ toX, toY ] = reducer.to;
            const [ fromX, fromY ] = reducer.from!;
            const oldBoard = this.board;

            // 新しい盤面へ
            this.movePiece({
                pieceData : reducer.pieceData,
                to : reducer.to,
                from : reducer.from!
            });

            if (this.board === oldBoard) this.didBoardUpdate = false;
        }
    }

    private checkPieceData(clientPieceData : PiecesType, serverPieceData : PiecesType) : boolean {
        // 成れるかが違う場合
        if ( !(clientPieceData.toPromotedPieceCode && serverPieceData.toPromotedPieceCode) &&
             !(!clientPieceData.toPromotedPieceCode && !serverPieceData.toPromotedPieceCode)) return false;
        
        return (
            clientPieceData.name === serverPieceData.name &&
            clientPieceData.imagePath === serverPieceData.imagePath &&
            clientPieceData.piecesCode === serverPieceData.piecesCode &&
            JSON.stringify(clientPieceData.move) === JSON.stringify(serverPieceData.move)
        );
    }
}