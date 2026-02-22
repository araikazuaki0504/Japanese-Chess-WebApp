import { initialBoard, PieceInstance } from "../const/initialBoard";
import { Blank, piecesData } from "../const/piecesData";
import { gameEventType, movePieceInfoType, promotedPieceInfoType, capturedPieceInfoType, resignedPieceInfoType, gameEventHistoryType, unMovePieceInfoType, unPromotedPieceInfoType, unCapturedPieceInfoType, unResignedPieceInfoType, addPieceInfoType }  from "../types/gameType";
import { PiecesType, moveType, capturedPieces } from "../types/piecesInfoType";
import { UserManager } from "./UserManager";

export class GameEngine {
    private board : PieceInstance[][] = initialBoard.map(row => row.map(piece => ({...piece})));
    private senteCapturedPiecesList : capturedPieces[] = [];
    private goteCapturedPiecesList : capturedPieces[] = [];
    private static BOARD_SIZE: number = 9;
    private currentTurn : "Sente" | "Gote" = "Sente";
    private otherTurn : "Sente" | "Gote" = "Gote";
    private userManager : UserManager;
    private gameEventHistory : gameEventHistoryType[] = [];

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

    getCapturedPiecesList(userType : "Sente" | "Gote") : capturedPieces[] {
        return userType === "Sente" ? this.senteCapturedPiecesList : this.goteCapturedPiecesList;
    }

    undoMovePiece(undoMovePieceInfo: unMovePieceInfoType) {
        this.undoMovePiece_ApplyBoard(undoMovePieceInfo);
    }

    undoMovePiece_ApplyBoard(undoMovePieceInfo: unMovePieceInfoType) : void {
        const [fromX, fromY] = undoMovePieceInfo.from;
        const [toX, toY] = undoMovePieceInfo.to;
        const movePieceData = undoMovePieceInfo.pieceData;
        
        // 移動
        this.board[fromY][fromX] = { def: movePieceData, owner: this.currentTurn };
        this.board[toY][toX] = { def: Blank, owner: "None" };
    }

    undoPromotedPiece(undoPromotedPieceInfo : unPromotedPieceInfoType) : void {
        this.undoPromotedPiece_ApplyBoard(undoPromotedPieceInfo);
    }

    undoPromotedPiece_ApplyBoard(undoPromotedPieceInfo : unPromotedPieceInfoType) : void {
        const [x, y] = undoPromotedPieceInfo.at;
        const unPromotedPieceData = undoPromotedPieceInfo.pieceData;

        this.board[y][x] = { def: unPromotedPieceData, owner: this.currentTurn};
    }

    undoCapturedPiece(undoCapturedPieceInfo : unCapturedPieceInfoType) : void {
        this.undoCapturedPiece_ApplyList(undoCapturedPieceInfo);
    }

    undoCapturedPiece_ApplyList(undoCapturedPieceInfo : unCapturedPieceInfoType) : void {
        const capturedPieceData = undoCapturedPieceInfo.pieceData;
        const capturedPiecesList = this.currentTurn === "Sente" ? this.senteCapturedPiecesList : this.goteCapturedPiecesList;

        const capturedPieceIndex = capturedPiecesList.findIndex(
            capturedPieces => capturedPieces.pieceData.piecesCode === capturedPieceData.piecesCode
        );

        // リスト内に同一の持ち駒が存在しない場合
        if (capturedPieceIndex === -1) return;
        else capturedPiecesList[capturedPieceIndex].pieceCount -= 1;

        if (this.currentTurn === "Sente") this.senteCapturedPiecesList = capturedPiecesList.filter((capturedPiece : capturedPieces) => capturedPiece.pieceCount > 0);
        else this.goteCapturedPiecesList = capturedPiecesList.filter((capturedPiece : capturedPieces) => capturedPiece.pieceCount > 0);
    }

    undoResignedPiece(undoResignedPieceInfo: unResignedPieceInfoType) : void {
        this.undoResignedPiece_ApplyBoard(undoResignedPieceInfo);
        this.undoResignedPiece_ApplyList(undoResignedPieceInfo);
    }

    private undoResignedPiece_ApplyBoard(undoResignedPieceInfo: unResignedPieceInfoType) : void {
        const [x, y] = undoResignedPieceInfo.at;
        const resignedPieceData = undoResignedPieceInfo.pieceData;

        this.board[y][x] = { def: resignedPieceData, owner: this.currentTurn};  
    }

