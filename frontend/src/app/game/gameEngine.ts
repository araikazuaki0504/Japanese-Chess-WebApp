import { gameEventType, movePieceInfoType, promotedPieceInfoType, capturedPieceInfoType, capturedPieces, resignedPieceInfoType,unMovePieceInfoType, unPromotedPieceInfoType, unCapturedPieceInfoType, unResignedPieceInfoType, addPieceInfoType }  from "../types/gameType";
import { moveType, PiecesType } from "../types/piecesInfoType";

import { initialBoard, PieceInstance, lightPieceInstance, lightCapturedPieceData } from "../const/initialBoard";
import { Blank,piecesData } from "../const/piecesData";
import { User } from "../user/user";

export class GameEngine {
    private static instance: GameEngine;
    private board : ReadonlyArray<ReadonlyArray<PieceInstance>> = initialBoard.map(row => row.map(piece => ({...piece})));;
    private myselfcapturedPiecesList : ReadonlyArray<capturedPieces> = [];
    private opponentcapturedPiecesList : ReadonlyArray<capturedPieces> = [];
    private BOARD_SIZE: number = 9;
    private didBoardUpdate : boolean = false;
    private didMyselfCapturedListUpdate : boolean = false;
    private didOpponentCapturedListUpdate : boolean = false;
    private didTurnUpdate : boolean = false;
    private currentTurn : "Sente" | "Gote" = "Sente";
    private user = User.getInstance();

    private constructor() {
        this.board = initialBoard;
        
    }

    static getInstance(): GameEngine {
        if (!GameEngine.instance) {
            GameEngine.instance = new GameEngine();
        }
        return GameEngine.instance;
    }

    getBoardSize() : number {
        return this.BOARD_SIZE;
    }

    getBoard() : ReadonlyArray<ReadonlyArray<PieceInstance>> {
        return this.board;
    }

    getCurrentTurn() : "Sente" | "Gote" {
        return this.currentTurn;
    }

    getCapturedPieceData(at : [number,number]) : PiecesType {
        const [x,y] = at;
        return this.board[y][x].def;
    }

    getMyselfCapturedList() : ReadonlyArray<capturedPieces> {
        return this.myselfcapturedPiecesList;
    }

    getOpponentCapturedList() : ReadonlyArray<capturedPieces> {
        return this.opponentcapturedPiecesList;
    }

    initSetBoard(lightBoard : lightPieceInstance[][]) {
        this.board = lightBoard.map((row) =>
            row.map((lightPieceData : lightPieceInstance) => {
                return {
                def: piecesData[lightPieceData.pieceCode],
                owner: lightPieceData.owner
            }})
        );

        this.didBoardUpdate = true;
    }

    static ligthBoardToBoard (lightBoard : lightPieceInstance[][]) : PieceInstance[][] {
        return lightBoard.map((row) =>
            row.map((lightPieceData : lightPieceInstance) => {
                return {
                def: piecesData[lightPieceData.pieceCode],
                owner: lightPieceData.owner
            }})
        );
    }

    initMyselfCapturedList(lightMyselfCapturedList : lightCapturedPieceData[]) {
        if (lightMyselfCapturedList.length === 0) return;

        this.myselfcapturedPiecesList = lightMyselfCapturedList.map((lightCapturedPieceData : lightCapturedPieceData) => {
            return {
                pieceData: piecesData[lightCapturedPieceData.pieceCode],
                pieceCount: lightCapturedPieceData.count
            };
        });

        this.didMyselfCapturedListUpdate = true;
    }

    initOpponentCapturedList(lightOpponentCapturedList : lightCapturedPieceData[]) {
        if (lightOpponentCapturedList.length === 0) return;

        this.opponentcapturedPiecesList = lightOpponentCapturedList.map((lightCapturedPieceData : lightCapturedPieceData) => {
            return {
                pieceData: piecesData[lightCapturedPieceData.pieceCode],
                pieceCount: lightCapturedPieceData.count
            };
        });

        console.log(this.opponentcapturedPiecesList);

        this.didOpponentCapturedListUpdate = true;
    }

    setBoard(board: typeof initialBoard) : void {
        this.board = board;
    }

    setCurrentTurn(currentTurn : "Sente" | "Gote") : void {
        this.currentTurn = currentTurn;
    }

