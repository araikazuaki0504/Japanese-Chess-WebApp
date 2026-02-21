export interface moveType {
    type: "step" | "slide";
    moveRange: number[][];
}

export interface PiecesType {
    name: string;
    piecesCode: number;
    imagePath: string;
    move: moveType[];
    toPromotedPieceCode?: number;
    fromPromotedPieceCode?: number;
}