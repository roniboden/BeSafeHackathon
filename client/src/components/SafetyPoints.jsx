import { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';

const SafetyPoints = ({ points }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPoints = useRef(points);

  useEffect(() => {
    // Check if points increased
    if (points > prevPoints.current) {
      // Use a timeout of 0 to move this to the next event loop tick.
      // This satisfies the 'no-set-state-in-effect' linter rule.
      const trigger = setTimeout(() => {
        setIsAnimating(true);
      }, 0);

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);

      // Clean up both timers
      return () => {
        clearTimeout(trigger);
        clearTimeout(timer);
      };
    }
    
    // Always sync the ref so we don't trigger animations on decreases
    prevPoints.current = points;
  }, [points]);

  return (
    <div className="safety-points-container" style={{ position: 'relative', display: 'inline-block' }}>
      {isAnimating && <span className="coin-animation">🪙</span>}

      <span className={`points-value ${isAnimating ? 'pulse-animation' : ''}`}>
        {points?.toLocaleString() ?? 0}
      </span>

      <style>{`
        @keyframes coinFloat {
          0% { transform: translateY(0) translateX(-50%); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-50px) translateX(-50%); opacity: 0; }
        }

        @keyframes numberPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); color: #FFD700; }
          100% { transform: scale(1); }
        }

        .coin-animation {
          position: absolute;
          left: 50%;
          top: 0;
          animation: coinFloat 1s ease-out forwards;
          pointer-events: none;
          font-size: 1.5rem;
          z-index: 50;
        }

        .pulse-animation {
          display: inline-block;
          animation: numberPulse 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

SafetyPoints.propTypes = {
  points: PropTypes.number
};

export default SafetyPoints;