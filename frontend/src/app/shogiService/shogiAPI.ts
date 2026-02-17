import { InitMessageType } from "../types/APIType"
import { BoardManager } from "../game/boardManeger";

export function ShogiAPI() {
    const initEvent = async (): Promise<InitMessageType> => {
        try {
            const res = await fetch("http://localhost:3000/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
            throw new Error("通信エラー");
            }

            const data: InitMessageType = await res.json();
            
            BoardManager.getInstance().setBoard(data.boardData);

            return data; // ← 呼び出し側で「待てる」
        } catch (err) {
            console.error(err);
            throw err; // ← await した側にエラーを伝播
        }
    };


  return { initEvent };
}
