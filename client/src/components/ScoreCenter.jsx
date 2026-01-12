import PropTypes from "prop-types";

function ScoreCenter({ score }) {
  return (
    <div style={styles.outer}>
      <div style={styles.iconBox}>🪙</div>
      <div style={styles.textContainer}>
        <div style={styles.label}>Safety Points</div>
        <div style={styles.score}>{score.toLocaleString()}</div>
      </div>
    </div>
  );
}

ScoreCenter.propTypes = {
  score: PropTypes.number.isRequired,
};

const styles = {
  outer: {
    padding: '12px 24px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    boxShadow: '0 10px 20px -5px rgba(217, 119, 6, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  iconBox: { fontSize: '28px', background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' },
  textContainer: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.05em' },
  score: { fontSize: '28px', fontWeight: '900', color: 'white', lineHeight: 1.1 }
};

export default ScoreCenter;