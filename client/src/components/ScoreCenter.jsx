import PropTypes from 'prop-types';

function ScoreCenter({ score }) {
  return (
    <div style={{
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      backgroundColor: '#FF9F1C',
      color: 'white',
      boxShadow: '0 10px 25px rgba(255, 159, 28, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '20px auto',
      border: '4px solid white'
    }}>
      <div style={{ fontSize: '30px' }}>🪙</div>
      <div style={{ fontSize: '16px', opacity: 0.9 }}>Safety Points</div>
      <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
        {score}
      </div>
    </div>
  );
}

ScoreCenter.propTypes = {
  score: PropTypes.number.isRequired
};

export default ScoreCenter;