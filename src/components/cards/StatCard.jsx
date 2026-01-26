import "./StatCard.scss";

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{title}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

export default StatCard;