import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { overlayStyle, modalStyle } from "./common/modalStyle";

const inputStyle = {
  width: "95%",
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 14
};

function headerText(action) {
  if (action === "reportPost") return "Report a harmful post";
  if (action === "reportGood") return "Report helpful/good content";
  return "Report";
}

function ReportModal({ isOpen, action, onClose, onSubmit }) {
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [details, setDetails] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPlatform("");
    setUrl("");
    setDetails("");
    setStatusMsg("");
    setIsSubmitting(false);
  }, [isOpen, action]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const submit = async () => {
    setStatusMsg("");

    if (!platform.trim()) {
      setStatusMsg("Please enter a platform (e.g., Instagram, TikTok).");
      return;
    }

    if (!details.trim() || details.trim().length < 10) {
      setStatusMsg("Please add a bit more detail (at least ~10 characters).");
      return;
    }

    const description =
      `Platform: ${platform}\n` +
      `Link: ${url || "N/A"}\n` +
      `${action === "reportPost" ? "What happened" : "Why it’s good"}: ${details}`;

    setIsSubmitting(true);
    try {
      await onSubmit({ action, description });
    } finally {
      setIsSubmitting(false);
    }
  };


    return (
        <div style={overlayStyle} onMouseDown={onClose}>
          <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <h2 style={{ margin: 0 }}>{headerText(action)}</h2>
              <button
                onClick={onClose}
                style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Platform *</label>
              <input
                style={inputStyle}
                placeholder="Instagram / TikTok / Reddit / X / ..."
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                disabled={isSubmitting}
              />

              <label style={{ display: "block", margin: "12px 0 6px" }}>Link (optional)</label>
              <input
                style={inputStyle}
                placeholder="Paste URL if available"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isSubmitting}
              />

              <label style={{ display: "block", margin: "12px 0 6px" }}>
                {action === "reportPost" ? "What happened? *" : "Why is it good/helpful? *"}
              </label>
              <textarea
                style={{ ...inputStyle, height: 120, resize: "vertical" }}
                placeholder={
                  action === "reportPost"
                    ? "Describe the problem (harassment, scam, hate, impersonation, etc.)"
                    : "Describe why this content is helpful/positive"
                }
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={isSubmitting}
              />

              {statusMsg && (
                <div style={{ marginTop: 12, color: "#b00020", fontWeight: "bold" }}>
                  {statusMsg}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  backgroundColor: "white",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={isSubmitting}
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
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    ReportModal.propTypes = {
      isOpen: PropTypes.bool.isRequired,
      action: PropTypes.oneOf(["reportPost", "reportGood"]),
      onClose: PropTypes.func.isRequired,
      onSubmit: PropTypes.func.isRequired
    };

export default ReportModal;