    isMyTurn() : boolean {
        const userType = this.user.getUserType();
        if (userType === "Spectator") return true;
        return this.currentTurn === userType;
    }

    didUpdateMyselfCapturedList() : boolean {
        const result = this.didMyselfCapturedListUpdate;
        this.didMyselfCapturedListUpdate = false;
        return result;
    }

    didUpdateOpponentCapturedList() : boolean {
        const result = this.didOpponentCapturedListUpdate;
        this.didOpponentCapturedListUpdate = false;
        return result;
    }

    didUpdateBoard() : boolean {
        const result = this.didBoardUpdate;
        this.didBoardUpdate = false;
        return result;
    }

    didUpdateTurn() : boolean {
        const result = this.didTurnUpdate;
        this.didTurnUpdate = false;
        return result;
    }

    private updateBoard(board :PieceInstance[][]) : PieceInstance[][] {
        this.didBoardUpdate = true;
        return board.map(row => [...row]);
    }

    movePiece(movePieceInfo: movePieceInfoType) : void {
        this.board = this.movePiece_ApplyBoard(this.board as PieceInstance[][], movePieceInfo)
    }

    private movePiece_ApplyBoard(board :PieceInstance[][], movePieceInfo: movePieceInfoType) : PieceInstance[][]{
        const [fromX, fromY] = movePieceInfo.from;
        const [toX, toY] = movePieceInfo.to;
        const movePieceData = movePieceInfo.pieceData;
        const owner = movePieceInfo.owner;

        const newBoard = this.updateBoard(board);
        
        // 移動
        newBoard[toY][toX] = { def: movePieceData, owner: owner };
        newBoard[fromY][fromX] = { def: Blank, owner: "None" };

        return newBoard;
    }

    promotedPiece(promotedPieceInfo : promotedPieceInfoType) : void {
        this.board = this.promotedPiece_ApplyBoard(this.board as PieceInstance[][], promotedPieceInfo);
    }

    private promotedPiece_ApplyBoard(board :PieceInstance[][], promotedPieceInfo : promotedPieceInfoType) : PieceInstance[][] {
        const [x, y] = promotedPieceInfo.at;
        const promotedPieceData = promotedPieceInfo.pieceData;
        const owner = promotedPieceInfo.owner;

        const promotedPieceCode = promotedPieceData.toPromotedPieceCode!;
        const promotedPieceDef = piecesData.find(piece => piece.piecesCode === promotedPieceCode);

        const newBoard = this.updateBoard(board);
        
        newBoard[y][x] = { def: promotedPieceDef!, owner: owner};

        return newBoard;
    }

    myselfCapturedPiece(capturedPieceInfo : capturedPieceInfoType) : void {
        this.myselfcapturedPiecesList = 
            this.capturedPiece_ApplyList(this.myselfcapturedPiecesList as capturedPieces[], capturedPieceInfo);
        this.didMyselfCapturedListUpdate = true;
    }

    opponentCapturedPiece(capturedPieceInfo : capturedPieceInfoType) : void {
        this.opponentcapturedPiecesList =
            this.capturedPiece_ApplyList(this.opponentcapturedPiecesList as capturedPieces[], capturedPieceInfo);
        this.didOpponentCapturedListUpdate = true;
    }

    private capturedPiece_ApplyList(
    capturedPiecesList : capturedPieces[], 
    capturedPieceInfo : capturedPieceInfoType) : capturedPieces[] {
        const capturedPieceData = capturedPieceInfo.pieceData;

        const capturedPieceIndex = capturedPiecesList.findIndex(
            capturedPieces => capturedPieces.pieceData.piecesCode === capturedPieceData.piecesCode
        );

        // リスト内に同一の持ち駒が存在しない場合
        if (capturedPieceIndex === -1) {
            return [...capturedPiecesList, {pieceData : capturedPieceInfo.pieceData, pieceCount : 1}];
        } else { // 存在する場合
            const newCapturedPeicesList = [...capturedPiecesList];
            newCapturedPeicesList[capturedPieceIndex].pieceCount += 1;
            return newCapturedPeicesList
        }
    }