    private undoResignedPiece_ApplyList(undoResignedPieceInfo: unResignedPieceInfoType) : void {
        const capturedPieceData = undoResignedPieceInfo.pieceData;
        const capturedPiecesList = this.currentTurn === "Sente" ? this.senteCapturedPiecesList : this.goteCapturedPiecesList;

        const capturedPieceIndex = capturedPiecesList.findIndex(
            capturedPiecesList => capturedPiecesList.pieceData.piecesCode === capturedPieceData.piecesCode
        );

        // リスト内に同一の持ち駒が存在しない場合
        if (capturedPieceIndex === -1) return;

        // 存在する場合
        capturedPiecesList[capturedPieceIndex].pieceCount += 1;
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
        const promotedPieceDef = piecesData[promotedPieceCode];
        
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

    addPiece(addPieceInfo : addPieceInfoType) {
      const [ toX, toY ] = addPieceInfo.at;

      if (addPieceInfo.owner) {
        this.board[toY][toX] = {def: addPieceInfo.pieceData, owner: addPieceInfo.owner};
      } else {
        this.board[toY][toX] = {def: Blank, owner: "None"};
      }
    }

    resetAll() : void {
        this.board = initialBoard.map(row => row.map(piece => ({...piece})));
        this.gameEventHistory = [];
        this.senteCapturedPiecesList = [];
        this.goteCapturedPiecesList = [];
        this.currentTurn = "Sente";
        this.otherTurn = "Gote";
    }

    validation(gameEvent : gameEventType) : boolean {
      if (gameEvent.type === "resetAll") return true;
      else if (gameEvent.type === "undo" && this.gameEventHistory.length > 0) return true;

      if (this.userManager.getUserType(gameEvent.userCode) === "Spectator") return true;

      if (this.userManager.getUserType(gameEvent.userCode) !== this.currentTurn) return false;

      switch(gameEvent.type) {
        case "move":
          if (!(gameEvent.to && gameEvent.from && gameEvent.pieceData))return false;
          return this.canMove({
            pieceData: gameEvent.pieceData,
            to: gameEvent.to,
            from: gameEvent.from
          });
        case "promoted":
          if (gameEvent.isPromoted === false) return true;
          if (!(gameEvent.to && gameEvent.pieceData)) return false;
          return this.canPromoted({
            pieceData: gameEvent.pieceData,
            at: gameEvent.to
          });
        case "captured":
          if (!(gameEvent.from && gameEvent.pieceData)) return false;
          return this.canCapturedPiece({
            pieceData: gameEvent.pieceData,
            at: gameEvent.from
          });
        case "resign":
          if (!(gameEvent.to && gameEvent.pieceData)) return false;
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
        const [toX, toY] = promotedPieceInfo.at;
        const ServerPromotedPieceData = this.board[toY][toX].def;
        const clientPromotedPieceData = promotedPieceInfo.pieceData;

        if (!this.checkPieceData(clientPromotedPieceData, ServerPromotedPieceData)) return false;

        if (this.currentTurn === "Gote")return toY <= 2 && ServerPromotedPieceData.toPromotedPieceCode !== undefined;
        else return toY >= 6 && ServerPromotedPieceData.toPromotedPieceCode !== undefined;
    }

    canCapturedPiece(capturedPieceInfo: capturedPieceInfoType) : boolean{
        const [toX, toY] = capturedPieceInfo.at;

        // if (!this.checkPieceData(capturedPieceInfo.pieceData, this.board[toY][toX].def)) return false;

        return this.board[toY][toX].owner === this.otherTurn;
    }

    canResignedPiece(resignedPieceInfo: resignedPieceInfoType) : boolean {
        const [toX, toY] = resignedPieceInfo.at;

        return this.checkPieceData(this.board[toY][toX].def, Blank);
    }

    ApplyReducer(reducer: gameEventType) : void {
      // ユーザーID取得
      const userID = this.userManager.getUserID(this.currentTurn as "Sente" | "Gote" | "Spectator")

      if (reducer.type === "error") return;

      // 移動
      if (reducer.type === "move" && reducer.to !== undefined && reducer.from !== undefined && reducer.pieceData) {

        // 新しい盤面へ
        this.movePiece_ApplyBoard({
            pieceData : reducer.pieceData,
            to : reducer.to,
            from : reducer.from
        });
      } else if (reducer.type === "promoted" && reducer.to !== undefined && reducer.pieceData) {// 成り
        // 新しい盤面へ
        this.promotedPiece_ApplyBoard({
            pieceData : reducer.pieceData,
            at : reducer.to,
        });
        this.turnChange();
      } else if (reducer.isPromoted === false) {
        this.turnChange(); //空のPromotedイベント(Promotedが送られてきたらそのターンは終了)
      }else if (reducer.type === "captured" && reducer.from !== undefined && reducer.pieceData) {// 駒の取得

        // 新しい相手の持ち駒リストへ
        this.capturedPiece_ApplyList({
            pieceData : reducer.pieceData,
            at : reducer.from
        });
      } else if (reducer.type === "resign" && reducer.to !== undefined && reducer.pieceData) {// 駒を置く

        this.resignedPiece({
            pieceData : reducer.pieceData,
            at : reducer.to
        });
        this.turnChange();
      } else if (reducer.type === "resetAll") {
        // 盤面と持ち駒リストを初期化
        this.resetAll();
      } else if (reducer.type === "add" && reducer.pieceData !== undefined && reducer.to !== undefined) {
        this.addPiece({
          pieceData: reducer.pieceData,
          owner: reducer.turn,
          at: reducer.to
        });
      } else {
        return;
      }

      // 履歴に追加
      this.gameEventHistory.push({
        type: reducer.type,
        turn: this.currentTurn,
        pieceCode: reducer.pieceData?.piecesCode!,
        to: reducer.to,
        from: reducer.from
      });
    }

    undoApplyReducer() : gameEventType[] {
      if (this.gameEventHistory.length === 0) {
        return [];
       }

      const oneTurnGameHistory : gameEventHistoryType[] = [];

      // 成りイベント取得
      oneTurnGameHistory.push(this.gameEventHistory.pop()!);

      // 直近の1ターン分のイベントを取得
      while (this.gameEventHistory.length > 0) {
        const lastEvents = this.getGameEventHistory();
        oneTurnGameHistory.push(lastEvents);

        if (lastEvents.type === "promoted") {
          const promotedEvent = oneTurnGameHistory.pop();
          this.gameEventHistory.push(promotedEvent!); // 成りイベントは次ターンのため、再度履歴に追加
          break;
        } else if (lastEvents.type === "resign") {
          break;
        }
      }

      console.log("one turn game event history", oneTurnGameHistory);

      const undoEvent : gameEventType[] = [];

      oneTurnGameHistory.forEach((lastEvent : gameEventHistoryType) => {
        const PieceData = piecesData[lastEvent.pieceCode];
        switch(lastEvent.type) {
          case "move":
            this.undoMovePiece({
              pieceData: PieceData!,
              turn: lastEvent.turn!,
              to: lastEvent.to!,
              from: lastEvent.from!
            });

            undoEvent.push({
              type: "undo",
              userCode: -1, // undoイベントには特定のユーザーコードはないため、-1(サーバーコード)を使用
              pieceData: PieceData,
              to: lastEvent.to,
              from: lastEvent.from, 
              turn: lastEvent.turn
            });
            break;
          case "promoted":
            if (lastEvent.to) { // 空イベントは無視
              this.undoPromotedPiece({
                pieceData: PieceData!,
                turn: lastEvent.turn!,
                at: lastEvent.to!
              });
            }
            
            undoEvent.push({
              type: "undo",
              userCode: -1,
              pieceData: PieceData,
              to: lastEvent.to,
              from: undefined,
              turn: lastEvent.turn,
              isPromoted: true
            });

            this.turnChange(); // 成りイベントのundoは手番も戻す必要があるため、ここで手番を戻す
            break;
          case "captured":
            this.undoCapturedPiece({
              pieceData: PieceData!,
              turn: lastEvent.turn!,
              at: lastEvent.from!
            });

            undoEvent.push({
              type: "undo",
              userCode: -1,
              pieceData: PieceData,
              to: undefined,
              from: lastEvent.from,
              turn: lastEvent.turn
            });
            break;
          case "resign":
            this.undoResignedPiece({
              pieceData: PieceData!,
              turn: lastEvent.turn!,
              at: lastEvent.to!
            });

            undoEvent.push({
              type: "undo",
              userCode: -1,
              pieceData: PieceData,
              to: lastEvent.to,
              from: undefined,
              turn: lastEvent.turn
            });

            this.turnChange(); // 駒を置くイベントのundoは手番も戻す必要があるため、ここで手番を戻す
            break;
        }
      });

      return undoEvent;
    }
      

    private getGameEventHistory() : gameEventHistoryType {
      return this.gameEventHistory.pop()!;
    }

    // 手番替え
    turnChange() : void {
      const tmpTurn = this.otherTurn;
      this.otherTurn = this.currentTurn;
      this.currentTurn = tmpTurn;

      console.log("turn changed");
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
      if (userType === "Gote") return gameEvent;

      return {
        ...gameEvent,
        to: GameEngine.coordinateRotate180(gameEvent.to),
        from: GameEngine.coordinateRotate180(gameEvent.from)
      };
    }

    private static coordinateRotate180(coordinate? : [number,number]) : [number,number] | undefined {
      if (coordinate === undefined) return undefined;

      const [x,y] = coordinate;
        
      return [GameEngine.BOARD_SIZE - x - 1, GameEngine.BOARD_SIZE - y - 1];
    }
}
