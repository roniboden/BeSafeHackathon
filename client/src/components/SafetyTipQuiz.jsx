import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import "../styles/ModalStyle.css"; 

function SafetyTipModal({ isOpen, onClose, onSuccess }) {
  const [tip, setTip] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadRandomTip();
      setResult(null);
      setSelectedOption(null);
      setErrorMsg("");
    }
  }, [isOpen]);

  const loadRandomTip = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/tips/random");
      setTip(res.data);
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || "Failed to load safety tip.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !tip?.id) return;
    setIsLoading(true);
    setErrorMsg(""); // Clear previous errors
    const user = JSON.parse(localStorage.getItem("besafe_user"));
    
    try {
      const res = await api.post("/tips/answer", {
        userID: user?.id,
        tipId: tip.id,
        selectedAnswer: selectedOption 
      });

      setResult(res.data);
      
      // If correct, notify parent to update points/UI
      if (res.data.isCorrect && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to submit answer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Daily Safety Tip</h2>
          <button className="modal-close-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {errorMsg && <p className="error-msg">⚠️ {errorMsg}</p>}
          
          {!result && tip && Array.isArray(tip.options) ? (
            <div className="tip-content">
              <div className="chat-bubble">
                {tip.scenario}
              </div>

              <div className="quiz-options-stack">
                {/* Display the actual question from the controller */}
                <p className="quiz-question-text"><strong>Question:</strong> {tip.question}</p>
                
                {tip.options.map((opt) => (
                  <label 
                    key={opt.id} 
                    className={`quiz-option-label ${selectedOption === opt.text ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="tip-option"
                      checked={selectedOption === opt.text}
                      onChange={() => setSelectedOption(opt.text)}
                    />
                    {opt.text}
                  </label>
                ))}
              </div>
              
              <div className="action-row">
                <button className="btn-secondary action-half-btn" onClick={onClose}>
                  Skip
                </button>
                <button 
                  className="auth-button action-half-btn" 
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedOption}
                >
                  {isLoading ? "Checking..." : "Submit Answer"}
                </button>
              </div>
            </div>
          ) : result ? (
            <div className="quiz-result-box">
              <div className={`ending-banner ${result.isCorrect ? "safe" : "unsafe"}`}>
                {result.isCorrect ? "✅ Correct!" : "❌ Not quite..."}
              </div>
              <p className="explanation-text">
                {result.explanation || result.message}
              </p>
              
              <div className="action-row">
                {/* If wrong, let them try the same one again; if correct, load new */}
                <button 
                  className="btn-secondary action-half-btn" 
                  onClick={() => result.isCorrect ? loadRandomTip() : setResult(null)}
                >
                  {result.isCorrect ? "Another Tip" : "Try Again"}
                </button>
                <button className="auth-button action-half-btn" onClick={onClose}>
                  {result.isCorrect ? "Got it!" : "Close"}
                </button>
              </div>
            </div>
          ) : (
            !errorMsg && <div className="loading-state">Finding a tip for you...</div>
          )}
        </div>
      </div>
    </div>
  );
}

SafetyTipModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default SafetyTipModal;