    resignedPiece(resignedPieceInfo: resignedPieceInfoType) : void {
        this.board = this.resignedPiece_ApplyBoard(this.board as PieceInstance[][], resignedPieceInfo);

        if (resignedPieceInfo.owner === "Myself") {
            this.myselfcapturedPiecesList =
             this.resignedPiece_ApplyList(this.myselfcapturedPiecesList as capturedPieces[], resignedPieceInfo);
            this.didMyselfCapturedListUpdate = true;
        } else {
            this.opponentcapturedPiecesList = 
             this.resignedPiece_ApplyList(this.opponentcapturedPiecesList as capturedPieces[], resignedPieceInfo);
            this.didOpponentCapturedListUpdate = true;
        }
    }

    private resignedPiece_ApplyBoard(board :PieceInstance[][], resignedPieceInfo: resignedPieceInfoType) : PieceInstance[][] {
        const [x, y] = resignedPieceInfo.at;
        const promotedPieceData = resignedPieceInfo.pieceData;
        const owner = resignedPieceInfo.owner;

        const newBoard = this.updateBoard(board);
        
        newBoard[y][x] = { def: promotedPieceData, owner: owner};

        return newBoard;   
    }

    private resignedPiece_ApplyList(
    capturedPiecesList : capturedPieces[],  
    resignedPieceInfo: resignedPieceInfoType) : capturedPieces[] {
        const capturedPieceData = resignedPieceInfo.pieceData;

        const capturedPieceIndex = capturedPiecesList.findIndex(
            capturedPiecesList => capturedPiecesList.pieceData.piecesCode === capturedPieceData.piecesCode
        );

        // リスト内に同一の持ち駒が存在しない場合
        if (capturedPieceIndex === -1) {
            return [];
        } else { // 存在する場合
            const newCapturedPeicesList = [...capturedPiecesList];
            newCapturedPeicesList[capturedPieceIndex].pieceCount -= 1;
            return newCapturedPeicesList.filter((capturedPiece : capturedPieces) => capturedPiece.pieceCount > 0);
        }
    }

    undoMovePiece(undoMovePieceInfo: unMovePieceInfoType) : void {
        this.board = this.undoMovePiece_ApplyBoard(this.board as PieceInstance[][], undoMovePieceInfo);
    }

    private undoMovePiece_ApplyBoard(undoBoard :PieceInstance[][], undoMovePieceInfo: unMovePieceInfoType) : PieceInstance[][] {
        console.log("undo move piece info:", undoMovePieceInfo);
        const [fromX, fromY] = undoMovePieceInfo.from;
        const [toX, toY] = undoMovePieceInfo.to;
        const movePieceData = undoMovePieceInfo.pieceData;
        const whoOwner = this.user.changeOwner(undoMovePieceInfo.turn);
        
        const newBoard = this.updateBoard(undoBoard);

        // 移動
        newBoard[fromY][fromX] = { def: movePieceData, owner: whoOwner };
        newBoard[toY][toX] = { def: Blank, owner: "None" };
        return newBoard;
    }

    undoPromotedPiece(undoPromotedPieceInfo : unPromotedPieceInfoType) : void {
        this.board = this.undoPromotedPiece_ApplyBoard(this.board as PieceInstance[][], undoPromotedPieceInfo);
    }

    private undoPromotedPiece_ApplyBoard(undoBoard : PieceInstance[][], undoPromotedPieceInfo : unPromotedPieceInfoType) : PieceInstance[][] {
        const [x, y] = undoPromotedPieceInfo.at;
        const unPromotedPieceData = undoPromotedPieceInfo.pieceData;
        const whoOwner = this.user.changeOwner(undoPromotedPieceInfo.turn);

        const newBoard = this.updateBoard(undoBoard);

        newBoard[y][x] = { def: unPromotedPieceData, owner: whoOwner};
        return newBoard;
    }

    undoCapturedPiece(undoCapturedPieceInfo : unCapturedPieceInfoType) : void {
        const whoOwner = this.user.changeOwner(undoCapturedPieceInfo.turn);
        
        console.log("undo captured piece info:", undoCapturedPieceInfo);

        this.board = this.undoCapturedPiece_ApplyBoard(this.board as PieceInstance[][], undoCapturedPieceInfo);

        if (whoOwner === "Myself") {
            this.myselfcapturedPiecesList = this.undoCapturedPiece_ApplyList(this.myselfcapturedPiecesList as capturedPieces[], undoCapturedPieceInfo);
            this.didMyselfCapturedListUpdate = true;
        } else {
            this.opponentcapturedPiecesList = this.undoCapturedPiece_ApplyList(this.opponentcapturedPiecesList as capturedPieces[], undoCapturedPieceInfo);
            this.didOpponentCapturedListUpdate = true;
        }
    }

