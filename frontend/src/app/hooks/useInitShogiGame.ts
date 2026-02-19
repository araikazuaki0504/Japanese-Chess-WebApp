import { RetutrnInitMessageType } from "../types/APIType";

import { GameEngine } from "../game/gameEngine";
import { ShogiAPI } from "../shogiAPI/shogiAPI";
import { useEffect } from "react";

export function useInitShogiGame() {
    const { sendInitEvent } = ShogiAPI();
    const gameEngine = GameEngine.getInstance();

    // gameの初期化
    const initShogiService = async () : Promise<RetutrnInitMessageType> => {
        return await sendInitEvent({
          type : "init",
          userType : gameEngine.getuserType()
        });
    }

    useEffect(() => {
        initShogiService().then((initData) => {
            
        });
    },[]);
}