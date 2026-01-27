import "./StatCard.scss";

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <span className="stat-label font-size-12">{title}</span>
      <span className="stat-value font-size-22">{value}</span>
    </div>
  );
}

export default StatCard;