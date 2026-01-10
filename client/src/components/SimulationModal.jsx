import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import { overlayStyle, modalStyle } from "./common/modalStyle";

const pillStyle = {
  fontSize: 12,
  padding: "4px 8px",
  border: "1px solid #ccc",
  borderRadius: 999
};

const buttonStyle = {
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "white",
  cursor: "pointer"
};

function SimulationModal({ isOpen, onClose, onSuccess }) {
    const [category, setCategory] = useState("phishing");
    const [scenario, setScenario] = useState(null);
    const [node, setNode] = useState(null);
    const [ending, setEnding] = useState(null);
    const [result, setResult] = useState(null);

    const [advanced, setAdvanced] = useState(false);
    const [userText, setUserText] = useState("");
    const [aiPick, setAiPick] = useState(null);

    const [statusMsg, setStatusMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
    if (!isOpen) return;

    // reset state when opened
    setScenario(null);
    setNode(null);
    setEnding(null);
    setResult(null);
    setStatusMsg("");
    setIsLoading(false);
    setCategory("phishing");
    setAdvanced(false);
    setUserText("");
    setAiPick(null);
    }, [isOpen]);

    useEffect(() => {
    const onKey = (e) => {
        if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    useEffect(() => {
    if (!isOpen) return;
    // load a scenario when modal opens or category changes
    loadScenario(category);
    }, [isOpen, category]);

    if (!isOpen) return null;

    async function loadScenario(cat) {
    setIsLoading(true);
    setStatusMsg("");
    setScenario(null);
    setNode(null);
    setEnding(null);
    setResult(null);

    try {
        const res = await api.get(`/simulations/scenario?category=${encodeURIComponent(cat)}`);
        setScenario(res.data.scenario);
        setNode(res.data.node);
    } catch (err) {
        const msg = err?.response?.data?.error || err.message || "Failed to load scenario";
        setStatusMsg(msg);
    } finally {
        setIsLoading(false);
    }
  }

  async function step(optionId) {
    if (!scenario || !node) return;

    setIsLoading(true);
    setStatusMsg("");

    const user = JSON.parse(localStorage.getItem("besafe_user"));
    const userId = user?.id;

    try {
      const res = await api.post("/simulations/step", {
        scenarioId: scenario.id,
        nodeId: node.id,
        optionId,
        userId
      });

      const data = res.data;

      if (data.done) {
        setEnding(data.ending);
        setResult(data.result);
        setNode(null);

        // refresh dashboard stats (points) after completion
        if (onSuccess) onSuccess();
      } else {
        setNode(data.node);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Failed to continue scenario";
      setStatusMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }

  const headerTitle = ending
    ? "Simulation Result"
    : scenario
      ? scenario.title
      : "Safety Simulation";

  return (
    <div style={overlayStyle} onMouseDown={onClose}>
      <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>{headerTitle}</h2>

            {/* Pills */}
            {!ending && scenario && (
              <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <span style={pillStyle}>{scenario.channel}</span>
                <span style={pillStyle}>{scenario.category}</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Category + New scenario */}
        {!ending && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
            <label style={{ fontWeight: "bold" }}>Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ccc" }}
            >
              <option value="phishing">Phishing</option>
              <option value="scam">Scam</option>
              <option value="harassment">Harassment</option>
            </select>

            <button
              onClick={() => loadScenario(category)}
              disabled={isLoading}
              style={{
                marginLeft: "auto",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              New Scenario
            </button>
          </div>
        )}

        {/* Status */}
        {statusMsg && (
          <div style={{ marginTop: 12, color: "#b00020", fontWeight: "bold" }}>
            {statusMsg}
          </div>
        )}

        {/* Body */}
        <div style={{ marginTop: 14 }}>
          {isLoading && !scenario && <div>Loading...</div>}

          {/* Active node */}
                {scenario && node && (
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, marginBottom: 12 }}>
            {node.message}
            </div>

            {/* NORMAL MODE OPTIONS */}
            {!advanced && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(node.options || []).map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => step(opt.id)}
                    disabled={isLoading}
                    style={{
                    ...buttonStyle,
                    opacity: isLoading ? 0.7 : 1
                    }}
                >
                    {opt.text}
                </button>
                ))}
            </div>
            )}


              {isLoading && <div style={{ marginTop: 12 }}>Working...</div>}
            </div>
          )}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eee" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                type="checkbox"
                checked={advanced}
                onChange={(e) => {
                    setAdvanced(e.target.checked);
                    setAiPick(null);
                    setUserText("");
                }}
                disabled={isLoading}
                />
                Advanced: type what you would do
            </label>

            {advanced && (
                <div style={{ marginTop: 10 }}>
                <textarea
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    placeholder="Type your response, how would you act in this situation?"
                    disabled={isLoading}
                    style={{ width: "95%", height: 90, borderRadius: 8, border: "1px solid #ccc", padding: 10 }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                    <button
                    disabled={isLoading || userText.trim().length < 3}
                    onClick={async () => {
                        setIsLoading(true);
                        setStatusMsg("");
                        setAiPick(null);

                        const user = JSON.parse(localStorage.getItem("besafe_user"));
                        const userId = user?.id;

                        try {
                        const res = await api.post("/simulations/advanced-step", {
                            scenarioId: scenario.id,
                            nodeId: node.id,
                            userText,
                            userId
                        });

                        const data = res.data;
                        setAiPick(data.ai || null);

                        if (data.done) {
                            setEnding(data.ending);
                            setResult(data.result);
                            setNode(null);
                            if (onSuccess) onSuccess();
                        } else {
                            setNode(data.node);
                        }

                        setUserText("");
                        } catch (err) {
                        const msg = err?.response?.data?.error || err.message || "Advanced step failed";
                        setStatusMsg(msg);
                        } finally {
                        setIsLoading(false);
                        }
                    }}
                    style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "none",
                        backgroundColor: "#7E57C2",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                    >
                    Use AI to choose
                    </button>
                </div>

                {aiPick && (
                    <div style={{ marginTop: 10, background: "#f6f6f6", padding: 10, borderRadius: 10 }}>
                    <strong>AI chose:</strong> {aiPick.chosenOptionText}
                    {aiPick.reason ? <div style={{ marginTop: 6 }}><em>{aiPick.reason}</em></div> : null}
                    </div>
                )}
                </div>
            )}
            </div>

          {/* Ending */}
          {ending && (
            <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
              <h3 style={{ marginTop: 0 }}>
                {ending.type === "safe" ? "✅ Safe outcome" : "⚠️ Unsafe outcome"}
              </h3>
              <div style={{ whiteSpace: "pre-wrap" }}>{ending.summary}</div>

              {result && (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f6f6f6" }}>
                  <strong>Points earned:</strong> {result.pointsEarned}
                </div>
              )}

              {result?.handlingSummary && (
                <div style={{ marginTop: 14 }}>
                  <h4 style={{ marginBottom: 6 }}>{result.handlingSummary.title}</h4>
                  <ul style={{ marginTop: 6 }}>
                    {(result.handlingSummary.steps || []).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>

                  {result.handlingSummary.whyThisWorks && (
                    <>
                      <h4 style={{ marginBottom: 6 }}>Why this works</h4>
                      <ul style={{ marginTop: 6 }}>
                        {result.handlingSummary.whyThisWorks.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                <button
                  onClick={() => loadScenario(category)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    backgroundColor: "white",
                    cursor: "pointer"
                  }}
                >
                  Play again
                </button>

                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: "#00C851",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
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
  onSuccess: PropTypes.func // call to refresh points/summary on dashboard
};

export default SimulationModal;
