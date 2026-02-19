import { gameEventMessageType, ReturnGameEventMessageType , InitMessageType, RetutrnInitMessageType } from "../types/APIType"

export function ShogiAPI() {
    const sendInitEvent = async (initMessageType : InitMessageType): Promise<RetutrnInitMessageType> => {
        try {
            const res = await fetch("http://localhost:3000/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(initMessageType)
            });

            if (!res.ok) {
                throw new Error("通信エラー");
            }

            const RetutrnInitMessage: RetutrnInitMessageType = await res.json();

            return RetutrnInitMessage; // ← 呼び出し側で「待てる」
        } catch (err) {
            console.error(err);
            throw err; // ← await した側にエラーを伝播
        }
    };

    const sendGameEvent = async (gameEventMessage : gameEventMessageType) => {
        try {
            const res = await fetch("http://localhost:3000/gameEvent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(gameEventMessage)
        });

        const ReturnGameEventMessage: ReturnGameEventMessageType = await res.json();
        console.log(ReturnGameEventMessage);

        } catch (err) {
            console.error(err);
            throw err; // ← await した側にエラーを伝播
        }
    }

  return { sendInitEvent, sendGameEvent };
}
