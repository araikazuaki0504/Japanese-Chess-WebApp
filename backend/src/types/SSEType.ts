export interface SSEMessage {
    type: string;
    SSEPayload: SSEPayload;
}

export interface SSEPayload {
    piecesCode: number;
    owner: "Sente" | "Gote";
    from: [number, number] | null;
    to: [number, number];
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