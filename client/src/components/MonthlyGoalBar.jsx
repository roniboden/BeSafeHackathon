import PropTypes from "prop-types";

function MonthlyGoalBar({
  monthlyCounts = {},
  monthlyTargets = {},
  actions = ["reportPost", "safetyTips", "reportGood", "simulation"],
  title = "Monthly Goal Progress"
}) {
  const done = actions.reduce((sum, a) => sum + (monthlyCounts?.[a] || 0), 0);
  const total = actions.reduce((sum, a) => sum + (monthlyTargets?.[a] || 0), 0);
  const percent = total ? Math.min(100, (done / total) * 100) : 0;

  return (
    <div style={{ marginTop: "30px", textAlign: "center" }}>
      <h3>
        {title}: {done} / {total}
      </h3>

      <div
        style={{
          width: "100%",
          backgroundColor: "#ddd",
          borderRadius: "10px",
          height: "20px"
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            backgroundColor: "#00C851",
            height: "100%",
            borderRadius: "10px",
            transition: "width 0.5s"
          }}
        />
      </div>
    </div>
  );
}

MonthlyGoalBar.propTypes = {
  monthlyCounts: PropTypes.object,
  monthlyTargets: PropTypes.object,
  actions: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string
};

export default MonthlyGoalBar;
