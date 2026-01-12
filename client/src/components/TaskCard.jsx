import PropTypes from "prop-types";

function TaskCard({ title, score, total, color, onUpdate }) {
  const reachedGoal = score >= total;
  
  // SVG Circle Calculations
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? Math.min(100, (score / total) * 100) : 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    
    <div className={`task-card-v3 ${reachedGoal ? "is-completed" : ""}`}>
      <div className="card-accent" style={{ backgroundColor: reachedGoal ? "#ccc" : color }} />
      
      <h3>{title}</h3>

      <div className="circular-progress">
        <svg width="100" height="100">
          {/* Background Gray Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#f0f0f0"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Colored Progress Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
          {/* Text inside circle */}
          <text x="50" y="48" textAnchor="middle" className="score-text">
            {score}
          </text>
          <text x="50" y="65" textAnchor="middle" className="total-text">
            / {total}
          </text>
        </svg>
      </div>

      {reachedGoal && (
        <div className="goal-badge">
          <span className="check">✓</span> Goal reached
        </div>
      )}

      <button
        className="update-button"
        /* Logic: Switch to grey if reachedGoal is true, otherwise use the prop color */
        style={{ backgroundColor: reachedGoal ? "#cbd5e0" : color }}
        onClick={() => onUpdate && onUpdate()}
        /* This prevents the user from clicking the button when the goal is met */
        disabled={reachedGoal}
      >
        {reachedGoal ? "Goal Reached" : "Update"}
      </button>
    </div>
  );
}

TaskCard.propTypes = {
  title: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string,
  onUpdate: PropTypes.func
};

export default TaskCard;