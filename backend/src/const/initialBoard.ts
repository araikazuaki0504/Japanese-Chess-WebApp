import { PiecesType } from "../types/piecesInfoType";
import { Osho, GyoKUSHO, Hisha, Kaku, KinSho, GinSho, Keima, Kyosha, Fu, Blank } from "./piecesData";

export interface PieceInstance {
    def : PiecesType;
    owner : "Sente" | "Gote" | "None";
}

export const initialBoard : PieceInstance[][] = [
    [{def: Kyosha, owner: "Sente"}, {def: Keima, owner: "Sente"}, {def: GinSho, owner: "Sente"}, {def: KinSho, owner: "Sente"}, {def: Osho, owner: "Sente"}, {def: KinSho, owner: "Sente"}, {def: GinSho, owner: "Sente"}, {def: Keima, owner: "Sente"}, {def: Kyosha, owner: "Sente"}],
    [{def: Blank, owner: "None"}, {def: Hisha, owner: "Sente"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Kaku, owner: "Sente"}, {def: Blank, owner: "None"}],
    [{def: Fu, owner: "Sente"}, {def: Fu, owner: "Sente"}, {def: Fu, owner: "Sente"}, {def: Fu, owner: "Sente"}, {def: Fu, owner: "Sente"}, {def: Fu, owner: "Sente"}, {def: Fu, owner: "Sente"}, {def: Fu, owner: "Sente"}, {def: Fu, owner: "Sente"}],
    [{def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}],
    [{def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}],
    [{def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}],
    [{def: Fu, owner: "Gote"}, {def: Fu, owner: "Gote"}, {def: Fu, owner: "Gote"}, {def: Fu, owner: "Gote"}, {def: Fu, owner: "Gote"}, {def: Fu, owner: "Gote"}, {def: Fu, owner: "Gote"}, {def: Fu, owner: "Gote"}, {def: Fu, owner: "Gote"}],
    [{def: Blank, owner: "None"}, {def: Kaku, owner: "Gote"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Blank, owner: "None"}, {def: Hisha, owner: "Gote"}, {def: Blank, owner: "None"}],
    [{def: Kyosha, owner: "Gote"}, {def: Keima, owner: "Gote"}, {def: GinSho, owner: "Gote"}, {def: KinSho, owner: "Gote"}, {def: GyoKUSHO, owner: "Gote"}, {def: KinSho, owner: "Gote"}, {def: GinSho, owner: "Gote"}, {def: Keima, owner: "Gote"}, {def: Kyosha, owner: "Gote"}]
];