    private undoCapturedPiece_ApplyBoard(undoBoard : PieceInstance[][], undoCapturedPieceInfo : unCapturedPieceInfoType) : PieceInstance[][] {
        const [x, y] = undoCapturedPieceInfo.at;
        const capturedPieceData = undoCapturedPieceInfo.pieceData;
        const whoOwner = this.user.changeOtherOwner(undoCapturedPieceInfo.turn);
        
        const newBoard = this.updateBoard(undoBoard);
        
        newBoard[y][x] = { def: capturedPieceData, owner: whoOwner};
        return newBoard;
    }

    private undoCapturedPiece_ApplyList(undoCapturedList : capturedPieces[], undoCapturedPieceInfo : unCapturedPieceInfoType) : capturedPieces[] {
        const capturedPieceData = undoCapturedPieceInfo.pieceData;
        
        const capturedPieceIndex = undoCapturedList.findIndex(
            capturedPieces => capturedPieces.pieceData.piecesCode === capturedPieceData.piecesCode
        );

        // リスト内に同一の持ち駒が存在しない場合
        if (capturedPieceIndex === -1) return [...undoCapturedList];
        else undoCapturedList[capturedPieceIndex].pieceCount -= 1;

        return [...undoCapturedList.filter((capturedPiece : capturedPieces) => capturedPiece.pieceCount > 0)];
    }

    undoResignedPiece(undoResignedPieceInfo: unResignedPieceInfoType) : void {
        const whoOwner = this.user.changeOwner(undoResignedPieceInfo.turn);

        this.board = this.undoResignedPiece_ApplyBoard(this.board as PieceInstance[][], undoResignedPieceInfo);
        
        if (whoOwner === "Myself") {
            this.myselfcapturedPiecesList = this.undoResignedPiece_ApplyList(this.myselfcapturedPiecesList as capturedPieces[], undoResignedPieceInfo);
            this.didMyselfCapturedListUpdate = true;
        } else {
            this.opponentcapturedPiecesList = this.undoResignedPiece_ApplyList(this.opponentcapturedPiecesList as capturedPieces[], undoResignedPieceInfo);
            this.didOpponentCapturedListUpdate = true;
        }
    }

    private undoResignedPiece_ApplyBoard(undoBoard : PieceInstance[][], undoResignedPieceInfo: unResignedPieceInfoType) : PieceInstance[][] {
        const [x, y] = undoResignedPieceInfo.at;

        const newBoard = this.updateBoard(undoBoard);

        newBoard[y][x] = { def: Blank, owner: "None"};  
        return newBoard;
    }

    private undoResignedPiece_ApplyList(undoCapturedPiecesList : capturedPieces[], undoResignedPieceInfo: unResignedPieceInfoType) : capturedPieces[] {
        const capturedPieceData = undoResignedPieceInfo.pieceData;

        const capturedPieceIndex = undoCapturedPiecesList.findIndex(
            capturedPiecesList => capturedPiecesList.pieceData.piecesCode === capturedPieceData.piecesCode
        );

        // リスト内に同一の持ち駒が存在しない場合
        if (capturedPieceIndex === -1) return [...undoCapturedPiecesList, {pieceData : capturedPieceData, pieceCount : 1}];

        // 存在する場合
        undoCapturedPiecesList[capturedPieceIndex].pieceCount += 1;
        return [...undoCapturedPiecesList];
    }

    resetAll() : void {
        this.board = initialBoard.map(row => row.map(piece => ({...piece})));;
        this.myselfcapturedPiecesList = [];
        this.opponentcapturedPiecesList = [];
        this.currentTurn = "Sente";

        this.didBoardUpdate = true;
        this.didMyselfCapturedListUpdate = true;
        this.didOpponentCapturedListUpdate = true;
    }

