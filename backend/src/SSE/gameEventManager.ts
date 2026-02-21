import { gameEventMessage } from "../types/APIType"; 

type gameEventType = gameEventMessage["type"];
type eventSequence = gameEventType[];

const VALID_SEQUENCES: eventSequence[] = [
  ["captured", "move", "promoted"],
  ["move", "promoted"],
  ["resign"],
  ["resetAll"],
];

type gameState = | "idle" | "captured" | "move" | "finished" | "error";

export class GameEventManager {
    private state: gameState = "idle";

  handleEvent(event: gameEventType): gameState {
    if (this.state === "error") return "error";

    switch (this.state) {
      case "idle":
        return this.fromIdle(event);
      case "captured":
        return this.fromCaptured(event);
      case "move":
        return this.fromMove(event);
      case "finished":
        return this.toError();
      default:
        return this.toError();
     }
    }

    private fromIdle(event: gameEventType): gameState {
        switch (event) {
        case "captured":
            return (this.state = "captured");
        case "move":
            return (this.state = "move");
        case "resign":
        case "resetAll":
            return (this.state = "finished");
        default:
            return this.toError();
        }
    }

    private fromCaptured(event: gameEventType): gameState {
        if (event === "move") {
        return (this.state = "move");
        }
        return this.toError();
    }

    private fromMove(event: gameEventType): gameState {
        if (event === "promoted") {
        return (this.state = "idle"); // 1手完了
        }
        return this.toError();
    }

    private toError(): gameState {
        this.state = "error";
        return "error";
    }

    reset() {
        this.state = "idle";
    }

    getState(): gameState {
        return this.state;
    }
  }