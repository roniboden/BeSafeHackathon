import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router'; 
import './styles/Dashboard.css';
import TaskCard from "./components/TaskCard";
import LogoutButton from "./components/LogoutButton";
import MonthlyGoalBar from "./components/MonthlyGoalBar";
import SafetyTipQuizModal from "./components/SafetyTipQuiz";
import ReportModal from "./components/ReportModal";
import FeedbackToast from "./components/FeedbackToast";
import SimulationModal from "./components/SimulationModal";
// Removed TopLeftStats import
import api from './services/api';

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
    streak: { current: 0 },
    weeklyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
    weeklyTargets: { reportPost: 5, safetyTips: 5, reportGood: 5, simulation: 5 },
    monthlyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
    monthlyTargets: { reportPost: 20, safetyTips: 20, reportGood: 20, simulation: 20 },
  });

  const loadSummary = async () => {
    const userString = localStorage.getItem("besafe_user");
    if (!userString) return;
    
    const user = JSON.parse(userString);
    // Ensure we are passing a clean ID
    const userId = user.id;

    try {
      const response = await api.get(`/reports/summary/${userId}`);
      
      // Validate that we actually got data
      if (response.data) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Dashboard Load Error:", error);
      // Optional: if 401/403, redirect to login
      if (error.response?.status === 404) {
        console.warn("User session invalid, check localStorage");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadSummary();
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const openReportModal = (action) => {
    setReportAction(action);
    setIsReportOpen(true);
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
    setReportAction(null);
  };

  const openSafetyQuiz = () => setIsQuizOpen(true);
  const closeSafetyQuiz = () => setIsQuizOpen(false);
  const openSimulation = () => setIsSimOpen(true);
  const closeSimulation = () => setIsSimOpen(false);

  const submitReport = async ({ action, description, file }) => {
    const user = JSON.parse(localStorage.getItem("besafe_user"));
    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("action", action);
    formData.append("description", description);
    formData.append("image", file);
    
    try {
      // This triggers your validateReport logic on the backend/helper
      await api.post("/reports", formData);
      
      await loadSummary();
      setFeedback({ 
        type: "success", 
        message: "Report accepted! You've earned points." 
      });
      closeReportModal();
    } catch (error) {
      // Extract the specific AI fields you defined in validateReport
      const serverData = error?.response?.data;
      const informativeReason = serverData?.reason || "Invalid Submission.";

      // Use a multi-line string or a formatted object for the toast
      // This ensures the user sees the "Gibberish" reason clearly
      setFeedback({ 
        type: "error", 
        message: informativeReason
      });

      // We do NOT close the modal so the user can see the reason and edit their text
    }
  };

  if (isLoading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="user-welcome">
          <h1>Hello, {userData.username}! 👋</h1>
          <p>Thanks for making the internet a safer place.</p>
        </div>
        
        <div className="nav-controls">
        {/* Refined Streak Badge */}
        <div className="streak-badge">
          <span className="fire-icon">🔥</span>
          <span className="streak-value">{userData.streak?.current ?? 0}</span>
        </div>

        {/* Modern Shop Button (Coins) */}
        <button className="points-shop-button" onClick={() => navigate("/shop")}>
          <div className="points-icon-container">
            <span className="bank-icon">🏛️</span>
          </div>
          <div className="points-label-container">
            <span className="points-label">SAFETY POINTS</span>
            <span className="points-amount">{userData.totalPoints?.toLocaleString() ?? 0}</span>
          </div>
        </button>

        <button className="profile-button" onClick={() => navigate("/profile")}>
          <div className="profile-avatar">
            {userData.username.charAt(0).toUpperCase()}
          </div>
        </button>

          <LogoutButton />
        </div>
      </nav>

      <FeedbackToast
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: "success", message: "" })}
      />

      <main>
        <div className="task-grid">
          <TaskCard 
            title="Simulation" 
            score={userData.weeklyCounts.simulation || 0} 
            total={userData.weeklyTargets?.simulation || 5} 
            color="#7E57C2" 
            onUpdate={openSimulation}
          />
          <TaskCard 
            title="Report Post" 
            score={userData.weeklyCounts.reportPost || 0} 
            total={userData.weeklyTargets?.reportPost || 5} 
            color="#FF4D4D" 
            onUpdate={() => openReportModal("reportPost")}
          />
          <TaskCard 
            title="Safety Tips" 
            score={userData.weeklyCounts?.safetyTips || 0} 
            total={userData.weeklyTargets?.safetyTips || 5} 
            color="#FF9F1C" 
            onUpdate={openSafetyQuiz} 
          />
          <TaskCard 
            title="Report Good" 
            score={userData.weeklyCounts?.reportGood || 0} 
            total={userData.weeklyTargets?.reportGood || 5} 
            color="#00C851" 
            onUpdate={() => openReportModal("reportGood")} 
          />
        </div>

        <section className="monthly-progress-card">
          <MonthlyGoalBar
            monthlyCounts={userData.monthlyCounts}
            monthlyTargets={userData.monthlyTargets}
          />
        </section>
      </main>
      
      <ReportModal isOpen={isReportOpen} action={reportAction} onClose={closeReportModal} onSubmit={submitReport} />
      <SafetyTipQuizModal isOpen={isQuizOpen} onClose={closeSafetyQuiz} onSuccess={loadSummary} />
      <SimulationModal isOpen={isSimOpen} onClose={closeSimulation} onSuccess={loadSummary} />
    </div>
  );
}

export default Dashboard;