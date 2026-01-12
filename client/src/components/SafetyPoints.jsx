import { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';

const SafetyPoints = ({ points }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPoints = useRef(points);

  useEffect(() => {
    if (points > prevPoints.current) {
      // Step 1: Trigger the animation
      const trigger = setTimeout(() => setIsAnimating(true), 0);
      
      // Step 2: Keep coins visible for longer (2 seconds total)
      const timer = setTimeout(() => setIsAnimating(false), 2000);

      return () => {
        clearTimeout(trigger);
        clearTimeout(timer);
      };
    }
    prevPoints.current = points;
  }, [points]);

  return (
    <div className="safety-points-container" style={{ position: 'relative' }}>
      {/* Renders 5 distinct coins when triggered */}
      {isAnimating && (
        <>
          <span className="coin-burst c1">🪙</span>
          <span className="coin-burst c2">🪙</span>
          <span className="coin-burst c3">🪙</span>
          <span className="coin-burst c4">🪙</span>
          <span className="coin-burst c5">🪙</span>
        </>
      )}

      <span className={`points-amount ${isAnimating ? 'pulse-animation' : ''}`}>
        {points?.toLocaleString() ?? 0}
      </span>

      <style>{`
        /* The main burst animation */
        @keyframes fountain {
          0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translate(var(--x), var(--y)) scale(1.2); opacity: 0; }
        }

        .coin-burst {
          position: absolute;
          left: 50%;
          top: -10px;
          font-size: 1.5rem;
          pointer-events: none;
          z-index: 100;
          /* Each coin uses the same keyframe but different variables */
          animation: fountain 1.5s ease-out forwards;
        }

        /* Define different paths for each coin */
        .c1 { --x: -60px; --y: -120px; animation-delay: 0.0s; }
        .c2 { --x: -30px; --y: -150px; animation-delay: 0.1s; }
        .c3 { --x: 0px;   --y: -180px; animation-delay: 0.2s; }
        .c4 { --x: 30px;  --y: -150px; animation-delay: 0.3s; }
        .c5 { --x: 60px;  --y: -120px; animation-delay: 0.4s; }

        @keyframes numberPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); color: #FFF; text-shadow: 0 0 15px gold; }
          100% { transform: scale(1); }
        }

        .pulse-animation {
          display: inline-block;
          animation: numberPulse 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

SafetyPoints.propTypes = { points: PropTypes.number };
export default SafetyPoints;