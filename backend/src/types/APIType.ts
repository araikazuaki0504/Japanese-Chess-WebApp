import { PiecesType } from "./piecesInfoType";
import { lightPieceInstance } from "../const/initialBoard";

export interface InitMessageType {
    type : "init";
    userType : "Sente" | "Gote" | "Spectator";
}

export interface RetutrnInitMessageType{
    type : "init";
    userCode : number;
    boardData : lightPieceInstance[][];
};

export interface gameEventMessage {
    type : "move" | "promoted" | "captured" | "resign" | "error";
    userCode : number;
    pieceData : PiecesType;
    to? : [number, number];
    from? : [number, number];
}

export interface ReturngameEventMessage {
    type : "move" | "promoted" | "captured" | "resign" | "error";
    userCode : number;
    pieceData : PiecesType;
    to? : [number, number];
    from? : [number, number];
    result : boolean;
}
