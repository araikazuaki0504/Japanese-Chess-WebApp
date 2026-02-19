import { initialBoard, PieceInstance } from "../const/initialBoard";
import { Blank, piecesData } from "../const/piecesData";
import { gameEventType, movePieceInfoType, promotedPieceInfoType, capturedPieceInfoType, resignedPieceInfoType }  from "../types/gameType";
import { PiecesType, moveType, capturedPieces } from "../types/piecesInfoType";
import { UserManager } from "./UserManager";

export class GameEngine {
    private board : PieceInstance[][] = initialBoard;
    private senteCapturedPiecesList : capturedPieces[] = [];
    private goteCapturedPiecesList : capturedPieces[] = [];
    private static BOARD_SIZE: number = 9;
    private currentTurn : "Sente" | "Gote" = "Sente";
    private otherTurn : "Sente" | "Gote" = (this.currentTurn === "Sente" ? "Gote" : "Sente");
    private userManager : UserManager;

    constructor() {
      this.userManager = UserManager.getInstance(); 
    }

    getcurrentTurn() : "Sente" | "Gote" {
        return this.currentTurn;
    }

    static getBoardSize() : number {
        return this.BOARD_SIZE;
    }

    getBoard() : PieceInstance[][] {
        return this.board;
    }

    getCapturedPieceData(at : [number,number]) : PiecesType {
        const [x,y] = at;
        return this.board[y][x].def;
    }

    movePiece_ApplyBoard(movePieceInfo: movePieceInfoType) : void{
        const [fromX, fromY] = movePieceInfo.from;
        const [toX, toY] = movePieceInfo.to;
        const movePieceData = movePieceInfo.pieceData;
        
        // 移動
        this.board[toY][toX] = { def: movePieceData, owner: this.currentTurn };
        this.board[fromY][fromX] = { def: Blank, owner: "None" };
    }

    promotedPiece_ApplyBoard(promotedPieceInfo : promotedPieceInfoType) : void{
        const [x, y] = promotedPieceInfo.at;
        const promotedPieceData = promotedPieceInfo.pieceData;

        const promotedPieceCode = promotedPieceData.toPromotedPieceCode!;
        const promotedPieceDef = piecesData.find(piece => piece.piecesCode === promotedPieceCode);
        
        this.board[y][x] = { def: promotedPieceDef!, owner: this.currentTurn};
    }

    capturedPiece_ApplyList(capturedPieceInfo : capturedPieceInfoType) {
        const capturedPieceData = capturedPieceInfo.pieceData;
        const capturedPiecesList = this.currentTurn === "Sente" ? this.senteCapturedPiecesList : this.goteCapturedPiecesList;

        const capturedPieceIndex = capturedPiecesList.findIndex(
            capturedPieces => capturedPieces.pieceData.piecesCode === capturedPieceData.piecesCode
        );

        // リスト内に同一の持ち駒が存在しない場合
        if (capturedPieceIndex === -1) capturedPiecesList.push({pieceData : capturedPieceInfo.pieceData, pieceCount : 1});
        else capturedPiecesList[capturedPieceIndex].pieceCount += 1;
    }

    resignedPiece(resignedPieceInfo: resignedPieceInfoType) : void {
        this.resignedPiece_ApplyBoard(resignedPieceInfo);
        this.resignedPiece_ApplyList(resignedPieceInfo);
    }

    private resignedPiece_ApplyBoard(resignedPieceInfo: resignedPieceInfoType) {
        const [x, y] = resignedPieceInfo.at;
        const promotedPieceData = resignedPieceInfo.pieceData;

        this.board[y][x] = { def: promotedPieceData, owner: this.currentTurn};  
    }

    private resignedPiece_ApplyList(resignedPieceInfo: resignedPieceInfoType) {
        const capturedPieceData = resignedPieceInfo.pieceData;
        const capturedPiecesList = this.currentTurn === "Sente" ? this.senteCapturedPiecesList : this.goteCapturedPiecesList;

        const capturedPieceIndex = capturedPiecesList.findIndex(
            capturedPiecesList => capturedPiecesList.pieceData.piecesCode === capturedPieceData.piecesCode
        );

        // リスト内に同一の持ち駒が存在しない場合
        if (capturedPieceIndex === -1) return

        // 存在する場合
        capturedPiecesList[capturedPieceIndex].pieceCount -= 1;
        
        if (this.currentTurn === "Sente") this.senteCapturedPiecesList = capturedPiecesList.filter((capturedPiece : capturedPieces) => capturedPiece.pieceCount > 0);
        else this.goteCapturedPiecesList = capturedPiecesList.filter((capturedPiece : capturedPieces) => capturedPiece.pieceCount > 0);
    }

