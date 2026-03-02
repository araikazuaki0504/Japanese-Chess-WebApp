import { PiecesType } from "./piecesInfoType";

export interface gameEventType {
    type: "move" | "promoted" | "captured" | "resign" | "resetAll" | "undo" | "add" | "error";
    userCode: number;
    pieceData?: PiecesType;
    to? : [number, number];
    from? : [number, number];
    isPromoted? : boolean;
    owner : "Sente" | "Gote";
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

export interface addPieceInfoType {
    pieceData: PiecesType;
    owner? : "Sente" | "Gote";
    at : [number, number];
}

export interface removeInfoType {
    at : [number, number];
}

export interface unMovePieceInfoType {
    pieceData: PiecesType;
    turn : "Sente" | "Gote";
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