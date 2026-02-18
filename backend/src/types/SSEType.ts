import { PiecesType } from "./piecesInfoType";

export interface SSEMessage {
    type: "move" | "resign" | "promoted" | "error";
    playerCode: number;
    pieceData: PiecesType;
    to : [number, number];
    from? : [number, number];
}

export interface ReturnSSEMessage {
    typeEvent: string;
    SSEPayload: ReturnSSEPayload;
}

export interface ReturnSSEPayload {
    piecesCode: number;
    owner: "Sente" | "Gote";
    from: [number, number] | null;
    to: [number, number];
}