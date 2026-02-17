import { PiecesType } from "./piecesInfoType";
import { PieceInstance } from "../const/initialBoard"

export interface initEventType {
    type : "init";
    playerCode : number;
    boardData: PieceInstance[][];
}

export interface gameEventType {
    type: "move" | "resign";
    playerCode: number;
    pieceData: PiecesType;
    from? : [number, number];
    to? : [number, number];
}

export interface movePieceInfoType {
    pieceData: PiecesType;
    from : [number, number];
    to : [number, number];
}

export interface promotedPieceInfoType {
    pieceData: PiecesType;
    at : [number, number];
    isPromoted: boolean;
}