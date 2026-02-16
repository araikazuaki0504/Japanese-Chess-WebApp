import "./css/ShogiTable.css";

export default function ShogiTable({ owner }: { owner: "myself" | "opponent" }) {
  return (
    <div className={`komadai ${owner}`}>
    </div>
  );
}