    addPiece(addPieceInfo: addPieceInfoType) : void {
        this.board = this.addPiece_ApplyBoard(this.board as PieceInstance[][], addPieceInfo);
    }

    private addPiece_ApplyBoard(board :PieceInstance[][], addPieceInfo: addPieceInfoType) : PieceInstance[][] {
        const [toX, toY] = addPieceInfo.to;
        const owner = this.user.changeOwner(addPieceInfo.owner);

        const newBoard = this.updateBoard(board);

        newBoard[toY][toX] = { def: addPieceInfo.pieceData, owner: owner };

        return newBoard;
    }
        

    canMove(movePieceInfo: movePieceInfoType) : boolean {
        const [fromX, fromY] = movePieceInfo.from;
        const [toX, toY] = movePieceInfo.to;
        const movePieceData = movePieceInfo.pieceData;
            
        // 移動可能判定
        const canMove = movePieceData.move.some((move: moveType) => {
              if (move.type === "step") return move.moveRange.some(([dx, dy]) => {
                const targetX = fromX + dx;
                const targetY = fromY + dy;

                if (targetX < 0 || targetX >= this.BOARD_SIZE || targetY < 0 || targetY >= this.BOARD_SIZE) return false; // ボード外
                if (this.board[targetY][targetX].owner === "Myself") return false; // 自分の駒がある場合は移動できない
        
                return targetX === toX && targetY === toY
            });
            
            if (move.type === "slide") return move.moveRange.some(([dx, dy]) => {
                for (let i = 1; i < this.BOARD_SIZE; i++) {
                  const targetX = fromX + dx * i;
                  const targetY = fromY + dy * i;
        
                  if (targetX < 0 || targetX >= this.BOARD_SIZE || targetY < 0 || targetY >= this.BOARD_SIZE) break; // ボード外
                  if (this.board[targetY][targetX].owner === "Myself") break; // 自分の駒がある場合は進めない
                  // 相手の駒がある場合はそこまで進めるがそれ以上は進めない
                  if (this.board[targetY][targetX].owner === "Opponent") {
                    if (targetX === toX && targetY === toY) return true;
                    break;
                  } 
                  if (targetX === toX && targetY === toY) return true;
                }
                return false;
            });
        });

        return canMove;
    }

    canPromoted(movePieceInfo: movePieceInfoType) : boolean {
        const toY = movePieceInfo.to[1];
        const movePieceData = movePieceInfo.pieceData;

        return toY <= 2 && movePieceData.toPromotedPieceCode !== undefined;
    }

    canCapturedPiece(movePieceInfo: movePieceInfoType) : boolean{
        const [toX, toY] = movePieceInfo.to;

        return this.board[toY][toX].owner === "Opponent";
    }

    canResignedPiece(resignedPieceInfo: resignedPieceInfoType) : boolean {
        const [toX, toY] = resignedPieceInfo.at;

        return this.checkPieceData(this.board[toY][toX].def, Blank);
    }

