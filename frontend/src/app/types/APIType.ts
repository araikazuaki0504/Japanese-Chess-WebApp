import { gameEventType, gameEventResultType } from "./gameType";
import { editEventType, editEvenResulttType } from "./editType";
import { lightPieceInstance, lightCapturedPieceData } from "../const/initialBoard"

export interface InitMessageType {
    type : "init";
    userType : "Sente" | "Gote" | "Spectator";
}

export interface RetutrnInitMessageType{
    type : "init";
    userCode : number;
    currentTurn : "Sente" | "Gote";
    boardData : lightPieceInstance[][];
    myselfCapturedList : lightCapturedPieceData[];
    opponentCapturedList : lightCapturedPieceData[];
};

export interface ReturnReloadMessageType {
    type : "reload";
    userCode : number;
    currentTurn : "Sente" | "Gote";
    boardData : lightPieceInstance[][];
    myselfCapturedList : lightCapturedPieceData[];
    opponentCapturedList : lightCapturedPieceData[];
}

export type gameEventMessageType = gameEventType;
export type ReturnGameEventMessageType = gameEventResultType;
export type editEventMessageType = editEventType;
export type ReturnEditEventMessageType = editEvenResulttType;