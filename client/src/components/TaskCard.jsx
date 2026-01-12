import PropTypes from "prop-types";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function TaskCard({ title, score, total, color = "#6366f1", onUpdate }) {
  const safeTotal = Math.max(1, total);
  const pct = (score / safeTotal) * 100;
  const pctLabel = Math.round(pct);
  const reachedGoal = score >= safeTotal;

  const size = 100;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (clamp(pct, 0, 100) / 100) * c;

  return (
    <div style={styles.card}>
      <div style={{ ...styles.topAccent, backgroundColor: color }}></div>
      <div style={styles.title}>{title}</div>
      <div style={styles.ringWrap}>
        <svg width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r} stroke="#f1f5f9" strokeWidth={stroke} fill="none" />
          <circle 
            cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none" 
            strokeLinecap="round" strokeDasharray={`${dash} ${c - dash}`}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
        </svg>
        <div style={styles.centerText}>
          <span style={styles.value}>{score}</span>
          <span style={styles.total}>/ {safeTotal}</span>
        </div>
      </div>
      <div style={styles.statusRow}>
        {reachedGoal ? (
          <span style={styles.badge}>✅ Goal reached</span>
        ) : (
          <span style={styles.subText}>{pctLabel}% complete</span>
        )}
      </div>
      <button onClick={onUpdate} style={{ ...styles.button, backgroundColor: color }}>
        Update
      </button>
    </div>
  );
}

TaskCard.propTypes = {
  title: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string,
  onUpdate: PropTypes.func,
};

const styles = {
  card: { background: "#ffffff", borderRadius: "24px", padding: "24px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden", border: "1px solid #e2e8f0" },
  topAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: '6px' },
  ringWrap: { position: "relative", margin: '20px 0' },
  centerText: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  value: { fontSize: 24, fontWeight: 800, color: "#0f172a" },
  total: { fontSize: 12, color: "#94a3b8" },
  title: { fontSize: 18, fontWeight: 700, color: "#1e293b" },
  statusRow: { height: '24px', marginBottom: '16px' },
  subText: { fontSize: 13, color: "#64748b" },
  badge: { fontSize: 12, fontWeight: 700, color: "#10b981", background: "#ecfdf5", padding: "4px 12px", borderRadius: "12px" },
  button: { width: "100%", padding: "12px", borderRadius: "14px", border: "none", color: "white", fontWeight: 700, cursor: "pointer" }
};

export default TaskCard;