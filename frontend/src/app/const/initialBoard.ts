import { PiecesType } from "../types/piecesInfoType";
import { Osho, GyoKUSHO, Hisha, Kaku, KinSho, GinSho, Keima, Kyosha, Fu, Blank } from "./piecesData";

export interface PieceInstance {
    def : PiecesType;
    owner : "Myself" | "Opponent" | "None";
}

export const initialBoard : PieceInstance[][] = [
    [{def: Kyosha, owner: "Opponent"}, {def: Keima, owner: "Opponent"}, {def: GinSho, owner: "Opponent"}, {def: KinSho, owner: "Opponent"}, {def: Osho, owner: "Opponent"}, {def: KinSho, owner: "Opponent"}, {def: GinSho, owner: "Opponent"}, {def: Keima, owner: "Opponent"}, {def: Kyosha, owner: "Opponent"}],
    [{def: Blank, owner: "None"}, {def: Hisha, owner: "Opponent"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Kaku, owner: "Opponent"}, {def: Blank, owner: "None"}],
    [{def: Fu, owner: "Opponent"}, {def: Fu, owner: "Opponent"}, {def: Fu, owner: "Opponent"}, {def: Fu, owner: "Opponent"}, {def: Fu, owner: "Opponent"}, {def: Fu, owner: "Opponent"}, {def: Fu, owner: "Opponent"}, {def: Fu, owner: "Opponent"}, {def: Fu, owner: "Opponent"}],
    [{def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}],
    [{def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}],
    [{def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}],
    [{def: Fu, owner: "Myself"}, {def: Fu, owner: "Myself"}, {def: Fu, owner: "Myself"}, {def: Fu, owner: "Myself"}, {def: Fu, owner: "Myself"}, {def: Fu, owner: "Myself"}, {def: Fu, owner: "Myself"}, {def: Fu, owner: "Myself"}, {def: Fu, owner: "Myself"}],
    [{def: Blank, owner: "None"}, {def: Kaku, owner: "Myself"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Hisha, owner: "Myself"}, {def: Blank, owner: "None"}],
    [{def: Kyosha, owner: "Myself"}, {def: Keima, owner: "Myself"}, {def: GinSho, owner: "Myself"}, {def: KinSho, owner: "Myself"}, {def: GyoKUSHO, owner: "Myself"}, {def: KinSho, owner: "Myself"}, {def: GinSho, owner: "Myself"}, {def: Keima, owner: "Myself"}, {def: Kyosha, owner: "Myself"}]
];