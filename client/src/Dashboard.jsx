import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "./services/api";
import TaskCard from "./components/TaskCard";
import ScoreCenter from "./components/ScoreCenter";
import LogoutButton from "./components/LogoutButton";
import MonthlyGoalBar from "./components/MonthlyGoalBar";
import SafetyTipQuizModal from "./components/SafetyTipQuiz";
import ReportModal from "./components/ReportModal";
import FeedbackToast from "./components/FeedbackToast";
import SimulationModal from "./components/SimulationModal";

function Dashboard() {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportAction, setReportAction] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: "success", message: "" });

  const [userData, setUserData] = useState({
    username: "",
    totalPoints: 0,
    weeklyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
    weeklyTargets: { reportPost: 5, safetyTips: 5, reportGood: 5, simulation: 0 },
    monthlyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
    monthlyTargets: { reportPost: 20, safetyTips: 20, reportGood: 20, simulation: 20 },
    monthlyGoalAchieved: false
  });

  const loadSummary = async () => {
    const userString = localStorage.getItem("besafe_user");
    if (!userString) return;

    const user = JSON.parse(userString);
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(`/reports/summary/${user.id}`);
      setUserData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadSummary();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: "success", message: "" });
    }, 3500);
  };

  const openReportModal = (action) => {
    setReportAction(action);
    setIsReportOpen(true);
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
    setReportAction(null);
  };

  const submitReport = async ({ action, description }) => {
    const user = JSON.parse(localStorage.getItem("besafe_user"));
    if (!user?.id) return;

    try {
      await api.post("/reports", { userId: user.id, action, description });
      await loadSummary();
      showFeedback("success", "Report accepted - keep it up!");
      closeReportModal();
    } catch (error) {
      const msg = error?.response?.data?.reason || error?.response?.data?.message || error.message;
      showFeedback("error", `Report rejected: ${msg}`);
    }
  };

  const openSimulation = () => setIsSimOpen(true);
  const closeSimulation = () => setIsSimOpen(false);

  if (isLoading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <LogoutButton />

      <FeedbackToast
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: "success", message: "" })}
      />

      <SafetyTipQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSuccess={loadSummary}
      />

      <SimulationModal
        isOpen={isSimOpen}
        onClose={closeSimulation}
        onSuccess={loadSummary}
      />

      <ReportModal
        isOpen={isReportOpen}
        action={reportAction}
        onClose={closeReportModal}
        onSubmit={submitReport}
      />

      <h1 style={styles.header}>Hello, {userData.username}! 👋</h1>
      <h4 style={styles.subHeader}>
        Thanks for making the internet a safer place
      </h4>

      <div style={styles.buttonWrapper}>
        <button
          onClick={() => navigate("/store")}
          style={styles.storeButton}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          🛍️ Visit Reward Store
        </button>
      </div>

      <div style={styles.contentWrapper}>
        
        <div style={styles.topCardRow}>
          <TaskCard 
            title="Simulation" 
            score={userData.weeklyCounts.simulation || 0} 
            total={userData.weeklyTargets?.simulation || 5} 
            color="#7E57C2" 
            onUpdate={openSimulation}
          />
          <div style={{ width: '20px' }}></div>
          <TaskCard
            title="Report Post"
            score={userData.weeklyCounts.reportPost || 0}
            total={userData.weeklyTargets?.reportPost || 5}
            color="#FF4D4D"
            onUpdate={() => openReportModal("reportPost")}
          />
        </div>

        <div style={styles.scoreWrapper}>
          <ScoreCenter score={userData.totalPoints} />
        </div>

        <div style={styles.bottomCardRow}>
          <TaskCard
            title="Safety Tips"
            score={userData.weeklyCounts?.safetyTips || 0}
            total={userData.weeklyTargets?.safetyTips || 5}
            color="#FF9F1C"
            onUpdate={() => setIsQuizOpen(true)}
          />
          
          <TaskCard
            title="Report Good"
            score={userData.weeklyCounts?.reportGood || 0}
            total={userData.weeklyTargets?.reportGood || 5}
            color="#00C851"
            onUpdate={() => openReportModal("reportGood")}
          />
        </div>

        <MonthlyGoalBar
          monthlyCounts={userData.monthlyCounts}
          monthlyTargets={userData.monthlyTargets}
          actions={["reportPost", "safetyTips", "reportGood"]}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  loading: {
    textAlign: "center",
    marginTop: "50px",
  },
  header: {
    textAlign: "center",
  },
  subHeader: {
    textAlign: "center",
    marginBottom: "20px",
  },
  buttonWrapper: {
    textAlign: "center",
    marginBottom: "30px",
  },
  storeButton: {
    background: "linear-gradient(45deg, #FF9F1C, #FF4D4D)",
    color: "white",
    border: "none",
    padding: "12px 30px",
    borderRadius: "25px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(255, 77, 77, 0.4)",
    transition: "transform 0.2s",
  },
  contentWrapper: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  topCardRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "-20px",
  },
  scoreWrapper: {
    position: "relative",
    zIndex: 10,
  },
  bottomCardRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "-20px",
  },
};

export default Dashboard;