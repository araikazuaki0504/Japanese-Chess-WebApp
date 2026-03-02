import { PiecesType } from "./piecesInfoType";

export interface unMovePieceInfoType {
    pieceData: PiecesType;
    turn : "Sente" | "Gote" ;
    to : [number, number];
    from : [number, number];
}

export interface unPromotedPieceInfoType {
    pieceData: PiecesType;
    turn : "Sente" | "Gote";
    at : [number, number];
}

export interface unCapturedPieceInfoType {
    pieceData: PiecesType;
    turn : "Sente" | "Gote";
    at : [number, number];
}

export interface unResignedPieceInfoType {
    pieceData: PiecesType;
    turn : "Sente" | "Gote";
    at : [number, number];
}