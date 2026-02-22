import { gameEventMessageType, ReturnGameEventMessageType , InitMessageType, RetutrnInitMessageType, ReturnReloadMessageType } from "../types/APIType"

export function ShogiAPI() {
    const sendInitEvent = async (initMessageType : InitMessageType) : Promise<RetutrnInitMessageType> => {
        try {
            const res = await fetch("http://133.242.148.242:3000/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(initMessageType)
            });

            if (!res.ok) {
                throw new Error("通信エラー");
            }

            const RetutrnInitMessage: RetutrnInitMessageType = await res.json();

            return RetutrnInitMessage;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const sendGameEvent = async (gameEventMessage : gameEventMessageType) : Promise<ReturnGameEventMessageType> => {
        try {
            const res = await fetch("http://133.242.148.242:3000/gameEvent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(gameEventMessage)
        });

        const returnGameEventMessage: ReturnGameEventMessageType = await res.json();
        console.log(returnGameEventMessage);

        return returnGameEventMessage;

        } catch (err) {
            console.error(err);
            throw err; // ← await した側にエラーを伝播
        }
    }

    const sendReloadEvent = async () : Promise<ReturnReloadMessageType> => {
        try {
            const res = await fetch("http://133.242.148.242:3000/reload", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });

        const returnGameEventMessage : ReturnReloadMessageType = await res.json();
        // console.log(ReturnGameEventMessage);

        return returnGameEventMessage;

        } catch (err) {
            console.error(err);
            throw err; // ← await した側にエラーを伝播
        }
    }

  return { sendInitEvent, sendGameEvent, sendReloadEvent };
}
