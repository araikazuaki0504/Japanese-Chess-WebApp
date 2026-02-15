import ShogiBoard from "./ShogiBoard";
import ShogiTable from "./ShogiTable";

import "../css/ShogiWindow.css";

export default function ShogiWindow() {
  return (
    <div className="shogi-root">
        <ShogiTable owner="opponent" />
        <ShogiBoard />
        <ShogiTable owner="myself" />
    </div>
  );
}