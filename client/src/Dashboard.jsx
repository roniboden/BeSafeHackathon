import { useState, useEffect } from 'react';
import TaskCard from "./components/TaskCard";
import ScoreCenter from './components/ScoreCenter';
import LogoutButton from "./components/LogoutButton";
import MonthlyGoalBar from "./components/MonthlyGoalBar";
import SafetyTipQuizModal from "./components/SafetyTipQuiz";
import ReportModal from "./components/ReportModal";
import FeedbackToast from "./components/FeedbackToast";
import SimulationModal from "./components/SimulationModal";
import api from './services/api';

function Dashboard() {
  const [userData, setUserData] = useState({
    username: "",
    totalPoints: 0,
    weeklyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
    weeklyTargets: { reportPost: 5, safetyTips: 5, reportGood: 5, simulation: 5 },
    monthlyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
    monthlyTargets: { reportPost: 20, safetyTips: 20, reportGood: 20, simulation: 20 },
    monthlyGoalAchieved: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportAction, setReportAction] = useState(null);
  const [feedback, setFeedback] = useState({ type: "success", message: "" });
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);

  const loadSummary = async () => {
    const user = JSON.parse(localStorage.getItem("besafe_user"));
    const userID = user?.id;
    if (!userID) return;

    try {
      const response = await api.get(`/reports/summary/${userID}`);
      setUserData(response.data);
    } catch (error) {
      console.error("Error loading summary:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    async function initDashboard() {
      try {
        await loadSummary();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initDashboard();
    return () => { isMounted = false; };
  }, []);

  const openReportModal = (action) => { setReportAction(action); setIsReportOpen(true); };
  const closeReportModal = () => { setIsReportOpen(false); setReportAction(null); };
  const openSafetyQuiz = () => setIsQuizOpen(true);
  const closeSafetyQuiz = () => setIsQuizOpen(false);
  const openSimulation = () => setIsSimOpen(true);
  const closeSimulation = () => setIsSimOpen(false);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "success", message: "" }), 3500);
  };

  const submitReport = async ({ action, description }) => {
    const user = JSON.parse(localStorage.getItem('besafe_user'));
    const userID = user?.id;
    try {
      await api.post("/reports", { userID, action, description });
      await loadSummary();
      showFeedback("success", "Report accepted - keep it up!");
      closeReportModal();
    } catch (error) {
      showFeedback("error", `Report rejected: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#64748b' }}>
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <LogoutButton />
      <FeedbackToast 
        type={feedback.type} 
        message={feedback.message} 
        onClose={() => setFeedback({ type: "success", message: "" })} 
      />

      <SafetyTipQuizModal isOpen={isQuizOpen} onClose={closeSafetyQuiz} onSuccess={loadSummary} />
      <SimulationModal isOpen={isSimOpen} onClose={closeSimulation} onSuccess={loadSummary} />

      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.h1}>Hello, {userData.username}! 👋</h1>
            <p style={styles.subtitle}>Thanks for making the internet a safer place.</p>
          </div>
          <ScoreCenter score={userData.totalPoints} />
        </header>

        <div style={styles.grid}>
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

        <ReportModal
          isOpen={isReportOpen}
          action={reportAction}
          onClose={closeReportModal}
          onSubmit={submitReport}
        />
        
        <div style={styles.footerCard}>
          <MonthlyGoalBar
            monthlyCounts={userData.monthlyCounts}
            monthlyTargets={userData.monthlyTargets}
            actions={["reportPost", "safetyTips", "reportGood"]}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Inter", system-ui, sans-serif' },
  container: { maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' },
  h1: { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '16px', marginTop: '6px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' },
  footerCard: { background: '#ffffff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }
};

export default Dashboard;