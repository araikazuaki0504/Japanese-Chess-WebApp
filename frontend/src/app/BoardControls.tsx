import "./css/BoardControls.css";


export default function BoardControls({ currentTurn, onReset, onUndo} : { currentTurn: "Sente" | "Gote"; onReset: () => void; onUndo: () => void }) {
    return (
    <div className="control-panel" role="region" aria-label="board-controls">
      {/* 先手後手表示 */}
      <div className="turn-indicator">
        <span className={`turn sente ${currentTurn === "Sente" ? "active" : ""}`}>
          先手
        </span>
        <span className={`turn gote ${currentTurn === "Gote" ? "active" : ""}`}>
          後手
        </span>
      </div>

      {/* 操作ボタン */}
      <div className="control-buttons">
        <button className="btn reset" onClick={onReset}>
          盤面リセット
        </button>
        <button className="btn undo" onClick={onUndo}>
          待った
        </button>
      </div>
    </div>
  );
}
