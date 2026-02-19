import { gameEventType, gameEventResultType } from "./gameType";
import { lightPieceInstance } from "../const/initialBoard"

export interface InitMessageType {
    type : "init";
    userType : "Sente" | "Gote" | "Spectator";
}

export interface RetutrnInitMessageType{
    type : "init";
    userCode : number;
    boardData : lightPieceInstance[][];
};

export type gameEventMessageType = gameEventType;
export type ReturnGameEventMessageType = gameEventResultType;