    validation(gameEvent : gameEventType) : boolean {
      if (this.userManager.getUserType(gameEvent.userCode) !== this.currentTurn) return false;

      switch(gameEvent.type) {
        case "move":
          if (!(gameEvent.to && gameEvent.from))return false;
          return this.canMove({
            pieceData: gameEvent.pieceData,
            to: gameEvent.to,
            from: gameEvent.from
          });
        case "promoted":
          if (!gameEvent.to) return false;
          return this.canPromoted({
            pieceData: gameEvent.pieceData,
            at: gameEvent.to
          });
        case "captured":
          if (!gameEvent.to) return false;
          return this.canCapturedPiece({
            pieceData: gameEvent.pieceData,
            at: gameEvent.to
          });
        case "resign":
          if (!gameEvent.to) return false;
          return this.canResignedPiece({
            pieceData: gameEvent.pieceData,
            at: gameEvent.to
          });
        default:
          return false;
      }
    }

    canMove(movePieceInfo: movePieceInfoType) : boolean {
        const [fromX, fromY] = movePieceInfo.from;
        const [toX, toY] = movePieceInfo.to;
        const movePieceData = movePieceInfo.pieceData;
        const Direction = this.currentTurn === "Sente" ? -1 : 1;
            
        // 移動可能判定
        const canMove = movePieceData.move.some((move: moveType) => {
              if (move.type === "step") return move.moveRange.some(([dx, dy]) => {
                const targetX = fromX + dx;
                const targetY = fromY + dy * Direction;

                if (targetX < 0 || targetX >= GameEngine.BOARD_SIZE || targetY < 0 || targetY >= GameEngine.BOARD_SIZE) return false; // ボード外
                if (this.board[targetY][targetX].owner === this.currentTurn) return false; // 自分の駒がある場合は移動できない
        
                return targetX === toX && targetY === toY
            });
            
            if (move.type === "slide") return move.moveRange.some(([dx, dy]) => {
                for (let i = 1; i < GameEngine.BOARD_SIZE; i++) {
                  const targetX = fromX + dx * i;
                  const targetY = fromY + dy * i * Direction;
        
                  if (targetX < 0 || targetX >= GameEngine.BOARD_SIZE || targetY < 0 || targetY >= GameEngine.BOARD_SIZE) break; // ボード外
                  if (this.board[targetY][targetX].owner === this.currentTurn) break; // 自分の駒がある場合は進めない
                  // 相手の駒がある場合はそこまで進めるがそれ以上は進めない
                  if (this.board[targetY][targetX].owner === this.otherTurn) {
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

    canPromoted(promotedPieceInfo: promotedPieceInfoType) : boolean {
        const toY = promotedPieceInfo.at[1];
        const movePieceData = promotedPieceInfo.pieceData;

        if (this.currentTurn === "Gote")return toY <= 2 && movePieceData.toPromotedPieceCode !== undefined;
        else return toY >= 6 && movePieceData.toPromotedPieceCode !== undefined;
    }

    canCapturedPiece(capturedPieceInfo: capturedPieceInfoType) : boolean{
        const [toX, toY] = capturedPieceInfo.at;

        return this.board[toY][toX].owner === this.otherTurn;
    }

    canResignedPiece(resignedPieceInfo: resignedPieceInfoType) : boolean {
        const [toX, toY] = resignedPieceInfo.at;

        return this.checkPieceData(this.board[toY][toX].def, Blank);
    }

    ApplyReducer(reducer: gameEventType) : void {
      // ユーザーID取得
      const userID = this.userManager.getUserID(this.currentTurn as "Sente" | "Gote" | "Spectator")

      if (reducer.userCode !== userID) return;

      if (reducer.type === "error") return;

        // 移動
      if (reducer.type === "move" && reducer.to !== undefined && reducer.from !== undefined) {

      // 新しい盤面へ
        this.movePiece_ApplyBoard({
            pieceData : reducer.pieceData,
            to : reducer.to,
            from : reducer.from
        });
      } else if (reducer.type === "promoted" && reducer.to !== undefined) {// 成り
        // 新しい盤面へ
        this.promotedPiece_ApplyBoard({
            pieceData : reducer.pieceData,
            at : reducer.to,
        });
      } else if (reducer.type === "captured" && reducer.from !== undefined) {// 駒の取得

        // 新しい相手の持ち駒リストへ
        this.capturedPiece_ApplyList({
            pieceData : reducer.pieceData,
            at : reducer.from
        });
      } else if (reducer.type === "resign" && reducer.to !== undefined) {// 駒を置く

        this.resignedPiece({
            pieceData : reducer.pieceData,
            at : reducer.to
        });
      } else {
        return;
      }
      
      // 手番替え
      const tmpTurn = this.otherTurn;
      this.otherTurn = this.currentTurn;
      this.currentTurn = tmpTurn;
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

    static convertServerCoordinate(gameEvent : gameEventType, userType : "Sente" | "Gote") : gameEventType {
        if (gameEvent.to) gameEvent.to = this.coordinateRotate180(gameEvent.to,userType);
        if (gameEvent.from) gameEvent.from = this.coordinateRotate180(gameEvent.from, userType);

        return gameEvent;
    }

    private static coordinateRotate180(coordinate : [number,number], userType : "Sente" | "Gote") : [number,number] {
        const [x,y] = coordinate;
        
        if (userType === "Sente") return [GameEngine.BOARD_SIZE - x - 1, GameEngine.BOARD_SIZE - y - 1];
        else return coordinate;
    }
}
