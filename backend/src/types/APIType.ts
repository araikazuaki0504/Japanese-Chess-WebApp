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

export interface gameEventMessage {
    type : "move" | "promoted" | "captured" | "resign" | "resetAll" | "undo" | "add" | "error";
    userCode : number;
    pieceData? : PiecesType;
    to? : [number, number];
    from? : [number, number];
    isPromoted? : boolean;
    turn? : "Sente" | "Gote";
}

export interface ReturnGameEventMessage extends gameEventMessage {
    currentTurn : "Sente" | "Gote" | "Spectator";
    result: boolean;
}
