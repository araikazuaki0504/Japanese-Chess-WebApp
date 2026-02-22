import { PiecesType } from "../types/piecesInfoType";

export const Osho : PiecesType = {
    name: "王将",
    piecesCode: 1,
    imagePath: "../assets/Osho.png",
    move: [
        {
            type : "step", 
            moveRange:[[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
        }
    ]
}

export const GyoKUSHO : PiecesType = {
    name: "玉将",
    piecesCode: 2,
    imagePath: "../assets/Gyokusho.png",
    move: [
        {
            type : "step", 
            moveRange:[[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
        }
    ]
}

export const Hisha : PiecesType = {
    name: "飛車",
    piecesCode: 3,
    imagePath: "../assets/Hisha.png",
    move: [
        {
            type : "slide", 
            moveRange: [[-1, 0], [0, -1], [0, 1], [1, 0]]
        }
    ],
    toPromotedPieceCode: 10
}

export const Kaku : PiecesType = {
    name: "角行",
    piecesCode: 4,
    imagePath: "../assets/Kaku.png",
    move: [
        {
            type: "slide",
            moveRange: [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        }
    ],
    toPromotedPieceCode: 11
}

export const KinSho : PiecesType = {
    name: "金将",
    piecesCode: 5,
    imagePath: "../assets/Kinsho.png",
    move: [
        {
            type: "step",
            moveRange: [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [0, 1]]
        }
    ]
}

export const GinSho : PiecesType = {
    name: "銀将",
    piecesCode: 6,
    imagePath: "../assets/Ginsho.png",
    move: [
        {
            type: "step",
            moveRange: [[-1, -1], [1, -1], [0, -1], [1, 1], [-1, 1]]
        }
    ],
    toPromotedPieceCode: 12
}

export const Keima : PiecesType = {
    name: "桂馬",
    piecesCode: 7,
    imagePath: "../assets/Keima.png",
    move: [
        {
            type: "step",
            moveRange: [[-1, -2], [1, -2]]
        }
    ],
    toPromotedPieceCode: 13
}

export const Kyosha : PiecesType = {
    name: "香車",
    piecesCode: 8,
    imagePath: "../assets/Kyosha.png",
    move: [
        {
            type: "slide",
            moveRange: [[0, -1]]
        }
    ],
    toPromotedPieceCode: 14
}

export const Fu : PiecesType = {
    name: "歩兵",
    piecesCode: 9,
    imagePath: "../assets/Fu.png",
    move: [
        {
            type: "step",
            moveRange: [[0, -1]]
        }
    ],
    toPromotedPieceCode: 15
}

export const PROMOTED_HISHA : PiecesType = {
    name: "龍王",
    piecesCode: 10,
    imagePath: "../assets/PromotedHisha.png",
    move: [
        {
            type: "step",
            moveRange: [[-1, 1], [1, -1], [1, 1], [-1, -1]]
        },
        {
            type: "slide",
            moveRange: [[-1, 0], [0, -1], [0, 1], [1, 0]]
        }
    ],
    fromPromotedPieceCode: 3
}

export const PROMOTED_KAKU : PiecesType = {
    name: "龍馬",
    piecesCode: 11,
    imagePath: "../assets/PromotedKaku.png",
    move: [
        {
            type: "step",
            moveRange: [[-1, 0], [0, -1], [0, 1], [1, 0]]
        },
        {
            type: "slide",
            moveRange: [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        }
    ],
    fromPromotedPieceCode: 4
}

export const PROMOTED_GINSHO : PiecesType = {
    name: "成銀",
    piecesCode: 12,
    imagePath: "../assets/PromotedDefault.png",
    move: [
        {
            type: "step",
            moveRange: [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [0, 1]]
        }
    ],
    fromPromotedPieceCode: 6
}

export const PROMOTED_KEIMA : PiecesType = {
    name: "成桂",
    piecesCode: 13,
    imagePath: "../assets/PromotedDefault.png",
    move: [
        {
            type: "step",
            moveRange: [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [0, 1]]
        }
    ],
    fromPromotedPieceCode: 7
}

export const PROMOTED_KYOUSHA : PiecesType = {
    name: "成香",
    piecesCode: 14,
    imagePath: "../assets/PromotedDefault.png",
    move: [
        {
            type: "step",
            moveRange: [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [0, 1]]
        }
    ],
    fromPromotedPieceCode: 8
}

export const PROMOTED_FU : PiecesType = {
    name: "と金",
    piecesCode: 15,
    imagePath: "../assets/PromotedFu.png",
    move: [
        {
            type: "step",
            moveRange: [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [0, 1]]
        }
    ],
    fromPromotedPieceCode: 9
}

export const Blank : PiecesType = {
    name: "blank",
    piecesCode: 0,
    imagePath: "",
    move: [
        {
            type: "step",
            moveRange: []
        }
    ]
}

export const piecesData = [Blank, Osho, GyoKUSHO, Hisha, Kaku, KinSho, GinSho, Keima, Kyosha, Fu, PROMOTED_HISHA, PROMOTED_KAKU, PROMOTED_GINSHO, PROMOTED_KEIMA, PROMOTED_KYOUSHA, PROMOTED_FU];