import { gameEventType }  from "../types/gameType";

import { PiecesType } from "../types/piecesInfoType";
import { initialBoard } from "../const/initialBoard";
import { Blank } from "../const/piecesData";

export class BoardManager {
    private static instance: BoardManager;
    private board : typeof initialBoard = initialBoard;
    private BOARD_SIZE: number = 9;
    playerCode = 0;

    private constructor() {
        this.board = initialBoard;
    }

    static getInstance(): BoardManager {
        if (!BoardManager.instance) {
            BoardManager.instance = new BoardManager();
        }
        return BoardManager.instance;
    }

    getBoardSize() : number {
        return this.BOARD_SIZE;
    }

    getBoard() : typeof initialBoard {
        return this.board;
    }

    setBoard(board: typeof initialBoard) : void {
        this.board = board;
    }

    IsApplyReducer(reducer: gameEventType) : boolean {
        if (reducer.playerCode !== this.playerCode) {
            const [ toX, toY ] = reducer.to;
            const [ fromX, fromY ] = reducer.from!;

            this.board[toY][toX] = { def : reducer.pieceData, owner : "Myself"};
            this.board[fromY][fromX] = { def : Blank, owner : "None"};
            
            return true;
        }
        if (reducer.type === "error") return false;

        if (reducer.type === "move") {
            const [ toX, toY ] = reducer.to;
            const [ fromX, fromY ] = reducer.from!;

            // 移動先の駒の情報が一致していないか
            if (!this.checkPieceData(this.board[toY][toX].def,reducer.pieceData)) return false;

            // 移動前の駒の情報が一致していないか
            if (this.checkPieceData(this.board[fromY][fromX].def,Blank)) return false;

            // 完全一致
            return true;
        }

        return false;
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