import { PiecesType } from "./piecesInfoType";

export interface gameEventType {
    type: "move" | "promoted" | "captured" | "resign" | "resetAll" | "error";
    userCode: number;
    pieceData?: PiecesType;
    to? : [number, number];
    from? : [number, number];
    isPromoted? : boolean;
}

export interface gameEventResultType extends gameEventType{
    currentTurn : "Sente" | "Gote";
    result: boolean;
}

export interface movePieceInfoType {
    pieceData: PiecesType;
    to : [number, number];
    owner : "Myself" | "Opponent";
    from : [number, number];
}

export interface promotedPieceInfoType {
    pieceData: PiecesType;
    at : [number, number];
    owner : "Myself" | "Opponent";
    isPromoted: boolean;
}

export interface capturedPieceInfoType {
    pieceData: PiecesType;
    owner : "Myself" | "Opponent";
    at : [number, number];
}

export interface capturedPieces {
    pieceData : PiecesType, 
    pieceCount : number
}

export interface resignedPieceInfoType {
    pieceData: PiecesType;
    owner : "Myself" | "Opponent";
    at : [number, number];
}