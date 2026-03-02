import { PiecesType } from "./piecesInfoType";
import { lightCapturedPieceData, lightPieceInstance } from "../const/initialBoard";

export interface InitMessageType {
    type : "init";
    userType : "Sente" | "Gote" | "Spectator";
}

export interface ReturnInitMessageType{
    type : "init";
    userCode : number;
    currentTurn : "Sente" | "Gote";
    boardData : lightPieceInstance[][];
    myselfCapturedList : lightCapturedPieceData[];
    opponentCapturedList : lightCapturedPieceData[];
};

export interface ReturnReloadMessageType{
    type : "reload";
    userCode : number;
    currentTurn : "Sente" | "Gote";
    boardData : lightPieceInstance[][];
    myselfCapturedList : lightCapturedPieceData[];
    opponentCapturedList : lightCapturedPieceData[];
};

export interface gameEventMessageType {
    type : "move" | "promoted" | "captured" | "resign" | "error";
    userCode : number;
    pieceData? : PiecesType;
    to? : [number, number];
    from? : [number, number];
    isPromoted? : boolean;
    owner : "Sente" | "Gote";
}

export interface ReturnGameEventMessageType extends gameEventMessageType {
    currentTurn : "Sente" | "Gote" | "Spectator";
    result: boolean;
}

export interface editEventMessageType {
    type: "resetAll" | "undo" | "edit-add" | "edit-remove" | "error";
    userCode: number;
    pieceData?: PiecesType;
    to? : [number, number];
    from? : [number, number];
    isPromoted? : boolean;
    owner? : "Sente" | "Gote";
}

export interface ReturnEditEventMessageType extends editEventMessageType {
    result: boolean;
}