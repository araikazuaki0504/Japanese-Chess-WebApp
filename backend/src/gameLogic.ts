import { movePieceType } from "./types/gameLogic";

import { initialBoard, PieceInstance } from "./const/initialBoard";

export class ShogiGame {
    private board : typeof initialBoard;
    private turn : "Sente" | "Gote";

    constructor() {
    this.board = initialBoard;
    this.turn = "Sente";
  }

  movePiece(move: movePieceType) : boolean {
    console.log("Received move:", move);
    return true;
  }

  getBoard() : typeof initialBoard {
    return this.board;
  }

  setTurn(turn: "Sente" | "Gote") : void {
    this.turn = turn;
  }

  getTurn() : "Sente" | "Gote" {
    return this.turn;
  }

  private validate() : boolean {
    return true;
  }
}
