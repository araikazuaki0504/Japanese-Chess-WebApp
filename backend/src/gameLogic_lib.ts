import { initialBoard, PieceInstance } from "./const/initialBoard";
import { PieceInstanceForClient } from "./types/gameLogic";

const convertMap_sente : Record< "Sente" | "Gote" | "None", "Myself" | "Opponent" | "None" > = { "Sente" : "Myself", "Gote" : "Opponent", "None" : "None" };
const convertMap_gote : Record< "Sente" | "Gote" | "None", "Myself" | "Opponent" | "None" > = { "Sente" : "Opponent", "Gote" : "Myself", "None" : "None" };

const boardRotate180 = (targetBoard: PieceInstanceForClient[][]): PieceInstanceForClient[][] => {
  return targetBoard
    .map(row => [...row].reverse())
    .reverse();
};

export const mapBoardToClient = (board : PieceInstance[][], isRotation : boolean) : PieceInstanceForClient[][] => {
    if (isRotation) { // 先手のとき
        const targetBoard = board.map(row =>
            row.map(cell => ({
            def: cell.def,
            owner: convertMap_sente[cell.owner],
            })
        ));

        return boardRotate180(targetBoard);
    } else { // 後手のとき
        const targetBoard = board.map(row =>
            row.map(cell => ({
            def: cell.def,
            owner: convertMap_gote[cell.owner],
            })
        ));

        return targetBoard;
    }

}