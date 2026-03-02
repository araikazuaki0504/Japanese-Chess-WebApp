import { PiecesType } from "./piecesInfoType";
import { gameEventMessageType, ReturnGameEventMessageType, editEventMessageType, ReturnEditEventMessageType } from "./APIType";

export interface movePieceInfoType {
    pieceData: PiecesType;
    owner : "Sente" | "Gote";
    to : [number, number];
    from : [number, number];
}

export interface promotedPieceInfoType {
    pieceData: PiecesType;
    owner : "Sente" | "Gote";
    at : [number, number];
}

export interface capturedPieceInfoType {
    pieceData: PiecesType;
    owner : "Sente" | "Gote";
    at : [number, number];
}

export interface resignedPieceInfoType {
    pieceData: PiecesType;
    owner : "Sente" | "Gote";
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

export type gameEventType = gameEventMessageType;
export type ReturnGameEventType = ReturnGameEventMessageType;
export type editEventType = editEventMessageType;
export type ReturnEditEventType = ReturnEditEventMessageType;