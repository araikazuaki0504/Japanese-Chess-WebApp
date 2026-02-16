import { PiecesType } from "./piecesInfoType";

export interface gameEventType {
    type: "move" | "resign";
    playerCode: number;
    pieceData: PiecesType;
    from : [number, number];
    to : [number, number];
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