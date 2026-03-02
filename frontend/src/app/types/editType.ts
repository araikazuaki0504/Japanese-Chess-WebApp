import { PiecesType } from "./piecesInfoType";

export interface editEventType {
    type: "resetAll" | "undo" | "edit-add" | "edit-remove" | "error";
    userCode: number;
    pieceData?: PiecesType;
    to? : [number, number];
    from? : [number, number];
    isPromoted? : boolean;
    owner? : "Sente" | "Gote";
}

export interface editEvenResulttType extends editEventType {
    result: boolean
}

export interface addPieceInfoType {
    pieceData: PiecesType;
    owner : "Sente" | "Gote";
    at : [number, number];
}

export interface removePieceInfoType {
    pieceData: PiecesType;
    at : [number, number];
}

export interface editPieceInfoType {
    type : "add" | "remove";
    info : addPieceInfoType | removePieceInfoType;
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