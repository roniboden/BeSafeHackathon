import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import { overlayStyle, modalStyle } from "./common/modalStyle";


function SafetyTipQuizModal({ isOpen, onClose, onSuccess }) {
  const [tip, setTip] = useState(null);
  const [selected, setSelected] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const user = JSON.parse(localStorage.getItem("besafe_user"));
  const userID = user?.id;

  const fetchTip = async () => {
    setIsLoadingTip(true);
    setStatusMsg("");
    setSelected("");
    try {
      const res = await api.get("/tips/random");
      setTip(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.reason ||
        err.message;
      setStatusMsg(msg);
      setTip(null);
    } finally {
      setIsLoadingTip(false);
    }
  };

  useEffect(() => {
  if (isOpen) {
    setIsCorrect(false);
    fetchTip();
  }
}, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const submitAnswer = async () => {
    if (!userID) {
      setStatusMsg("User not found. Please log in again.");
      return;
    }
    if (!tip?.id) {
      setStatusMsg("No tip loaded.");
      return;
    }
    if (!selected) {
      setStatusMsg("Please choose an answer.");
      return;
    }

    setIsSubmitting(true);
    setStatusMsg("");

    try {
      const res = await api.post("/tips/answer", {
        userID,
        tipId: tip.id,          // IMPORTANT: matches backend tipId
        selectedAnswer: selected
      });

      if (res.data.isCorrect) {
        setIsCorrect(true);
        setStatusMsg(res.data.message || "Correct!");
        onSuccess?.(); // refresh dashboard data
        return;
      } else {
        setStatusMsg(res.data.message || "Wrong answer, try again!");
        // keep the same tip so they can retry
      }
    } catch (err) {
      const msg =
        err?.response?.data?.reason ||
        err?.response?.data?.message ||
        err.message;
      setStatusMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onMouseDown={onClose}>
      <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Safety Tip Quiz</h2>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {isLoadingTip && <div style={{ marginTop: 12 }}>Loading tip…</div>}

        {!isLoadingTip && tip && (
          <div style={{ marginTop: 12 }}>
            <h3 style={{ margin: "6px 0" }}>{tip.title}</h3>
            <p style={{ marginTop: 8, lineHeight: 1.4 }}>{tip.text}</p>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                {tip.quiz?.question}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {(tip.quiz?.options || []).map((opt) => (
                  <label
                    key={opt}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 10,
                      padding: 10,
                      backgroundColor: selected === opt ? "#f0f7ff" : "white",
                      opacity: isCorrect ? 0.7 : 1,
                      cursor: isCorrect ? "default" : "pointer"
                    }}
                  >
                    <input
                      type="radio"
                      name="quiz"
                      value={opt}
                      checked={selected === opt}
                      disabled = {isCorrect}
                      onChange={() => setSelected(opt)}
                      style={{ marginRight: 10 }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {statusMsg && (
          <div style={{ marginTop: 12, color: "#b00020", fontWeight: "bold" }}>
            {statusMsg}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            {!isCorrect && (
                    <>
                    <button
                        onClick={fetchTip}
                        disabled={isLoadingTip || isSubmitting}
                        style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        backgroundColor: "white",
                        cursor: "pointer"
                        }}
                    >
                        New Tip
                    </button>

                    <button
                        onClick={submitAnswer}
                        disabled={isLoadingTip || isSubmitting}
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
                        {isSubmitting ? "Submitting…" : "Submit Answer"}
                    </button>
                    </>
                )}

                {isCorrect && (
                    <button
                    onClick={onClose}
                    style={{
                        padding: "10px 18px",
                        borderRadius: 8,
                        border: "none",
                        backgroundColor: "#00C851",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                    >
                    Continue
                    </button>
                )}
         </div>
      </div>
    </div>
  );
}

SafetyTipQuizModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default SafetyTipQuizModal;
