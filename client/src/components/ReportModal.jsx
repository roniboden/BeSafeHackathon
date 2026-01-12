import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../styles/ModalStyle.css"; 

function headerText(action) {
  if (action === "reportPost") return "Report Harmful Content";
  if (action === "reportGood") return "Report Positive Content";
  return "Report";
}

function ReportModal({ isOpen, action, onClose, onSubmit }) {
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [details, setDetails] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPlatform(""); setUrl(""); setDetails(""); setStatusMsg(""); 
    setSelectedFile(null); // Reset file on open
    setIsSubmitting(false);
  }, [isOpen, action]);

  if (!isOpen) return null;

  const handleFormSubmit = async () => {
    if (!platform.trim()) return setStatusMsg("Specify a platform.");
    if (details.trim().length < 10) return setStatusMsg("Provide more details.");
    if (!selectedFile) return setStatusMsg("Please upload a screenshot/image for verification.");

    const description = `Platform: ${platform}\nLink: ${url || "N/A"}\nDetails: ${details}`;
    setIsSubmitting(true);
    try {
      // Pass the file along with the text data
      await onSubmit({ action, description, file: selectedFile });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{headerText(action)}</h2>
          <button className="modal-close-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <div className="input-field">
            <label>Platform *</label>
            <input
              className="modal-input"
              placeholder="e.g. TikTok, Instagram"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Image Evidence *</label>
            <input 
              type="file" 
              accept="image/*" 
              className="modal-input"
              onChange={(e) => setSelectedFile(e.target.files[0])} 
            />
            {selectedFile && <p className="file-name">Selected: {selectedFile.name}</p>}
          </div>

          <div className="input-field">
            <label>{action === "reportPost" ? "Problem Description *" : "Description *"}</label>
            <textarea
              className="modal-input"
              style={{ height: 100, resize: "none" }}
              placeholder="Tell us more..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          {statusMsg && <p className="error-msg">{statusMsg}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="submit-report-btn" 
            onClick={handleFormSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

ReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  action: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default ReportModal;