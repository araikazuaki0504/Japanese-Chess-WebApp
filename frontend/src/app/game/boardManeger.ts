import { useState } from "react";

import { gameEventType }  from "../types/gameType";

import { Blank } from "../const/piecesData";
import { initialBoard } from "../const/initialBoard";

export class BoardManager {
    private static instance: BoardManager;
    private board : typeof initialBoard = initialBoard;
    private BOARD_SIZE: number = 9;

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

    applyBoardEvent(clientReducer: gameEventType, serverReducer: gameEventType) : void {
        if (this.checkReducer(clientReducer, serverReducer)) {
            const piece = this.board[clientReducer.from![1]][clientReducer.from![0]];
            this.board[clientReducer.to![1]][clientReducer.to![0]] = piece;
            this.board[clientReducer.from![1]][clientReducer.from![0]] = { def: Blank, owner: "None" };
        }
    }

    private checkReducer(clientReducer: gameEventType, serverReducer: gameEventType) : boolean {
        return (
            clientReducer.type === serverReducer.type &&
            clientReducer.playerCode === serverReducer.playerCode &&
            clientReducer.pieceData === serverReducer.pieceData &&
            (clientReducer.from && serverReducer.from ? clientReducer.from[0] === serverReducer.from[0] && clientReducer.from[1] === serverReducer.from[1] : true) &&
            (clientReducer.to && serverReducer.to ? clientReducer.to[0] === serverReducer.to[0] && clientReducer.to[1] === serverReducer.to[1] : true)
        );
    }
}

export const useBoardUpdater = () => {
    const [ board, setBoard ] = useState(initialBoard); 

    return { board, setBoard };
}