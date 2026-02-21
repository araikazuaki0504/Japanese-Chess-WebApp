import { PiecesType } from "./piecesInfoType";
import { gameEventMessage, ReturngameEventMessage } from "./APIType";

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

export type gameEventType = gameEventMessage;
export type ReturnGameEventType = ReturngameEventMessage;