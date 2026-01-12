import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import "../styles/ModalStyle.css"; // Using the consolidated CSS file

function SimulationModal({ isOpen, onClose, onSuccess }) {
  const [category, setCategory] = useState("scam");
  const [scenario, setScenario] = useState(null);
  const [node, setNode] = useState(null);
  const [ending, setEnding] = useState(null);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState(null); 

  const [userText, setUserText] = useState("");
  const [coachMsg, setCoachMsg] = useState(null);
  const [aiPick, setAiPick] = useState(null);
  const [pendingOptionId, setPendingOptionId] = useState(null);

  const [statusMsg, setStatusMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setScenario(null); setNode(null); setEnding(null); setResult(null);
    setStatusMsg(""); setIsLoading(false); setCategory("scam");
    setMode(null); setUserText(""); setCoachMsg(null); setAiPick(null); setPendingOptionId(null);
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) loadScenario(category);
  }, [isOpen, category]);

  if (!isOpen) return null;

  async function loadScenario(cat) {
    setIsLoading(true); setStatusMsg(""); setScenario(null); setNode(null);
    setEnding(null); setResult(null); setMode(null); setUserText("");
    setCoachMsg(null); setAiPick(null); setPendingOptionId(null);

    try {
      const res = await api.get(`/simulations/scenario?category=${encodeURIComponent(cat)}`);
      setScenario(res.data.scenario);
      setNode(res.data.node);
    } catch (err) {
      setStatusMsg(err?.response?.data?.error || "Failed to load scenario");
    } finally {
      setIsLoading(false);
    }
  }

  async function step(optionId) {
    if (!scenario || !node) return;
    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem("besafe_user"));
    try {
      const res = await api.post("/simulations/step", {
        scenarioId: scenario.id, nodeId: node.id, optionId, userId: user?.id
      });
      setUserText(""); setCoachMsg(null); setAiPick(null); setPendingOptionId(null);
      if (res.data.done) {
        setEnding(res.data.ending); setResult(res.data.result); setNode(null);
        if (onSuccess) onSuccess();
      } else {
        setNode(res.data.node);
      }
    } catch (err) {
      setStatusMsg(err?.response?.data?.error || "Error loading scenario");
    } finally {
      setIsLoading(false);
    }
  }

  async function requestCoachSuggestion() {
    setIsLoading(true); setCoachMsg(null); setAiPick(null);
    try {
      const res = await api.post("/simulations/coach", {
        scenarioId: scenario.id, nodeId: node.id, userText
      });
      setCoachMsg(res.data.coach); setAiPick(res.data.suggestion);
      setPendingOptionId(res.data?.suggestion?.optionId);
      setUserText("");
    } catch (err) {
      setStatusMsg(err?.response?.data?.error || "Error moving to next step");
    } finally {
      setIsLoading(false);
    }
  }

  const headerTitle = ending ? "Simulation Result" : scenario?.title || "Safety Simulation";

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{headerTitle}</h2>
            {!ending && scenario && (
              <div className="pill-container">
                <span className="pill-badge">{scenario.channel}</span>
                <span className="pill-badge">{scenario.category}</span>
              </div>
            )}
          </div>
          <button className="modal-close-x" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {!ending && (
            <div className="category-row">
              <label>Choose Category:</label>
              <select 
                className="modal-input-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
              >
                <option value="scam">Scam</option>
                <option value="harassment">Harassment</option>
              </select>
              <button className="btn-new-scenario" onClick={() => loadScenario(category)}>
                New Scenario
              </button>
            </div>
          )}

          {statusMsg && <p className="error-msg">{statusMsg}</p>}

          {isLoading && !scenario && <div className="loading-spinner">Loading Scenario...</div>}

          {/* MODE CHOOSER - Side by Side Buttons */}
          {!ending && scenario && node && mode === null && (
            <div className="mode-selection-box">
              <h3>How do you want to play?</h3>
              <p>Choose a style. You can switch anytime.</p>
              <div className="mode-btn-group">
                <button className="auth-button mode-half-btn" onClick={() => setMode("quiz")}>
                  Quiz Mode
                </button>
                <button className="btn-secondary mode-half-btn" onClick={() => setMode("free")}>
                  Free Text + Coach
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE SCENARIO - Ensuring classes persist */}
          {!ending && scenario && node && mode !== null && (
            <div className="scenario-active-box">
              <div className="mode-switcher">
                <button className="btn-text-only" onClick={() => setMode(mode === "quiz" ? "free" : "quiz")}>
                  Switch to {mode === "quiz" ? "Free Text" : "Quiz Mode"}
                </button>
              </div>

              {/* Message bubble from scenario */}
              <div className="chat-bubble">
                <strong>Scenario:</strong><br />
                {node.message}
              </div>

              {mode === "quiz" ? (
                <div className="quiz-options">
                  {node.options?.map((opt) => (
                    <button key={opt.id} className="quiz-opt-btn" onClick={() => step(opt.id)}>
                      {opt.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="free-text-zone">
                  <textarea
                    className="modal-input"
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    placeholder="Type what you would do..."
                    disabled={isLoading}
                    style={{ height: "90px" }}
                  />
                  <div className="action-row">
                    <button className="auth-button" disabled={isLoading || userText.length < 3} onClick={requestCoachSuggestion}>
                      Ask Coach
                    </button>
                    <button className="btn-secondary" disabled={!pendingOptionId} onClick={() => step(pendingOptionId)}>
                      Continue
                    </button>
                  </div>

                  {coachMsg && (
                    <div className="coach-feedback">
                      <strong>Coach:</strong>
                      <p>{coachMsg.message}</p>
                      {coachMsg.followUp && <em>{coachMsg.followUp}</em>}
                    </div>
                  )}
                  {aiPick && (
                    <div className="coach-suggestion">
                      <strong>Suggestion:</strong> {aiPick.optionText}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ENDING */}
          {ending && (
            <div className="ending-box">
              <div className={`ending-banner ${ending.type}`}>
                {ending.type === "safe" ? "✅ Safe Outcome" : "⚠️ Unsafe Outcome"}
              </div>
              <p>{ending.summary}</p>
              {result && (
                <div className="points-display">
                  🏆 Points earned: <strong>{result.pointsEarned}</strong>
                </div>
              )}
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => loadScenario(category)}>Play Again</button>
                <button className="auth-button" onClick={onClose}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

SimulationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default SimulationModal;