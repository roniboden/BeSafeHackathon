import { useState } from 'react';
import PropTypes from 'prop-types';

function TaskCard({ title, score, total, color, onUpdate }) {
  const [currentScore, setCurrentScore] = useState(score);

  const handleClick = () => {
    if (currentScore < total) {
      setCurrentScore(currentScore + 1);
      if (onUpdate) {
        onUpdate();
      }
    }
  };

  return (
    <div style={{ 
      border: `2px solid ${color}`, 
      padding: '20px', 
      borderRadius: '15px',
      textAlign: 'center',
      margin: '10px',
      backgroundColor: 'white',
      width: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      
      <h3>{title}</h3>
      
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: color, margin: '10px 0' }}>
        {currentScore} / {total}
      </div>
      
      <button 
        onClick={handleClick}
        style={{
          padding: '10px 20px',
          backgroundColor: color,
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
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
  onUpdate: PropTypes.func           
};

export default TaskCard;