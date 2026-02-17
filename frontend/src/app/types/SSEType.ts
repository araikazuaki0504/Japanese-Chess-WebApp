import { gameEventType } from "./gameType";
import { PieceInstance } from "../const/initialBoard";

export type SSEMessageType = gameEventType;
export type ReturnSSEMessage = gameEventType;

export interface initGameInfoType {
    playerCode: number,
    board: PieceInstance[][]
}