    ApplyReducer(reducer: gameEventType) : void {
        if (reducer.userCode === this.user.getUserCode()) return;

        if (reducer.type === "error") return;

        if (reducer.isPromoted === false) { 
            this.turnChange();
            return;
        }

        // 移動
        if (reducer.type === "move" && reducer.to !== undefined && reducer.from !== undefined && reducer.pieceData !== undefined) {
            const oldBoard = this.board;

            // 新しい盤面へ
            this.movePiece({
                pieceData : reducer.pieceData,
                owner : "Opponent",
                to : this.coordinateRotate180(reducer.to),
                from : this.coordinateRotate180(reducer.from)
            });

            if (this.board === oldBoard) this.didBoardUpdate = false;
        }

        // 成り
        if (reducer.type === "promoted" && reducer.to !== undefined && reducer.pieceData !== undefined) {
            const oldBoard = this.board;

            // 新しい盤面へ
            this.promotedPiece({
                pieceData : reducer.pieceData,
                owner : "Opponent",
                at : this.coordinateRotate180(reducer.to),
                isPromoted : true
            });

            this.turnChange();

            if (this.board === oldBoard) this.didBoardUpdate = false;
        }

        // 駒の取得
         if (reducer.type === "captured" && reducer.from !== undefined && reducer.pieceData !== undefined) {
            const oldOpponentCapturedList = this.opponentcapturedPiecesList;

            // 新しい相手の持ち駒リストへ
            this.opponentCapturedPiece({
                pieceData : reducer.pieceData,
                owner : "Opponent",
                at : this.coordinateRotate180(reducer.from)
            });

            if (this.opponentcapturedPiecesList === oldOpponentCapturedList) this.didOpponentCapturedListUpdate = false;
        }

        // 駒を置く
        if (reducer.type === "resign" && reducer.to !== undefined && reducer.pieceData !== undefined) {
            const oldBoard = this.board;
            const oldOpponentCapturedList = this.opponentcapturedPiecesList;

            this.resignedPiece({
                pieceData : reducer.pieceData,
                owner : "Opponent",
                at : this.coordinateRotate180(reducer.to)
            });

            if (this.board === oldBoard) this.didBoardUpdate = false;
            if (this.opponentcapturedPiecesList === oldOpponentCapturedList) this.didOpponentCapturedListUpdate = false;

            this.turnChange();
        }

        // 初期化
        if (reducer.type === "resetAll") {
            this.resetAll();
        }

        // 任意の駒を追加
        if (reducer.type === "addPiece" && reducer.to !== undefined && reducer.pieceData !== undefined && reducer.turn !== undefined) {
            const oldBoard = this.board;

            this.addPiece({
                pieceData : reducer.pieceData,
                owner : reducer.turn,
                to : this.coordinateRotate180(reducer.to)
             });

             if (this.board === oldBoard) this.didBoardUpdate = false;
        }
    }

    undoApplyReducer(reducer: gameEventType) : void {
        if (reducer.type !== "undo") return;

        console.log("undo reducer:", reducer);

        if (reducer.to && reducer.from && reducer.pieceData) {
            this.undoMovePiece({
                pieceData : reducer.pieceData,
                turn : reducer.turn!,
                to : this.user.getUserType() === "Sente" ? this.coordinateRotate180(reducer.to) : reducer.to,
                from : this.user.getUserType() === "Sente" ? this.coordinateRotate180(reducer.from) : reducer.from
            });

            this.turnChange();
            return;
        } else if (reducer.to && !reducer.from && reducer.pieceData && reducer.isPromoted) {
            this.undoPromotedPiece({
                pieceData : reducer.pieceData,
                turn : reducer.turn!,
                at : this.user.getUserType() === "Sente" ? this.coordinateRotate180(reducer.to) : reducer.to
            });

            return;
        } else if (!reducer.to && reducer.from && reducer.pieceData && !reducer.isPromoted) {
            this.undoCapturedPiece({
                pieceData : reducer.pieceData,
                turn : reducer.turn!,
                at : this.user.getUserType() === "Sente" ? this.coordinateRotate180(reducer.from) : reducer.from
            });
            return;
        } else if (reducer.to && !reducer.from && reducer.pieceData && !reducer.isPromoted) {
            this.undoResignedPiece({
                pieceData : reducer.pieceData,
                turn : reducer.turn!,
                at : this.user.getUserType() === "Sente" ? this.coordinateRotate180(reducer.to) : reducer.to
            });

            this.turnChange();
            return;
        }
    }

    turnChange() : void {
        // 手番替え
       this.currentTurn = (this.currentTurn === "Sente" ? "Gote" : "Sente");
       this.didTurnUpdate = true;
    }

    private checkPieceData(clientPieceData : PiecesType, serverPieceData : PiecesType) : boolean {
        // 成れるかが違う場合
        if ( !(clientPieceData.toPromotedPieceCode && serverPieceData.toPromotedPieceCode) &&
             !(!clientPieceData.toPromotedPieceCode && !serverPieceData.toPromotedPieceCode)) return false;
        
        return (
            clientPieceData.name === serverPieceData.name &&
            clientPieceData.imagePath === serverPieceData.imagePath &&
            clientPieceData.piecesCode === serverPieceData.piecesCode &&
            JSON.stringify(clientPieceData.move) === JSON.stringify(serverPieceData.move)
        );
    }

    private coordinateRotate180(coordinate : [number,number]) : [number,number] {
        const [x,y] = coordinate;
        
        if (this.user.getUserType() === "Sente") return [8 - x, 8 - y];
        else return coordinate;
    }
}