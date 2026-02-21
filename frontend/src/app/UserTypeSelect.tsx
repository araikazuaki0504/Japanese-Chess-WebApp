import "./css/UserTypeSelect.css";

import { User } from "./user/user";

export default function UserTypeSelect({ setIsSelect } : { setIsSelect : (isSelect: boolean) => void}) {
    const selectedHandler = (SelecteduserType : "Sente" | "Gote" | "Spectator") => {
        const user = User.getInstance();
        user.setUserType(SelecteduserType);

        setIsSelect(true);
    }
  
    return (
    <div className="user-select">
      <h2 className="title">参加方法を選んでください</h2>

      <div className="buttons">
        <button
          className="select-button sente"
          onClick={() => selectedHandler("Sente")}
        >
          先手
        </button>

        <button
          className="select-button gote"
          onClick={() => selectedHandler("Gote")}
        >
          後手
        </button>

        <button
          className="select-button spectator"
          onClick={() => selectedHandler("Spectator")}
        >
          観戦者
        </button>
      </div>
    </div>
  );
};
