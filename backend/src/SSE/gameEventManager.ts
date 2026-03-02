import { gameEventMessageType } from "../types/APIType"; 

type gameEventType = gameEventMessageType["type"];
type eventSequence = gameEventType[];

export class GameEventManager {
  private readonly sequences: eventSequence[] = [
    ["captured", "move", "promoted"],
    ["move", "promoted"],
    ["resign"],
  ];

  private sequenceIndex: number | null = null;
  private eventIndex: number = 0;

  check(event: gameEventType): boolean {
    // まだどのシーケンスか確定していない場合
    if (this.sequenceIndex === null) {
      return this.tryStartSequence(event);
    }

    const sequence = this.sequences[this.sequenceIndex];
    const expected = sequence[this.eventIndex];

    if (event !== expected) {
      return false;
    }

    this.eventIndex++;

    // シーケンス完了
    if (this.eventIndex >= sequence.length) {
      this.reset();
    }

    return true;
  }

  private tryStartSequence(event: gameEventType): boolean {
    for (let i = 0; i < this.sequences.length; i++) {
      if (this.sequences[i][0] === event) {
        this.sequenceIndex = i;
        this.eventIndex = 1;

        // 1要素シーケンス（resign / resetAll）
        if (this.sequences[i].length === 1) {
          this.reset();
        }

        return true;
      }
    }
    return false;
  }

  reset(): void {
    this.sequenceIndex = null;
    this.eventIndex = 0;
  }
}