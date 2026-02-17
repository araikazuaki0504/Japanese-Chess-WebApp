import { SSEPayload, ReturnSSEPayload } from "./SSEType";
import { PiecesType } from "./piecesInfoType";

export type movePieceType = SSEPayload;
export type ReturnMovePieceType = ReturnSSEPayload;

export interface PieceInstanceForClient {
    def : PiecesType;
    owner : "Myself" | "Opponent" | "None";
}