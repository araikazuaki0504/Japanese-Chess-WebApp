import { PiecesType } from "./piecesInfoType";
import { gameEventMessage, ReturnGameEventMessage } from "./APIType";

export interface movePieceInfoType {
    pieceData: PiecesType;
    to : [number, number];
    from : [number, number];
}

export interface promotedPieceInfoType {
    pieceData: PiecesType;
    at : [number, number];
}

export interface capturedPieceInfoType {
    pieceData: PiecesType;
    at : [number, number];
}

export interface resignedPieceInfoType {
    pieceData: PiecesType;
    at : [number, number];
}

export interface addPieceInfoType {
    pieceData: PiecesType;
    owner? : "Sente" | "Gote";
    at : [number, number];
}

export interface gameEventHistoryType {
    type : gameEventType["type"];
    turn? : "Sente" | "Gote" ;
    pieceCode : number;
    to? : [number, number];
    from? : [number, number];
}

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

export type gameEventType = gameEventMessage;
export type ReturnGameEventType = ReturnGameEventMessage;