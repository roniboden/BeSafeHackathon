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
    weeklyTargets: { reportPost: 5, safetyTips: 5, reportGood: 5, simulation: 0 },

    monthlyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
    monthlyTargets: { reportPost: 20, safetyTips: 20, reportGood: 20, simulation: 20 },

    monthlyGoalAchieved: false
  });
  
  const [isLoading, setIsLoading] = useState(true);

  const loadSummary = async () => {
    const user = JSON.parse(localStorage.getItem("besafe_user"));
    const userID = user?.id;

    if (!userID) {
      console.error("User not found in localStorage");
      setIsLoading(false);
      return;
    }

    const response = await api.get(`/reports/summary/${userID}`);
    setUserData(response.data);
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

  // report tasks
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportAction, setReportAction] = useState(null);

  const openReportModal = (action) => {
    setReportAction(action);
    setIsReportOpen(true);
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
    setReportAction(null);
  };

  const [feedback, setFeedback] = useState({ type: "success", message: "" });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    // auto-hide after 3.5s
    window.clearTimeout(showFeedback._t);
    showFeedback._t = window.setTimeout(() => {
      setFeedback({ type: "success", message: "" });
    }, 3500);
  };

  const submitReport = async ({ action, description }) => {
    const user = JSON.parse(localStorage.getItem('besafe_user'));
    const userID = user?.id;

    if(!userID){
      console.log("User not found in report submission");
      return;
    }
    try{
    await api.post("/reports", {userID, action, description});
    await loadSummary();
    showFeedback("success", "Report accepted - keep it up!");
    closeReportModal();
    } catch (error){
      const msg =
        error?.response?.data?.reason ||
        error?.response?.data?.message ||
        error.message;

        showFeedback("error", `Report rejected: ${msg}`);
    }
  };
  
  //safety tips 
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const openSafetyQuiz = () => setIsQuizOpen(true);
  const closeSafetyQuiz = () => setIsQuizOpen(false);

  // simulation
  const [isSimOpen, setIsSimOpen] = useState(false);
  const openSimulation = () => setIsSimOpen(true);
  const closeSimulation = () => setIsSimOpen(false);


  if (isLoading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading...</div>;


  return (
    
    <div style={{ 
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      <LogoutButton />

      <FeedbackToast
      type={feedback.type}
      message={feedback.message}
      onClose={() => setFeedback({ type: "success", message: "" })}
      />


      <SafetyTipQuizModal
      isOpen={isQuizOpen}
      onClose={closeSafetyQuiz}
      onSuccess={loadSummary}
      />

      <h1 style={{ textAlign: 'center' }}>Hello, {userData.username}! 👋</h1>
      <h4 style={{ textAlign: 'center' }}>Thanks for making the internet a safer place</h4>

      <SimulationModal
        isOpen={isSimOpen}
        onClose={closeSimulation}
        onSuccess={loadSummary}
      />
      
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '-20px' }}>
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
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}> 
          <ScoreCenter score={userData.totalPoints} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-20px' }}>
          
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
          onSubmit={async (payload) => {
            try {
              await submitReport(payload);
            } catch (error) {
              const msg =
                error?.response?.data?.reason ||
                error?.response?.data?.message ||
                error.message;
              alert(msg);
              console.error(error);
            }
          }}
        />
        
        <MonthlyGoalBar
          monthlyCounts={userData.monthlyCounts}
          monthlyTargets={userData.monthlyTargets}
          actions={["reportPost", "safetyTips", "reportGood"]}
        />
        </div>
    </div>
  );
}

export default Dashboard;