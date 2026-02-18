import { PiecesType } from "./piecesInfoType";
import { PieceInstance, lightPieceInstance } from "../const/initialBoard"

export interface initEventType {
    type : "init";
    playerCode : number;
    boardData : lightPieceInstance[][];
}

export interface gameEventType {
    type: "move" | "resign" | "error";
    playerCode: number;
    pieceData: PiecesType;
    to : [number, number];
    from? : [number, number];
}

export interface movePieceInfoType {
    pieceData: PiecesType;
    to : [number, number];
    from : [number, number];
}

export interface promotedPieceInfoType {
    pieceData: PiecesType;
    at : [number, number];
    isPromoted: boolean;
}